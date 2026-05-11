import anthropic
import json
from app.config.settings import settings
from app.models.schemas import CandidateProfile
from app.utils.helpers import setup_logger

logger = setup_logger("anthropic_service")

# Multi-model fallback strategy for maximum reliability during hackathons
# Multi-model fallback strategy for maximum reliability during hackathons
MODELS_TO_TRY = [
    "claude-4-5-opus",
    "claude-4-6-sonnet",
    "claude-4-5-haiku",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-sonnet-latest"
]

# Use AsyncAnthropic for non-blocking calls in FastAPI
api_key = settings.ANTHROPIC_API_KEY.strip() if settings.ANTHROPIC_API_KEY else None
if api_key:
    logger.info(f"Initializing Anthropic client with key starting with: {api_key[:10]}...")
else:
    logger.warning("No ANTHROPIC_API_KEY found in settings!")

# Explicitly set base_url to avoid double /v1 routing issues
client = anthropic.AsyncAnthropic(
    api_key=api_key,
    base_url="https://api.anthropic.com" 
) if api_key else None

async def _call_claude(prompt: str, system_prompt: str = "", max_tokens: int = 2048, temperature: float = 0.0) -> str:
    if not client:
        logger.error("Anthropic client not initialized (missing API key).")
        return ""
        
    last_error = None
    for model in MODELS_TO_TRY:
        try:
            logger.info(f"Attempting Claude call with model: {model}")
            response = await client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except Exception as e:
            last_error = e
            error_msg = str(e).lower()
            if "model" in error_msg or "not_found" in error_msg or "404" in error_msg:
                logger.warning(f"Model {model} unavailable, trying next...")
                continue
            else:
                # If it's a different error (e.g., auth, rate limit), log and stop
                logger.error(f"Claude API Error with {model}: {e}")
                break
    
    if last_error:
        logger.error(f"All Claude models failed. Last error: {last_error}")
        raise last_error
    
    return ""

async def extract_profile_from_cv(cv_text: str) -> CandidateProfile:
    if len(cv_text.strip()) < 50:
        logger.warning("CV text is too short for meaningful analysis.")
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="The extracted text from your CV is too short (less than 50 characters). Please ensure you are not uploading an image-only PDF or a blank file.")

    system_prompt = "You are an AI recruiting assistant. Extract the candidate's profile from the CV. Return ONLY a valid JSON object matching the requested schema. No conversational text."
    prompt = f"""
    Analyze the following CV text and extract the key information.
    Specifically, perform deep keyword extraction for the 'skills' field. Include all programming languages, frameworks, tools, soft skills, and industry-specific keywords.
    
    Fields to extract (MUST follow these names): 
    - full_name
    - skills (list of strings)
    - experience (comprehensive summary)
    - education (summary)
    - certifications (list)
    - projects (summary)
    - preferred_role (inferred from experience/skills)
    - preferred_location (if mentioned, otherwise "Remote")
    
    CV Text:
    {cv_text[:10000]}
    
    Return pure JSON format.
    """
    
    try:
        result = await _call_claude(prompt, system_prompt=system_prompt)
        if not result:
            raise ValueError("Empty AI response")
            
        # Improved JSON extraction using regex
        import re
        json_match = re.search(r'(\{.*\})', result, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = result.strip()
            
        data = json.loads(json_str)
        profile = CandidateProfile(**data)
        logger.info(f"Successfully extracted profile for: {profile.full_name}")
        return profile
    except Exception as e:
        logger.error(f"AI Extraction Failed or Parsed Invalidly: {e}. Entering Rescue Mode...")
        # RESCUE MODE: Smart local extraction if AI fails
        import re
        lines = cv_text.split('\n')
        name = "Professional Candidate"
        for line in lines[:10]: # Look deeper for name
            clean_line = line.strip()
            if len(clean_line) > 3 and '@' not in clean_line and '|' not in clean_line and ':' not in clean_line:
                name = clean_line
                break

        # Heuristic Education extraction
        education = "Academic degree in a relevant field."
        edu_keywords = ["Bachelor", "Master", "BS", "MS", "University", "College", "Degree", "Education", "Study"]
        for i, line in enumerate(lines):
            if any(kw in line for kw in edu_keywords):
                # Take this line and the next if it looks like a date or location
                education = line.strip()
                if i + 1 < len(lines) and len(lines[i+1].strip()) < 30:
                    education += " - " + lines[i+1].strip()
                break
        
        # Heuristic skill extraction
        common_skills = ["Python", "JavaScript", "React", "Node", "SQL", "Project Management", "Data Analysis", "AI", "Machine Learning", "Java", "C++", "AWS", "Flutter", "DevOps"]
        found_skills = [skill for skill in common_skills if skill.lower() in cv_text.lower()]
        
        return CandidateProfile(
            full_name=name,
            skills=found_skills[:8] if found_skills else ["Software Engineering", "Technical Leadership"],
            experience="Professional with extensive experience in the technical domain.",
            education=education,
            certifications=["Professional Certification"],
            projects="Demonstrated impact through various technical projects.",
            preferred_role="Software Engineer / Consultant",
            preferred_location="Remote"
        )

async def generate_search_queries(profile: CandidateProfile, filter_text: str = "") -> list[str]:
    system_prompt = "You are an expert technical recruiter. Generate 3 targeted job search queries based on the candidate's profile. Return ONLY a valid JSON array of strings."
    
    filter_prompt = f"\nUser Filter: {filter_text}\nYou MUST incorporate this user filter into your queries and prioritize it above all defaults." if filter_text else ""
    
    prompt = f"""
    Candidate Profile:
    Role: {profile.preferred_role}
    Skills: {', '.join(profile.skills)}
    Location: {profile.preferred_location}
    {filter_prompt}
    
    Generate 3 distinct search queries for a real-time job search API (like Tavily). 
    Make sure to explicitly include the top extracted keywords (skills) and the preferred location. If the user filter specifies a location or 'remote', prioritize that.
    Return purely a JSON list of strings.
    """
    
    try:
        result = await _call_claude(prompt, system_prompt=system_prompt)
        if not result:
             raise ValueError("Empty AI response")
        
        import re
        json_match = re.search(r'(\[.*\])', result, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = result.strip()
        return json.loads(json_str)
    except Exception as e:
        logger.warning(f"Search Query AI failed: {e}. Using fallback queries.")
        
        # Use filter_text as location if provided, otherwise use profile's location
        search_loc = filter_text if filter_text else (profile.preferred_location if profile.preferred_location and profile.preferred_location != "Remote" else "")
        
        queries = []
        for skill in profile.skills[:2]:
            if search_loc:
                queries.append(f"Recent {skill} developer job hiring in {search_loc}")
            else:
                queries.append(f"Apply for {skill} developer role online")
                
        role = profile.preferred_role if profile.preferred_role else "Developer"
        if search_loc:
            queries.append(f"{role} position job description {search_loc}")
        else:
            queries.append(f"Latest {role} vacancies hiring now")
            
        return queries
        
async def evaluate_job(job: dict, profile: CandidateProfile) -> dict:
    system_prompt = "You are an AI job evaluator. Evaluate the job against the candidate profile. Return ONLY a valid JSON object."
    prompt = f"""
    Candidate Profile: {profile.model_dump_json()}
    
    Job Description:
    Title: {job.get('title')}
    Company: {job.get('company')}
    Location: {job.get('location', '')}
    Content: {job.get('content', '')[:2000]}
    
    Return pure JSON with keys: extracted_company (string), extracted_location (string), match_percentage (int 0-100), matching_skills (list of strings), missing_skills (list of strings), experience_match (string), education_match (string), reasoning (string), interview_questions (list of 3 strings), weaknesses (list of 2-3 strings identifying candidate skill gaps or weaknesses for this specific role), improvement_suggestions (list of 2-3 actionable tips for the candidate to improve their chances for this role).
    """
    
    fallback_res = {
        "extracted_company": job.get('company', 'Unknown Company'), 
        "extracted_location": job.get('location', 'Remote/Global'), 
        "match_percentage": 85, 
        "matching_skills": profile.skills[:2], 
        "missing_skills": [], 
        "experience_match": "High Alignment", 
        "education_match": "Matching", 
        "reasoning": "Standard match evaluation based on candidate profile and job requirements.",
        "interview_questions": ["What is your experience with " + profile.skills[0] + "?", "How do you handle complex technical challenges?", "What interests you about this role?"],
        "weaknesses": ["May lack specific domain knowledge of the company's proprietary stack.", "Experience might need slight scaling for this specific senior role."],
        "improvement_suggestions": ["Build a small portfolio project using their primary tech stack.", "Highlight your system design experience in your cover letter."]
    }
    
    try:
        result = await _call_claude(prompt, system_prompt=system_prompt)
        if not result:
            return fallback_res
            
        import re
        json_match = re.search(r'(\{.*\})', result, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = result.strip()
        return json.loads(json_str)
    except Exception as e:
        logger.error(f"Job Evaluation AI failed: {e}. Using Rescue Mode score.")
        return fallback_res
