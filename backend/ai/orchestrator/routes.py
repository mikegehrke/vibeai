# -------------------------------------------------------------
# VIBEAI – ORCHESTRATOR API ROUTES
# -------------------------------------------------------------
"""
REST API for Multi-Agent Orchestrator

Endpoints:
- POST /orchestrator/handle - Handle user prompt
- POST /orchestrator/workflow - Execute workflow
- POST /orchestrator/project/create - Create new project
- GET /orchestrator/project/{project_id} - Get project context
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict

router = APIRouter(prefix="/orchestrator", tags=["Orchestrator"])


# Request Models
class HandleRequest(BaseModel):
    """Handle user prompt request."""
    user_id: str
    project_id: str
    prompt: str
    context: Optional[Dict] = None


class WorkflowRequest(BaseModel):
    """Workflow execution request."""
    user_id: str
    project_id: str
    workflow: str  # create_app | build_app | full_cycle
    params: Optional[Dict] = None


class CreateProjectRequest(BaseModel):
    """Create project request."""
    user_id: str
    project_id: str
    framework: str  # flutter | react | vue | node
    project_name: str
    options: Optional[Dict] = None


# Endpoints
@router.post("/handle")
async def handle_prompt(request: HandleRequest):
    """
    Handle user prompt with multi-agent orchestrator.

    Example:
    ```json
    {
        "user_id": "user123",
        "project_id": "proj456",
        "prompt": "Create a login screen with email and password"
    }
    ```

    Returns:
    ```json
    {
        "agent": "ui_agent",
        "intent": "ui",
        "result": {
            "screen": {...}
        },
        "success": true
    }
    ```
    """
    from ai.orchestrator.orchestrator import orchestrator

    try:
        result = await orchestrator.handle(
            user_id=request.user_id,
            project_id=request.project_id,
            prompt=request.prompt,
            context=request.context
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/workflow")
async def execute_workflow(request: WorkflowRequest):
    """
    Execute predefined workflow.

    Workflows:
    - create_app: UI → Code → Preview
    - build_app: Code → Build → Deploy
    - full_cycle: UI → Code → Preview → Build → Deploy

    Example:
    ```json
    {
        "user_id": "user123",
        "project_id": "proj456",
        "workflow": "full_cycle",
        "params": {
            "prompt": "Create social media app"
        }
    }
    ```
    """
    from ai.orchestrator.orchestrator import orchestrator

    try:
        result = await orchestrator.execute_workflow(
            user_id=request.user_id,
            project_id=request.project_id,
            workflow=request.workflow,
            params=request.params
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/project/create")
async def create_project(request: CreateProjectRequest):
    """
    Create new project with template.

    Example:
    ```json
    {
        "user_id": "user123",
        "project_id": "proj456",
        "framework": "flutter",
        "project_name": "my_app"
    }
    ```

    Returns:
    ```json
    {
        "success": true,
        "project_path": "/tmp/vibeai_projects/proj456",
        "framework": "flutter",
        "files_created": 15
    }
    ```
    """
    from ai.project_generator.generator import project_generator
    from ai.orchestrator.memory.project_context import project_context

    try:
        # Create project structure
        result = await project_generator.create_project(
            project_id=request.project_id,
            framework=request.framework,
            project_name=request.project_name,
            options=request.options
        )

        # Update context
        project_context.update(
            user_id=request.user_id,
            project_id=request.project_id,
            updates={
                "framework": request.framework,
                "project_path": result.get("project_path"),
                "project_name": request.project_name
            }
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/project/{project_id}")
async def get_project_context(project_id: str, user_id: str):
    """
    Get project context.

    Example:
    ```
    GET /orchestrator/project/proj456?user_id=user123
    ```

    Returns:
    ```json
    {
        "user_id": "user123",
        "project_id": "proj456",
        "framework": "flutter",
        "screens": [...],
        "code": {...},
        "project_path": "/tmp/vibeai_projects/proj456"
    }
    ```
    """
    from ai.orchestrator.memory.project_context import project_context

    try:
        context = project_context.load(user_id, project_id)
        return context

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects")
async def list_user_projects(user_id: str):
    """
    List all projects for a user.

    Example:
    ```
    GET /orchestrator/projects?user_id=user123
    ```

    Returns:
    ```json
    {
        "projects": [
            {
                "project_id": "proj456",
                "framework": "flutter",
                "project_name": "my_app"
            }
        ],
        "count": 1
    }
    ```
    """
    from ai.orchestrator.memory.project_context import project_context

    try:
        projects = project_context.list_projects(user_id)

        return {
            "projects": projects,
            "count": len(projects)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/project/{project_id}")
async def delete_project(project_id: str, user_id: str):
    """Delete project."""
    from ai.orchestrator.memory.project_context import project_context
    from ai.project_generator.generator import project_generator

    try:
        # Delete context
        project_context.delete(user_id, project_id)

        # Delete files
        project_generator.delete_project(project_id)

        return {"success": True, "message": "Project deleted"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Orchestrator"
    }
