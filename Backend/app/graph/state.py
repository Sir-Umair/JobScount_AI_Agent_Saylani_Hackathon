from typing import TypedDict, List, Dict, Any
from app.models.schemas import CandidateProfile, JobRecommendation

class AgentState(TypedDict):
    cv_text: str
    candidate_profile: dict
    filter: str
    chunks: list
    embeddings: list
    search_queries: list
    jobs: list
    evaluated_jobs: list
    ranked_jobs: list
    output_format: str
    final_output: Any
