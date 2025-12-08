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

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user_v2
from builder.builder_pipeline import builder_pipeline

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
async def create_project(request: ProjectRequest, user=Depends(get_current_user_v2)):
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
    """
    try:
        result = await builder_pipeline.build_project(
            project_name=request.project_name,
            project_type=request.project_type,
            description=request.description,
            custom_structure=request.custom_structure,
            model=request.model,
        )

        return {"status": "success", "data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Project generation failed: {str(e)}")


@router.post("/update-file")
async def update_file(request: FileUpdateRequest, user=Depends(get_current_user_v2)):
    """
    Aktualisiert eine bestehende Datei mit intelligentm Merging.

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
async def get_project_types(user=Depends(get_current_user_v2)):
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
