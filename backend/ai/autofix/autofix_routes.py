# -------------------------------------------------------------
# VIBEAI – AUTO FIX API ROUTES ⭐ BLOCK 18
# -------------------------------------------------------------
"""
AutoFix API Routes - REST endpoints for AI code repair

Endpoints:
- POST /autofix/fix - Fix a file automatically
- POST /autofix/detect - Detect issues in a file
- POST /autofix/optimize-imports - Optimize imports
- POST /autofix/refactor - Refactor code
- POST /autofix/batch-fix - Fix multiple files
- GET /autofix/health - Health check
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from .autofix_agent import autofix_agent

router = APIRouter(prefix="/autofix", tags=["AutoFix"])


# ========================================
# PYDANTIC MODELS
# ========================================

class FixFileRequest(BaseModel):
    project_id: str
    file_path: str
    content: str
    issue_type: Optional[str] = None


class DetectIssuesRequest(BaseModel):
    project_id: str
    file_path: str
    content: str


class OptimizeImportsRequest(BaseModel):
    project_id: str
    file_path: str
    content: str


class RefactorRequest(BaseModel):
    project_id: str
    file_path: str
    content: str
    refactor_type: str = "general"


class BatchFixRequest(BaseModel):
    project_id: str
    files: List[dict]  # [{"path": "...", "content": "..."}]


# ========================================
# API ROUTES
# ========================================

@router.post("/fix")
async def fix_file(request: Request):
    """
    Fix a file automatically with AI
    
    Request body:
    {
        "project_id": "demo-project",
        "file_path": "src/main.py",
        "content": "...",
        "issue_type": "error|warning|improvement"
    }
    
    Response:
    {
        "success": true,
        "fixed": true,
        "file": "src/main.py",
        "changes_made": ["imports_modified", "code_improved"]
    }
    """
    
    body = await request.json()
    user_email = request.headers.get("x-user", "default")
    
    project_id = body.get("project_id")
    file_path = body.get("file_path")
    content = body.get("content")
    issue_type = body.get("issue_type")
    
    if not all([project_id, file_path, content]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    result = await autofix_agent.fix_file(
        user=user_email,
        project_id=project_id,
        file_path=file_path,
        content=content,
        issue_type=issue_type
    )
    
    return result


@router.post("/detect")
async def detect_issues(request: Request):
    """
    Detect issues in code without fixing
    
    Request body:
    {
        "project_id": "demo-project",
        "file_path": "src/main.py",
        "content": "..."
    }
    
    Response:
    {
        "success": true,
        "file": "src/main.py",
        "issues": [
            {"type": "error", "line": 10, "message": "Undefined variable"}
        ],
        "has_errors": true
    }
    """
    
    body = await request.json()
    user_email = request.headers.get("x-user", "default")
    
    project_id = body.get("project_id")
    file_path = body.get("file_path")
    content = body.get("content")
    
    if not all([project_id, file_path, content]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    result = await autofix_agent.detect_issues(
        user=user_email,
        project_id=project_id,
        file_path=file_path,
        content=content
    )
    
    return result


@router.post("/optimize-imports")
async def optimize_imports(request: Request):
    """
    Optimize imports in a file
    
    Request body:
    {
        "project_id": "demo-project",
        "file_path": "src/main.py",
        "content": "..."
    }
    
    Response:
    {
        "success": true,
        "file": "src/main.py",
        "imports_optimized": true
    }
    """
    
    body = await request.json()
    user_email = request.headers.get("x-user", "default")
    
    project_id = body.get("project_id")
    file_path = body.get("file_path")
    content = body.get("content")
    
    if not all([project_id, file_path, content]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    result = await autofix_agent.optimize_imports(
        user=user_email,
        project_id=project_id,
        file_path=file_path,
        content=content
    )
    
    return result


@router.post("/refactor")
async def refactor_code(request: Request):
    """
    Refactor code with AI
    
    Request body:
    {
        "project_id": "demo-project",
        "file_path": "src/main.py",
        "content": "...",
        "refactor_type": "general|performance|readability|security"
    }
    
    Response:
    {
        "success": true,
        "file": "src/main.py",
        "refactored": true,
        "refactor_type": "performance"
    }
    """
    
    body = await request.json()
    user_email = request.headers.get("x-user", "default")
    
    project_id = body.get("project_id")
    file_path = body.get("file_path")
    content = body.get("content")
    refactor_type = body.get("refactor_type", "general")
    
    if not all([project_id, file_path, content]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    result = await autofix_agent.refactor_code(
        user=user_email,
        project_id=project_id,
        file_path=file_path,
        content=content,
        refactor_type=refactor_type
    )
    
    return result


@router.post("/batch-fix")
async def batch_fix(request: Request):
    """
    Fix multiple files at once
    
    Request body:
    {
        "project_id": "demo-project",
        "files": [
            {"path": "src/main.py", "content": "..."},
            {"path": "src/utils.py", "content": "..."}
        ]
    }
    
    Response:
    {
        "success": true,
        "total": 2,
        "fixed": 2,
        "failed": 0,
        "results": [...]
    }
    """
    
    body = await request.json()
    user_email = request.headers.get("x-user", "default")
    
    project_id = body.get("project_id")
    files = body.get("files", [])
    
    if not project_id or not files:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    results = []
    fixed_count = 0
    failed_count = 0
    
    for file_data in files:
        file_path = file_data.get("path")
        content = file_data.get("content")
        
        if not file_path or not content:
            results.append({
                "file": file_path,
                "success": False,
                "error": "Missing path or content"
            })
            failed_count += 1
            continue
        
        result = await autofix_agent.fix_file(
            user=user_email,
            project_id=project_id,
            file_path=file_path,
            content=content
        )
        
        results.append(result)
        
        if result.get("success"):
            fixed_count += 1
        else:
            failed_count += 1
    
    return {
        "success": True,
        "total": len(files),
        "fixed": fixed_count,
        "failed": failed_count,
        "results": results
    }


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Response:
    {
        "status": "online",
        "agent": "autofix",
        "capabilities": [...]
    }
    """
    
    return {
        "status": "online",
        "agent": "autofix",
        "capabilities": [
            "fix_file",
            "detect_issues",
            "optimize_imports",
            "refactor_code",
            "batch_fix"
        ],
        "supported_languages": [
            "python",
            "javascript",
            "typescript",
            "react",
            "flutter",
            "dart",
            "css",
            "html"
        ]
    }
