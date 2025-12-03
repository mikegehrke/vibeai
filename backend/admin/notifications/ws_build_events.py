from typing import Any
# -------------------------------------------------------------
# VIBEAI – BUILD EVENTS WEBSOCKET (Live Build Logs)
# -------------------------------------------------------------
from fastapi import WebSocket
import json
import asyncio
import logging

logger = logging.getLogger("ws_build_events")


class BuildEventManager:

    def __init__(self):
        # build_id → set(websockets)
        self.active_build_streams = {}

    # ---------------------------------------------------------
    # CLIENT VERBINDEN
    # ---------------------------------------------------------
    async def connect(self, websocket: WebSocket, build_id: str):
        await websocket.accept()

        if build_id not in self.active_build_streams:
            self.active_build_streams[build_id] = set()

        self.active_build_streams[build_id].add(websocket)

        await websocket.send_text(json.dumps({
            "type": "connected",
            "build_id": build_id,
            "message": f"Connected to build {build_id}"
        }))

        logger.info(
            f"Client connected to build {build_id}. "
            f"Total clients: {len(self.active_build_streams[build_id])}"
        )

    # ---------------------------------------------------------
    # CLIENT TRENNEN
    # ---------------------------------------------------------
    async def disconnect(self, websocket: WebSocket, build_id: str):
        if build_id in self.active_build_streams:
            self.active_build_streams[build_id].discard(websocket)

            if len(self.active_build_streams[build_id]) == 0:
                del self.active_build_streams[build_id]

            logger.info(f"Client disconnected from build {build_id}")

    # ---------------------------------------------------------
    # LOGS SENDEN
    # ---------------------------------------------------------
    async def broadcast(self, build_id: str, text: str):
        """
        Sende Live-Log Zeile an alle verbundenen Clients.
        """
        if build_id not in self.active_build_streams:
            return

        dead = set()

        for ws in self.active_build_streams[build_id]:
            try:
                await ws.send_text(json.dumps({
                    "type": "log",
                    "text": text,
                    "timestamp": asyncio.get_event_loop().time()
                }))
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                dead.add(ws)

        # Tote Verbindungen entfernen
        for ws in dead:
            self.active_build_streams[build_id].discard(ws)

    # ---------------------------------------------------------
    # STATUS UPDATE
    # ---------------------------------------------------------
    async def broadcast_status(
        self,
        build_id: str,
        status: str,
        progress: int = None
    ) -> None:
        """
        Sende Status-Update an alle Clients.
        """
        if build_id not in self.active_build_streams:
            return

        dead = set()

        for ws in self.active_build_streams[build_id]:
            try:
                payload = {
                    "type": "status",
                    "status": status,
                    "timestamp": asyncio.get_event_loop().time()
                }

                if progress is not None:
                    payload["progress"] = progress

                await ws.send_text(json.dumps(payload))
            except Exception as e:
                logger.warning(f"Failed to send status: {e}")
                dead.add(ws)

        # Tote Verbindungen entfernen
        for ws in dead:
            self.active_build_streams[build_id].discard(ws)

    # ---------------------------------------------------------
    # ERROR EVENT
    # ---------------------------------------------------------
    async def broadcast_error(self, build_id: str, error: str):
        """
        Sende Error-Event an alle Clients.
        """
        if build_id not in self.active_build_streams:
            return

        dead = set()

        for ws in self.active_build_streams[build_id]:
            try:
                await ws.send_text(json.dumps({
                    "type": "error",
                    "error": error,
                    "timestamp": asyncio.get_event_loop().time()
                }))
            except Exception as e:
                logger.warning(f"Failed to send error: {e}")
                dead.add(ws)

        # Tote Verbindungen entfernen
        for ws in dead:
            self.active_build_streams[build_id].discard(ws)

    # ---------------------------------------------------------
    # BUILD COMPLETE
    # ---------------------------------------------------------
    async def broadcast_complete(
        self,
        build_id: str,
        success: bool,
        artifacts: list = None
    ) -> None:
        """
        Sende Build-Completion Event.
        """
        if build_id not in self.active_build_streams:
            return

        dead = set()

        for ws in self.active_build_streams[build_id]:
            try:
                payload = {
                    "type": "complete",
                    "success": success,
                    "timestamp": asyncio.get_event_loop().time()
                }

                if artifacts:
                    payload["artifacts"] = artifacts

                await ws.send_text(json.dumps(payload))
            except Exception as e:
                logger.warning(f"Failed to send completion: {e}")
                dead.add(ws)

        # Tote Verbindungen entfernen
        for ws in dead:
            self.active_build_streams[build_id].discard(ws)

    # ---------------------------------------------------------
    # GET ACTIVE STREAMS
    # ---------------------------------------------------------
    def get_active_builds(self) -> list:
        """
        Liste aller aktiven Build-Streams.
        """
        return [
            {
                "build_id": build_id,
                "clients": len(clients)
            }
            for build_id, clients in self.active_build_streams.items()
        ]


# Globale Instanz
ws_build_events = BuildEventManager()
