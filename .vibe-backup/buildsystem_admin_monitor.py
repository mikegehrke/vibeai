# -------------------------------------------------------------
# VIBEAI – ADMIN BUILD MONITOR
# -------------------------------------------------------------
"""
Admin-Dashboard Backend für Build-Monitoring

Endpoints:
- GET /api/admin/builds - Alle Builds übersicht
- GET /api/admin/builds/stats - Build-Statistiken
- GET /api/admin/builds/active - Aktuell laufende Builds
- POST /api/admin/builds/{build_id}/cancel - Build abbrechen
- POST /api/admin/builds/cleanup - Cleanup-Operation starten
- GET /api/admin/builds/system - System-Ressourcen

Features:
- Echtzeit Build-Monitoring
- Ressourcen-Übersicht (CPU, RAM, Disk)
- Build-Statistiken (Success-Rate, durchschnittliche Dauer)
- Admin-Aktionen (Cancel, Cleanup, Restart)
"""

import time
from datetime import datetime, timedelta
from typing import Dict, Optional

import psutil
from fastapi import APIRouter, HTTPException

from ..auth import verify_admin  # Admin-Auth Middleware
from .build_cleanup import cleanup_failed_builds, cleanup_old_builds, get_all_builds_size, get_cleanup_stats
from .build_manager import build_manager

router = APIRouter(prefix="/api/admin/builds", tags=["admin-builds"])


@router.get("/")
async def list_all_builds(
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = None,
    user: Optional[str] = None,
) -> Dict[str, any]:
    """
    Liste aller Builds mit Filterung.

    Query Params:
        limit: Max. Anzahl Builds
        offset: Pagination offset
        status: Filter nach Status (SUCCESS, FAILED, RUNNING)
        user: Filter nach User-ID

    Returns:
        {
            "total": 125,
            "limit": 50,
            "offset": 0,
            "builds": [...]
        }
    """
    all_builds = list(build_manager.builds.items())

    # Filter nach Status
    if status:
        all_builds = [(bid, b) for bid, b in all_builds if b.get("status") == status]

    # Filter nach User
    if user:
        all_builds = [(bid, b) for bid, b in all_builds if b.get("user") == user]

    # Sortiere nach Timestamp (neueste zuerst)
    all_builds.sort(key=lambda x: x[1].get("timestamp", 0), reverse=True)

    total = len(all_builds)

    # Pagination
    paginated = all_builds[offset : offset + limit]

    builds_data = []
    for build_id, build_data in paginated:
        builds_data.append(
            {
                "build_id": build_id,
                "user": build_data.get("user"),
                "project": build_data.get("project_path"),
                "build_type": build_data.get("build_type"),
                "status": build_data.get("status"),
                "timestamp": build_data.get("timestamp"),
                "duration": build_data.get("duration"),
                "artifacts": build_data.get("artifacts", []),
            }
        )

    return {"total": total, "limit": limit, "offset": offset, "builds": builds_data}


@router.get("/stats")
async def get_build_statistics() -> Dict[str, any]:
    """
    Build-Statistiken für Admin-Dashboard.

    Returns:
        {
            "total_builds": 125,
            "success_rate": 0.85,
            "avg_duration_seconds": 120.5,
            "builds_today": 12,
            "builds_this_week": 45,
            "builds_by_type": {...},
            "builds_by_status": {...}
        }
    """
    all_builds = build_manager.builds.values()

    total = len(all_builds)

    if total == 0:
        return {
            "total_builds": 0,
            "success_rate": 0,
            "avg_duration_seconds": 0,
            "builds_today": 0,
            "builds_this_week": 0,
            "builds_by_type": {},
            "builds_by_status": {},
        }

    # Success Rate
    success_count = sum(1 for b in all_builds if b.get("status") == "SUCCESS")
    success_rate = success_count / total

    # Durchschnittliche Dauer
    durations = [b.get("duration", 0) for b in all_builds if b.get("duration")]
    avg_duration = sum(durations) / len(durations) if durations else 0

    # Builds heute
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).timestamp()

    builds_today = sum(1 for b in all_builds if b.get("timestamp", 0) >= today_start)

    # Builds diese Woche
    week_start = (datetime.now() - timedelta(days=7)).timestamp()

    builds_this_week = sum(1 for b in all_builds if b.get("timestamp", 0) >= week_start)

    # Builds nach Typ
    builds_by_type = {}
    for b in all_builds:
        build_type = b.get("build_type", "unknown")
        builds_by_type[build_type] = builds_by_type.get(build_type, 0) + 1

    # Builds nach Status
    builds_by_status = {}
    for b in all_builds:
        status = b.get("status", "UNKNOWN")
        builds_by_status[status] = builds_by_status.get(status, 0) + 1

    return {
        "total_builds": total,
        "success_rate": round(success_rate, 3),
        "avg_duration_seconds": round(avg_duration, 2),
        "builds_today": builds_today,
        "builds_this_week": builds_this_week,
        "builds_by_type": builds_by_type,
        "builds_by_status": builds_by_status,
    }


@router.get("/active")
async def get_active_builds() -> Dict[str, any]:
    """
    Aktuell laufende Builds.

    Returns:
        {
            "active_count": 3,
            "builds": [...]
        }
    """
    active_builds = []

    for build_id, build_data in build_manager.builds.items():
        status = build_data.get("status")

        if status in ["PENDING", "RUNNING"]:
            active_builds.append(
                {
                    "build_id": build_id,
                    "user": build_data.get("user"),
                    "build_type": build_data.get("build_type"),
                    "status": status,
                    "started_at": build_data.get("timestamp"),
                    "elapsed_seconds": (time.time() - build_data.get("timestamp", 0)),
                }
            )

    return {"active_count": len(active_builds), "builds": active_builds}


@router.post("/{build_id}/cancel")
async def cancel_build(build_id: str) -> Dict[str, str]:
    """
    Bricht einen laufenden Build ab.

    Args:
        build_id: Build-ID

    Returns:
        {"status": "cancelled", "build_id": "..."}
    """
    build = build_manager.get_build(build_id)

    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    status = build.get("status")

    if status not in ["PENDING", "RUNNING"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel build with status: {status}")

    # Update Status
    build_manager.update_status(build_id, "CANCELLED")

    # TODO: Kill Build-Prozess wenn implementiert

    return {"status": "cancelled", "build_id": build_id}


@router.post("/cleanup")
async def trigger_cleanup(max_age_days: int = 7, cleanup_failed: bool = True) -> Dict[str, any]:
    """
    Startet Cleanup-Operation.

    Query Params:
        max_age_days: Builds älter als X Tage löschen
        cleanup_failed: Fehlgeschlagene Builds auch löschen

    Returns:
        {
            "deleted_builds": 5,
            "freed_space_gb": 1.23,
            "deleted_failed": 2
        }
    """
    result = cleanup_old_builds(max_age_days=max_age_days)

    failed_result = {"deleted": 0, "freed_space": 0}
    if cleanup_failed:
        failed_result = cleanup_failed_builds(max_age_hours=24)

    total_freed = result["freed_space"] + failed_result["freed_space"]

    return {
        "deleted_builds": result["deleted"],
        "freed_space_gb": round(total_freed / (1024**3), 2),
        "deleted_failed": failed_result["deleted"],
    }


@router.get("/system")
async def get_system_resources() -> Dict[str, any]:
    """
    System-Ressourcen für Monitoring.

    Returns:
        {
            "cpu_percent": 45.2,
            "memory_percent": 62.5,
            "disk_usage_gb": 123.45,
            "disk_free_gb": 876.55,
            "disk_percent": 12.3,
            "build_artifacts_size_gb": 5.67
        }
    """
    # CPU
    cpu_percent = psutil.cpu_percent(interval=1)

    # Memory
    memory = psutil.virtual_memory()
    memory_percent = memory.percent

    # Disk
    disk = psutil.disk_usage(".")
    disk_total_gb = disk.total / (1024**3)
    disk_used_gb = disk.used / (1024**3)
    disk_free_gb = disk.free / (1024**3)
    disk_percent = disk.percent

    # Build-Artifacts Größe
    artifacts_size = get_all_builds_size()
    artifacts_size_gb = artifacts_size / (1024**3)

    return {
        "cpu_percent": round(cpu_percent, 1),
        "memory_percent": round(memory_percent, 1),
        "disk_total_gb": round(disk_total_gb, 2),
        "disk_used_gb": round(disk_used_gb, 2),
        "disk_free_gb": round(disk_free_gb, 2),
        "disk_percent": round(disk_percent, 1),
        "build_artifacts_size_gb": round(artifacts_size_gb, 2),
    }


@router.get("/cleanup-stats")
async def get_cleanup_statistics() -> Dict[str, any]:
    """
    Cleanup-Statistiken für Admin-Dashboard.

    Returns:
        Stats von get_cleanup_stats()
    """
    return get_cleanup_stats()


@router.get("/user/{user_id}/builds")
async def get_user_builds(user_id: str, limit: int = 20) -> Dict[str, any]:
    """
    Alle Builds eines Users.

    Args:
        user_id: User-ID
        limit: Max. Anzahl

    Returns:
        {
            "user_id": "...",
            "total_builds": 15,
            "builds": [...]
        }
    """
    user_builds = [(bid, b) for bid, b in build_manager.builds.items() if b.get("user") == user_id]

    # Sortiere nach Timestamp
    user_builds.sort(key=lambda x: x[1].get("timestamp", 0), reverse=True)

    total = len(user_builds)
    limited = user_builds[:limit]

    builds_data = []
    for build_id, build_data in limited:
        builds_data.append(
            {
                "build_id": build_id,
                "build_type": build_data.get("build_type"),
                "status": build_data.get("status"),
                "timestamp": build_data.get("timestamp"),
                "duration": build_data.get("duration"),
            }
        )

    return {"user_id": user_id, "total_builds": total, "builds": builds_data}
