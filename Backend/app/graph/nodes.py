from app.graph.state import AgentState
from app.services.anthropic_service import extract_profile_from_cv, generate_search_queries
from app.services.embedding_service import get_embeddings
from app.vectorstore.faiss_store import vector_store
from app.services.tavily_service import search_jobs
from app.services.evaluator_service import rank_jobs
from app.models.schemas import CandidateProfile
from app.utils.helpers import setup_logger

logger = setup_logger("nodes")

async def parse_cv_node(state: AgentState):
    logger.info("Executing parse_cv_node")
    # Assuming text is already extracted and in state["cv_text"]
    return state

async def extract_profile_node(state: AgentState):
    logger.info("Executing extract_profile_node")
    if state.get("candidate_profile"):
        logger.info("Profile already exists in state, skipping extraction.")
        return state
        
    profile = await extract_profile_from_cv(state["cv_text"])
    state["candidate_profile"] = profile.model_dump()
    return state

async def chunk_cv_node(state: AgentState):
    logger.info("Executing chunk_cv_node")
    text = state["cv_text"]
    # Simple chunking by max chars
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]
    state["chunks"] = chunks
    return state

async def generate_embeddings_node(state: AgentState):
    logger.info("Executing generate_embeddings_node")
    chunks = state.get("chunks", [])
    if chunks:
        embeddings = get_embeddings(chunks)
        state["embeddings"] = embeddings
    else:
        state["embeddings"] = []
    return state

async def store_faiss_node(state: AgentState):
    logger.info("Executing store_faiss_node")
    embeddings = state.get("embeddings", [])
    chunks = state.get("chunks", [])
    if embeddings and chunks:
        vector_store.add_embeddings(embeddings, chunks)
    return state

async def generate_queries_node(state: AgentState):
    logger.info("Executing generate_queries_node")
    profile = CandidateProfile(**state.get("candidate_profile", {}))
    filter_text = state.get("filter", "")
    queries = await generate_search_queries(profile, filter_text)
    state["search_queries"] = queries
    return state

async def tavily_search_node(state: AgentState):
    logger.info("Executing tavily_search_node")
    queries = state.get("search_queries", [])
    
    # Run all Tavily searches concurrently in a thread pool (search_jobs is synchronous)
    import asyncio
    loop = asyncio.get_event_loop()
    
    async def run_search(q: str):
        try:
            return await loop.run_in_executor(None, lambda: search_jobs(q, max_results=20))
        except Exception as e:
            logger.error(f"Tavily search failed for '{q}': {e}")
            return []
    
    results = await asyncio.gather(*(run_search(q) for q in queries))
    all_jobs = [job for batch in results for job in batch]
    
    unique_jobs = {job.get('url'): job for job in all_jobs if job.get('url')}
    state["jobs"] = list(unique_jobs.values())
    logger.info(f"Collected {len(state['jobs'])} unique jobs from {len(queries)} concurrent searches")
    return state

async def evaluate_jobs_node(state: AgentState):
    logger.info("Executing evaluate_jobs_node")
    # Pass through
    state["evaluated_jobs"] = state.get("jobs", [])
    return state

async def rank_jobs_node(state: AgentState):
    logger.info("Executing rank_jobs_node")
    jobs = state.get("jobs", [])
    profile = CandidateProfile(**state.get("candidate_profile", {}))
    filter_text = state.get("filter", "")
    ranked = await rank_jobs(jobs, profile, filter_text)
    state["ranked_jobs"] = [r.model_dump() for r in ranked]
    return state

async def format_response_node(state: AgentState):
    logger.info("Executing format_response_node")
    ranked_jobs = state.get("ranked_jobs", [])
    output_format = state.get("output_format", "json")
    
    if output_format == "json":
        state["final_output"] = ranked_jobs
    else:
        text_out = "Here are your job recommendations based on your profile:\n\n"
        for i, r in enumerate(ranked_jobs):
            text_out += f"{i+1}. {r.get('title')} at {r.get('company')} is a {r.get('match_percentage')}% match because {r.get('reasoning')}\n"
        state["final_output"] = text_out
    return state
