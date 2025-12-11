# -------------------------------------------------------------
# VIBEAI – PACKAGE MANAGER
# -------------------------------------------------------------
"""
Package Manager für verschiedene Sprachen:
- npm (Node.js)
- pip (Python)
- pub (Dart/Flutter)
- cargo (Rust)
- go mod (Go)
"""

import os
import subprocess
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/packages", tags=["Package Manager"])


class InstallPackageRequest(BaseModel):
    project_id: str
    package_name: str
    package_manager: str  # npm, pip, pub, cargo, go
    version: Optional[str] = None
    dev: bool = False  # For npm: --save-dev


class UninstallPackageRequest(BaseModel):
    project_id: str
    package_name: str
    package_manager: str


class ListPackagesRequest(BaseModel):
    project_id: str
    package_manager: str


def get_project_path(project_id: str) -> str:
    """Get project directory path."""
    base_path = os.getenv("PROJECTS_PATH", "./projects")
    return os.path.join(base_path, project_id)


def run_command(project_path: str, command: List[str]) -> Dict:
    """Run command and return result."""
    try:
        if not os.path.exists(project_path):
            raise HTTPException(status_code=404, detail="Project not found")
        
        result = subprocess.run(
            command,
            cwd=project_path,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr if result.returncode != 0 else None,
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Command timed out",
            "output": "",
            "returncode": -1
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "output": "",
            "returncode": -1
        }


@router.post("/install")
async def install_package(request: InstallPackageRequest):
    """Install a package."""
    project_path = get_project_path(request.project_id)
    
    # Special handling: empty package_name = install all from config file
    if not request.package_name or request.package_name.strip() == "":
        if request.package_manager == "npm":
            # npm install (all from package.json)
            command = ["npm", "install"]
        elif request.package_manager == "pub":
            # flutter pub get (all from pubspec.yaml)
            command = ["flutter", "pub", "get"]
        elif request.package_manager == "pip":
            # pip install -r requirements.txt
            command = ["pip", "install", "-r", "requirements.txt"]
        else:
            raise HTTPException(status_code=400, detail="Empty package_name only supported for npm, pub, pip")
    else:
        commands = {
            "npm": ["npm", "install", request.package_name] + (["--save-dev"] if request.dev else []),
            "pip": ["pip", "install", request.package_name],
            "pub": ["flutter", "pub", "add", request.package_name],
            "cargo": ["cargo", "add", request.package_name],
            "go": ["go", "get", request.package_name]
        }
        
        if request.package_manager not in commands:
            raise HTTPException(status_code=400, detail=f"Unsupported package manager: {request.package_manager}")
        
        command = commands[request.package_manager]
        if request.version:
            command[-1] = f"{request.package_name}=={request.version}" if request.package_manager == "pip" else f"{request.package_name}@{request.version}"
    
    result = run_command(project_path, command)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or "Installation failed")
    
    return {
        "success": True,
        "message": f"Package {request.package_name or 'all dependencies'} installed successfully",
        "output": result["output"]
    }


@router.post("/uninstall")
async def uninstall_package(request: UninstallPackageRequest):
    """Uninstall a package."""
    project_path = get_project_path(request.project_id)
    
    commands = {
        "npm": ["npm", "uninstall", request.package_name],
        "pip": ["pip", "uninstall", "-y", request.package_name],
        "pub": ["flutter", "pub", "remove", request.package_name],
        "cargo": ["cargo", "remove", request.package_name],
        "go": ["go", "mod", "edit", "-droprequire", request.package_name]
    }
    
    if request.package_manager not in commands:
        raise HTTPException(status_code=400, detail=f"Unsupported package manager: {request.package_manager}")
    
    result = run_command(project_path, commands[request.package_manager])
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or "Uninstallation failed")
    
    return {
        "success": True,
        "message": f"Package {request.package_name} uninstalled successfully",
        "output": result["output"]
    }


@router.post("/list")
async def list_packages(request: ListPackagesRequest):
    """List installed packages."""
    project_path = get_project_path(request.project_id)
    
    commands = {
        "npm": ["npm", "list", "--depth=0", "--json"],
        "pip": ["pip", "list", "--format=json"],
        "pub": ["flutter", "pub", "deps", "--json"],
        "cargo": ["cargo", "tree", "--format", "json"],
        "go": ["go", "list", "-m", "-json", "all"]
    }
    
    if request.package_manager not in commands:
        raise HTTPException(status_code=400, detail=f"Unsupported package manager: {request.package_manager}")
    
    result = run_command(project_path, commands[request.package_manager])
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or "Failed to list packages")
    
    import json
    try:
        packages = json.loads(result["output"])
        return {
            "success": True,
            "packages": packages,
            "package_manager": request.package_manager
        }
    except:
        # Fallback: parse text output
        return {
            "success": True,
            "packages": result["output"],
            "package_manager": request.package_manager,
            "raw": True
        }


@router.post("/search")
async def search_packages(query: str, package_manager: str = "npm"):
    """Search for packages."""
    commands = {
        "npm": ["npm", "search", query, "--json"],
        "pip": ["pip", "search", query],  # Note: pip search is deprecated
        "pub": ["flutter", "pub", "search", query],
        "cargo": ["cargo", "search", query, "--limit", "20"],
    }
    
    if package_manager not in commands:
        raise HTTPException(status_code=400, detail=f"Unsupported package manager: {package_manager}")
    
    result = run_command(".", commands[package_manager])  # Search doesn't need project path
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or "Search failed")
    
    import json
    try:
        results = json.loads(result["output"])
        return {
            "success": True,
            "results": results,
            "query": query
        }
    except:
        return {
            "success": True,
            "results": result["output"],
            "query": query,
            "raw": True
        }






