"""
VIBEAI - State Management API Routes

REST API für State Management Code-Generierung
"""

import os
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from .state_manager import state_manager

router = APIRouter(prefix="/state", tags=["state"])

# ============================================================
# PYDANTIC MODELS
# ============================================================


class StateField(BaseModel):
    """State-Feld Definition"""

    name: str
    type: str  # int, String, number, boolean, etc.
    default: str  # Default-Wert als String


class GenerateStateRequest(BaseModel):
    """Request für State-Generierung"""

    framework: str  # flutter | react | vue
    library: str  # riverpod | provider | bloc | zustand | redux | etc.
    state_name: str = "app"
    fields: Optional[List[StateField]] = None
    project_id: Optional[str] = None
    save_to_file: bool = False


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
async def generate_state_code(request: Request):
    """
    Generiert State Management Code

    Body:
    {
        "framework": "flutter | react | vue",
        "library": "riverpod | zustand | pinia | etc.",
        "state_name": "user",
        "fields": [
            {"name": "count", "type": "int", "default": "0"},
            {"name": "name", "type": "String", "default": "''"}
        ],
        "project_id": "demo-project",
        "save_to_file": true
    }
    """
    try:
        body = await request.json()
        user = request.headers.get("x-user", "default")

        framework = body.get("framework")
        library = body.get("library")
        state_name = body.get("state_name", "app")
        fields = body.get("fields")
        project_id = body.get("project_id")
        save_to_file = body.get("save_to_file", False)

        if not framework or not library:
            raise HTTPException(status_code=400, detail="framework und library sind erforderlich")

        # Felder konvertieren
        if fields:
            fields = [{"name": f["name"], "type": f["type"], "default": f["default"]} for f in fields]

        # Base Path ermitteln (falls speichern gewünscht)
        base_path = None
        if save_to_file and project_id:
            base_path = get_project_path(user, project_id)

        # State generieren
        result = state_manager.generate_state(
            framework=framework,
            library=library,
            state_name=state_name,
            fields=fields,
            base_path=base_path,
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/libraries")
async def get_supported_libraries():
    """
    Listet unterstützte State Management Libraries

    Returns:
    {
        "flutter": ["riverpod", "provider", "bloc", "getx"],
        "react": ["zustand", "redux", "context", "recoil"],
        "vue": ["pinia", "vuex"]
    }
    """
    return state_manager.supported_frameworks


@router.get("/templates/{library}")
async def get_library_template(library: str):
    """
    Gibt Template-Code für Library zurück

    Params:
        library: riverpod | zustand | pinia | etc.
    """
    try:
        # Standard-Generierung ohne Speichern
        result = state_manager.generate_state(
            framework=("flutter" if library in ["riverpod", "provider", "bloc", "getx"] else "react"),
            library=library,
            state_name="example",
            fields=[
                {
                    "name": "count",
                    "type": "int" if library.startswith("r") else "number",
                    "default": "0",
                }
            ],
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health Check für State Manager"""
    return {
        "status": "healthy",
        "service": "state-manager",
        "supported_frameworks": list(state_manager.supported_frameworks.keys()),
        "total_libraries": sum(len(libs) for libs in state_manager.supported_frameworks.values()),
    }