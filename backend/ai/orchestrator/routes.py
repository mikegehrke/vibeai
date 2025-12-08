# -------------------------------------------------------------
# VIBEAI – ORCHESTRATOR API ROUTES
# -------------------------------------------------------------
"""
REST API for Multi-Agent Orchestrator

Endpoints:
- POST /orchestrator/handle - Handle user prompt
- POST /orchestrator/workflow - Execute workflow
- POST /orchestrator/project/create - Create new project
- GET /orchestrator/project/{project_id} - Get project context
"""

from typing import Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/orchestrator", tags=["Orchestrator"])


# Request Models
class HandleRequest(BaseModel):
    """Handle user prompt request."""

    user_id: str
    project_id: str
    prompt: str
    context: Optional[Dict] = None


class WorkflowRequest(BaseModel):
    """Workflow execution request."""

    user_id: str
    project_id: str
    workflow: str  # create_app | build_app | full_cycle
    params: Optional[Dict] = None


class CreateProjectRequest(BaseModel):
    """Create project request."""

    user_id: str
    project_id: str
    framework: str  # flutter | react | vue | node
    project_name: str
    options: Optional[Dict] = None


# Endpoints
@router.post("/handle")
async def handle_prompt(request: HandleRequest):
    """
    Handle user prompt with multi-agent orchestrator.

    Example: