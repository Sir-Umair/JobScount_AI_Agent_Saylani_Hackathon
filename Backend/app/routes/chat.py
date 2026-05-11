from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.database_service import db_service
from app.services.anthropic_service import settings, client
import anthropic
import datetime

router = APIRouter()

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

    # Retrieve relevant context from vector store using FAISS
    from app.services.embedding_service import get_embeddings
    from app.vectorstore.faiss_store import vector_store
    
    query_embedding = get_embeddings([request.message])[0]
    relevant_chunks = vector_store.search(query_embedding, k=3)
    vector_context = "\n\n".join(relevant_chunks) if relevant_chunks else cv_context[:2000] # Fallback to first 2000 chars if FAISS is empty
    
    # 2. Build Prompt for Claude
    prompt = f"""
    You are the JobScout AI Career Coach. You help candidates find jobs, prepare for interviews, and optimize their careers.
    
    CANDIDATE CONTEXT (Extracted from CV):
    - Full Name: {profile.get('full_name', 'Unknown')}
    - Role: {profile.get('preferred_role', 'Not specified')}
    - Skills: {', '.join(profile.get('skills', []))}
    - Experience: {profile.get('experience', 'Not specified')}
    
    RELEVANT CV CONTEXT (from Vector Store):
    {vector_context}
    
    USER QUERY:
    {request.message}
    
    INSTRUCTIONS:
    - Answer the user's career or job-related questions using their CV context.
    - Be professional, encouraging, and highly specific to their skills.
    - If they ask for interview prep, generate 3 specific questions based on their skill gaps.
    - If they ask about salary or market trends, focus on the Pakistani market first but provide global context if needed.
    """

    try:
        from app.services.anthropic_service import _call_claude
        
        system_prompt = "You are the JobScout AI Career Coach. You help candidates find jobs, prepare for interviews, and optimize their careers."
        
        # We use _call_claude for robust multi-model fallback and to prevent crashes if client is None
        response_text = await _call_claude(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=1024,
            temperature=0.7
        )
        
        if not response_text:
            response_text = "I'm currently running in Rescue Mode due to an API constraint, but based on your profile, you have a solid foundation! Focus on highlighting your top skills in interviews."
            
        # 3. Save to MongoDB History
        await db_service.save_chat_message({
            "user_query": request.message,
            "assistant_response": response_text,
            "timestamp": datetime.datetime.utcnow(),
            "cv_filename": cv_data.get("filename")
        })
        
        return {"role": "assistant", "content": response_text}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
