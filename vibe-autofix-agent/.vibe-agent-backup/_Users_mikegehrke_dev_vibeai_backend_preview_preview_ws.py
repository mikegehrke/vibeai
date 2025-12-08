# -------------------------------------------------------------
# VIBEAI – PREVIEW WEBSOCKET
# -------------------------------------------------------------
"""
WebSocket System für Live Preview Events

Features:
- Live Log Streaming vom Preview Server
- Compilation Events (Compiling, Success, Error)
- Hot Reload Events
- Error Messages
- Multi-Client Support (mehrere Browser-Tabs)

Events:
- connected: Verbindung hergestellt
- preview_log: Preview Server Log-Zeile
- compile_start: Kompilierung startet
- compile_success: Erfolgreich kompiliert
- compile_error: Fehler beim Kompilieren
- reload: Hot Reload ausgelöst
- error: Allgemeiner Fehler

Verwendung:
    # Log senden
    await preview_ws.broadcast(user, port, "Compiled successfully!")

    # Event senden
    await preview_ws.send_event(user, "compile_success", {"time": "2.3s"})
"""

import asyncio
from typing import Dict, Set

from fastapi import WebSocket


class PreviewWebSocketManager:
    """
    WebSocket Manager für Live Preview Events.

    Verwaltet WebSocket-Verbindungen pro User und
    broadcasted Live-Events vom Preview Server.
    """

    def __init__(self):
        # user → Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}

        # user → port (aktueller Preview Port)
        self.user_ports: Dict[str, int] = {}

    # ---------------------------------------------------------
    # CONNECT
    # ---------------------------------------------------------
    async def connect(self, websocket: WebSocket, user: str, port: int):
        """
        Registriert neue WebSocket-Verbindung.

        Args:
            websocket: WebSocket-Objekt
            user: User-Email/ID
            port: Preview Port
        """
        await websocket.accept()

        if user not in self.active_connections:
            self.active_connections[user] = set()

        self.active_connections[user].add(websocket)
        self.user_ports[user] = port

        # Begrüßungsnachricht
        await websocket.send_json(
            {
                "type": "connected",
                "port": port,
                "message": f"Preview WebSocket connected on port {port}",
            }
        )

    # ---------------------------------------------------------
    # DISCONNECT
    # ---------------------------------------------------------
    async def disconnect(self, websocket: WebSocket, user: str):
        """
        Entfernt WebSocket-Verbindung.

        Args:
            websocket: WebSocket-Objekt
            user: User-Email/ID
        """
        if user in self.active_connections:
            self.active_connections[user].discard(websocket)

            # Cleanup wenn keine Connections mehr
            if not self.active_connections[user]:
                del self.active_connections[user]
                if user in self.user_ports:
                    del self.user_ports[user]

    # ---------------------------------------------------------
    # BROADCAST LOG
    # ---------------------------------------------------------
    async def broadcast(self, user: str, port: int, text: str):
        """
        Sendet Log-Zeile an alle Clients eines Users.

        Args:
            user: User-Email/ID
            port: Preview Port
            text: Log-Text
        """
        if user not in self.active_connections:
            return

        message = {
            "type": "preview_log",
            "port": port,
            "text": text,
            "timestamp": asyncio.get_event_loop().time(),
        }

        # Detect special events
        text_lower = text.lower()

        if "compiling" in text_lower or "building" in text_lower:
            message["type"] = "compile_start"
        elif "compiled successfully" in text_lower:
            message["type"] = "compile_success"
        elif "serving at" in text_lower or "server running" in text_lower:
            message["type"] = "server_ready"
        elif "hot reload" in text_lower or "reloading" in text_lower:
            message["type"] = "reload"
        elif "error" in text_lower or "failed" in text_lower:
            message["type"] = "compile_error"

        # Sende an alle Clients
        dead_connections = set()

        for websocket in self.active_connections[user]:
            try:
                await websocket.send_json(message)
            except Exception:
                dead_connections.add(websocket)

        # Cleanup tote Connections
        for ws in dead_connections:
            await self.disconnect(ws, user)

    # ---------------------------------------------------------
    # SEND EVENT
    # ---------------------------------------------------------
    async def send_event(self, user: str, event_type: str, data: Dict = None):
        """
        Sendet Custom Event an alle Clients.

        Args:
            user: User-Email/ID
            event_type: Event-Typ (compile_success, error, etc.)
            data: Optional Event-Daten
        """
        if user not in self.active_connections:
            return

        port = self.user_ports.get(user, 0)

        message = {
            "type": event_type,
            "port": port,
            "timestamp": asyncio.get_event_loop().time(),
        }

        if data:
            message.update(data)

        # Sende an alle Clients
        dead_connections = set()

        for websocket in self.active_connections[user]:
            try:
                await websocket.send_json(message)
            except Exception:
                dead_connections.add(websocket)

        # Cleanup
        for ws in dead_connections:
            await self.disconnect(ws, user)

    # ---------------------------------------------------------
    # SEND ERROR
    # ---------------------------------------------------------
    async def send_error(self, user: str, error_message: str):
        """
        Sendet Error Event.

        Args:
            user: User-Email/ID
            error_message: Fehlermeldung
        """
        await self.send_event(user, "error", {"error": error_message})

    # ---------------------------------------------------------
    # SEND COMPILATION STATUS
    # ---------------------------------------------------------
    async def send_compile_status(self, user: str, status: str, duration: float = None):
        """
        Sendet Compilation Status.

        Args:
            user: User-Email/ID
            status: "started", "success", "failed"
            duration: Optionale Dauer in Sekunden
        """
        event_data = {"status": status}

        if duration is not None:
            event_data["duration"] = f"{duration:.2f}s"

        event_type = f"compile_{status}"

        await self.send_event(user, event_type, event_data)

    # ---------------------------------------------------------
    # GET ACTIVE CONNECTIONS
    # ---------------------------------------------------------
    def get_active_connections(self) -> Dict[str, int]:
        """
        Gibt Dictionary mit User → Anzahl Connections zurück.

        Returns:
            {user: connection_count}
        """
        return {user: len(connections) for user, connections in self.active_connections.items()}

    # ---------------------------------------------------------
    # BROADCAST TO ALL
    # ---------------------------------------------------------
    async def broadcast_to_all(self, message: str):
        """
        Sendet Nachricht an ALLE aktiven Connections.

        Args:
            message: Broadcast-Nachricht
        """
        msg = {
            "type": "broadcast",
            "message": message,
            "timestamp": asyncio.get_event_loop().time(),
        }

        for user in list(self.active_connections.keys()):
            dead_connections = set()

            for websocket in self.active_connections[user]:
                try:
                    await websocket.send_json(msg)
                except Exception:
                    dead_connections.add(websocket)

            for ws in dead_connections:
                await self.disconnect(ws, user)


# Singleton Instance
preview_ws = PreviewWebSocketManager()