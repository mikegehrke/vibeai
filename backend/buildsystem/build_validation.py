# -------------------------------------------------------------
# VIBEAI – BUILD ERROR HANDLING & VALIDATION
# -------------------------------------------------------------
"""
Validierung und Error Handling für Build-Start

Features:
- Projekt-Validierung vor Build-Start
- Dependency-Check (Flutter, Node.js, etc.)
- Plattenplatz-Prüfung
- Build-Config Validierung
- Saubere Fehlermeldungen für Frontend
- Build-Queue Management

Verwendung:
    result = await validate_build_request(user, project_path, build_type)
    if not result["valid"]:
        raise HTTPException(400, detail=result["errors"])
"""

import os
import shutil
from typing import Dict, List, Optional
from pathlib import Path

from .build_manager import build_manager


async def validate_build_request(
    user: str,
    project_path: str,
    build_type: str
) -> Dict[str, any]:
    """
    Validiert Build-Request vor dem Start.
    
    Args:
        user: User-ID
        project_path: Pfad zum Projekt
        build_type: Build-Typ (flutter_android, web, etc.)
    
    Returns:
        {
            "valid": True/False,
            "errors": [],
            "warnings": []
        }
    """
    errors = []
    warnings = []
    
    # 1) Projekt-Pfad existiert
    if not os.path.exists(project_path):
        errors.append(f"Project path not found: {project_path}")
        return {
            "valid": False,
            "errors": errors,
            "warnings": warnings
        }
    
    # 2) Build-Typ unterstützt
    supported_types = [
        "flutter_android",
        "flutter_ios",
        "flutter_web",
        "web",
        "nextjs",
        "electron"
    ]
    
    if build_type not in supported_types:
        errors.append(
            f"Unsupported build type: {build_type}. "
            f"Supported: {', '.join(supported_types)}"
        )
    
    # 3) Projekt-spezifische Validierung
    if build_type.startswith("flutter"):
        flutter_errors = await _validate_flutter_project(project_path)
        errors.extend(flutter_errors)
    
    elif build_type in ["web", "nextjs"]:
        web_errors = await _validate_web_project(project_path)
        errors.extend(web_errors)
    
    elif build_type == "electron":
        electron_errors = await _validate_electron_project(project_path)
        errors.extend(electron_errors)
    
    # 4) Plattenplatz prüfen
    disk_space_gb = get_available_disk_space_gb()
    
    if disk_space_gb < 1.0:
        errors.append(
            f"Insufficient disk space: {disk_space_gb:.2f} GB available. "
            "Need at least 1 GB."
        )
    elif disk_space_gb < 2.0:
        warnings.append(
            f"Low disk space: {disk_space_gb:.2f} GB available."
        )
    
    # 5) Maximale Builds pro User prüfen
    user_builds = get_active_builds_for_user(user)
    
    if len(user_builds) >= 5:
        errors.append(
            f"Too many active builds for user {user}. "
            f"Maximum: 5, Current: {len(user_builds)}"
        )
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }


async def _validate_flutter_project(project_path: str) -> List[str]:
    """
    Validiert Flutter-Projekt.
    
    Returns:
        List[str]: Fehlermeldungen (leer wenn OK)
    """
    errors = []
    
    # pubspec.yaml muss existieren
    pubspec_path = os.path.join(project_path, "pubspec.yaml")
    if not os.path.exists(pubspec_path):
        errors.append("Missing pubspec.yaml - not a valid Flutter project")
    
    # lib/ Ordner muss existieren
    lib_path = os.path.join(project_path, "lib")
    if not os.path.exists(lib_path):
        errors.append("Missing lib/ directory")
    
    return errors


async def _validate_web_project(project_path: str) -> List[str]:
    """
    Validiert Web/Next.js Projekt.
    
    Returns:
        List[str]: Fehlermeldungen (leer wenn OK)
    """
    errors = []
    
    # package.json muss existieren
    package_json = os.path.join(project_path, "package.json")
    if not os.path.exists(package_json):
        errors.append("Missing package.json - not a valid Node.js project")
    
    return errors


async def _validate_electron_project(project_path: str) -> List[str]:
    """
    Validiert Electron-Projekt.
    
    Returns:
        List[str]: Fehlermeldungen (leer wenn OK)
    """
    errors = []
    
    # package.json muss existieren
    package_json = os.path.join(project_path, "package.json")
    if not os.path.exists(package_json):
        errors.append("Missing package.json")
        return errors
    
    # main.js oder index.js muss existieren
    main_js = os.path.join(project_path, "main.js")
    index_js = os.path.join(project_path, "index.js")
    
    if not os.path.exists(main_js) and not os.path.exists(index_js):
        errors.append(
            "Missing main.js or index.js - "
            "not a valid Electron project"
        )
    
    return errors


def get_available_disk_space_gb() -> float:
    """
    Gibt verfügbaren Plattenplatz in GB zurück.
    
    Returns:
        float: Verfügbarer Platz in GB
    """
    stat = shutil.disk_usage(".")
    return stat.free / (1024 ** 3)


def get_active_builds_for_user(user: str) -> List[str]:
    """
    Gibt Liste aktiver Builds für einen User zurück.
    
    Args:
        user: User-ID
    
    Returns:
        List[str]: Build-IDs
    """
    active_builds = []
    
    for build_id, build_data in build_manager.builds.items():
        if build_data.get("user") == user:
            status = build_data.get("status", "")
            
            # Nur PENDING und RUNNING zählen als aktiv
            if status in ["PENDING", "RUNNING"]:
                active_builds.append(build_id)
    
    return active_builds


def get_build_queue_position(build_id: str) -> Optional[int]:
    """
    Gibt Position in der Build-Queue zurück.
    
    Args:
        build_id: Build-ID
    
    Returns:
        Optional[int]: Position (1-based) oder None
    """
    pending_builds = []
    
    for bid, build_data in build_manager.builds.items():
        if build_data.get("status") == "PENDING":
            pending_builds.append({
                "id": bid,
                "timestamp": build_data.get("timestamp", 0)
            })
    
    # Sortiere nach Timestamp
    pending_builds.sort(key=lambda x: x["timestamp"])
    
    # Finde Position
    for idx, build in enumerate(pending_builds):
        if build["id"] == build_id:
            return idx + 1
    
    return None


async def check_build_dependencies(build_type: str) -> Dict[str, any]:
    """
    Prüft ob notwendige Build-Tools installiert sind.
    
    Args:
        build_type: Build-Typ
    
    Returns:
        {
            "available": True/False,
            "missing": [],
            "version": "..."
        }
    """
    import subprocess
    
    missing = []
    version = None
    
    if build_type.startswith("flutter"):
        # Prüfe Flutter
        try:
            result = subprocess.run(
                ["flutter", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                version = result.stdout.split("\n")[0]
            else:
                missing.append("flutter")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            missing.append("flutter")
    
    elif build_type in ["web", "nextjs"]:
        # Prüfe Node.js
        try:
            result = subprocess.run(
                ["node", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                version = result.stdout.strip()
            else:
                missing.append("node")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            missing.append("node")
        
        # Prüfe npm
        try:
            subprocess.run(
                ["npm", "--version"],
                capture_output=True,
                timeout=5
            )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            missing.append("npm")
    
    elif build_type == "electron":
        # Prüfe Node.js und npm
        try:
            subprocess.run(
                ["node", "--version"],
                capture_output=True,
                timeout=5
            )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            missing.append("node")
        
        try:
            subprocess.run(
                ["npm", "--version"],
                capture_output=True,
                timeout=5
            )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            missing.append("npm")
    
    return {
        "available": len(missing) == 0,
        "missing": missing,
        "version": version
    }


def format_build_error(error: Exception, build_type: str) -> str:
    """
    Formatiert Build-Fehler für Frontend.
    
    Args:
        error: Exception
        build_type: Build-Typ
    
    Returns:
        str: Formatierte Fehlermeldung
    """
    error_msg = str(error)
    
    # Spezifische Fehlerbehandlung
    if "pubspec.yaml" in error_msg.lower():
        return (
            "Flutter project error: Missing or invalid pubspec.yaml. "
            "Please check your Flutter project structure."
        )
    
    elif "package.json" in error_msg.lower():
        return (
            "Node.js project error: Missing or invalid package.json. "
            "Please check your project configuration."
        )
    
    elif "permission denied" in error_msg.lower():
        return (
            "Permission error: Unable to access project files. "
            "Please check file permissions."
        )
    
    elif "no space left" in error_msg.lower():
        return (
            "Disk space error: Not enough storage available. "
            "Please free up disk space and try again."
        )
    
    elif "timeout" in error_msg.lower():
        return (
            "Build timeout: The build took too long to complete. "
            "Please check your project size and complexity."
        )
    
    # Fallback: Original-Fehler
    return f"Build error ({build_type}): {error_msg}"
