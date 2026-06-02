Here is my Backend development progress

# Technical Architecture & Systems Engineering Specification
**Project:** JobScout AI Agent (Saylani Hackathon)  
**Document Classification:** Formal System Specification & Tool Integration Matrix  

---

## Executive Summary
This document provides a formal, comprehensive architectural specification of the **JobScout AI Backend, Data Infrastructure, and System Integrations**. Engineered to deliver autonomous, stateful career-coaching workflows, the system combines asynchronous API endpoints via **FastAPI** with a stateful directed acyclic graph (DAG) orchestrated by **LangGraph**. Persisted storage is managed through a hybrid transactional document layer (**MongoDB**) and a high-performance, high-dimensional semantic search index (**FAISS**).

This specification details both the **internal technology stack** built into the application and the **forensic developer tools** used by the AI coding assistant to analyze, verify, and document this codebase.

---

## 1. System & Data Architecture Overview

The backend employs a decoupled microservices architecture designed for asynchronous processing, non-blocking input/output operations, and fault-tolerant agentic execution.

```mermaid
graph TD
    Client[React Client] -->|1. Multipart Upload| API_Upload[Upload Router: /upload-cv]
    Client -->|2. Invoke Agent| API_Agent[Agent Router: /run-agent]
    Client -->|3. Dynamic Chat| API_Chat[Chat Router: /chat]
    Client -->|4. Retrieve Stats| API_Dash[Dashboard Router: /dashboard-stats]

    subgraph API & Routing Layer (FastAPI & Uvicorn)
        API_Upload
        API_Agent
        API_Chat
        API_Dash
    end

    subgraph Agentic Orchestration (LangGraph Workflow)
        StateGraph[StateGraph Engine]
        Node_Parse[parse_cv_node] --> Node_Extract[extract_profile_node]
        Node_Extract --> Node_Query[generate_queries_node]
        Node_Query --> Node_Search[tavily_search_node]
        Node_Search --> Node_Rank[rank_jobs_node]
        Node_Rank --> Node_Format[format_response_node]
    end

    API_Agent -->|Active Context| StateGraph
    Node_Search -->|Parallel Web Scraping| Tavily[Tavily Search API]
    Node_Rank -->|Strict Matching & Scoring| Evaluator[Evaluator Service]

    subgraph Persistence & Retrieval Layer
        MongoDB[(MongoDB: jobscout_db)]
        FAISS[(FAISS Vector Store)]
    end

    API_Upload -->|Document Text Extraction| CVParser[CV Parser: PyMuPDF / docx / OCR]
    CVParser -->|Sentence-Transformers| FAISS
    CVParser -->|Structured JSON| MongoDB
    API_Chat -->|Semantic Context Query| FAISS
    API_Chat -->|Claude LLM Processing| Claude[Anthropic Claude API]
    API_Chat -->|Log Conversations| MongoDB

    style Client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    style StateGraph fill:#3b0764,stroke:#c084fc,stroke-width:2px,color:#fff
    style MongoDB fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff
    style FAISS fill:#172554,stroke:#60a5fa,stroke-width:2px,color:#fff
```

---

## 2. Integrated Tooling & Dependency Matrix

The application's core logic is supported by a robust selection of production-grade dependencies, APIs, and algorithms.

### 2.1 Core Application Libraries
*   **FastAPI:** Serves as the high-performance ASGI web framework. Leveraging Pydantic, it enforces rigorous JSON serialization, handles input validation, and supports concurrent request handling.
*   **Uvicorn:** A lightning-fast ASGI web server implementation, running the FastAPI application under an asynchronous loop architecture.
*   **LangGraph & LangChain:** Orchestrate the multi-node workflow DAG. LangGraph maintains transactional state (`AgentState`) across execution steps, handling state persistence and transition boundaries.
*   **Motor (Async MongoDB Driver):** Provides a fully non-blocking, asynchronous interface to MongoDB database instances, matching FastAPI's concurrent loop execution.

### 2.2 Text Extraction & Document Processing Tools
*   **PyMuPDF (`fitz`):** A high-performance PDF rendering and extraction library used to parse raw text streams from uploaded PDF resumes.
*   **python-docx:** Inspects OpenXML Word documents. The parser traverses paragraph models and processes table layouts, preventing data loss from heavily styled or tabular resume structures.
*   **Tesseract OCR (`pytesseract` & `pdf2image`):** Embedded as a fault-tolerant fallback. When `PyMuPDF` returns empty text arrays (e.g., scanned resume images), the parser converts PDF pages into image buffers and extracts characters via Optical Character Recognition.

### 2.3 Web Scrapers & Intelligence Engines
*   **Tavily Search API (`tavily-python`):** Utilized as a specialized search engine for LLMs. The LangGraph agent issues multi-threaded, parallel web queries to Tavily to locate real-time, live job listings matching candidate criteria.
*   **Anthropic Claude API (`anthropic`):** Serves as the cognitive engine. The backend utilizes `claude-3-5-sonnet-latest` (with hierarchical fallbacks to Claude 3.5 Haiku, Claude 3 Opus, and Claude 2.1) to extract structured profiles, generate search terms, and execute deep matching evaluations.

### 2.4 Vector Search & Machine Learning Engines
*   **FAISS (`faiss-cpu`):** An in-memory similarity search tool utilizing Euclidean Distance ($L2$ Flat Index) to perform high-speed vector indexing and retrieval.
*   **SentenceTransformers (`all-MiniLM-L6-v2`):** Generates dense vector representations (384 dimensions) of resume text chunks and saved job descriptions.

---

## 3. Analysis & Forensic Methodology (AI Assistant Tools)

To construct this specification without speculative estimation, I utilized a precise set of static-analysis and system-exploration tools to audit your project's workspace at `d:\Hackathone`:

*   **`list_dir` (System Directory Inspection):** Executed directory analysis across `/Backend`, `/Backend/app`, `/Backend/app/routes`, `/Backend/app/services`, `/Backend/app/graph`, and `/Backend/app/vectorstore` to construct the modular system layout and map project paths.
*   **`view_file` (File Contents Auditor):** Directly analyzed the internal code logic of core services:
    *   `app/config/settings.py` to identify environment settings and variable schemas.
    *   `app/models/schemas.py` to inspect strict Pydantic structures.
    *   `app/services/database_service.py` to map out MongoDB collection names and query operations.
    *   `app/services/evaluator_service.py` to isolate the custom regex salary parsers and geography matching algorithms.
    *   `app/graph/nodes.py` & `workflow.py` to confirm the state progression of the LangGraph pipeline.

---

## 4. Deep-Dive Component Specifications

### 4.1 Stateful Execution DAG (`AgentState` Transitions)
The LangGraph pipeline runs step-by-step state modifications using the following process:

1.  **Ingestion:** The payload initiates within `parse_cv_node`, populating `cv_text` in the `AgentState`.
2.  **Extraction:** `extract_profile_node` calls the Anthropic API. If the API key is missing or limits are reached, the service invokes a **Rescue Mode** local parser using regex name-finding and heuristic degree matching.
3.  **Query Planning:** `generate_queries_node` evaluates candidate skills and active filters to write 3 distinct search terms.
4.  **Web Fetch:** `tavily_search_node` executes searches in parallel. URLs are filtered and deduplicated to generate a clean, unique job listing set.
5.  **Alignment Evaluation:** `rank_jobs_node` matches job data against the Pydantic profile. It applies a **+10% match bonus** for location matches, a **+10% boost** for deep candidate links, and filters out listings that violate the candidate's salary or geographic constraints.
6.  **Response Delivery:** `format_response_node` packages the final output into JSON arrays or structured text.

### 4.2 Data Filtering & Parsing Algorithms
A core strength of the backend is the offline analysis performed by `app/services/evaluator_service.py`:
*   **Salary Parser:** Employs advanced regex to parse multiple formats, converting them into standard annual figures for comparison:
    *   *Hourly Rates:* `(?:\$[\s]*)([0-9]+)...` (e.g., `$40/hr` is calculated as `$80,000` annually).
    *   *K-Notation Range:* `([0-9]+)k` (e.g., `80k` is parsed as `80000`).
    *   *Standard Numerical Large Digits:* Matches values near salary keywords (`salary`, `compensation`, `package`).
*   **Geographic Matching:** A multi-tier parser that maps city names (e.g., Karachi, Lahore, Berlin, London) to national regions (Pakistan, Germany, United Kingdom, USA, UAE) while classifying Remote-friendly listings dynamically.

---

## 5. Schema Registry & Database Models

### 5.1 MongoDB Collections Schema
```
├── jobscout_db
│   ├── cv_collection        <- Resumes, extracted text, and CandidateProfile JSON
│   ├── chat_history         <- Conversational prompts and assistant responses
│   ├── search_results       <- Historical recommended jobs sorted by date
│   └── saved_jobs           <- Starred jobs linked to unique candidate profile IDs
```

### 5.2 Pydantic Validation Models
The system uses strict Pydantic models to validate API requests and responses:

#### `CandidateProfile`
```python
class CandidateProfile(BaseModel):
    full_name: str = ""
    professional_summary: str = ""
    skills: List[str] = Field(default_factory=list)
    experience: str = ""
    education: str = ""
    certifications: List[str] = Field(default_factory=list)
    projects: str = ""
    preferred_role: str = ""
    preferred_location: str = ""
```

#### `JobRecommendation`
```python
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
```

---

## 6. Endpoints Directory & API Routes

All endpoints leverage FastAPI's asynchronous routing:

*   **`POST /upload-cv`**: Accepts a multipart form file stream. Parses the text, generates a candidate profile via Claude, indexes the content in FAISS, and saves the structured document to MongoDB, returning a unique `cv_id`.
*   **`POST /run-agent`**: Triggered with an `AgentRequest`. Invokes the compiled LangGraph workflow to find, match, and rank live job openings, returning a list of `JobRecommendation` objects.
*   **`POST /chat`**: Takes a `ChatRequest`. Executes a similarity search in FAISS using `SentenceTransformers` to find matching context, injecting it into Claude's prompt context for tailored career coaching.
*   **`GET /dashboard-stats`**: Aggregates profile statistics, skill counts, and match metrics from MongoDB, returning real-time metrics (e.g., top match and average match percentages).
*   **`POST /save-job`**: Saves aStarred job to MongoDB and adds the serialized text to the FAISS index.
*   **`GET /saved-jobs/{cv_id}`**: Retrieves all bookmarked positions for the candidate.
*   **`DELETE /delete-job`**: Removes a starred vacancy from the candidate's collection.
*   **`GET /health`**: Standard system health monitoring.
