# -------------------------------------------------------------
# VIBEAI – PROJECT DOWNLOAD & EXPORT
# -------------------------------------------------------------
"""
Project Download & Export:
- Download project as ZIP
- Export project files
- Clone from GitHub
"""

import os
import shutil
import zipfile
import subprocess
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/download", tags=["Download"])


class GitHubCloneRequest(BaseModel):
    project_id: str
    repo_url: str
    branch: Optional[str] = "main"


def get_project_path(project_id: str) -> str:
    """Get project directory path."""
    # Use project_manager if available
    try:
        from codestudio.terminal_routes import get_project_path as get_path
        return get_path(project_id)
    except:
        # Fallback
        base_path = os.getenv("PROJECTS_PATH", "./projects")
        user_projects_path = os.path.join(base_path, "default_user", project_id)
        if os.path.exists(user_projects_path):
            return user_projects_path
        return os.path.join(base_path, project_id)


@router.get("/zip/{project_id}")
async def download_project_zip(project_id: str):
    """Download project as ZIP file."""
    project_path = get_project_path(project_id)
    
    if not os.path.exists(project_path):
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create temporary ZIP file
    zip_path = f"/tmp/{project_id}.zip"
    
    try:
        # Create ZIP file
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(project_path):
                # Skip .git, node_modules, __pycache__, etc.
                dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', '.venv', 'venv', 'build', 'dist', '.next', '.vscode']]
                
                for file in files:
                    file_path = os.path.join(root, file)
                    # Skip hidden files and build artifacts
                    if not file.startswith('.') and not file.endswith(('.pyc', '.pyo', '.log')):
                        arcname = os.path.relpath(file_path, project_path)
                        zipf.write(file_path, arcname)
        
        # Return ZIP file
        return FileResponse(
            zip_path,
            media_type='application/zip',
            filename=f"{project_id}.zip",
            headers={"Content-Disposition": f"attachment; filename={project_id}.zip"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating ZIP: {str(e)}")
    finally:
        # Clean up after download (optional - can keep for caching)
        pass


@router.post("/clone-github")
async def clone_from_github(request: GitHubCloneRequest):
    """Clone project from GitHub."""
    project_path = get_project_path(request.project_id)
    
    # Create project directory if it doesn't exist
    os.makedirs(project_path, exist_ok=True)
    
    # Check if directory is empty
    if os.listdir(project_path):
        raise HTTPException(status_code=400, detail="Project directory is not empty")
    
    try:
        # Clone repository
        if request.branch and request.branch != "main":
            result = subprocess.run(
                ["git", "clone", "-b", request.branch, request.repo_url, project_path],
                capture_output=True,
                text=True,
                timeout=60
            )
        else:
            result = subprocess.run(
                ["git", "clone", request.repo_url, project_path],
                capture_output=True,
                text=True,
                timeout=60
            )
        
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Git clone failed: {result.stderr}"
            )
        
        return {
            "success": True,
            "message": f"Successfully cloned from {request.repo_url}",
            "path": project_path
        }
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Git clone timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cloning repository: {str(e)}")


