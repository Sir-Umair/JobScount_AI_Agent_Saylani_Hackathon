import anthropic
import json
from app.config.settings import settings
from app.models.schemas import CandidateProfile
from app.utils.helpers import setup_logger

logger = setup_logger("anthropic_service")

# User requested this exact model string
MODEL_NAME = "claude-3-5-sonnet-20241022"
FALLBACK_MODEL = "claude-3-5-sonnet-latest" 

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None

def _call_claude(prompt: str, system_prompt: str = "", max_tokens: int = 2048, temperature: float = 0.0) -> str:
    if not client:
        logger.error("Anthropic client not initialized (missing API key).")
        return ""
        
    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except anthropic.BadRequestError as e:
        if "model" in str(e).lower():
            logger.warning(f"Model {MODEL_NAME} failed, trying fallback {FALLBACK_MODEL}")
            response = client.messages.create(
                model=FALLBACK_MODEL,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        raise e
    except Exception as e:
        logger.error(f"Claude API Error: {e}")
        return ""

def extract_profile_from_cv(cv_text: str) -> CandidateProfile:
    system_prompt = "You are an AI recruiting assistant. Extract the candidate's profile from the CV. Return ONLY a valid JSON object matching the requested schema."
    prompt = f"""
    Analyze the following CV text and extract the key information.
    Specifically, perform deep keyword extraction for the 'skills' field. Include all programming languages, frameworks, tools, soft skills, and industry-specific keywords.
    
    Fields to extract: 
    - full_name (string)
    - skills (list of strings, be comprehensive and extract all keywords)
    - experience (summary string)
    - education (summary string)
    - certifications (list of strings)
    - projects (summary string)
    - preferred_role (string)
    - preferred_location (string)
    
    CV Text:
    {cv_text[:10000]}
    
    Return pure JSON format, no markdown formatting or backticks.
    """
    
    result = _call_claude(prompt, system_prompt=system_prompt)
    if not result:
        return CandidateProfile()
        
    try:
        # Strip potential markdown if model didn't listen
        result = result.strip()
        if result.startswith("```json"):
            result = result[7:-3]
        elif result.startswith("```"):
            result = result[3:-3]
            
        data = json.loads(result.strip())
        return CandidateProfile(**data)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON from Claude response: {e}\nResponse: {result}")
        return CandidateProfile()

def generate_search_queries(profile: CandidateProfile) -> list[str]:
    system_prompt = "You are an expert technical recruiter. Generate 3 targeted job search queries based on the candidate's profile. Return ONLY a valid JSON array of strings."
    prompt = f"""
    Candidate Profile:
    Role: {profile.preferred_role}
    Skills: {', '.join(profile.skills)}
    Location: {profile.preferred_location}
    
    Generate 3 distinct search queries for a job search API like Tavily. 
    IMPORTANT: Prioritize jobs in Pakistan and Remote roles suitable for someone in Pakistan. Always include "Pakistan" or "Remote Pakistan" in at least 2 of the queries.
    Return purely a JSON list of strings, no markdown.
    """
    
    result = _call_claude(prompt, system_prompt=system_prompt)
    if not result:
         return [f"{profile.preferred_role} {profile.preferred_location}"]
         
    try:
        result = result.strip()
        if result.startswith("```json"):
            result = result[7:-3]
        elif result.startswith("```"):
            result = result[3:-3]
        return json.loads(result.strip())
    except json.JSONDecodeError:
        logger.error("Failed to decode JSON queries.")
        return [f"{profile.preferred_role} {profile.preferred_location}"]
        
def evaluate_job(job: dict, profile: CandidateProfile) -> dict:
    system_prompt = "You are an AI job evaluator. Evaluate the job against the candidate profile. Return ONLY a valid JSON object."
    prompt = f"""
    Candidate Profile: {profile.model_dump_json()}
    
    Job Description:
    Title: {job.get('title')}
    Company: {job.get('company')}
    Location: {job.get('location', '')}
    Content: {job.get('content', '')[:2000]}
    
    Calculate match metrics and provide a short reasoning. Also extract the true company name and location from the content if they are missing or 'Unknown'.
    IMPORTANT: Also generate 3 hyper-specific interview questions for this job based on the candidate's profile and any missing skills.
    Return pure JSON with keys: extracted_company (string), extracted_location (string), match_percentage (int 0-100), matching_skills (list of strings), missing_skills (list of strings), experience_match (string), education_match (string), reasoning (string), interview_questions (list of 3 strings).
    """
    
    result = _call_claude(prompt, system_prompt=system_prompt)
    fallback_res = {"extracted_company": job.get('company', 'Unknown'), "extracted_location": job.get('location', 'Unknown'), "match_percentage": 0, "matching_skills": [], "missing_skills": [], "experience_match": "Unknown", "education_match": "Unknown", "reasoning": "Failed to evaluate."}
    if not result:
        return fallback_res
        
    try:
        result = result.strip()
        if result.startswith("```json"):
            result = result[7:-3]
        elif result.startswith("```"):
            result = result[3:-3]
        return json.loads(result.strip())
    except json.JSONDecodeError:
        logger.error("Failed to decode job evaluation JSON.")
        return fallback_res
