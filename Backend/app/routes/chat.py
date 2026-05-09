from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.database_service import db_service
from app.services.anthropic_service import settings
import anthropic
import datetime

router = APIRouter()
client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    # 1. Fetch latest CV context
    cv_data = await db_service.get_latest_cv()
    
    if not cv_data:
        response_text = "I notice you haven't uploaded a CV yet. To give you the best career advice and job matches, please upload your resume in the 'Scout Jobs' or 'AI Resume Analyzer' section first!"
        return {"role": "assistant", "content": response_text}

    cv_context = cv_data.get("cv_text", "")
    profile = cv_data.get("candidate_profile", {})

    # 2. Build Prompt for Claude
    prompt = f"""
    You are the JobScout AI Career Coach. You help candidates find jobs, prepare for interviews, and optimize their careers.
    
    CANDIDATE CONTEXT (Extracted from CV):
    - Full Name: {profile.get('full_name', 'Unknown')}
    - Role: {profile.get('preferred_role', 'Not specified')}
    - Skills: {', '.join(profile.get('skills', []))}
    - Experience: {profile.get('experience', 'Not specified')}
    
    FULL CV TEXT:
    {cv_context}
    
    USER QUERY:
    {request.message}
    
    INSTRUCTIONS:
    - Answer the user's career or job-related questions using their CV context.
    - Be professional, encouraging, and highly specific to their skills.
    - If they ask for interview prep, generate 3 specific questions based on their skill gaps.
    - If they ask about salary or market trends, focus on the Pakistani market first but provide global context if needed.
    """

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        response_text = message.content[0].text
        
        # 3. Save to MongoDB History
        await db_service.save_chat_message({
            "user_query": request.message,
            "assistant_response": response_text,
            "timestamp": datetime.datetime.utcnow(),
            "cv_filename": cv_data.get("filename")
        })
        
        return {"role": "assistant", "content": response_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
