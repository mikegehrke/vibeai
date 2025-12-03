# -------------------------------------------------------------
# VIBEAI – BUILD WEBSOCKET ROUTES
# -------------------------------------------------------------
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from admin.notifications.ws_build_events import ws_build_events
import logging

logger = logging.getLogger("ws_routes")

router = APIRouter(prefix="/ws", tags=["WebSocket"])


# -------------------------------------------------------------
# BUILD LOGS WEBSOCKET
# -------------------------------------------------------------
@router.websocket("/build/{build_id}")
async def websocket_build_logs(
    websocket: WebSocket,
    build_id: str,
    token: str = Query(None)
):
    """
    WebSocket endpoint for live build logs.
    
    Usage:
        ws://localhost:8005/ws/build/{build_id}?token={auth_token}
    
    Events:
        - connected: Connection established
        - log: Build log line
        - status: Build status update
        - error: Build error
        - complete: Build finished
    """
    # TODO: Add auth token verification
    # if token:
    #     user = verify_token(token)
    #     if not user:
    #         await websocket.close(code=1008)
    #         return
    
    await ws_build_events.connect(websocket, build_id)
    
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            
            # Client kann ping senden
            if data == "ping":
                await websocket.send_text("pong")
                
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from build {build_id}")
        await ws_build_events.disconnect(websocket, build_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await ws_build_events.disconnect(websocket, build_id)


# -------------------------------------------------------------
# ACTIVE BUILDS MONITORING
# -------------------------------------------------------------
@router.get("/active-builds")
async def get_active_builds():
    """
    Get list of all active build streams.
    """
    return {
        "active_builds": ws_build_events.get_active_builds()
    }
