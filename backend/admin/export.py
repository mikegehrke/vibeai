# -----------------------------------------------------------
# OPTIMIERTE VERSION – ADMIN EXPORT mit Auth & Optionen
# -----------------------------------------------------------
import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Response

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from auth import require_admin
from schemas import ExportFilter
from utils import export_data

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/export")
async def export_all(
    filter: ExportFilter = Depends(),  # Optional: bestimme, was exportiert wird
    _=Depends(require_admin),  # Admin-Zugriff absichern
):
    try:
        data = await export_data(filter)  # async + Filter
        return {"status": "success", "exported_items": len(data), "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✔ Original export_all() funktioniert
# ✔ Admin-Auth mit require_admin
# ✔ Filter-Support für selektiven Export
# ✔ Error Handling
# ✔ Async-basiert
#
# ❗ ABER:
#     - Kein ZIP-Export für Projekte
#     - Kein File-Download
#     - Keine Project-Export Funktionen
#     - Kein Backup-System
#     - Keine Integration mit generator.py/projects.py
#     - Kein Export für App Builder/Code Studio Projekte
#
# 👉 Das Original ist gut für Daten-Export
# 👉 Für App Builder brauchen wir Project/ZIP Export

import io

# -------------------------------------------------------------
# VIBEAI – ADMIN EXPORT V2 (PROJECTS + DATA + ZIP)
# -------------------------------------------------------------
import os
import zipfile
from datetime import datetime
from typing import List

PROJECTS_DIR = os.getenv("PROJECTS_DIR", "./projects")
EXPORTS_DIR = os.getenv("EXPORTS_DIR", "./exports")


class ExportServiceV2:
    """
    Production Export Service für:
    - Project ZIP Downloads
    - Data Exports (JSON)
    - Backup Creation
    - App Builder/Code Studio Integration
    """

    def __init__(self):
        # Ensure directories exist
        os.makedirs(PROJECTS_DIR, exist_ok=True)
        os.makedirs(EXPORTS_DIR, exist_ok=True)

    # ---------------------------------------------------------
    # 1. List All Projects
    # ---------------------------------------------------------
    def list_projects(self) -> List[dict]:
        """Lists all available projects with metadata."""
        projects = []

        if not os.path.exists(PROJECTS_DIR):
            return projects

        for name in os.listdir(PROJECTS_DIR):
            project_path = os.path.join(PROJECTS_DIR, name)

            if os.path.isdir(project_path):
                # Get project metadata
                stat = os.stat(project_path)

                projects.append(
                    {
                        "id": name,
                        "name": name,
                        "path": project_path,
                        "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "size_bytes": self._get_dir_size(project_path),
                    }
                )

        return projects

    # ---------------------------------------------------------
    # 2. Export Single Project as ZIP
    # ---------------------------------------------------------
    def export_project_zip(self, project_id: str) -> bytes:
        """
        Exports a single project as ZIP file (in-memory).

        Args:
            project_id: Project identifier

        Returns:
            ZIP file bytes
        """
        project_path = os.path.join(PROJECTS_DIR, project_id)

        if not os.path.exists(project_path):
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

        # Create ZIP in memory
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in os.walk(project_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Relative path in ZIP
                    archive_path = os.path.relpath(file_path, project_path)
                    zf.write(file_path, arcname=archive_path)

        zip_buffer.seek(0)
        return zip_buffer.read()

    # ---------------------------------------------------------
    # 3. Export All Projects as ZIP
    # ---------------------------------------------------------
    def export_all_projects_zip(self) -> bytes:
        """
        Exports all projects as single ZIP archive.

        Returns:
            ZIP file bytes
        """
        project_list = self.list_projects()

        if not project_list:
            raise HTTPException(status_code=404, detail="No projects available")

        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for project in project_list:
                project_path = project["path"]
                project_id = project["id"]

                for root, dirs, files in os.walk(project_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        # Archive path includes project folder
                        archive_path = os.path.join(project_id, os.path.relpath(file_path, project_path))
                        zf.write(file_path, arcname=archive_path)

        zip_buffer.seek(0)
        return zip_buffer.read()

    # ---------------------------------------------------------
    # 4. Export Project Metadata (JSON)
    # ---------------------------------------------------------
    def export_project_metadata(self, project_id: str) -> dict:
        """
        Exports project metadata as JSON.

        Args:
            project_id: Project identifier

        Returns:
            Project metadata dict
        """
        project_path = os.path.join(PROJECTS_DIR, project_id)

        if not os.path.exists(project_path):
            raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

        # Collect file list
        files = []
        for root, dirs, filenames in os.walk(project_path):
            for filename in filenames:
                file_path = os.path.join(root, filename)
                rel_path = os.path.relpath(file_path, project_path)

                stat = os.stat(file_path)

                files.append(
                    {
                        "path": rel_path,
                        "size": stat.st_size,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    }
                )

        return {
            "project_id": project_id,
            "total_files": len(files),
            "total_size": sum(f["size"] for f in files),
            "files": files,
        }

    # ---------------------------------------------------------
    # Helper: Get Directory Size
    # ---------------------------------------------------------
    def _get_dir_size(self, path: str) -> int:
        """Calculate total size of directory."""
        total_size = 0

        for root, dirs, files in os.walk(path):
            for file in files:
                file_path = os.path.join(root, file)
                try:
                    total_size += os.path.getsize(file_path)
                except OSError:
                    pass

        return total_size


# Global Instance
export_service_v2 = ExportServiceV2()

# -------------------------------------------------------------
# FastAPI Routes für Export V2
# -------------------------------------------------------------


@router.get("/export/projects")
async def list_all_projects(_=Depends(require_admin)):
    """List all available projects with metadata."""
    projects = export_service_v2.list_projects()

    return {"status": "success", "total_projects": len(projects), "projects": projects}


@router.get("/export/project/{project_id}/zip")
async def download_project_zip(project_id: str, _=Depends(require_admin)):
    """Download single project as ZIP."""
    try:
        zip_data = export_service_v2.export_project_zip(project_id)

        return Response(
            content=zip_data,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={project_id}.zip"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/project/{project_id}/metadata")
async def get_project_metadata(project_id: str, _=Depends(require_admin)):
    """Get project metadata as JSON."""
    try:
        metadata = export_service_v2.export_project_metadata(project_id)

        return {"status": "success", "metadata": metadata}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/all-projects/zip")
async def download_all_projects_zip(_=Depends(require_admin)):
    """Download all projects as single ZIP archive."""
    try:
        zip_data = export_service_v2.export_all_projects_zip()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"vibeai_projects_{timestamp}.zip"

        return Response(
            content=zip_data,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))