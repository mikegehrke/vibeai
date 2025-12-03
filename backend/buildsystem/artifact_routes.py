# -------------------------------------------------------------
# VIBEAI – ARTIFACT DOWNLOAD ROUTES
# -------------------------------------------------------------
"""
Download-Routen für Build-Artifacts

Endpoints:
- GET /api/builds/{build_id}/artifacts - Liste aller Artifacts
- GET /api/builds/{build_id}/download - ZIP-Download aller Artifacts
- GET /api/builds/{build_id}/download/{filename} - Einzelne Datei
- GET /api/builds/{build_id}/logs - Build-Logs herunterladen

Features:
- Streaming Downloads für große Dateien
- ZIP on-the-fly für Build-Ordner
- Sichere Pfad-Validierung
- Content-Type Detection
"""

import os
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse, StreamingResponse
from typing import List, Dict, Any
import mimetypes

from .build_manager import build_manager
from .zip_export import create_temp_zip, cleanup_temp_zip, get_zip_size

router = APIRouter(prefix="/api/builds", tags=["artifacts"])


@router.get("/{build_id}/artifacts")
async def list_artifacts(build_id: str) -> Dict[str, Any]:
    """
    Liste aller verfügbaren Artifacts für einen Build.
    
    Returns:
        {
            "build_id": "abc123",
            "status": "SUCCESS",
            "artifacts": [
                {
                    "filename": "app-release.apk",
                    "path": "build/outputs/apk/release/app-release.apk",
                    "size": 12345678,
                    "type": "application/vnd.android.package-archive"
                }
            ]
        }
    """
    build = build_manager.get_build(build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    
    build_dir = f"build_artifacts/{build_id}"
    
    if not os.path.exists(build_dir):
        return {
            "build_id": build_id,
            "status": build.get("status", "UNKNOWN"),
            "artifacts": []
        }
    
    artifacts = []
    
    # Rekursiv alle Dateien sammeln
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, build_dir)
            
            # Nur echte Build-Outputs (keine Logs)
            if file.endswith('.log') or file.endswith('.json'):
                continue
            
            file_size = os.path.getsize(file_path)
            mime_type, _ = mimetypes.guess_type(file_path)
            
            artifacts.append({
                "filename": file,
                "path": rel_path,
                "size": file_size,
                "type": mime_type or "application/octet-stream"
            })
    
    return {
        "build_id": build_id,
        "status": build.get("status", "UNKNOWN"),
        "artifacts": artifacts
    }


@router.get("/{build_id}/download")
async def download_all_artifacts(build_id: str):
    """
    Download aller Build-Artifacts als ZIP.
    
    Returns:
        ZIP-File mit allen Artifacts
    """
    build = build_manager.get_build(build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    
    build_dir = f"build_artifacts/{build_id}"
    
    if not os.path.exists(build_dir):
        raise HTTPException(
            status_code=404,
            detail="No artifacts found for this build"
        )
    
    try:
        # Erstelle temporäre ZIP
        zip_path = create_temp_zip(build_dir)
        
        # Stream ZIP zum Client
        def iterfile():
            with open(zip_path, mode="rb") as file_like:
                yield from file_like
            # Cleanup nach Download
            cleanup_temp_zip(zip_path)
        
        return StreamingResponse(
            iterfile(),
            media_type="application/zip",
            headers={
                "Content-Disposition": f"attachment; filename=build_{build_id}.zip"
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating zip: {str(e)}"
        )


@router.get("/{build_id}/download/{filename:path}")
async def download_artifact(build_id: str, filename: str):
    """
    Download einzelne Artifact-Datei.
    
    Args:
        build_id: Build-ID
        filename: Relativer Pfad zur Datei (z.B. "outputs/apk/app.apk")
    
    Returns:
        Datei als Download
    """
    build = build_manager.get_build(build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    
    # Sichere Pfad-Validierung
    build_dir = f"build_artifacts/{build_id}"
    file_path = os.path.join(build_dir, filename)
    
    # Verhindere Path Traversal
    if not os.path.abspath(file_path).startswith(os.path.abspath(build_dir)):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Content-Type automatisch erkennen
    mime_type, _ = mimetypes.guess_type(file_path)
    
    return FileResponse(
        path=file_path,
        media_type=mime_type or "application/octet-stream",
        filename=os.path.basename(filename)
    )


@router.get("/{build_id}/logs")
async def download_logs(build_id: str):
    """
    Download Build-Logs als Text-Datei.
    
    Returns:
        build_{build_id}.log als Download
    """
    build = build_manager.get_build(build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    
    log_path = f"build_artifacts/{build_id}/build.log"
    
    if not os.path.exists(log_path):
        # Fallback: Logs aus build_manager holen
        logs = build_manager.get_logs(build_id)
        if not logs:
            raise HTTPException(
                status_code=404,
                detail="No logs found for this build"
            )
        
        # Logs als String zusammenfügen
        log_content = "\n".join(logs)
        
        return Response(
            content=log_content,
            media_type="text/plain",
            headers={
                "Content-Disposition": f"attachment; filename=build_{build_id}.log"
            }
        )
    
    return FileResponse(
        path=log_path,
        media_type="text/plain",
        filename=f"build_{build_id}.log"
    )


@router.get("/{build_id}/artifacts/info")
async def get_artifacts_info(build_id: str) -> Dict[str, Any]:
    """
    Detaillierte Info über alle Artifacts (inkl. ZIP-Größe).
    
    Returns:
        {
            "build_id": "abc123",
            "total_files": 5,
            "total_size": 12345678,
            "estimated_zip_size": 8765432,
            "artifacts": [...]
        }
    """
    artifacts_data = await list_artifacts(build_id)
    
    total_size = sum(a["size"] for a in artifacts_data["artifacts"])
    
    # Geschätzte ZIP-Größe (ca. 70% der Originalgröße bei Kompression)
    estimated_zip_size = int(total_size * 0.7)
    
    return {
        **artifacts_data,
        "total_files": len(artifacts_data["artifacts"]),
        "total_size": total_size,
        "estimated_zip_size": estimated_zip_size
    }
