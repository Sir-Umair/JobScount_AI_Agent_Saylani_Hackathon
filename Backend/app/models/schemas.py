from pydantic import BaseModel, Field
from typing import List, Any, Optional

class CandidateProfile(BaseModel):
    full_name: str = ""
    skills: List[str] = Field(default_factory=list)
    experience: str = ""
    education: str = ""
    certifications: List[str] = Field(default_factory=list)
    projects: str = ""
    preferred_role: str = ""
    preferred_location: str = ""

class JobRecommendation(BaseModel):
    title: str = ""
    company: str = ""
    location: str = ""
    job_url: str = ""
    match_percentage: int = 0
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    experience_match: str = ""
    education_match: str = ""
    reasoning: str = ""
    interview_questions: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    improvement_suggestions: List[str] = Field(default_factory=list)

class AgentRequest(BaseModel):
    cv_text: str
    candidate_profile: CandidateProfile
    output_format: str = "json"  # json or plain_text
    filter: Optional[str] = None

class AgentResponse(BaseModel):
    results: Any
