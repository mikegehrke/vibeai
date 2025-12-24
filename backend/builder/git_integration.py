# -------------------------------------------------------------
# VIBEAI – GIT INTEGRATION
# -------------------------------------------------------------
"""
Git Integration für App Builder:
- Commit changes
- Push to remote
- Pull from remote
- Branch management
- Status check
"""

import os
import subprocess
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/git", tags=["Git"])


class GitCommitRequest(BaseModel):
    project_id: str
    message: str
    files: Optional[List[str]] = None  # Specific files, None = all


class GitPushRequest(BaseModel):
    project_id: str
    remote: str = "origin"
    branch: str = "main"


class GitPullRequest(BaseModel):
    project_id: str
    remote: str = "origin"
    branch: str = "main"


class GitBranchRequest(BaseModel):
    project_id: str
    branch_name: str
    create: bool = False


def get_project_path(project_id: str) -> str:
    """Get project directory path."""
    base_path = os.getenv("PROJECTS_PATH", "./projects")
    return os.path.join(base_path, project_id)


def run_git_command(project_path: str, command: List[str]) -> Dict:
    """Run git command and return result."""
    try:
        if not os.path.exists(project_path):
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Initialize git if needed
        if not os.path.exists(os.path.join(project_path, ".git")):
            subprocess.run(["git", "init"], cwd=project_path, check=True, capture_output=True)
        
        result = subprocess.run(
            ["git"] + command,
            cwd=project_path,
            capture_output=True,
            text=True,
            check=False
        )
        
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr if result.returncode != 0 else None,
            "returncode": result.returncode
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "output": "",
            "returncode": -1
        }


@router.post("/status")
async def git_status(project_id: str):
    """Get git status."""
    project_path = get_project_path(project_id)
    result = run_git_command(project_path, ["status", "--porcelain"])
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    # Parse status
    lines = result["output"].strip().split("\n") if result["output"] else []
    files = []
    for line in lines:
        if line:
            status = line[:2]
            filename = line[3:]
            files.append({
                "status": status,
                "file": filename,
                "staged": status[0] != " ",
                "modified": status[1] != " "
            })
    
    return {
        "success": True,
        "files": files,
        "has_changes": len(files) > 0
    }


@router.post("/commit")
async def git_commit(request: GitCommitRequest):
    """Commit changes."""
    project_path = get_project_path(request.project_id)
    
    # Add files
    if request.files:
        for file in request.files:
            run_git_command(project_path, ["add", file])
    else:
        run_git_command(project_path, ["add", "."])
    
    # Commit
    result = run_git_command(project_path, ["commit", "-m", request.message])
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or "Commit failed")
    
    return {
        "success": True,
        "message": "Changes committed successfully",
        "output": result["output"]
    }


@router.post("/push")
async def git_push(request: GitPushRequest):
    """Push to remote."""
    project_path = get_project_path(request.project_id)
    result = run_git_command(project_path, ["push", request.remote, request.branch])
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or "Push failed")
    
    return {
        "success": True,
        "message": f"Pushed to {request.remote}/{request.branch}",
        "output": result["output"]
    }


@router.post("/pull")
async def git_pull(request: GitPullRequest):
    """Pull from remote."""
    project_path = get_project_path(request.project_id)
    result = run_git_command(project_path, ["pull", request.remote, request.branch])
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or "Pull failed")
    
    return {
        "success": True,
        "message": f"Pulled from {request.remote}/{request.branch}",
        "output": result["output"]
    }


@router.get("/branches")
async def git_branches(project_id: str):
    """List all branches."""
    project_path = get_project_path(project_id)
    result = run_git_command(project_path, ["branch", "-a"])
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    branches = [b.strip().replace("* ", "") for b in result["output"].split("\n") if b.strip()]
    
    return {
        "success": True,
        "branches": branches
    }


@router.post("/branch")
async def git_branch(request: GitBranchRequest):
    """Create or switch branch."""
    project_path = get_project_path(request.project_id)
    
    if request.create:
        result = run_git_command(project_path, ["checkout", "-b", request.branch_name])
    else:
        result = run_git_command(project_path, ["checkout", request.branch_name])
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or "Branch operation failed")
    
    return {
        "success": True,
        "message": f"{'Created' if request.create else 'Switched to'} branch {request.branch_name}",
        "output": result["output"]
    }













