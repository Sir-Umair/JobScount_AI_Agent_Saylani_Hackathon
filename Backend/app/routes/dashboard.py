from fastapi import APIRouter, HTTPException
from app.services.database_service import db_service

router = APIRouter()

@router.get("/dashboard-stats")
async def get_dashboard_stats():
    # 1. Fetch latest CV
    cv_data = await db_service.get_latest_cv()
    # 2. Fetch latest agent results
    results_data = await db_service.get_latest_results()
    
    if not cv_data:
        return {
            "has_data": False,
            "message": "No CV data found. Please upload a CV first."
        }
    
    profile = cv_data.get("candidate_profile", {})
    results = results_data.get("results", []) if results_data else []
    
    # Calculate some dynamic metrics
    skill_count = len(profile.get("skills", []))
    
    # Safety check: ensure results is a list of dicts
    if isinstance(results, list) and len(results) > 0 and isinstance(results[0], dict):
        top_match = max([j.get("match_percentage", 0) for j in results])
        avg_match = sum([j.get("match_percentage", 0) for j in results]) / len(results)
    else:
        top_match = 0
        avg_match = 0
    
    return {
        "has_data": True,
        "profile": profile,
        "cv_id": str(cv_data.get("_id")),
        "results": results,
        "metrics": {
            "skill_count": skill_count,
            "top_match": top_match,
            "avg_match": round(avg_match, 1),
            "job_count": len(results)
        }
    }

from pydantic import BaseModel

class SaveJobRequest(BaseModel):
    cv_id: str
    job: dict

@router.post("/save-job")
async def save_job(request: SaveJobRequest):
    await db_service.save_job(request.cv_id, request.job)
    return {"message": "Job saved successfully"}

@router.get("/saved-jobs/{cv_id}")
async def get_saved_jobs(cv_id: str):
    jobs = await db_service.get_saved_jobs_by_cv_id(cv_id)
    return {"saved_jobs": jobs}

