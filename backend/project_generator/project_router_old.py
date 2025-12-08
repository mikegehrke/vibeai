# project_generator/project_router.py
# Clean, working project generator router

import os
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

# Import all generators
from project_generator.flutter_generator import flutter_project
from project_generator.next_generator import nextjs_project
from project_generator.node_generator import node_project
from project_generator.react_generator import react_project

# Import project manager for integration
try:
    from codestudio.project_manager import project_manager
except ImportError:
    project_manager = None

# Router für Project Generation
router = APIRouter(prefix="/projects", tags=["projects"])


# Pydantic Models
class ProjectRequest(BaseModel):
    framework: str = Field(
        ...,
        description="Framework: flutter, react, nextjs, node"
    )
    project_name: str
    description: str = Field(
        "A new project",
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
        json_schema_extra = {
            "example": {
                "framework": "react",
                "project_name": "my-awesome-app",
                "description": "My awesome React app",
                "options": {"include_router": True}
            }
        }


class ProjectResponse(BaseModel):
    success: bool
    message: str
    project_id: str
    project_path: str
    framework: str
    files_created: int
    total_size: int
    created_at: str
    files: List[Dict]


class CreateProjectResponse(BaseModel):
    success: bool
    project: ProjectResponse


# Generator mapping
generators = {
    "flutter": flutter_project,
    "react": react_project,
    "nextjs": nextjs_project,
    "node": node_project
}


def validate_framework(framework: str):
    """Validate supported framework"""
    if framework not in generators:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported framework: {framework}. "
                   f"Supported: {', '.join(generators.keys())}"
        )


def get_project_path(
    framework: str,
    project_name: str,
    user_id: Optional[str] = None
) -> str:
    """Generate project path"""
    base_path = os.getenv("PROJECTS_BASE_PATH", "./projects")
    
    if user_id:
        return os.path.join(base_path, user_id, framework, project_name)
    return os.path.join(base_path, framework, project_name)


def calculate_directory_size(directory_path: str) -> int:
    """Calculate total size of directory"""
    total_size = 0
    try:
        for dirpath, _, filenames in os.walk(directory_path):
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                try:
                    total_size += os.path.getsize(filepath)
                except (OSError, FileNotFoundError):
                    continue
    except (OSError, FileNotFoundError):
        pass
    return total_size


def get_files_info(project_path: str) -> List[Dict]:
    """Get information about all files in project"""
    files_info = []
    
    try:
        for root, _, files in os.walk(project_path):
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, project_path)
                
                try:
                    file_size = os.path.getsize(file_path)
                    files_info.append({
                        "name": file,
                        "path": relative_path,
                        "size": file_size,
                        "type": "file"
                    })
                except (OSError, FileNotFoundError):
                    continue
    except (OSError, FileNotFoundError):
        pass
        
    return files_info


@router.post("/create", response_model=ProjectResponse)
async def create_project(request: ProjectRequest):
    """
    Create a new project with the specified framework.
    
    Supports:
    - Flutter: Mobile/Web/Desktop apps
    - React: Web applications with Vite 
    - Next.js: Full-stack React applications
    - Node.js: Backend services with Express
    """
    try:
        # Validate framework
        validate_framework(request.framework)
        
        # Get project path
        project_path = get_project_path(
            request.framework, 
            request.project_name, 
            request.user_id
        )

        # Ensure directory exists
        os.makedirs(project_path, exist_ok=True)

        # Get generator
        generator = generators[request.framework]

        # Prepare options
        options = request.options or {}
        options.update({
            "description": request.description,
            "user_id": request.user_id
        })

        # Generate project
        result = generator.create_project(
            base_path=project_path, 
            project_name=request.project_name, 
            options=options
        )

        if not result.get("success", False):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Project generation failed"
            )

        # Register project if project manager available
        project_id = (
            f"{request.framework}_{request.project_name}_"
            f"{int(datetime.utcnow().timestamp())}"
        )

        if project_manager:
            try:
                project_manager.register_project(
                    project_id=project_id,
                    name=request.project_name,
                    framework=request.framework,
                    path=project_path,
                    user_id=request.user_id
                )
            except (ImportError, AttributeError, TypeError):
                # Continue even if registration fails
                pass

        # Calculate project info
        total_size = calculate_directory_size(project_path)
        files_info = get_files_info(project_path)

        return ProjectResponse(
            success=True,
            message=f"Project '{request.project_name}' created successfully!",
            project_id=project_id,
            project_path=project_path,
            framework=request.framework,
            files_created=result.get("files_created", len(files_info)),
            total_size=total_size,
            created_at=datetime.utcnow().isoformat(),
            files=files_info
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        ) from e


@router.get("/frameworks")
async def list_frameworks():
    """List all supported frameworks and their capabilities"""
    return {
        "frameworks": {
            "flutter": {
                "name": "Flutter",
                "description": "Cross-platform mobile and web apps",
                "platforms": ["ios", "android", "web", "desktop"],
                "language": "Dart"
            },
            "react": {
                "name": "React",
                "description": "Modern web applications with Vite",
                "platforms": ["web"],
                "language": "JavaScript/TypeScript"
            },
            "nextjs": {
                "name": "Next.js", 
                "description": "Full-stack React applications",
                "platforms": ["web"],
                "language": "JavaScript/TypeScript"
            },
            "node": {
                "name": "Node.js",
                "description": "Backend services with Express",
                "platforms": ["server"],
                "language": "JavaScript"
            }
        }
    }


@router.get("/templates")
async def list_templates():
    """List available project templates"""
    return {
        "templates": {
            "flutter": [
                "basic_app",
                "material_app", 
                "cupertino_app",
                "web_app"
            ],
            "react": [
                "basic_spa",
                "typescript_app",
                "pwa_app"
            ],
            "nextjs": [
                "basic_app",
                "api_routes",
                "full_stack"
            ],
            "node": [
                "express_api",
                "rest_service", 
                "microservice"
            ]
        }
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "generators": list(generators.keys()),
        "timestamp": datetime.utcnow().isoformat()
    }

