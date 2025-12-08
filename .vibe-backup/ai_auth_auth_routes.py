# -------------------------------------------------------------
# VIBEAI – AUTH GENERATOR API ROUTES
# -------------------------------------------------------------
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from .auth_generator import auth_generator

router = APIRouter(prefix="/auth-gen", tags=["Auth Generator"])


class GenerateBackendRequest(BaseModel):
    """Request für Backend Auth Generierung"""

    framework: str  # fastapi, nodejs, django
    project_id: str
    options: Optional[Dict[str, Any]] = None


class GenerateFrontendRequest(BaseModel):
    """Request für Frontend Auth UI Generierung"""

    framework: str  # flutter, react, nextjs, vue
    project_id: str
    style: Optional[str] = "material"


class AuthFrameworksResponse(BaseModel):
    """Verfügbare Auth Frameworks"""

    backends: List[str]
    frontends: List[str]


@router.post("/generate/backend")
async def generate_auth_backend(request: Request, data: GenerateBackendRequest):
    """
    Generiert komplettes Auth Backend

    POST /auth-gen/generate/backend
    {
        "framework": "fastapi",
        "project_id": "my-app",
        "options": {
            "jwt_secret": "custom_secret",
            "session_timeout": 3600
        }
    }

    Returns:
    {
        "success": true,
        "framework": "fastapi",
        "files": ["/path/to/controller.py", ...],
        "endpoints": ["/auth/register", "/auth/login", ...],
        "features": ["JWT", "Email Validation"]
    }
    """
    try:
        # Bestimme Projekt-Pfad
        base_path = f"/tmp/vibeai_projects/{data.project_id}"

        result = auth_generator.generate_backend(framework=data.framework, base_path=base_path, options=data.options)

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Fehler bei Generierung"))

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")


@router.post("/generate/frontend")
async def generate_auth_frontend(request: Request, data: GenerateFrontendRequest):
    """
    Generiert komplettes Auth Frontend UI

    POST /auth-gen/generate/frontend
    {
        "framework": "flutter",
        "project_id": "my-app",
        "style": "material"
    }

    Returns:
    {
        "success": true,
        "framework": "flutter",
        "files": ["/path/to/login_screen.dart", ...],
        "screens": ["LoginScreen", "SignupScreen", "ForgotPasswordScreen"]
    }
    """
    try:
        # Bestimme Projekt-Pfad
        base_path = f"/tmp/vibeai_projects/{data.project_id}"

        result = auth_generator.generate_frontend_ui(framework=data.framework, base_path=base_path, style=data.style)

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Fehler bei Generierung"))

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")


@router.post("/generate/full")
async def generate_full_auth(request: Request, backend_framework: str, frontend_framework: str, project_id: str):
    """
    Generiert komplettes Auth System (Backend + Frontend)

    POST /auth-gen/generate/full?backend_framework=fastapi&frontend_framework=flutter&project_id=my-app

    Returns:
    {
        "success": true,
        "backend": {...},
        "frontend": {...}
    }
    """
    try:
        base_path = f"/tmp/vibeai_projects/{project_id}"

        # Backend generieren
        backend_result = auth_generator.generate_backend(framework=backend_framework, base_path=base_path)

        if not backend_result.get("success"):
            raise HTTPException(status_code=400, detail=f"Backend Fehler: {backend_result.get('error')}")

        # Frontend generieren
        frontend_result = auth_generator.generate_frontend_ui(framework=frontend_framework, base_path=base_path)

        if not frontend_result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=f"Frontend Fehler: {frontend_result.get('error')}",
            )

        return {
            "success": True,
            "backend": backend_result,
            "frontend": frontend_result,
            "total_files": len(backend_result.get("files", [])) + len(frontend_result.get("files", [])),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")


@router.get("/frameworks", response_model=AuthFrameworksResponse)
async def get_supported_frameworks():
    """
    Gibt alle unterstützten Auth Frameworks zurück

    GET /auth-gen/frameworks

    Returns:
    {
        "backends": ["fastapi", "nodejs", "django"],
        "frontends": ["flutter", "react", "nextjs", "vue"]
    }
    """
    return AuthFrameworksResponse(
        backends=auth_generator.supported_backends,
        frontends=auth_generator.supported_frontends,
    )


@router.get("/template/{framework}/{type}")
async def get_auth_template(framework: str, type: str):
    """
    Gibt Template-Vorschau für spezifisches Framework

    GET /auth-gen/template/flutter/login
    GET /auth-gen/template/react/signup

    Returns:
    {
        "framework": "flutter",
        "type": "login",
        "preview": "... code preview ..."
    }
    """
    templates = {
        "flutter": {
            "login": "LoginScreen with Material Design",
            "signup": "SignupScreen with validation",
            "forgot": "ForgotPasswordScreen",
        },
        "react": {
            "login": "Login component with hooks",
            "signup": "Signup component with form validation",
        },
        "fastapi": {
            "controller": "FastAPI auth routes with JWT",
            "models": "Pydantic models for auth",
        },
        "nodejs": {
            "controller": "Express auth routes with bcrypt",
            "routes": "Auth router configuration",
        },
    }

    if framework not in templates:
        raise HTTPException(status_code=404, detail=f"Framework '{framework}' nicht gefunden")

    if type not in templates[framework]:
        raise HTTPException(status_code=404, detail=f"Template '{type}' nicht verfügbar")

    return {"framework": framework, "type": type, "preview": templates[framework][type]}


@router.get("/health")
async def health_check():
    """Health Check für Auth Generator"""
    return {
        "status": "healthy",
        "service": "Auth Generator",
        "version": "1.0.0",
        "features": [
            "Backend Generation (FastAPI, Node.js)",
            "Frontend Generation (Flutter, React, Next.js)",
            "JWT Authentication",
            "Full Auth Flow (Login, Signup, Forgot Password)",
        ],
    }
