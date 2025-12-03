# -------------------------------------------------------------
# VIBEAI – PROJECT GENERATOR ROUTER
# -------------------------------------------------------------
"""
Project Generator API Router

REST API endpoints for creating projects across all frameworks:
- Flutter
- React
- Next.js
- Node.js/Express
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
import os
from datetime import datetime

# Import all generators
from project_generator.flutter_generator import flutter_project
from project_generator.react_generator import react_project
from project_generator.next_generator import nextjs_project
from project_generator.node_generator import node_project

# Import project manager for integration
try:
    from codestudio.project_manager import project_manager
except ImportError:
    project_manager = None


router = APIRouter(prefix="/project", tags=["Project Generator"])


# -------------------------------------------------------------
# PYDANTIC MODELS
# -------------------------------------------------------------

class CreateProjectRequest(BaseModel):
    """Request model for creating a new project."""
    
    framework: str = Field(
        ...,
        description="Framework type: flutter, react, nextjs, node"
    )
    project_name: str = Field(
        ...,
        description="Name of the project"
    )
    description: Optional[str] = Field(
        None,
        description="Project description"
    )
    options: Optional[Dict] = Field(
        default_factory=dict,
        description="Framework-specific options"
    )
    user_id: Optional[str] = Field(
        None,
        description="User ID for multi-tenant support"
    )

    class Config:
        schema_extra = {
            "example": {
                "framework": "react",
                "project_name": "my-awesome-app",
                "description": "My awesome React app",
                "options": {
                    "include_router": True
                }
            }
        }


class CreateProjectResponse(BaseModel):
    """Response model for project creation."""
    
    success: bool
    project_id: Optional[str] = None
    project_name: str
    framework: str
    project_path: str
    files_created: int
    created_at: str
    message: Optional[str] = None
    error: Optional[str] = None


class FrameworkInfo(BaseModel):
    """Information about a supported framework."""
    
    name: str
    display_name: str
    description: str
    features: List[str]


# -------------------------------------------------------------
# HELPER FUNCTIONS
# -------------------------------------------------------------

def get_generator(framework: str):
    """Get the appropriate generator for a framework."""
    
    generators = {
        "flutter": flutter_project,
        "react": react_project,
        "nextjs": nextjs_project,
        "next": nextjs_project,  # Alias
        "node": node_project,
        "express": node_project  # Alias
    }
    
    generator = generators.get(framework.lower())
    if not generator:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported framework: {framework}. Supported: {', '.join(generators.keys())}"
        )
    
    return generator


def get_project_path(framework: str, project_name: str, user_id: Optional[str] = None) -> str:
    """
    Generate project path.
    
    Structure:
    - With user_id: /tmp/vibeai_projects/{user_id}/{framework}/{project_name}
    - Without user_id: /tmp/vibeai_projects/{framework}/{project_name}
    """
    base_dir = "/tmp/vibeai_projects"
    
    if user_id:
        path = os.path.join(base_dir, user_id, framework, project_name)
    else:
        path = os.path.join(base_dir, framework, project_name)
    
    return path


def register_with_project_manager(
    project_id: str,
    framework: str,
    project_name: str,
    project_path: str,
    user_id: Optional[str] = None
):
    """Register project with project manager if available."""
    
    if not project_manager:
        return False
    
    try:
        project_manager.register_project(
            project_id=project_id,
            framework=framework,
            name=project_name,
            path=project_path,
            user_id=user_id,
            created_at=datetime.utcnow()
        )
        return True
    except Exception as e:
        print(f"⚠️  Could not register with project manager: {e}")
        return False


# -------------------------------------------------------------
# API ENDPOINTS
# -------------------------------------------------------------

@router.post("/create", response_model=CreateProjectResponse)
async def create_project(request: CreateProjectRequest):
    """
    Create a new project.
    
    Supports:
    - Flutter
    - React (Vite)
    - Next.js
    - Node.js (Express)
    
    Returns project details and file count.
    """
    
    try:
        # Get generator
        generator = get_generator(request.framework)
        
        # Generate project path
        project_path = get_project_path(
            request.framework,
            request.project_name,
            request.user_id
        )
        
        # Check if project exists
        if os.path.exists(project_path):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Project already exists at {project_path}"
            )
        
        # Prepare options
        options = request.options or {}
        if request.description:
            options["description"] = request.description
        
        # Create project
        result = generator.create_project(
            base_path=project_path,
            project_name=request.project_name,
            options=options
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Unknown error")
            )
        
        # Generate project ID
        project_id = f"{request.framework}_{request.project_name}_{int(datetime.utcnow().timestamp())}"
        
        # Register with project manager
        register_with_project_manager(
            project_id=project_id,
            framework=request.framework,
            project_name=request.project_name,
            project_path=project_path,
            user_id=request.user_id
        )
        
        return CreateProjectResponse(
            success=True,
            project_id=project_id,
            project_name=request.project_name,
            framework=request.framework,
            project_path=project_path,
            files_created=result.get("files_created", 0),
            created_at=datetime.utcnow().isoformat(),
            message=f"{request.framework} project created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )


@router.get("/frameworks", response_model=List[FrameworkInfo])
async def get_frameworks():
    """
    Get list of supported frameworks.
    
    Returns details about each framework including features.
    """
    
    frameworks = [
        FrameworkInfo(
            name="flutter",
            display_name="Flutter",
            description="Cross-platform mobile, web, and desktop apps",
            features=[
                "Material Design UI",
                "Hot reload",
                "Native performance",
                "Single codebase",
                "iOS & Android"
            ]
        ),
        FrameworkInfo(
            name="react",
            display_name="React",
            description="Modern web apps with Vite",
            features=[
                "Lightning-fast HMR",
                "Component-based",
                "React 18",
                "Vite build tool",
                "Production optimized"
            ]
        ),
        FrameworkInfo(
            name="nextjs",
            display_name="Next.js",
            description="Full-stack React framework with SSR",
            features=[
                "Server-Side Rendering",
                "Static Site Generation",
                "API Routes",
                "Image optimization",
                "SEO friendly"
            ]
        ),
        FrameworkInfo(
            name="node",
            display_name="Node.js",
            description="Express REST API backend",
            features=[
                "RESTful API",
                "Express framework",
                "CORS enabled",
                "Security headers",
                "Environment config"
            ]
        )
    ]
    
    return frameworks


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns service status and available frameworks.
    """
    
    return {
        "status": "healthy",
        "service": "Project Generator",
        "version": "2.0.0",
        "frameworks": ["flutter", "react", "nextjs", "node"],
        "timestamp": datetime.utcnow().isoformat()
    }
