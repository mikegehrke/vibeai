# -------------------------------------------------------------
# VIBEAI – UNIFIED PREVIEW ROUTES
# -------------------------------------------------------------
"""
REST API for Unified Preview Manager

Provides simple endpoints for preview management across all frameworks.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/preview/unified", tags=["Preview Manager"])


class StartPreviewRequest(BaseModel):
    """Start preview request."""
    user_id: str
    project_id: str
    framework: str  # flutter | react | vue
    project_path: str
    port: Optional[int] = None


class StopPreviewRequest(BaseModel):
    """Stop preview request."""
    user_id: str
    project_id: str


class ReloadPreviewRequest(BaseModel):
    """Reload preview request."""
    user_id: str
    project_id: str


@router.post("/start")
async def start_preview(request: StartPreviewRequest):
    """
    Start preview server.

    Example:
    ```json
    {
        "user_id": "user123",
        "project_id": "proj456",
        "framework": "flutter",
        "project_path": "/tmp/vibeai_projects/proj456"
    }
    ```

    Returns:
    ```json
    {
        "success": true,
        "server_id": "server_abc",
        "preview_url": "http://localhost:8080",
        "framework": "flutter",
        "port": 8080
    }
    ```
    """
    from preview.unified_preview_manager import unified_preview_manager

    try:
        result = await unified_preview_manager.start_preview(
            user_id=request.user_id,
            project_id=request.project_id,
            framework=request.framework,
            project_path=request.project_path,
            port=request.port
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to start preview")
            )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop")
async def stop_preview(request: StopPreviewRequest):
    """
    Stop preview server.

    Example:
    ```json
    {
        "user_id": "user123",
        "project_id": "proj456"
    }
    ```
    """
    from preview.unified_preview_manager import unified_preview_manager

    try:
        result = await unified_preview_manager.stop_preview(
            user_id=request.user_id,
            project_id=request.project_id
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reload")
async def reload_preview(request: ReloadPreviewRequest):
    """
    Reload/hot reload preview.

    Example:
    ```json
    {
        "user_id": "user123",
        "project_id": "proj456"
    }
    ```
    """
    from preview.unified_preview_manager import unified_preview_manager

    try:
        result = await unified_preview_manager.reload_preview(
            user_id=request.user_id,
            project_id=request.project_id
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to reload preview")
            )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active/{user_id}/{project_id}")
async def get_active_preview(user_id: str, project_id: str):
    """
    Get active preview info.

    Example:
    ```
    GET /preview/unified/active/user123/proj456
    ```

    Returns:
    ```json
    {
        "server_id": "server_abc",
        "framework": "flutter",
        "user_id": "user123",
        "project_id": "proj456"
    }
    ```
    """
    from preview.unified_preview_manager import unified_preview_manager

    result = unified_preview_manager.get_active_preview(user_id, project_id)

    if not result:
        return {
            "active": False,
            "message": "No active preview"
        }

    return {
        "active": True,
        **result
    }


@router.get("/list")
async def list_active_previews():
    """
    List all active previews.

    Returns:
    ```json
    {
        "active_servers": [
            {
                "server_id": "server_abc",
                "framework": "flutter",
                "user_id": "user123",
                "project_id": "proj456"
            }
        ],
        "count": 1
    }
    ```
    """
    from preview.unified_preview_manager import unified_preview_manager

    return unified_preview_manager.list_active_previews()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    from preview.unified_preview_manager import unified_preview_manager

    previews = unified_preview_manager.list_active_previews()

    return {
        "status": "healthy",
        "service": "Unified Preview Manager",
        "active_previews": previews.get("count", 0)
    }
