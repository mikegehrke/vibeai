# -------------------------------------------------------------
# VIBEAI – FLOW CONTROLLER API ROUTES
# -------------------------------------------------------------
"""
REST API for Full Flow Controller

Endpoints:
- POST /flow/execute - Execute complete flow
- GET /flow/{flow_id} - Get flow status
- GET /flow/active - List active flows
- GET /flow/user/{user_id} - List user flows
"""

from typing import Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agents.flow_controller import flow_controller

router = APIRouter(prefix="/flow", tags=["Flow Controller"])


# ---------------------------------------------------------
# REQUEST MODELS
# ---------------------------------------------------------
class FlowExecuteRequest(BaseModel):
    """Request model for flow execution."""

    user_id: str
    prompt: str
    framework: str = "flutter"
    build_target: str = "apk"
    options: Optional[Dict] = None


# ---------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------
@router.post("/execute")
async def execute_flow(request: FlowExecuteRequest):
    """
    Execute complete app development flow.

    Example: