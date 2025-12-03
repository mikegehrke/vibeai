# -------------------------------------------------------------
# VIBEAI – TEAM COLLABORATION API ROUTES ⭐ BLOCK 19
# -------------------------------------------------------------
"""
Team API Routes - Multi-agent collaboration endpoints

Endpoints:
- POST /team/collaborate - Multi-agent collaboration
- POST /team/ask - Ask specific agent
- POST /team/route - Auto-route task to specialists
- GET /team/agents - List all agents
- GET /team/health - Health check
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from .team_engine import team_engine

router = APIRouter(prefix="/team", tags=["Team"])


# ========================================
# PYDANTIC MODELS
# ========================================

class CollaborateRequest(BaseModel):
    prompt: str
    agents: Optional[List[str]] = None
    mode: str = "parallel"
    project_id: Optional[str] = None


class AskAgentRequest(BaseModel):
    agent: str
    prompt: str
    project_id: Optional[str] = None


class RouteTaskRequest(BaseModel):
    task_type: str
    prompt: str
    project_id: Optional[str] = None


# ========================================
# API ROUTES
# ========================================

@router.post("/collaborate")
async def collaborate(request: Request):
    """
    Multi-agent collaboration on a task
    
    Request body:
    {
        "prompt": "Build a login form with validation",
        "agents": ["frontend", "backend", "designer"],
        "mode": "parallel|sequential|consensus",
        "project_id": "demo-project"
    }
    
    Response:
    {
        "success": true,
        "mode": "parallel",
        "agents": [...],
        "results": {
            "frontend": {...},
            "backend": {...}
        },
        "summary": "..."
    }
    """
    
    body = await request.json()
    user_email = request.headers.get("x-user", "default")
    
    prompt = body.get("prompt")
    agents = body.get("agents")
    mode = body.get("mode", "parallel")
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Missing prompt")
    
    if mode not in ["parallel", "sequential", "consensus"]:
        raise HTTPException(status_code=400, detail="Invalid mode")
    
    result = await team_engine.collaborate(
        prompt=prompt,
        agents=agents,
        mode=mode
    )
    
    return result


@router.post("/ask")
async def ask_agent(request: Request):
    """
    Ask a specific agent for a response
    
    Request body:
    {
        "agent": "frontend",
        "prompt": "How should I structure my React components?",
        "project_id": "demo-project"
    }
    
    Response:
    {
        "success": true,
        "agent": "frontend",
        "agent_name": "Frontend Specialist",
        "model": "gpt-4",
        "response": "...",
        "expertise": [...]
    }
    """
    
    body = await request.json()
    user_email = request.headers.get("x-user", "default")
    
    agent = body.get("agent")
    prompt = body.get("prompt")
    
    if not all([agent, prompt]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    result = await team_engine.ask(agent, prompt)
    
    return result


@router.post("/route")
async def route_task(request: Request):
    """
    Auto-route task to appropriate specialists
    
    Request body:
    {
        "task_type": "ui_design|api_development|full_stack|testing|deployment",
        "prompt": "Create a user dashboard",
        "project_id": "demo-project"
    }
    
    Response:
    {
        "success": true,
        "task_type": "ui_design",
        "agents": ["designer", "frontend"],
        "results": {...}
    }
    """
    
    body = await request.json()
    user_email = request.headers.get("x-user", "default")
    
    task_type = body.get("task_type")
    prompt = body.get("prompt")
    
    if not all([task_type, prompt]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    result = await team_engine.route_task(task_type, prompt)
    
    result["task_type"] = task_type
    
    return result


@router.get("/agents")
async def list_agents():
    """
    List all available agents and their capabilities
    
    Response:
    {
        "agents": {
            "frontend": {
                "name": "Frontend Specialist",
                "model": "gpt-4",
                "expertise": [...]
            },
            ...
        },
        "total": 7
    }
    """
    
    return {
        "agents": team_engine.agents,
        "total": len(team_engine.agents),
        "collaboration_modes": list(team_engine.collaboration_modes.keys()),
        "task_types": list(team_engine.task_routing.keys())
    }


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Response:
    {
        "status": "online",
        "engine": "team",
        "agents": 7,
        "models": {...}
    }
    """
    
    return {
        "status": "online",
        "engine": "team",
        "agents": len(team_engine.agents),
        "models": team_engine.models,
        "collaboration_modes": list(team_engine.collaboration_modes.keys()),
        "capabilities": [
            "multi_agent_collaboration",
            "parallel_execution",
            "sequential_workflow",
            "consensus_building",
            "task_routing",
            "model_fallback"
        ]
    }
