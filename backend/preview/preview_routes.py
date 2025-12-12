# -------------------------------------------------------------
# VIBEAI – PREVIEW ROUTES (API Endpoints)
# -------------------------------------------------------------
"""
API Endpoints für Live Preview System

Endpoints:
- POST /preview/start - Preview starten
- POST /preview/stop - Preview stoppen
- POST /preview/restart - Preview neu starten
- GET /preview/status - Preview Status
- GET /preview/list - Alle aktiven Previews
- WebSocket /ws/preview/{user} - Live Event Stream

Features:
- Web Preview (React, Next.js, Vue)
- Flutter Preview (Flutter Web)
- Multi-User Support
- Live Logs über WebSocket
"""

import os
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Request, WebSocket

from auth import get_current_user
from codestudio.project_manager import project_manager
from preview.preview_manager import preview_manager
from preview.preview_ws import preview_ws
from preview.preview_renderer import PreviewRenderer

router = APIRouter(prefix="/api/preview", tags=["Preview System"])


# -------------------------------------------------------------
# START PREVIEW
# -------------------------------------------------------------
@router.post("/start")
async def start_preview(request: Request) -> Dict[str, Any]:
    """
    Startet Live Preview für ein Projekt.

    Request Body:
        {
            "project_id": "abc123",
            "type": "web" | "flutter"
        }

    Returns:
        {
            "success": True,
            "port": 3001,
            "url": "http://localhost:3001",
            "type": "web"
        }
    """
    # ⚡ AUTH: Optional - wenn kein User, verwende default_user
    try:
        user = await get_current_user(request)
        user_email = user.email if hasattr(user, 'email') else (user.get('email') if isinstance(user, dict) else 'default_user')
    except Exception:
        # ⚡ FALLBACK: Verwende default_user wenn Auth fehlschlägt
        user_email = 'default_user'
        print(f"⚠️  Auth failed, using default_user for preview")
    
    body = await request.json()

    project_id = body.get("project_id")
    preview_type = body.get("type", "web")

    if not project_id:
        raise HTTPException(400, "Missing project_id")

    # ⚡ Projekt-Pfad direkt prüfen (auch ohne project.json)
    project_path = project_manager._get_project_path(user_email, project_id)
    
    # Prüfe ob Projekt-Verzeichnis existiert (auch ohne Metadaten)
    if not os.path.exists(project_path):
        raise HTTPException(404, f"Project directory not found: {project_id} (user: {user_email}, path: {project_path})")
    
    # Versuche Metadaten zu laden (optional - Projekt kann auch ohne existieren)
    try:
        project = project_manager.get_project(user_email, project_id)
    except (FileNotFoundError, KeyError):
        # ⚡ FALLBACK: Projekt existiert als Verzeichnis, aber keine Metadaten
        # Das ist OK - viele Projekte haben keine project.json
        project = None
        print(f"⚠️  No metadata found for project {project_id}, but directory exists")
    
    # ⚡ WICHTIG: Speichere Dateien IMMER, auch wenn Verzeichnis existiert
    # (Smart Agent speichert Dateien direkt, aber Preview sollte sie auch haben)
    files = body.get("files", [])
    if files:
        print(f"💾 Speichere {len(files)} Dateien für Preview...")
        project_manager.save_files_to_project(user_email, project_id, files)
        print(f"✅ Dateien gespeichert in: {project_path}")
    
    # Prüfe ob Projekt-Verzeichnis existiert und Dateien hat
    if not os.path.exists(project_path) or not os.listdir(project_path):
        if not files:
            raise HTTPException(400, "Project directory is empty. Please save files first.")

    try:
        # Preview starten
        if preview_type == "web":
            result = await preview_manager.start_web_preview(user_email, project_id, project_path)
        elif preview_type == "flutter":
            result = await preview_manager.start_flutter_preview(user_email, project_id, project_path)
        else:
            raise HTTPException(400, f"Invalid preview type: {preview_type}. Use 'web' or 'flutter'.")

        return {"success": True, **result}

    except FileNotFoundError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Error starting preview: {str(e)}")


# -------------------------------------------------------------
# STOP PREVIEW
# -------------------------------------------------------------
@router.post("/stop")
async def stop_preview(request: Request) -> Dict[str, Any]:
    """
    Stoppt aktiven Preview.

    Returns:
        {"success": True}
    """
    user = await get_current_user(request)

    stopped = preview_manager.stop_preview(user.email)

    return {
        "success": stopped,
        "message": "Preview stopped" if stopped else "No active preview",
    }


# -------------------------------------------------------------
# RESTART PREVIEW
# -------------------------------------------------------------
@router.post("/restart")
async def restart_preview(request: Request) -> Dict[str, Any]:
    """
    Startet Preview neu (für Hot Reload).

    Returns:
        {
            "success": True,
            "port": 3001,
            "url": "http://localhost:3001"
        }
    """
    user = await get_current_user(request)

    try:
        result = await preview_manager.restart_preview(user.email)

        if not result:
            raise HTTPException(404, "No active preview to restart")

        return {"success": True, **result}

    except Exception as e:
        raise HTTPException(500, f"Error restarting preview: {str(e)}")


# -------------------------------------------------------------
# PREVIEW STATUS
# -------------------------------------------------------------
@router.get("/status")
async def get_preview_status(request: Request) -> Dict[str, Any]:
    """
    Gibt Status des aktiven Previews zurück.

    Returns:
        {
            "active": True,
            "project_id": "abc123",
            "port": 3001,
            "url": "http://localhost:3001",
            "type": "web",
            "uptime": 120.5,
            "running": True
        }
    """
    user = await get_current_user(request)

    status = preview_manager.get_preview_status(user.email)

    if not status:
        return {"active": False, "message": "No active preview"}

    return {"active": True, **status}


# -------------------------------------------------------------
# LIST ALL PREVIEWS (Admin)
# -------------------------------------------------------------
@router.get("/list")
async def list_all_previews() -> Dict[str, Any]:
    """
    Liste aller aktiven Previews (Admin-Funktion).

    Returns:
        {
            "total": 3,
            "previews": {
                "user1@email.com": {...},
                "user2@email.com": {...}
            }
        }
    """
    previews = preview_manager.list_active_previews()

    return {"total": len(previews), "previews": previews}


# -------------------------------------------------------------
# WEBSOCKET PREVIEW LOGS
# -------------------------------------------------------------
@router.websocket("/ws/{user}")
async def websocket_preview_logs(websocket: WebSocket, user: str):
    """
    WebSocket für Live Preview Logs.

    Args:
        user: User-Email/ID

    Events:
        - connected: Verbindung hergestellt
        - log: Log-Zeile vom Preview Server
        - compile_start: Kompilierung startet
        - compile_success: Erfolgreich kompiliert
        - compile_error: Fehler
        - reload: Hot Reload
    """
    # TODO: Auth Token validieren
    # token = websocket.query_params.get("token")

    # Status prüfen
    status = preview_manager.get_preview_status(user)

    if not status:
        await websocket.close(code=1008, reason="No active preview")
        return

    port = status["port"]

    # WebSocket verbinden
    await preview_ws.connect(websocket, user, port)

    try:
        # Keep-Alive Loop
        while True:
            data = await websocket.receive_text()

            # Ping/Pong
            if data == "ping":
                await websocket.send_text("pong")

    except Exception as e:
        print(f"WebSocket error for {user}: {e}")
    finally:
        await preview_ws.disconnect(websocket, user)


# -------------------------------------------------------------
# GET PREVIEW URL (für IFRAME)
# -------------------------------------------------------------
@router.get("/url")
async def get_preview_url(request: Request) -> Dict[str, str]:
    """
    Gibt Preview-URL für IFRAME zurück.

    Returns:
        {
            "url": "http://localhost:3001",
            "embed_url": "http://localhost:3001"
        }
    """
    user = await get_current_user(request)

    status = preview_manager.get_preview_status(user.email)

    if not status:
        raise HTTPException(404, "No active preview")

    return {"url": status["url"], "embed_url": status["url"]}


# -------------------------------------------------------------
# RENDER SCREEN (App Builder Integration)
# -------------------------------------------------------------
@router.post("/render_screen")
async def render_screen(request: Request) -> Dict[str, str]:
    """
    Rendert KI-generierten Screen zu HTML für Live Preview.

    🔥 App Builder Integration:
    - Nimmt Screen-Definition vom App Builder
    - Rendert zu komplettem HTML
    - Sofort sichtbar ohne Build
    - Echtzeit-Updates möglich

    Request Body:
        {
            "screen": {
                "name": "LoginScreen",
                "components": [
                    {
                        "type": "heading",
                        "text": "Welcome Back",
                        "props": { "size": "large" }
                    },
                    {
                        "type": "input",
                        "text": "",
                        "props": { "placeholder": "Email" }
                    },
                    {
                        "type": "button",
                        "text": "Login",
                        "props": { "color": "#007acc" }
                    }
                ],
                "style": "tailwind",
                "metadata": {
                    "title": "Login",
                    "theme": "dark"
                }
            }
        }

    Returns:
        {
            "success": True,
            "html": "<html>...</html>",
            "screen_name": "LoginScreen"
        }
    """
    try:
        body = await request.json()
        screen = body.get("screen")

        if not screen:
            raise HTTPException(400, "Missing 'screen' in request body")

        # Screen Name
        screen_name = screen.get("name", "Untitled Screen")

        # Style (tailwind, bootstrap, custom)
        style = screen.get("style", "tailwind")

        # HTML rendern
        renderer = PreviewRenderer()
        html = renderer.render_screen_html(screen, style)

        return {"success": True, "html": html, "screen_name": screen_name}

    except Exception as e:
        print(f"Error rendering screen: {e}")
        raise HTTPException(500, f"Failed to render screen: {str(e)}")


# -------------------------------------------------------------
# RENDER COMPONENT (einzelnes Component)
# -------------------------------------------------------------
@router.post("/render_component")
async def render_component(request: Request) -> Dict[str, str]:
    """
    Rendert einzelnes Component zu HTML.

    Request Body:
        {
            "component": {
                "type": "button",
                "text": "Click Me",
                "props": { "color": "#4caf50" }
            },
            "style": "tailwind"
        }

    Returns:
        {
            "success": True,
            "html": "<button>...</button>"
        }
    """
    try:
        body = await request.json()
        component = body.get("component")
        style = body.get("style", "tailwind")

        if not component:
            raise HTTPException(400, "Missing 'component' in request body")

        renderer = PreviewRenderer()
        html = renderer.render_component_html(component, style)

        return {"success": True, "html": html}

    except Exception as e:
        print(f"Error rendering component: {e}")
        raise HTTPException(500, f"Failed to render component: {str(e)}")