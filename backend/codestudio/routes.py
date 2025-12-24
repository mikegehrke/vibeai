# -------------------------------------------------------------
# VIBEAI – CODE STUDIO ROUTES (Run Code, File Ops, Projects)
# -------------------------------------------------------------
import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from auth import get_current_user_v2
from billing.limiter import check_user_rate_limit
from codestudio.executor import execute_code
from codestudio.file_manager import file_manager
from codestudio.project_manager import project_manager
from db import get_db

logger = logging.getLogger("codestudio")

router = APIRouter(prefix="/codestudio", tags=["Code Studio"])


# -------------------------------------------------------------
# RUN CODE
# -------------------------------------------------------------
@router.post("/run")
async def run_code(request: Request, user=Depends(get_current_user_v2), db: Session = Depends(get_db)):
    """
    Execute code in sandboxed environment.

    Supports: Python, JavaScript, TypeScript, Dart, Swift, Kotlin, Java, C#
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "Invalid JSON")

    language = body.get("language")
    code = body.get("code")
    project_id = body.get("project_id")
    stdin = body.get("stdin", "")

    if not language or not code:
        raise HTTPException(400, "Missing 'language' or 'code'")

    # Rate & Cost Limit Check
    try:
        check_user_rate_limit(
            user=user,
            tokens=2000,
            provider="openai",
            feature="code_studio",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(429, f"Rate limit exceeded: {str(e)}")

    # Execute Code
    try:
        result = await execute_code(
            language=language,
            code=code,
            user_email=user.email,
            project_id=project_id,
            stdin=stdin,
            db=db,
        )

        return result

    except Exception as e:
        logger.error(f"Code execution failed: {e}")
        raise HTTPException(500, f"Execution error: {str(e)}")


# -------------------------------------------------------------
# FILE: CREATE
# -------------------------------------------------------------
@router.post("/file/create")
async def create_file(request: Request, user=Depends(get_current_user_v2)):
    """
    Create new file in project.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "Invalid JSON")

    project_id = body.get("project_id")
    filename = body.get("filename")
    content = body.get("content", "")

    if not project_id or not filename:
        raise HTTPException(400, "Missing 'project_id' or 'filename'")

    try:
        result = file_manager.create_file(
            user_email=user.email,
            project_id=project_id,
            filename=filename,
            content=content,
        )

        return {"success": True, "file": result}

    except Exception as e:
        logger.error(f"File creation failed: {e}")
        raise HTTPException(500, str(e))


# -------------------------------------------------------------
# FILE: READ
# -------------------------------------------------------------
@router.get("/file/read")
async def read_file(project_id: str, filename: str, user=Depends(get_current_user_v2)):
    """
    Read file content from project.
    """
    try:
        content = file_manager.read_file(user_email=user.email, project_id=project_id, filename=filename)

        return {"content": content, "filename": filename}

    except Exception as e:
        logger.error(f"File read failed: {e}")
        raise HTTPException(404, str(e))


# -------------------------------------------------------------
# FILE: UPDATE
# -------------------------------------------------------------
@router.post("/file/update")
async def update_file(request: Request, user=Depends(get_current_user_v2)):
    """
    Update existing file content.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "Invalid JSON")

    project_id = body.get("project_id")
    filename = body.get("filename")
    content = body.get("content")

    if not project_id or not filename or content is None:
        raise HTTPException(400, "Missing required fields")

    try:
        result = file_manager.update_file(
            user_email=user.email,
            project_id=project_id,
            filename=filename,
            content=content,
        )

        return {"success": True, "file": result}

    except Exception as e:
        logger.error(f"File update failed: {e}")
        raise HTTPException(500, str(e))


# -------------------------------------------------------------
# FILE: LIST
# -------------------------------------------------------------
@router.get("/file/list")
async def list_files(project_id: str, user=Depends(get_current_user_v2)):
    """
    List all files in project.
    """
    try:
        files = file_manager.list_files(user_email=user.email, project_id=project_id)

        return {"files": files, "count": len(files)}

    except Exception as e:
        logger.error(f"File listing failed: {e}")
        raise HTTPException(500, str(e))


# -------------------------------------------------------------
# FILE: DELETE
# -------------------------------------------------------------
@router.post("/file/delete")
async def delete_file(request: Request, user=Depends(get_current_user_v2)):
    """
    Delete file from project.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "Invalid JSON")

    project_id = body.get("project_id")
    filename = body.get("filename")

    if not project_id or not filename:
        raise HTTPException(400, "Missing 'project_id' or 'filename'")

    try:
        file_manager.delete_file(user_email=user.email, project_id=project_id, filename=filename)

        return {"success": True, "message": f"Deleted {filename}"}

    except Exception as e:
        logger.error(f"File deletion failed: {e}")
        raise HTTPException(500, str(e))


# -------------------------------------------------------------
# PROJECT: CREATE
# -------------------------------------------------------------
@router.post("/project/create")
async def create_project(request: Request, user=Depends(get_current_user_v2)):
    """
    Create new Code Studio project.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(400, "Invalid JSON")

    name = body.get("name")
    description = body.get("description", "")
    language = body.get("language", "python")

    if not name:
        raise HTTPException(400, "Missing 'name'")

    try:
        project = project_manager.create_project(
            user_email=user.email, name=name, description=description, language=language
        )

        return {"success": True, "project": project}

    except Exception as e:
        logger.error(f"Project creation failed: {e}")
        raise HTTPException(500, str(e))


# -------------------------------------------------------------
# PROJECT: LIST
# -------------------------------------------------------------
@router.get("/project/list")
async def list_projects(user=Depends(get_current_user_v2)):
    """
    List all user projects.
    """
    try:
        projects = project_manager.list_projects(user_email=user.email)

        return {"projects": projects, "count": len(projects)}

    except Exception as e:
        logger.error(f"Project listing failed: {e}")
        raise HTTPException(500, str(e))


# -------------------------------------------------------------
# PROJECT: GET
# -------------------------------------------------------------
@router.get("/project/{project_id}")
async def get_project(project_id: str, user=Depends(get_current_user_v2)):
    """
    Get project details.
    """
    try:
        project = project_manager.get_project(user_email=user.email, project_id=project_id)

        return project

    except Exception as e:
        logger.error(f"Project fetch failed: {e}")
        raise HTTPException(404, str(e))


# -------------------------------------------------------------
# PROJECT: DELETE
# -------------------------------------------------------------
@router.delete("/project/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user_v2)):
    """
    Delete project and all its files.
    """
    try:
        project_manager.delete_project(user_email=user.email, project_id=project_id)

        return {"success": True, "message": f"Deleted project {project_id}"}

    except Exception as e:
        logger.error(f"Project deletion failed: {e}")
        raise HTTPException(500, str(e))


# -------------------------------------------------------------
# SUPPORTED LANGUAGES
# -------------------------------------------------------------
@router.get("/languages")
async def get_supported_languages():
    """
    Get list of supported programming languages.
    """
    return {
        "languages": [
            {"id": "python", "name": "Python", "version": "3.9+", "icon": "🐍"},
            {
                "id": "javascript",
                "name": "JavaScript",
                "version": "Node.js 18+",
                "icon": "📜",
            },
            {"id": "typescript", "name": "TypeScript", "version": "5.0+", "icon": "📘"},
            {"id": "dart", "name": "Dart", "version": "3.0+", "icon": "🎯"},
            {"id": "swift", "name": "Swift", "version": "5.8+", "icon": "🦅"},
            {"id": "kotlin", "name": "Kotlin", "version": "1.8+", "icon": "🅺"},
            {"id": "java", "name": "Java", "version": "17+", "icon": "☕"},
            {"id": "csharp", "name": "C#", "version": ".NET 7+", "icon": "#️⃣"},
        ]
    }


# -------------------------------------------------------------
# EXECUTION STATS
# -------------------------------------------------------------
@router.get("/stats")
async def get_execution_stats(user=Depends(get_current_user_v2)):
    """
    Get user's Code Studio usage statistics.
    """
    # TODO: Implement stats tracking
    return {
        "total_executions": 0,
        "total_projects": len(project_manager.list_projects(user.email)),
        "languages_used": [],
        "total_runtime_seconds": 0,
    }