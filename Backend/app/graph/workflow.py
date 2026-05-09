import warnings
try:
    from langchain_core._api import LangChainPendingDeprecationWarning
    warnings.filterwarnings("ignore", category=LangChainPendingDeprecationWarning)
except ImportError:
    pass

from langgraph.graph import StateGraph, END
from app.graph.state import AgentState
from app.graph.nodes import (
    parse_cv_node,
    extract_profile_node,
    chunk_cv_node,
    generate_embeddings_node,
    store_faiss_node,
    generate_queries_node,
    tavily_search_node,
    evaluate_jobs_node,
    rank_jobs_node,
    format_response_node
)

def build_graph():
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("parse_cv_node", parse_cv_node)
    workflow.add_node("extract_profile_node", extract_profile_node)
    workflow.add_node("chunk_cv_node", chunk_cv_node)
    workflow.add_node("generate_embeddings_node", generate_embeddings_node)
    workflow.add_node("store_faiss_node", store_faiss_node)
    workflow.add_node("generate_queries_node", generate_queries_node)
    workflow.add_node("tavily_search_node", tavily_search_node)
    workflow.add_node("evaluate_jobs_node", evaluate_jobs_node)
    workflow.add_node("rank_jobs_node", rank_jobs_node)
    workflow.add_node("format_response_node", format_response_node)

    # Add edges
    workflow.set_entry_point("parse_cv_node")
    workflow.add_edge("parse_cv_node", "extract_profile_node")
    workflow.add_edge("extract_profile_node", "chunk_cv_node")
    workflow.add_edge("chunk_cv_node", "generate_embeddings_node")
    workflow.add_edge("generate_embeddings_node", "store_faiss_node")
    workflow.add_edge("store_faiss_node", "generate_queries_node")
    workflow.add_edge("generate_queries_node", "tavily_search_node")
    workflow.add_edge("tavily_search_node", "evaluate_jobs_node")
    workflow.add_edge("evaluate_jobs_node", "rank_jobs_node")
    workflow.add_edge("rank_jobs_node", "format_response_node")
    workflow.add_edge("format_response_node", END)

    return workflow.compile()

agent_workflow = build_graph()
