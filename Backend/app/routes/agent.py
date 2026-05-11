from fastapi import APIRouter, HTTPException
from app.models.schemas import AgentRequest
from app.graph.workflow import agent_workflow
from app.services.database_service import db_service
import datetime

router = APIRouter()

@router.post("/run-agent")
async def run_agent(request: AgentRequest):
    try:
        initial_state = {
            "cv_text": request.cv_text,
            "candidate_profile": request.candidate_profile.model_dump(),
            "output_format": request.output_format,
            "filter": request.filter or ""
        }
        
        # Execute the workflow asynchronously
        result_state = await agent_workflow.ainvoke(initial_state)
        final_results = result_state.get("final_output", [])

        # Save to MongoDB
        await db_service.save_results({
            "results": final_results,
            "candidate_profile": request.candidate_profile.model_dump(),
            "timestamp": datetime.datetime.utcnow()
        })
        
        return {
            "status": "success",
            "results": final_results
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
