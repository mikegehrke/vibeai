# -------------------------------------------------------------
# VIBEAI – ADMIN BUILD MONITOR (Simple Version)
# -------------------------------------------------------------
"""
Einfache Admin-Routen für Build-Management

Endpoints:
- GET /admin/builds/all - Alle Builds aller User
- DELETE /admin/builds/{user}/{build_id} - Build löschen
- GET /admin/builds/{user}/{build_id}/logs - Build-Logs anzeigen

Features:
- Übersicht über alle User-Builds
- Build-Löschung
- Log-Zugriff
- Einfache API für Admin-Dashboard
"""

import os
import shutil
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from buildsystem.build_manager import build_manager

router = APIRouter(prefix="/admin/builds", tags=["Admin Builds"])


# -------------------------------------------------------------
# LIST ALL BUILDS (ALL USERS)
# -------------------------------------------------------------
@router.get("/all")
def list_all_builds() -> List[Dict]:
    """
    Liste aller Builds von allen Usern.

    Returns:
        List[Dict]: Alle Build-Metadaten
    """
    output = []

    base = "build_artifacts"
    if not os.path.exists(base):
        return []

    for user in os.listdir(base):
        user_path = os.path.join(base, user)

        if not os.path.isdir(user_path):
            continue

        for build_id in os.listdir(user_path):
            meta = build_manager.load_build(user, build_id)
            if meta:
                # Ergänze User-Info
                meta["user"] = user
                output.append(meta)

    # Sortiere nach Timestamp (neueste zuerst)
    output.sort(key=lambda x: x.get("timestamp", 0), reverse=True)

    return output


# -------------------------------------------------------------
# DELETE BUILD
# -------------------------------------------------------------
@router.delete("/{user}/{build_id}")
def delete_build(user: str, build_id: str) -> Dict[str, Any]:
    """
    Löscht einen Build eines Users.

    Args:
        user: User-Email/ID
        build_id: Build-ID

    Returns:
        {"success": True, "deleted": build_id}
    """
    build_path = os.path.join("build_artifacts", user, build_id)

    if not os.path.exists(build_path):
        raise HTTPException(404, "Build not found")

    # Lösche Build-Verzeichnis
    try:
        shutil.rmtree(build_path, ignore_errors=True)
    except Exception as e:
        raise HTTPException(500, f"Error deleting build: {str(e)}")

    return {"success": True, "deleted": build_id, "user": user}


# -------------------------------------------------------------
# GET BUILD LOGS
# -------------------------------------------------------------
@router.get("/{user}/{build_id}/logs")
def get_build_logs(user: str, build_id: str) -> Dict[str, str]:
    """
    Gibt Build-Logs für einen spezifischen Build zurück.

    Args:
        user: User-Email/ID
        build_id: Build-ID

    Returns:
        {"logs": "..."}
    """
    log_path = os.path.join("build_artifacts", user, build_id, "logs", "build.log")

    if not os.path.exists(log_path):
        return {"logs": "No logs found"}

    try:
        with open(log_path, "r", encoding="utf-8") as f:
            data = f.read()

        return {"logs": data}
    except Exception as e:
        raise HTTPException(500, f"Error reading logs: {str(e)}")


# -------------------------------------------------------------
# GET BUILD STATUS
# -------------------------------------------------------------
@router.get("/{user}/{build_id}/status")
def get_build_status(user: str, build_id: str) -> Dict:
    """
    Gibt Build-Status zurück.

    Args:
        user: User-Email/ID
        build_id: Build-ID

    Returns:
        Build-Metadaten
    """
    meta = build_manager.load_build(user, build_id)

    if not meta:
        raise HTTPException(404, "Build not found")

    # Ergänze User-Info
    meta["user"] = user

    return meta


# -------------------------------------------------------------
# GET USER BUILDS
# -------------------------------------------------------------
@router.get("/user/{user}")
def get_user_builds(user: str) -> List[Dict]:
    """
    Liste aller Builds eines bestimmten Users.

    Args:
        user: User-Email/ID

    Returns:
        List[Dict]: Alle Builds des Users
    """
    output = []
    user_path = os.path.join("build_artifacts", user)

    if not os.path.exists(user_path):
        return []

    for build_id in os.listdir(user_path):
        meta = build_manager.load_build(user, build_id)
        if meta:
            meta["user"] = user
            output.append(meta)

    # Sortiere nach Timestamp
    output.sort(key=lambda x: x.get("timestamp", 0), reverse=True)

    return output


# -------------------------------------------------------------
# BUILD STATISTICS
# -------------------------------------------------------------
@router.get("/stats")
def get_build_statistics() -> Dict[str, Any]:
    """
    Globale Build-Statistiken über alle User.

    Returns:
        {
            "total_builds": 123,
            "total_users": 15,
            "builds_by_status": {...},
            "builds_by_type": {...}
        }
    """
    all_builds = list_all_builds()

    total_builds = len(all_builds)

    # Unique Users
    unique_users = set(b.get("user") for b in all_builds if b.get("user"))

    # Builds nach Status
    builds_by_status = {}
    for build in all_builds:
        status = build.get("status", "UNKNOWN")
        builds_by_status[status] = builds_by_status.get(status, 0) + 1

    # Builds nach Typ
    builds_by_type = {}
    for build in all_builds:
        build_type = build.get("build_type", "unknown")
        builds_by_type[build_type] = builds_by_type.get(build_type, 0) + 1

    return {
        "total_builds": total_builds,
        "total_users": len(unique_users),
        "builds_by_status": builds_by_status,
        "builds_by_type": builds_by_type,
    }
