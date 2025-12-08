# -------------------------------------------------------------
# VIBEAI – PROJECT GENERATOR ROUTES
# -------------------------------------------------------------
"""
REST API for Project Generator

Endpoints:
- POST /generator/create - Create new project
- GET /generator/list - List all projects
- GET /generator/project/{id} - Get project info
- DELETE /generator/project/{id} - Delete project
- GET /generator/stats - Get statistics
"""

from typing import Dict, List, Optional

from ai.project_generator.generator import project_generator
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/generator", tags=["Project Generator"])

# ============================================================
# REQUEST/RESPONSE MODELS
# ============================================================


class CreateProjectRequest(BaseModel):
    """Request to create new project."""

    project_id: str
    framework: str  # flutter | react | vue | nextjs | node
    project_name: str
    description: Optional[str] = ""
    author: Optional[str] = "VibeAI"
    git_init: bool = False
    install_deps: bool = False
    template_type: str = "basic"  # basic | advanced

    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "myapp_123",
                "framework": "react",
                "project_name": "My Awesome App",
                "description": "A social media app",
                "git_init": True,
                "install_deps": False,
            }
        }


class CreateProjectResponse(BaseModel):
    """Response after project creation."""

    success: bool
    project_path: Optional[str] = None
    framework: Optional[str] = None
    files_created: Optional[int] = None
    git_initialized: Optional[bool] = None
    dependencies_installed: Optional[bool] = None
    error: Optional[str] = None


class ProjectInfo(BaseModel):
    """Project information."""

    project_id: str
    project_path: str
    framework: str
    file_count: Optional[int] = None
    size_mb: Optional[float] = None
    created_at: Optional[str] = None
    modified_at: Optional[str] = None


class ProjectsList(BaseModel):
    """List of projects."""

    projects: List[Dict]
    total: int


class GeneratorStats(BaseModel):
    """Generator statistics."""

    total_projects: int
    frameworks: Dict[str, int]
    total_size_mb: float
    output_directory: str


# ============================================================
# ENDPOINTS
# ============================================================


@router.post("/create", response_model=CreateProjectResponse)
async def create_project(request: CreateProjectRequest):
    """
    Create new project with framework-specific structure.

    Supports:
    - Flutter (Mobile + Web)
    - React (Vite)
    - Next.js (Full-stack)
    - Vue.js (Vite)
    - Node.js (Express)

    Optional features:
    - Git initialization
    - Dependency installation
    - Custom templates
    """
    try:
        options = {
            "description": request.description,
            "author": request.author,
            "git_init": request.git_init,
            "install_deps": request.install_deps,
            "template_type": request.template_type,
        }

        result = await project_generator.create_project(
            project_id=request.project_id,
            framework=request.framework,
            project_name=request.project_name,
            options=options,
        )

        return CreateProjectResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list", response_model=ProjectsList)
async def list_projects():
    """
    List all generated projects.

    Returns project summaries with framework, path, and creation time.
    """
    try:
        projects = project_generator.list_projects()

        return ProjectsList(projects=projects, total=len(projects))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/project/{project_id}", response_model=ProjectInfo)
async def get_project_info(project_id: str):
    """
    Get detailed information about specific project.

    Includes:
    - Framework type
    - File count
    - Size in MB
    - Timestamps
    """
    try:
        info = project_generator.get_project_info(project_id)

        if not info:
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

        return ProjectInfo(**info)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/project/{project_id}")
async def delete_project(project_id: str):
    """
    Delete project completely.

    Removes all files and directories.
    """
    try:
        if not project_generator.project_exists(project_id):
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

        success = project_generator.delete_project(project_id)

        return {"success": success, "message": f"Project '{project_id}' deleted"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=GeneratorStats)
async def get_stats():
    """
    Get global statistics.

    Returns:
    - Total projects
    - Framework distribution
    - Total disk usage
    """
    try:
        stats = project_generator.get_stats()
        return GeneratorStats(**stats)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/frameworks")
async def get_supported_frameworks():
    """
    Get list of supported frameworks.

    Returns framework names, descriptions, and features.
    """
    return {
        "frameworks": [
            {
                "id": "flutter",
                "name": "Flutter",
                "description": "Google's UI toolkit for mobile, web & desktop",
                "features": ["Cross-platform", "Hot reload", "Native performance"],
                "build_types": ["APK", "Web", "Desktop"],
            },
            {
                "id": "react",
                "name": "React (Vite)",
                "description": "Modern React with Vite tooling",
                "features": ["Fast HMR", "Component-based", "Modern tooling"],
                "build_types": ["Web"],
            },
            {
                "id": "nextjs",
                "name": "Next.js",
                "description": "Full-stack React framework with SSR",
                "features": ["SSR/SSG", "API routes", "File-based routing"],
                "build_types": ["Web", "Static"],
            },
            {
                "id": "vue",
                "name": "Vue.js 3 (Vite)",
                "description": "Progressive JavaScript framework",
                "features": ["Composition API", "Fast HMR", "Lightweight"],
                "build_types": ["Web"],
            },
            {
                "id": "node",
                "name": "Node.js (Express)",
                "description": "Backend REST API server",
                "features": ["Express.js", "CORS enabled", "JSON API"],
                "build_types": ["Server"],
            },
        ]
    }


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Project Generator", "version": "1.0.0"}
