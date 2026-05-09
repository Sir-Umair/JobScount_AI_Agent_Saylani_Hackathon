import fitz
import docx
import io
import pytesseract
from pdf2image import convert_from_bytes
from app.utils.helpers import setup_logger

logger = setup_logger("cv_parser")

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
            
        # If no text was extracted, try OCR fallback
        if not text.strip():
            logger.info("No text extracted using PyMuPDF. Attempting OCR fallback...")
            try:
                images = convert_from_bytes(file_bytes)
                for image in images:
                    text += pytesseract.image_to_string(image)
            except Exception as ocr_e:
                logger.error(f"OCR fallback failed (are Tesseract and Poppler installed on Windows?): {ocr_e}")
                
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    text = ""
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        logger.error(f"Error parsing DOCX: {e}")
    return text

def parse_cv(file_bytes: bytes, filename: str) -> str:
    logger.info(f"Parsing CV: {filename}")
    if filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    else:
        logger.warning(f"Unsupported file format: {filename}")
        return ""
