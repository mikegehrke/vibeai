# -------------------------------------------------------------
# VIBEAI – BUILD ROUTES (API Endpoints for Build System)
# -------------------------------------------------------------
import asyncio
import os
from shutil import which

from auth import get_current_user
from buildsystem.build_executor import start_build
from buildsystem.build_manager import build_manager
from buildsystem.zip_export import create_zip_from_directory
from codestudio.project_manager import project_manager
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse

router = APIRouter(prefix="/build", tags=["Build System"])

# -------------------------------------------------------------
# BUILD VALIDATION
# -------------------------------------------------------------

VALID_BUILD_TYPES = {
    "flutter_apk",
    "flutter_web",
    "flutter_aab",
    "flutter_android",
    "flutter_ios",
    "web",
    "nextjs",
    "electron",
}


def tool_exists(tool: str) -> bool:
    """
    Prüft ob ein CLI-Tool installiert ist.

    Args:
        tool: Name des Tools (z.B. "flutter", "npm")

    Returns:
        bool: True wenn Tool verfügbar
    """
    return which(tool) is not None


def validate_build_type(build_type: str):
    """
    Validiert Build-Typ und prüft Dependencies.

    Args:
        build_type: Build-Typ (z.B. "flutter_apk")

    Raises:
        HTTPException: Wenn Build-Typ ungültig oder Dependencies fehlen
    """
    # Build-Typ validieren
    if build_type not in VALID_BUILD_TYPES:
        raise HTTPException(
            400,
            f"Invalid build type: {build_type}. " f"Valid types: {', '.join(VALID_BUILD_TYPES)}",
        )

    # Flutter builds
    if build_type.startswith("flutter"):
        if not tool_exists("flutter"):
            raise HTTPException(
                500,
                "Flutter SDK not installed on server. " "Please contact administrator.",
            )

    # Web/Next.js builds
    elif build_type in ["web", "nextjs"]:
        if not tool_exists("npm"):
            raise HTTPException(
                500,
                "Node.js / npm not installed on server. " "Please contact administrator.",
            )

    # Electron builds
    elif build_type == "electron":
        if not tool_exists("npm"):
            raise HTTPException(500, "Node.js / npm not installed on server (required for Electron).")


# -------------------------------------------------------------
# START BUILD
# -------------------------------------------------------------
@router.post("/start")
async def start_build_route(request: Request):
    body = await request.json()

    build_type = body.get("build_type")
    project_id = body.get("project_id")

    if not build_type or not project_id:
        raise HTTPException(400, "Missing parameters")

    # ⭐ Build-Typ und Dependencies validieren
    validate_build_type(build_type)

    user = await get_current_user(request)

    # Projekt laden
    project = project_manager.load_project(user.email, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    # Build erstellen
    build = build_manager.create_build(user=user.email, project_id=project_id, build_type=build_type)

    build_id = build["id"]
    project_path = project_manager.get_project_path(user.email, project_id)

    # Build asynchron starten
    asyncio.create_task(
        start_build(
            user=user.email,
            build_id=build_id,
            project_path=project_path,
            build_type=build_type,
        )
    )

    return {"success": True, "build_id": build_id, "message": "Build started"}


# -------------------------------------------------------------
# BUILD STATUS
# -------------------------------------------------------------
@router.get("/status")
async def build_status(build_id: str, request: Request):
    user = await get_current_user(request)
    meta = build_manager.load_build(user.email, build_id)

    if not meta:
        raise HTTPException(404, "Build not found")

    return meta


# -------------------------------------------------------------
# BUILD LOGS
# -------------------------------------------------------------
@router.get("/logs")
async def build_logs(build_id: str, request: Request):
    user = await get_current_user(request)

    log_path = os.path.join("build_artifacts", user.email, build_id, "logs", "build.log")

    if not os.path.exists(log_path):
        return {"logs": ""}

    with open(log_path, "r", encoding="utf-8") as f:
        data = f.read()

    return {"logs": data}


# -------------------------------------------------------------
# BUILD DOWNLOAD
# -------------------------------------------------------------
@router.get("/download")
async def download_build(build_id: str, request: Request):
    user = await get_current_user(request)

    output_path = os.path.join("build_artifacts", user.email, build_id, "output")

    if not os.path.exists(output_path):
        raise HTTPException(404, "No build output found")

    # Liste aller Dateien zurückgeben
    files = []
    for root, _, filenames in os.walk(output_path):
        for name in filenames:
            full = os.path.join(root, name)
            rel = full.replace(output_path + "/", "")
            files.append(rel)

    return {"build_id": build_id, "files": files}


# -------------------------------------------------------------
# LIST BUILDS
# -------------------------------------------------------------
@router.get("/list")
async def list_builds(request: Request):
    user = await get_current_user(request)

    builds = build_manager.list_builds(user.email)
    return {"builds": builds}


# -------------------------------------------------------------
# DOWNLOAD ZIP
# -------------------------------------------------------------
@router.get("/download/zip")
async def download_zip(build_id: str, request: Request):
    """
    Download kompletter Build als ZIP.

    Args:
        build_id: Build-ID

    Returns:
        ZIP-File mit allen Build-Outputs
    """
    user = await get_current_user(request)

    source = os.path.join("build_artifacts", user.email, build_id, "output")

    if not os.path.exists(source):
        raise HTTPException(404, "No build output found")

    zip_path = os.path.join("build_artifacts", user.email, build_id, "build.zip")

    create_zip_from_directory(source, zip_path)

    return FileResponse(zip_path, filename=f"{build_id}.zip")
