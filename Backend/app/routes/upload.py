from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.cv_parser import parse_cv
from app.services.anthropic_service import extract_profile_from_cv
from app.services.database_service import db_service
from app.utils.helpers import setup_logger

logger = setup_logger("upload_route")

router = APIRouter()

@router.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF or DOCX are supported.")
        
    try:
        content = await file.read()
        cv_text = parse_cv(content, filename)
        
        logger.info(f"Extracted {len(cv_text)} characters from {filename}")
        
        if not cv_text or len(cv_text.strip()) < 10:
             logger.warning(f"Extracted text is too short or empty for {filename}")
             raise HTTPException(
                 status_code=400,
                 detail={"message": "Could not extract enough text from the provided CV. Please ensure it's not an image-only PDF.", "code": "PDF_EXTRACT_FAIL"}
             )

        # Extract profile directly - now async!
        profile = await extract_profile_from_cv(cv_text)
        
        # Save to MongoDB
        cv_id = await db_service.save_cv({
            "filename": filename,
            "cv_text": cv_text,
            "candidate_profile": profile.model_dump()
        })
        
        # Save to Vector Store
        from app.services.embedding_service import get_embeddings
        from app.vectorstore.faiss_store import vector_store
        
        # Simple chunking by max chars
        chunks = [cv_text[i:i+500] for i in range(0, len(cv_text), 500)]
        if chunks:
            embeddings = get_embeddings(chunks)
            vector_store.add_embeddings(embeddings, chunks)
            logger.info(f"Stored {len(chunks)} chunks in FAISS for {filename}")
        
        return {
            "message": "CV uploaded and parsed successfully.",
            "cv_text": cv_text,
            "candidate_profile": profile.model_dump(),
            "cv_id": cv_id
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
