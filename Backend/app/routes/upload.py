from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.cv_parser import parse_cv
from app.services.anthropic_service import extract_profile_from_cv
from app.services.database_service import db_service

router = APIRouter()

@router.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF or DOCX are supported.")
        
    try:
        content = await file.read()
        cv_text = parse_cv(content, filename)
        
        if not cv_text:
             raise HTTPException(status_code=400, detail="Could not extract text from the provided CV.")

        # Extract profile directly
        profile = extract_profile_from_cv(cv_text)
        
        # Save to MongoDB
        await db_service.save_cv({
            "filename": filename,
            "cv_text": cv_text,
            "candidate_profile": profile.model_dump()
        })
        
        return {
            "message": "CV uploaded and parsed successfully.",
            "cv_text": cv_text,
            "candidate_profile": profile.model_dump()
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
