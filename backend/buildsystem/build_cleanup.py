# -------------------------------------------------------------
# VIBEAI – BUILD CLEANUP SYSTEM
# -------------------------------------------------------------
"""
Automatisches Cleanup für alte Build-Artifacts

Features:
- Alte Builds automatisch löschen (nach X Tagen)
- Cleanup nach Build-Count (nur letzte N Builds behalten)
- Speicherplatz-Management
- Temporäre Dateien bereinigen
- Fehlgeschlagene Builds priorisiert löschen

Verwendung:
    # Cleanup alte Builds
    cleanup_old_builds(max_age_days=7)
    
    # Nur letzte 10 Builds behalten
    cleanup_by_count(max_builds=10, user_id="user123")
    
    # Speicherplatz freigeben
    cleanup_until_size(max_size_gb=5.0)
"""

import os
import shutil
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from pathlib import Path

from .build_manager import build_manager


# -------------------------------------------------------------
# SIMPLE CLEANUP (User-Friendly API)
# -------------------------------------------------------------

BASE_DIR = "build_artifacts"
MAX_AGE_SECONDS = 30 * 24 * 3600   # 30 Tage


def cleanup_old_builds():
    """
    Löscht alte Build-Artefakte (> 30 Tage).
    
    Einfache Funktion für manuelle oder CRON-basierte Cleanups.
    Durchsucht alle User-Verzeichnisse und entfernt alte Builds.
    """
    now = time.time()

    if not os.path.exists(BASE_DIR):
        return

    deleted_count = 0
    freed_space = 0

    for user in os.listdir(BASE_DIR):
        user_path = os.path.join(BASE_DIR, user)
        if not os.path.isdir(user_path):
            continue

        for build_id in os.listdir(user_path):
            build_path = os.path.join(user_path, build_id)
            meta_file = os.path.join(build_path, "build.json")

            if not os.path.exists(meta_file):
                continue

            # Metadata laden
            try:
                mod_time = os.path.getmtime(meta_file)
            except Exception:
                continue

            age = now - mod_time
            if age > MAX_AGE_SECONDS:
                # Größe berechnen vor dem Löschen
                try:
                    size = sum(
                        os.path.getsize(os.path.join(dirpath, filename))
                        for dirpath, _, filenames in os.walk(build_path)
                        for filename in filenames
                    )
                    freed_space += size
                except Exception:
                    pass
                
                # Build löschen
                shutil.rmtree(build_path, ignore_errors=True)
                deleted_count += 1
                print(f"Deleted old build: {user}/{build_id}")

    print(
        f"Cleanup complete: {deleted_count} builds deleted, "
        f"{freed_space / (1024**3):.2f} GB freed"
    )
    
    return {
        "deleted": deleted_count,
        "freed_space_gb": round(freed_space / (1024**3), 2)
    }


# -------------------------------------------------------------
# ADVANCED CLEANUP FUNCTIONS
# -------------------------------------------------------------


def get_build_size(build_id: str) -> int:
    """
    Berechnet Größe eines Build-Verzeichnisses in Bytes.
    
    Args:
        build_id: Build-ID
    
    Returns:
        int: Größe in Bytes
    """
    build_dir = f"build_artifacts/{build_id}"
    
    if not os.path.exists(build_dir):
        return 0
    
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(build_dir):
        for filename in filenames:
            file_path = os.path.join(dirpath, filename)
            if os.path.exists(file_path):
                total_size += os.path.getsize(file_path)
    
    return total_size


def get_all_builds_size() -> int:
    """
    Berechnet Gesamtgröße aller Build-Artifacts.
    
    Returns:
        int: Größe in Bytes
    """
    artifacts_dir = "build_artifacts"
    
    if not os.path.exists(artifacts_dir):
        return 0
    
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(artifacts_dir):
        for filename in filenames:
            file_path = os.path.join(dirpath, filename)
            if os.path.exists(file_path):
                total_size += os.path.getsize(file_path)
    
    return total_size


def delete_build_artifacts(build_id: str) -> bool:
    """
    Löscht Build-Artifacts für eine Build-ID.
    
    Args:
        build_id: Build-ID
    
    Returns:
        bool: True wenn erfolgreich gelöscht
    """
    build_dir = f"build_artifacts/{build_id}"
    
    if not os.path.exists(build_dir):
        return False
    
    try:
        shutil.rmtree(build_dir)
        print(f"Deleted build artifacts: {build_id}")
        return True
    except Exception as e:
        print(f"Error deleting build {build_id}: {e}")
        return False


def cleanup_old_builds_advanced(max_age_days: int = 7) -> Dict[str, Any]:
    """
    Löscht Builds älter als X Tage (erweiterte Version).
    
    Args:
        max_age_days: Maximales Alter in Tagen
    
    Returns:
        {
            "deleted": 5,
            "freed_space": 123456789,
            "build_ids": ["abc", "def"]
        }
    """
    cutoff_time = time.time() - (max_age_days * 24 * 60 * 60)
    
    deleted_count = 0
    freed_space = 0
    deleted_ids = []
    
    artifacts_dir = "build_artifacts"
    
    if not os.path.exists(artifacts_dir):
        return {
            "deleted": 0,
            "freed_space": 0,
            "build_ids": []
        }
    
    for build_id in os.listdir(artifacts_dir):
        build_dir = os.path.join(artifacts_dir, build_id)
        
        if not os.path.isdir(build_dir):
            continue
        
        # Prüfe Änderungszeit
        mtime = os.path.getmtime(build_dir)
        
        if mtime < cutoff_time:
            size = get_build_size(build_id)
            
            if delete_build_artifacts(build_id):
                deleted_count += 1
                freed_space += size
                deleted_ids.append(build_id)
    
    return {
        "deleted": deleted_count,
        "freed_space": freed_space,
        "build_ids": deleted_ids
    }


def cleanup_by_count(
    max_builds: int = 10,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Behält nur die letzten N Builds pro User.
    
    Args:
        max_builds: Anzahl Builds die behalten werden
        user_id: Optional - nur für einen User cleanen
    
    Returns:
        {
            "deleted": 3,
            "kept": 10,
            "freed_space": 98765432
        }
    """
    all_builds = build_manager.builds.copy()
    
    # Filter nach User
    if user_id:
        all_builds = {
            bid: b for bid, b in all_builds.items()
            if b.get("user") == user_id
        }
    
    # Sortiere nach Timestamp (neueste zuerst)
    sorted_builds = sorted(
        all_builds.items(),
        key=lambda x: x[1].get("timestamp", 0),
        reverse=True
    )
    
    # Builds zum Löschen (alles nach max_builds)
    builds_to_delete = sorted_builds[max_builds:]
    
    deleted_count = 0
    freed_space = 0
    
    for build_id, build_data in builds_to_delete:
        size = get_build_size(build_id)
        
        if delete_build_artifacts(build_id):
            deleted_count += 1
            freed_space += size
    
    return {
        "deleted": deleted_count,
        "kept": min(len(sorted_builds), max_builds),
        "freed_space": freed_space
    }


def cleanup_failed_builds(max_age_hours: int = 24) -> Dict[str, Any]:
    """
    Löscht fehlgeschlagene Builds älter als X Stunden.
    
    Args:
        max_age_hours: Maximales Alter in Stunden
    
    Returns:
        {
            "deleted": 2,
            "freed_space": 45678
        }
    """
    cutoff_time = time.time() - (max_age_hours * 60 * 60)
    
    deleted_count = 0
    freed_space = 0
    
    for build_id, build_data in build_manager.builds.items():
        # Nur fehlgeschlagene Builds
        if build_data.get("status") != "FAILED":
            continue
        
        # Prüfe Alter
        build_time = build_data.get("timestamp", 0)
        if build_time < cutoff_time:
            size = get_build_size(build_id)
            
            if delete_build_artifacts(build_id):
                deleted_count += 1
                freed_space += size
    
    return {
        "deleted": deleted_count,
        "freed_space": freed_space
    }


def cleanup_until_size(max_size_gb: float = 5.0) -> Dict[str, Any]:
    """
    Löscht älteste Builds bis Gesamtgröße unter Limit ist.
    
    Args:
        max_size_gb: Maximale Größe in GB
    
    Returns:
        {
            "deleted": 3,
            "freed_space": 1234567890,
            "current_size": 3456789012
        }
    """
    max_size_bytes = int(max_size_gb * 1024 * 1024 * 1024)
    current_size = get_all_builds_size()
    
    if current_size <= max_size_bytes:
        return {
            "deleted": 0,
            "freed_space": 0,
            "current_size": current_size
        }
    
    # Sortiere Builds nach Alter (älteste zuerst)
    sorted_builds = sorted(
        build_manager.builds.items(),
        key=lambda x: x[1].get("timestamp", 0)
    )
    
    deleted_count = 0
    freed_space = 0
    
    for build_id, build_data in sorted_builds:
        if current_size <= max_size_bytes:
            break
        
        size = get_build_size(build_id)
        
        if delete_build_artifacts(build_id):
            deleted_count += 1
            freed_space += size
            current_size -= size
    
    return {
        "deleted": deleted_count,
        "freed_space": freed_space,
        "current_size": current_size
    }


def cleanup_temp_files() -> Dict[str, Any]:
    """
    Löscht temporäre Build-Dateien (.tmp, .cache, etc.).
    
    Returns:
        {
            "deleted_files": 15,
            "freed_space": 123456
        }
    """
    temp_extensions = ['.tmp', '.cache', '.swp', '.bak']
    
    deleted_files = 0
    freed_space = 0
    
    artifacts_dir = "build_artifacts"
    
    if not os.path.exists(artifacts_dir):
        return {
            "deleted_files": 0,
            "freed_space": 0
        }
    
    for root, dirs, files in os.walk(artifacts_dir):
        for file in files:
            file_path = os.path.join(root, file)
            
            # Prüfe Extension
            if any(file.endswith(ext) for ext in temp_extensions):
                try:
                    size = os.path.getsize(file_path)
                    os.remove(file_path)
                    deleted_files += 1
                    freed_space += size
                except Exception as e:
                    print(f"Error deleting temp file {file_path}: {e}")
    
    return {
        "deleted_files": deleted_files,
        "freed_space": freed_space
    }


def get_cleanup_stats() -> Dict[str, Any]:
    """
    Statistiken über Build-Artifacts.
    
    Returns:
        {
            "total_builds": 25,
            "total_size": 1234567890,
            "total_size_gb": 1.15,
            "oldest_build": "2024-01-01T12:00:00",
            "newest_build": "2024-12-02T15:30:00",
            "failed_builds": 3,
            "success_builds": 22
        }
    """
    total_builds = len(build_manager.builds)
    total_size = get_all_builds_size()
    
    timestamps = [
        b.get("timestamp", 0)
        for b in build_manager.builds.values()
    ]
    
    oldest = min(timestamps) if timestamps else 0
    newest = max(timestamps) if timestamps else 0
    
    failed = sum(
        1 for b in build_manager.builds.values()
        if b.get("status") == "FAILED"
    )
    
    success = sum(
        1 for b in build_manager.builds.values()
        if b.get("status") == "SUCCESS"
    )
    
    return {
        "total_builds": total_builds,
        "total_size": total_size,
        "total_size_gb": round(total_size / (1024**3), 2),
        "oldest_build": (
            datetime.fromtimestamp(oldest).isoformat()
            if oldest else None
        ),
        "newest_build": (
            datetime.fromtimestamp(newest).isoformat()
            if newest else None
        ),
        "failed_builds": failed,
        "success_builds": success
    }
