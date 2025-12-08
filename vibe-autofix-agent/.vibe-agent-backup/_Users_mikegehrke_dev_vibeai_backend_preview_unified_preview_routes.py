# -------------------------------------------------------------
# VIBEAI – UNIFIED PREVIEW ROUTES
# -------------------------------------------------------------
"""
REST API for Unified Preview Manager

Provides simple endpoints for preview management across all frameworks.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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