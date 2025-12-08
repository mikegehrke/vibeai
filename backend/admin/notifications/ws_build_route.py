# -------------------------------------------------------------
# VIBEAI – BUILD EVENTS WEBSOCKET ROUTE
# -------------------------------------------------------------
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from admin.notifications.ws_build_events import ws_build_events

logger = logging.getLogger("ws_build_route")

router = APIRouter()


@router.websocket("/ws/build-events/{build_id}")
async def build_events_socket(websocket: WebSocket, build_id: str):
    """
    WebSocket für Live Build Logs.
    Jeder Client hört die Logs des spezifischen Builds.

    Usage:
        ws://localhost:8005/ws/build-events/{build_id}

    Events sent to client:
        {type: "connected", build_id: "..."}
        {type: "log", text: "..."}
        {type: "status", status: "RUNNING", progress: 45}
        {type: "error", error: "..."}
        {type: "complete", success: true, artifacts: [...]}
    """

    # Verbinden
    await ws_build_events.connect(websocket, build_id)

    logger.info(f"Client connected to build events: {build_id}")

    try:
        # Client offen halten (der Client sendet normalerweise nichts)
        while True:
            data = await websocket.receive_text()

            # Optional: Ping/Pong support
            if data == "ping":
                await websocket.send_text("pong")

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from build: {build_id}")
        await ws_build_events.disconnect(websocket, build_id)

    except Exception as e:
        logger.error(f"WebSocket error for build {build_id}: {e}")
        await ws_build_events.disconnect(websocket, build_id)