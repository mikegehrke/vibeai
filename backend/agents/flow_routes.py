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

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
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
    ```json
    {
        "user_id": "user123",
        "prompt": "Create a login screen with email and password",
        "framework": "flutter",
        "build_target": "apk"
    }
    ```
    
    Returns:
    ```json
    {
        "success": true,
        "flow_id": "flow_abc123",
        "status": "completed",
        "results": {
            "ui": {...},
            "code": {...},
            "preview": {...},
            "build": {...},
            "download": {
                "url": "http://localhost:8000/downloads/flow_abc123.zip"
            }
        },
        "duration": 45.2
    }
    ```
    """
    result = await flow_controller.execute_full_flow(
        user_id=request.user_id,
        prompt=request.prompt,
        framework=request.framework,
        build_target=request.build_target,
        options=request.options
    )
    
    return result


@router.get("/{flow_id}")
async def get_flow_status(flow_id: str):
    """
    Get flow status.
    
    Returns:
    ```json
    {
        "flow_id": "flow_abc123",
        "user_id": "user123",
        "prompt": "Create login screen",
        "framework": "flutter",
        "status": "building",
        "progress": 75,
        "current_step": "building",
        "results": {...},
        "errors": []
    }
    ```
    """
    status = flow_controller.get_flow_status(flow_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    return status


@router.get("/active")
async def list_active_flows():
    """
    List all active flows.
    
    Returns:
    ```json
    {
        "active_flows": [
            {
                "flow_id": "flow_abc123",
                "user_id": "user123",
                "status": "building",
                "progress": 75
            }
        ],
        "count": 1
    }
    ```
    """
    flows = flow_controller.list_active_flows()
    
    return {
        "active_flows": flows,
        "count": len(flows)
    }


@router.get("/user/{user_id}")
async def list_user_flows(user_id: str):
    """
    List all flows for a specific user.
    
    Returns:
    ```json
    {
        "flows": [
            {
                "flow_id": "flow_abc123",
                "status": "completed",
                "prompt": "Create login screen"
            }
        ],
        "count": 1
    }
    ```
    """
    flows = flow_controller.list_user_flows(user_id)
    
    return {
        "flows": flows,
        "count": len(flows)
    }


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Flow Controller",
        "active_flows": len(flow_controller.active_flows),
        "total_flows": len(flow_controller.flow_history)
    }
