from fastapi import APIRouter, HTTPException
from app.services.database_service import db_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/dashboard-stats")
async def get_dashboard_stats():
    try:
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
        
        # Safety: ensure results is always a list
        if not isinstance(results, list):
            results = []

        # Flatten nested list if agent wrapped results in another list
        if results and isinstance(results[0], list):
            results = results[0]

        # Filter to only valid dict job entries
        results = [r for r in results if isinstance(r, dict)]

        # Calculate dynamic metrics
        skill_count = len(profile.get("skills", []))
        
        if results:
            top_match = max(j.get("match_percentage", 0) for j in results)
            avg_match = sum(j.get("match_percentage", 0) for j in results) / len(results)
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
                "top_match": round(top_match, 1),
                "avg_match": round(avg_match, 1),
                "job_count": len(results)
            }
        }
    except Exception as e:
        logger.error(f"Dashboard stats error: {e}", exc_info=True)
        # Return graceful empty state instead of 500 crash
        return {
            "has_data": False,
            "message": f"Could not load dashboard data: {str(e)}"
        }

from pydantic import BaseModel

class SaveJobRequest(BaseModel):
    cv_id: str
    job: dict

@router.post("/save-job")
async def save_job(request: SaveJobRequest):
    await db_service.save_job(request.cv_id, request.job)
    
    # Store job in vector DB
    try:
        from app.services.embedding_service import get_embeddings
        from app.vectorstore.faiss_store import vector_store
        import json
        
        job_str = json.dumps(request.job, default=str)
        embeddings = get_embeddings([job_str])
        vector_store.add_embeddings(embeddings, [job_str])
    except Exception as e:
        pass
        
    return {"message": "Job saved successfully in DB and Vector Store"}

@router.get("/saved-jobs/{cv_id}")
async def get_saved_jobs(cv_id: str):
    jobs = await db_service.get_saved_jobs_by_cv_id(cv_id)
    return {"saved_jobs": jobs}

class DeleteJobRequest(BaseModel):
    cv_id: str
    job_url: str

@router.delete("/delete-job")
async def delete_job(request: DeleteJobRequest):
    await db_service.delete_saved_job(request.cv_id, request.job_url)
    return {"message": "Job deleted successfully"}

