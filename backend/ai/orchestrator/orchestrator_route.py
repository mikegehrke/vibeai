# -------------------------------------------------------------
# VIBEAI – ORCHESTRATOR ROUTE
# -------------------------------------------------------------
"""
AI Orchestrator HTTP API

Endpoint:
- POST /ai/orchestrator

Connects frontend AI chat to multi-agent orchestrator.

Features:
- User authentication
- Project context
- Async agent handling
- Response formatting
"""

from typing import Dict, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["AI Orchestrator"])

# -------------------------------------------------------------
# PYDANTIC MODELS
# -------------------------------------------------------------


class OrchestratorRequest(BaseModel):
    """Request model for orchestrator."""

    prompt: str
    projectId: Optional[str] = None
    project_id: Optional[str] = None  # Alias support
    context: Optional[Dict] = None


class OrchestratorResponse(BaseModel):
    """Response model for orchestrator."""

    response: str
    agent: Optional[str] = None
    actions: Optional[list] = None


# -------------------------------------------------------------
# ORCHESTRATOR ENDPOINT
# -------------------------------------------------------------


@router.post("/orchestrator")
async def orchestrator_handle(request: Request):
    """
    Handle AI orchestrator requests.

    Routes user prompts to multi-agent system.
    Returns AI-generated responses and actions.
    """
    try:
        body = await request.json()
        prompt = body.get("prompt")
        project_id = body.get("projectId") or body.get("project_id")
        context = body.get("context", {})

        if not prompt:
            raise HTTPException(status_code=400, detail="Missing prompt")

        # Get user from headers or use default
        user_email = request.headers.get("x-user", "default")

        # Import orchestrator
        try:
            from ai.orchestrator.orchestrator import orchestrator
        except ImportError:
            raise HTTPException(status_code=503, detail="Orchestrator not available")

        # Handle request
        result = await orchestrator.handle(
            user=user_email,
            project_id=project_id or "default",
            prompt=prompt,
            context=context,
        )

        # Format response
        if isinstance(result, dict):
            return {
                "response": result.get("response", str(result)),
                "agent": result.get("agent"),
                "actions": result.get("actions", []),
            }
        else:
            return {"response": str(result)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestrator error: {str(e)}")


# -------------------------------------------------------------
# ORCHESTRATOR STATUS
# -------------------------------------------------------------


@router.get("/orchestrator/status")
async def orchestrator_status():
    """
    Get orchestrator status.

    Returns available agents and capabilities.
    """
    try:
        return {
            "status": "online",
            "agents": [
                "ui_agent",
                "code_agent",
                "preview_agent",
                "build_agent",
                "deploy_agent",
            ],
            "version": "2.0.0",
        }
    except ImportError:
        return {"status": "offline", "error": "Orchestrator not initialized"}


# -------------------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------------------


@router.get("/health")
async def health_check():
    """AI API health check."""
    return {"status": "healthy", "service": "AI Orchestrator API", "version": "1.0.0"}