"""
VIBEAI - Navigation API Routes

REST API für automatische Navigation-Generierung
"""

import os
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from .navigation_manager import navigation_manager

router = APIRouter(prefix="/navigation", tags=["navigation"])

# ============================================================
# PYDANTIC MODELS
# ============================================================


class Screen(BaseModel):
    """Screen/Route Definition"""

    name: str
    path: Optional[str] = None
    params: Optional[Dict[str, Any]] = None


class GenerateNavigationRequest(BaseModel):
    """Request für Navigation-Generierung"""

    framework: str  # flutter | react | nextjs
    project_id: str
    screens: List[Screen]


class ExtractRoutesRequest(BaseModel):
    """Request für Route-Extraktion"""

    framework: str
    project_id: str


# ============================================================
# HELPER FUNCTIONS
# ============================================================


def get_project_path(user: str, project_id: str) -> str:
    """Ermittelt Projekt-Pfad"""
    base = os.path.expanduser("~/vibeai_projects")
    project_path = os.path.join(base, user, project_id)

    if not os.path.exists(project_path):
        os.makedirs(project_path, exist_ok=True)

    return project_path


# ============================================================
# ROUTES
# ============================================================


@router.post("/generate")
async def generate_navigation(request: Request):
    """
    Generiert Navigation-Code für Framework

    Body:
    {
        "framework": "flutter | react | nextjs",
        "project_id": "demo-project",
        "screens": [
            {"name": "Home", "path": "/"},
            {"name": "Profile", "path": "/profile"}
        ]
    }
    """
    try:
        body = await request.json()
        user = request.headers.get("x-user", "default")

        framework = body.get("framework")
        project_id = body.get("project_id")
        screens = body.get("screens", [])

        if not framework or not project_id:
            raise HTTPException(status_code=400, detail="framework und project_id sind erforderlich")

        # Projekt-Pfad ermitteln
        project_path = get_project_path(user, project_id)

        # Navigation generieren
        result = navigation_manager.generate_navigation(framework=framework, base_path=project_path, screens=screens)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract")
async def extract_routes(request: Request):
    """
    Extrahiert existierende Routes aus Projekt

    Body:
    {
        "framework": "flutter | react | nextjs",
        "project_id": "demo-project"
    }
    """
    try:
        body = await request.json()
        user = request.headers.get("x-user", "default")

        framework = body.get("framework")
        project_id = body.get("project_id")

        if not framework or not project_id:
            raise HTTPException(status_code=400, detail="framework und project_id sind erforderlich")

        project_path = get_project_path(user, project_id)

        result = navigation_manager.extract_existing_routes(framework=framework, base_path=project_path)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/frameworks")
async def get_supported_frameworks():
    """
    Listet unterstützte Frameworks

    Returns:
    {
        "frameworks": ["flutter", "react", "nextjs"],
        "count": 3
    }
    """
    return {
        "frameworks": navigation_manager.supported_frameworks,
        "count": len(navigation_manager.supported_frameworks),
    }


@router.get("/health")
async def health_check():
    """Health Check für Navigation Manager"""
    return {
        "status": "healthy",
        "service": "navigation-manager",
        "supported_frameworks": navigation_manager.supported_frameworks,
    }
