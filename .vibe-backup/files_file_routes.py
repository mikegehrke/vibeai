# -------------------------------------------------------------
# VIBEAI – FILE ROUTES (READ / WRITE / DELETE / LIST)
# -------------------------------------------------------------
"""
Complete File Operations API

Endpoints:
- GET  /files/list - List all files in project
- POST /files/read - Read file content
- POST /files/write - Write/update file content
- POST /files/delete - Delete file
- POST /files/mkdir - Create folder

Features:
- Multi-user support
- UTF-8 encoding
- Auto-folder creation
- Relative path handling
- Security validation
"""

import os

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(prefix="/files", tags=["Files"])

# -------------------------------------------------------------
# PYDANTIC MODELS
# -------------------------------------------------------------


class ReadFileRequest(BaseModel):
    projectId: str
    file: str


class WriteFileRequest(BaseModel):
    projectId: str
    file: str
    content: str


class DeleteFileRequest(BaseModel):
    projectId: str
    file: str


class CreateFolderRequest(BaseModel):
    projectId: str
    folder: str


# -------------------------------------------------------------
# HELPER FUNCTIONS
# -------------------------------------------------------------


def get_project_path(user_email: str, project_id: str) -> str:
    """
    Get project path for user.

    Falls back to /tmp/vibeai_projects if project_manager unavailable.
    """
    try:
        from codestudio.project_manager import project_manager

        return project_manager.get_project_path(user_email, project_id)
    except (ImportError, AttributeError):
        # Fallback for testing
        base_path = "/tmp/vibeai_projects"
        return os.path.join(base_path, user_email or "default", project_id)


def validate_path(project_path: str, file_path: str) -> str:
    """
    Validate and resolve file path.

    Prevents directory traversal attacks.
    """
    full_path = os.path.abspath(os.path.join(project_path, file_path))
    project_path = os.path.abspath(project_path)

    if not full_path.startswith(project_path):
        raise HTTPException(status_code=403, detail="Access denied: Path outside project directory")

    return full_path


# -------------------------------------------------------------
# LIST FILES
# -------------------------------------------------------------


@router.get("/list")
async def list_files(projectId: str, request: Request):
    """
    List all files in project.

    Returns relative paths sorted alphabetically.
    Excludes .git, node_modules, __pycache__, etc.
    """
    user_email = request.headers.get("x-user", "default")
    project_path = get_project_path(user_email, projectId)

    if not os.path.exists(project_path):
        return {"files": []}

    file_list = []

    # Directories to exclude
    exclude_dirs = {
        ".git",
        "node_modules",
        "__pycache__",
        ".next",
        "build",
        "dist",
        ".vscode",
        ".idea",
        "venv",
    }

    for root, dirs, files in os.walk(project_path):
        # Remove excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        for f in files:
            # Skip hidden files and build artifacts
            if f.startswith(".") or f.endswith((".pyc", ".log")):
                continue

            full = os.path.join(root, f)
            rel = os.path.relpath(full, project_path)
            file_list.append(rel)

    return {"files": sorted(file_list)}


# -------------------------------------------------------------
# READ FILE
# -------------------------------------------------------------


@router.post("/read")
async def read_file(request: Request):
    """
    Read file content.

    Returns UTF-8 decoded content.
    Handles binary files gracefully.
    """
    body = await request.json()
    project_id = body.get("projectId")
    file = body.get("file")

    if not project_id or not file:
        raise HTTPException(status_code=400, detail="Missing projectId or file")

    user_email = request.headers.get("x-user", "default")
    project_path = get_project_path(user_email, project_id)
    full_path = validate_path(project_path, file)

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail=f"File not found: {file}")

    if not os.path.isfile(full_path):
        raise HTTPException(status_code=400, detail=f"Path is not a file: {file}")

    try:
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()

        return {"content": content, "file": file, "size": len(content)}
    except UnicodeDecodeError:
        # Binary file
        raise HTTPException(status_code=400, detail="Cannot read binary file as text")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")


# -------------------------------------------------------------
# WRITE FILE
# -------------------------------------------------------------


@router.post("/write")
async def write_file(request: Request):
    """
    Write or update file content.

    Creates parent directories automatically.
    Supports UTF-8 content.
    Triggers preview reload.
    """
    body = await request.json()
    project_id = body.get("projectId")
    file = body.get("file")
    content = body.get("content", "")

    if not project_id or not file:
        raise HTTPException(status_code=400, detail="Missing projectId or file")

    user_email = request.headers.get("x-user", "default")
    project_path = get_project_path(user_email, project_id)
    full_path = validate_path(project_path, file)

    try:
        # Create parent directories
        folder = os.path.dirname(full_path)
        if folder:
            os.makedirs(folder, exist_ok=True)

        # Write file
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)

        # Trigger preview reload
        try:
            from preview.preview_reload import preview_reload

            await preview_reload.notify_reload(user_email, project_id)
        except (ImportError, AttributeError):
            pass  # Preview reload not available

        return {"success": True, "file": file, "size": len(content)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error writing file: {str(e)}")


# -------------------------------------------------------------
# DELETE FILE
# -------------------------------------------------------------


@router.post("/delete")
async def delete_file(request: Request):
    """
    Delete file.

    Only deletes files, not directories.
    Returns success even if file doesn't exist.
    """
    body = await request.json()
    project_id = body.get("projectId")
    file = body.get("file")

    if not project_id or not file:
        raise HTTPException(status_code=400, detail="Missing projectId or file")

    user_email = request.headers.get("x-user", "default")
    project_path = get_project_path(user_email, project_id)
    full_path = validate_path(project_path, file)

    try:
        if os.path.exists(full_path):
            if os.path.isfile(full_path):
                os.remove(full_path)
            else:
                raise HTTPException(status_code=400, detail="Path is not a file")

        return {"success": True, "file": file}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")


# -------------------------------------------------------------
# CREATE FOLDER
# -------------------------------------------------------------


@router.post("/mkdir")
async def create_folder(request: Request):
    """
    Create folder (and parent folders).

    Creates entire path if needed.
    Returns success even if folder exists.
    """
    body = await request.json()
    project_id = body.get("projectId")
    folder = body.get("folder")

    if not project_id or not folder:
        raise HTTPException(status_code=400, detail="Missing projectId or folder")

    user_email = request.headers.get("x-user", "default")
    project_path = get_project_path(user_email, project_id)
    full_path = validate_path(project_path, folder)

    try:
        os.makedirs(full_path, exist_ok=True)

        return {"success": True, "folder": folder}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating folder: {str(e)}")


# -------------------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------------------


@router.get("/health")
async def health_check():
    """File API health check."""
    return {"status": "healthy", "service": "File Operations API", "version": "1.0.0"}
