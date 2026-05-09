from app.models.schemas import CandidateProfile, JobRecommendation
from app.services.anthropic_service import evaluate_job
from app.vectorstore.faiss_store import vector_store
from app.utils.helpers import setup_logger

logger = setup_logger("evaluator_service")

def rank_jobs(jobs: list[dict], profile: CandidateProfile) -> list[JobRecommendation]:
    logger.info(f"Evaluating and ranking {len(jobs)} jobs.")
    recommendations = []
    
    for job in jobs:
        # Evaluate with Claude
        eval_result = evaluate_job(job, profile)
        
        # Create JobRecommendation object
        match_score = eval_result.get("match_percentage", 0)
        
        # Apply Pakistan Bonus
        location = eval_result.get("extracted_location", job.get("location", "Unknown Location"))
        if "pakistan" in location.lower():
            match_score = min(100, match_score + 10)
        
        # Only keep relevant jobs (e.g. >= 50% match)
        if match_score >= 50:
            rec = JobRecommendation(
                title=job.get("title", "Unknown Title"),
                company=eval_result.get("extracted_company", job.get("company", "Unknown Company")),
                location=location,
                job_url=job.get("url", ""),
                match_percentage=match_score,
                matching_skills=eval_result.get("matching_skills", []),
                missing_skills=eval_result.get("missing_skills", []),
                experience_match=eval_result.get("experience_match", "Unknown"),
                education_match=eval_result.get("education_match", "Unknown"),
                reasoning=eval_result.get("reasoning", ""),
                interview_questions=eval_result.get("interview_questions", [])
            )
            recommendations.append(rec)
        
    # Sort by match percentage descending
    recommendations.sort(key=lambda x: x.match_percentage, reverse=True)
    
    # Perfect 5: Limit to top 5 results
    return recommendations[:5]
