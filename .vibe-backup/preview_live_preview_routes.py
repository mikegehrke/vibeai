# -------------------------------------------------------------
# VIBEAI – LIVE PREVIEW ROUTES
# -------------------------------------------------------------
"""
REST API für Live Preview System

Endpoints:
- POST /preview/flutter/start - Start Flutter web server
- POST /preview/flutter/stop - Stop Flutter server
- POST /preview/flutter/reload - Trigger hot reload
- GET /preview/flutter/status - Get server status
- POST /preview/react/start - Start React/Vite dev server
- POST /preview/react/stop - Stop React server
- GET /preview/react/status - Get server status
- GET /preview/servers - List all active servers

Integration:
- Code Generator → Write code → Start preview
- WebSocket → Live logs streaming
- Frontend IFRAME → Display preview
"""

import asyncio
from typing import Dict

from fastapi import APIRouter, HTTPException, Request, WebSocket
from preview.flutter_preview import flutter_preview_manager
from preview.react_preview import react_preview_manager

router = APIRouter(prefix="/preview", tags=["Live Preview"])


# -------------------------------------------------------------
# FLUTTER PREVIEW ENDPOINTS
# -------------------------------------------------------------
@router.post("/flutter/start")
async def start_flutter_preview(request: Request) -> Dict:
    """
    Start Flutter web server für Live Preview.

    Request Body:
    {
        "project_path": "/path/to/flutter/project",
        "port": 8080  // optional
    }

    Response:
    {
        "success": true,
        "server_id": "flutter_8080",
        "port": 8080,
        "url": "http://localhost:8080",
        "status": "starting"
    }
    """
    try:
        body = await request.json()
        project_path = body.get("project_path")
        port = body.get("port")

        if not project_path:
            raise HTTPException(status_code=400, detail="Missing 'project_path'")

        result = await flutter_preview_manager.start_server(project_path, port)

        return {"success": True, **result}

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start Flutter server: {str(e)}")


@router.post("/flutter/stop")
async def stop_flutter_preview(request: Request) -> Dict:
    """
    Stop Flutter web server.

    Request Body:
    {
        "server_id": "flutter_8080"
    }

    Response:
    {
        "success": true,
        "message": "Server stopped"
    }
    """
    try:
        body = await request.json()
        server_id = body.get("server_id")

        if not server_id:
            raise HTTPException(status_code=400, detail="Missing 'server_id'")

        result = await flutter_preview_manager.stop_server(server_id)
        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop server: {str(e)}")


@router.post("/flutter/reload")
async def reload_flutter_preview(request: Request) -> Dict:
    """
    Trigger Flutter hot reload.

    Request Body:
    {
        "server_id": "flutter_8080"
    }

    Response:
    {
        "success": true,
        "message": "Hot reload triggered"
    }
    """
    try:
        body = await request.json()
        server_id = body.get("server_id")

        if not server_id:
            raise HTTPException(status_code=400, detail="Missing 'server_id'")

        result = await flutter_preview_manager.trigger_hot_reload(server_id)
        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flutter/status/{server_id}")
async def get_flutter_status(server_id: str) -> Dict:
    """
    Get Flutter server status.

    Response:
    {
        "server_id": "flutter_8080",
        "status": "running",
        "port": 8080,
        "url": "http://localhost:8080",
        "recent_logs": [...]
    }
    """
    status = flutter_preview_manager.get_server_status(server_id)

    if status.get("status") == "not_found":
        raise HTTPException(status_code=404, detail=f"Server not found: {server_id}")

    return status


# -------------------------------------------------------------
# REACT PREVIEW ENDPOINTS
# -------------------------------------------------------------
@router.post("/react/start")
async def start_react_preview(request: Request) -> Dict:
    """
    Start React/Vite dev server für Live Preview.

    Request Body:
    {
        "project_path": "/path/to/react/project",
        "port": 5173  // optional
    }

    Response:
    {
        "success": true,
        "server_id": "react_5173",
        "port": 5173,
        "url": "http://localhost:5173",
        "status": "starting"
    }
    """
    try:
        body = await request.json()
        project_path = body.get("project_path")
        port = body.get("port")

        if not project_path:
            raise HTTPException(status_code=400, detail="Missing 'project_path'")

        result = await react_preview_manager.start_server(project_path, port)

        return {"success": True, **result}

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start React server: {str(e)}")


@router.post("/react/stop")
async def stop_react_preview(request: Request) -> Dict:
    """
    Stop React dev server.

    Request Body:
    {
        "server_id": "react_5173"
    }

    Response:
    {
        "success": true,
        "message": "Server stopped"
    }
    """
    try:
        body = await request.json()
        server_id = body.get("server_id")

        if not server_id:
            raise HTTPException(status_code=400, detail="Missing 'server_id'")

        result = await react_preview_manager.stop_server(server_id)
        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop server: {str(e)}")


@router.get("/react/status/{server_id}")
async def get_react_status(server_id: str) -> Dict:
    """
    Get React server status.

    Response:
    {
        "server_id": "react_5173",
        "status": "running",
        "port": 5173,
        "url": "http://localhost:5173",
        "recent_logs": [...]
    }
    """
    status = react_preview_manager.get_server_status(server_id)

    if status.get("status") == "not_found":
        raise HTTPException(status_code=404, detail=f"Server not found: {server_id}")

    return status


# -------------------------------------------------------------
# UNIVERSAL ENDPOINTS
# -------------------------------------------------------------
@router.get("/servers")
async def list_all_servers() -> Dict:
    """
    List all active preview servers (Flutter + React).

    Response:
    {
        "flutter_servers": [...],
        "react_servers": [...],
        "total": 5
    }
    """
    flutter_servers = flutter_preview_manager.list_servers()
    react_servers = react_preview_manager.list_servers()

    return {
        "flutter_servers": flutter_servers["servers"],
        "react_servers": react_servers["servers"],
        "total": flutter_servers["count"] + react_servers["count"],
    }


@router.post("/stop_all")
async def stop_all_servers() -> Dict:
    """
    Stop all active preview servers.

    Response:
    {
        "success": true,
        "stopped": {
            "flutter": 2,
            "react": 3
        }
    }
    """
    flutter_stopped = 0
    react_stopped = 0

    # Stop all Flutter servers
    flutter_list = flutter_preview_manager.list_servers()
    for server in flutter_list["servers"]:
        try:
            await flutter_preview_manager.stop_server(server["server_id"])
            flutter_stopped += 1
        except:
            pass

    # Stop all React servers
    react_list = react_preview_manager.list_servers()
    for server in react_list["servers"]:
        try:
            await react_preview_manager.stop_server(server["server_id"])
            react_stopped += 1
        except:
            pass

    return {
        "success": True,
        "stopped": {"flutter": flutter_stopped, "react": react_stopped},
    }


# -------------------------------------------------------------
# WEBSOCKET - LIVE LOGS
# -------------------------------------------------------------
@router.websocket("/ws/logs/{server_id}")
async def preview_logs_websocket(websocket: WebSocket, server_id: str):
    """
    WebSocket für Live Logs von Preview Server.

    Sendet logs in Echtzeit:
    {
        "timestamp": 123456789,
        "message": "Hot reload complete",
        "type": "event"
    }
    """
    await websocket.accept()

    try:
        # Determine server type
        if server_id.startswith("flutter_"):
            manager = flutter_preview_manager
        elif server_id.startswith("react_"):
            manager = react_preview_manager
        else:
            await websocket.send_json({"error": "Unknown server type"})
            await websocket.close()
            return

        # Get server
        server = manager.active_servers.get(server_id)
        if not server:
            await websocket.send_json({"error": f"Server not found: {server_id}"})
            await websocket.close()
            return

        # Send existing logs
        for log in server["logs"][-100:]:  # Last 100 logs
            await websocket.send_json(log)

        # Stream new logs
        last_log_count = len(server["logs"])

        while True:
            await asyncio.sleep(0.5)

            # Check for new logs
            current_logs = server["logs"]
            if len(current_logs) > last_log_count:
                # Send new logs
                for log in current_logs[last_log_count:]:
                    await websocket.send_json(log)
                last_log_count = len(current_logs)

    except Exception as e:
        await websocket.send_json({"error": str(e)})
    finally:
        await websocket.close()


# -------------------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------------------
@router.get("/health")
async def preview_health_check() -> Dict:
    """
    Health check for preview system.

    Response:
    {
        "status": "healthy",
        "flutter_servers": 2,
        "react_servers": 3
    }
    """
    flutter_count = flutter_preview_manager.list_servers()["count"]
    react_count = react_preview_manager.list_servers()["count"]

    return {
        "status": "healthy",
        "flutter_servers": flutter_count,
        "react_servers": react_count,
    }
