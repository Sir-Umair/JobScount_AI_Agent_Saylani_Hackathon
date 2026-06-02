# JobScout AI

AI-powered job discovery platform that combines autonomous job scouting,
resume intelligence, semantic search, and personalized career coaching.

---

## Key Features

- Resume Parsing (PDF & DOCX)
- OCR Recovery for Scanned Documents
- Autonomous LangGraph Job Search Agent
- Real-Time Job Discovery with Tavily
- Multi-Criteria Job Ranking
- FAISS Vector Search
- RAG-Powered Career Coach
- Interactive Analytics Dashboard
- MongoDB Persistence Layer

---

## Architecture

[Mermaid Diagram]

---

## Core Workflow

1. Upload Resume
2. Extract Candidate Profile
3. Generate Search Queries
4. Discover Live Job Opportunities
5. Rank Opportunities
6. Save Matches As per defined filter 
7. Chat with Career Coach

---

## Technology Stack

### Backend
- FastAPI
- LangGraph
- LangChain
- MongoDB
- FAISS
- SentenceTransformers
- Anthropic Claude
- Tavily Search

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts

---

## API Endpoints

[API Table]

---

## Installation

[Backend Setup]

[Frontend Setup]

---

## System Reliability

### OCR Fallback
When searchable text cannot be extracted from PDFs, OCR processing is automatically triggered.

### Model Fallback
If the primary Claude model is unavailable, the system switches to alternative supported models.

### Resume Parsing Recovery
Basic profile extraction remains available even when LLM processing is unavailable.

### Video Demo
To See REal Timw Woorking Visit the LInk Given in the main Readme.md file
Team Members

