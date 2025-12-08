# -------------------------------------------------------------
# VIBEAI – BUILDER API ROUTES
# -------------------------------------------------------------
# API-Endpunkte für App Builder:
# - Projekt generieren
# - Datei aktualisieren
# - Preview generieren
# - Download-Package erstellen
# -------------------------------------------------------------

from typing import Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/builder", tags=["App Builder"])


class ProjectRequest(BaseModel):
    project_name: str
    project_type: str
    description: str = ""
    custom_structure: Optional[Dict] = None
    model: str = "gpt-4o"


class FileUpdateRequest(BaseModel):
    file_path: str
    original_content: str
    updates: str
    merge_strategy: str = "smart"


@router.post("/create-project")
async def create_project(request: ProjectRequest):
    """
    Generiert ein komplettes Projekt.

    Unterstützte Projekttypen:
    - flutter
    - react-native
    - nextjs
    - nodejs
    - fastapi
    - ios-swift
    - android-kotlin
    - react
    """
    try:
        import os
        import tempfile
        import sys
        
        # Füge Backend-Pfad hinzu
        sys.path.insert(0, os.path.dirname(__file__))
        
        # Erstelle temporäres Projekt-Verzeichnis
        project_id = request.project_name.lower().replace(' ', '_')
        temp_dir = tempfile.mkdtemp()
        project_path = os.path.join(temp_dir, project_id)
        
        # Wähle den richtigen Generator
        if request.project_type == "flutter":
            from project_generator.flutter_generator import (
                FlutterProjectGenerator
            )
            generator = FlutterProjectGenerator()
            result = generator.create_project(
                base_path=project_path,
                project_name=project_id,
                options={
                    "description": request.description,
                    "org": "com.vibeai"
                }
            )
        
        elif request.project_type == "react":
            from project_generator.react_generator import (
                ReactProjectGenerator
            )
            generator = ReactProjectGenerator()
            result = generator.create_project(
                base_path=project_path,
                project_name=project_id,
                options={"description": request.description}
            )
        
        elif request.project_type == "nextjs":
            from project_generator.next_generator import (
                NextJSProjectGenerator
            )
            generator = NextJSProjectGenerator()
            result = generator.create_project(
                base_path=project_path,
                project_name=project_id,
                options={"description": request.description}
            )
        
        elif request.project_type == "nodejs":
            from project_generator.node_generator import (
                NodeProjectGenerator
            )
            generator = NodeProjectGenerator()
            result = generator.create_project(
                base_path=project_path,
                project_name=project_id,
                options={"description": request.description}
            )
        
        else:
            # Fallback
            msg = f"Generator für {request.project_type} fehlt"
            result = {"success": False, "error": msg}
        
        if not result.get("success"):
            raise HTTPException(500, result.get("error", "Failed"))
        
        # Lese generierte Dateien
        files = []
        for root, dirs, filenames in os.walk(project_path):
            # Skip versteckte Ordner
            dirs[:] = [
                d for d in dirs 
                if not d.startswith('.') 
                and d not in ['build', 'node_modules', '__pycache__']
            ]
            
            for filename in filenames:
                if filename.startswith('.'):
                    continue
                    
                file_path = os.path.join(root, filename)
                rel_path = os.path.relpath(file_path, project_path)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Bestimme Sprache basierend auf Extension
                    ext_map = {
                        'dart': 'dart', 'js': 'javascript',
                        'ts': 'typescript', 'jsx': 'javascript',
                        'tsx': 'typescript', 'py': 'python',
                        'yaml': 'yaml', 'yml': 'yaml',
                        'json': 'json', 'md': 'markdown',
                        'html': 'html', 'css': 'css'
                    }
                    ext = filename.split('.')[-1] if '.' in filename else 'txt'
                    
                    files.append({
                        "path": rel_path,
                        "content": content,
                        "language": ext_map.get(ext, 'text')
                    })
                except Exception as e:
                    print(f"Fehler beim Lesen: {e}")
                    continue
        
        return {
            "status": "success",
            "data": {
                "project_id": project_id,
                "project_name": request.project_name,
                "framework": request.project_type,
                "files": files,
                "files_created": len(files),
                "errors": [],
                "metadata": {
                    "model_used": request.model,
                    "description": request.description,
                    "generator": result.get("framework", request.project_type)
                }
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Project creation failed: {str(e)}"
        )


@router.post("/update-file")
async def update_file(request: FileUpdateRequest):
    """
    Aktualisiert eine bestehende Datei mit intelligentem Merging.

    Merge-Strategien:
    - smart: Intelligentes Merging (empfohlen)
    - overwrite: Komplett ersetzen
    - append: Anhängen
    - imports_only: Nur Imports mergen
    """
    try:
        result = await builder_pipeline.update_file(
            file_path=request.file_path,
            original_content=request.original_content,
            updates=request.updates,
            merge_strategy=request.merge_strategy,
        )

        return {"status": "success", "data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File update failed: {str(e)}")


@router.get("/project-types")
async def get_project_types():
    """
    Liefert alle unterstützten Projekttypen mit Details.
    """
    return {
        "project_types": [
            {
                "id": "flutter",
                "name": "Flutter App",
                "description": "Cross-platform mobile app with Flutter",
                "platforms": ["iOS", "Android", "Web"],
                "language": "Dart",
            },
            {
                "id": "react-native",
                "name": "React Native App",
                "description": "Cross-platform mobile app with React Native",
                "platforms": ["iOS", "Android"],
                "language": "TypeScript",
            },
            {
                "id": "nextjs",
                "name": "Next.js App",
                "description": "Full-stack web app with Next.js",
                "platforms": ["Web"],
                "language": "TypeScript",
            },
            {
                "id": "nodejs",
                "name": "Node.js Backend",
                "description": "Backend API with Node.js + Express",
                "platforms": ["Server"],
                "language": "JavaScript",
            },
            {
                "id": "fastapi",
                "name": "FastAPI Backend",
                "description": "Modern Python API with FastAPI",
                "platforms": ["Server"],
                "language": "Python",
            },
            {
                "id": "ios-swift",
                "name": "iOS App (Swift)",
                "description": "Native iOS app with SwiftUI",
                "platforms": ["iOS"],
                "language": "Swift",
            },
            {
                "id": "android-kotlin",
                "name": "Android App (Kotlin)",
                "description": "Native Android app with Jetpack Compose",
                "platforms": ["Android"],
                "language": "Kotlin",
            },
        ]
    }


# -------------------------------------------------------------
# GITHUB INTEGRATION
# -------------------------------------------------------------

class GitHubRequest(BaseModel):
    action: str  # clone, push, pull
    repo_url: Optional[str] = None
    project_id: str
    commit_message: Optional[str] = "Update from VibeAI"


@router.post("/github")
async def github_action(request: GitHubRequest):
    """
    GitHub Integration: Clone, Push, Pull
    """
    import subprocess
    import os
    
    project_path = f"./projects/{request.project_id}"
    
    try:
        if request.action == "clone":
            if not request.repo_url:
                raise HTTPException(400, "repo_url required for clone")
            
            # Clone repository
            subprocess.run(
                ["git", "clone", request.repo_url, project_path],
                check=True,
                capture_output=True
            )
            
            return {"status": "success", "message": "Repository cloned"}
        
        elif request.action == "push":
            if not os.path.exists(f"{project_path}/.git"):
                # Initialize git if needed
                subprocess.run(["git", "init"], cwd=project_path, check=True)
                
            # Add all files
            subprocess.run(["git", "add", "."], cwd=project_path, check=True)
            
            # Commit
            subprocess.run(
                ["git", "commit", "-m", request.commit_message],
                cwd=project_path,
                check=True
            )
            
            # Push
            subprocess.run(
                ["git", "push"],
                cwd=project_path,
                check=True
            )
            
            return {"status": "success", "message": "Pushed to GitHub"}
        
        elif request.action == "pull":
            subprocess.run(
                ["git", "pull"],
                cwd=project_path,
                check=True
            )
            
            return {"status": "success", "message": "Pulled from GitHub"}
        
        else:
            raise HTTPException(400, f"Unknown action: {request.action}")
            
    except subprocess.CalledProcessError as e:
        raise HTTPException(500, f"Git error: {e.stderr.decode()}")
    except Exception as e:
        raise HTTPException(500, f"GitHub action failed: {str(e)}")


# -------------------------------------------------------------
# ZIP EXPORT/IMPORT
# -------------------------------------------------------------

from fastapi import UploadFile, File
from fastapi.responses import FileResponse
import zipfile
import io


@router.get("/export-zip/{project_id}")
async def export_zip(project_id: str):
    """
    Exportiert Projekt als ZIP
    """
    import os
    import tempfile
    
    project_path = f"./projects/{project_id}"
    
    if not os.path.exists(project_path):
        raise HTTPException(404, "Project not found")
    
    # Create ZIP in temp directory
    temp_dir = tempfile.gettempdir()
    zip_path = os.path.join(temp_dir, f"{project_id}.zip")
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_path):
            # Skip git and build folders
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules']]
            
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, project_path)
                zipf.write(file_path, arcname)
    
    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename=f"{project_id}.zip"
    )


@router.post("/import-zip")
async def import_zip(
    file: UploadFile = File(...),
    project_id: Optional[str] = None
):
    """
    Importiert Projekt aus ZIP
    """
    import os
    import shutil
    
    if not project_id:
        project_id = file.filename.replace('.zip', '')
    
    project_path = f"./projects/{project_id}"
    
    # Create project directory
    os.makedirs(project_path, exist_ok=True)
    
    # Extract ZIP
    contents = await file.read()
    with zipfile.ZipFile(io.BytesIO(contents)) as zipf:
        zipf.extractall(project_path)
    
    # Count files
    file_count = sum(len(files) for _, _, files in os.walk(project_path))
    
    return {
        "status": "success",
        "project_id": project_id,
        "files_imported": file_count,
        "message": "Project imported successfully"
    }
