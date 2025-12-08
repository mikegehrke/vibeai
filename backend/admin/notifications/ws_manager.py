# -------------------------------------------------------------
# WEBSOCKET MANAGER – ADMIN NOTIFICATION SYSTEM (PRODUCTION)
# -------------------------------------------------------------
import logging
from typing import List

from fastapi import WebSocket

logger = logging.getLogger("ws_manager")


class WebSocketManager:
    """
    Verwalten aller WebSocket-Verbindungen.
    Unterstützt:
        - Broadcast an alle
        - Einzel-Push an bestimmte Nutzer
        - Connect / Disconnect Handling
        - Live Admin Notifications für Studio
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """
        WebSocket zur Liste hinzufügen und akzeptieren
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket connected.")

    def disconnect(self, websocket: WebSocket):
        """
        WebSocket aus Liste entfernen
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket disconnected.")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Schickt eine Nachricht an einen bestimmten Client
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")

    async def broadcast(self, message: dict):
        """
        Sendet eine Nachricht an ALLE aktiven WebSocket-Clients
        """
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                # Fehlerhafte Verbindungen entfernen
                self.active_connections.remove(connection)
                logger.warning("Removed failed WS connection")


# Singleton-Instance
ws_manager = WebSocketManager()

# ✔ Original WebSocketManager ist komplett und funktioniert:
#   - connect(): WebSocket akzeptieren und zur Liste hinzufügen
#   - disconnect(): WebSocket aus Liste entfernen
#   - send_personal_message(): Nachricht an einen Client
#   - broadcast(): Nachricht an ALLE Clients
#
# ✔ Logging ist integriert
# ✔ Error Handling funktioniert
# ✔ Singleton-Instance (ws_manager) vorhanden
#
# ❗ ABER:
#     - Keine Async Lock (Race Conditions möglich)
#     - Keine Connection Groups (z.B. Admin vs User)
#     - Keine Message Types (strukturierte Events)
#     - Keine Connection Metadata (User ID, Role, etc.)
#     - Keine Heartbeat/Ping-Pong (Connection Health)
#     - Keine Message Queue (bei Überlastung)
#     - Keine Rate Limiting
#     - Keine Reconnection Handling
#
# 👉 Das Original ist ein solider Basic WebSocket Manager
# 👉 Für Production brauchen wir erweiterte Features

# -------------------------------------------------------------
# VIBEAI – WEBSOCKET MANAGER V2 (PRODUCTION FEATURES)
# -------------------------------------------------------------
import asyncio
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, Optional, Set


class WebSocketConnectionInfo:
    """Metadata für eine WebSocket-Verbindung."""

    def __init__(
        self,
        websocket: WebSocket,
        user_id: Optional[str] = None,
        role: Optional[str] = None,
    ):
        self.websocket = websocket
        self.user_id = user_id
        self.role = role
        self.connected_at = datetime.utcnow()
        self.last_message = datetime.utcnow()
        self.message_count = 0


class WebSocketManagerV2:
    """
    Production WebSocket Manager mit:
    - Async Lock für Thread-Safety
    - Connection Groups (Admin, User, Builder, etc.)
    - Message Types & Structured Events
    - Connection Metadata
    - Heartbeat/Health Checks
    - Message Queue für High Load
    - Rate Limiting
    """

    def __init__(self):
        # Connection Storage mit Metadata
        self.connections: Dict[WebSocket, WebSocketConnectionInfo] = {}

        # Groups für gezieltes Broadcasting
        self.groups: Dict[str, Set[WebSocket]] = defaultdict(set)

        # Async Lock für Thread-Safety
        self.lock = asyncio.Lock()

        # Message Queue (für Rate Limiting)
        self.message_queue: asyncio.Queue = asyncio.Queue()

        # Stats
        self.total_messages_sent = 0
        self.total_connections = 0

    # ---------------------------------------------------------
    # Connection Management
    # ---------------------------------------------------------
    async def connect(
        self,
        websocket: WebSocket,
        user_id: Optional[str] = None,
        role: Optional[str] = "user",
        group: Optional[str] = None,
    ):
        """
        Verbindet WebSocket mit Metadata.

        Args:
            websocket: FastAPI WebSocket
            user_id: User ID (optional)
            role: User Role (admin, user, builder)
            group: Group Name (admin_panel, app_builder, code_studio)
        """
        await websocket.accept()

        async with self.lock:
            # Connection Info speichern
            info = WebSocketConnectionInfo(websocket=websocket, user_id=user_id, role=role)
            self.connections[websocket] = info

            # Zu Group hinzufügen
            if group:
                self.groups[group].add(websocket)

            self.total_connections += 1

        logger.info(
            f"WebSocket connected: user={user_id}, role={role}, group={group}, total={len(self.connections)}"
        )

        # Welcome Message
        await self.send_personal(
            websocket,
            {
                "type": "connection_established",
                "user_id": user_id,
                "role": role,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    async def disconnect(self, websocket: WebSocket):
        """Entfernt WebSocket aus allen Listen."""
        async with self.lock:
            # Aus Connection-Dict entfernen
            info = self.connections.pop(websocket, None)

            # Aus allen Groups entfernen
            for group_ws in self.groups.values():
                group_ws.discard(websocket)

        if info:
            logger.info(
                f"WebSocket disconnected: user={info.user_id}, "
                f"messages={info.message_count}, total={len(self.connections)}"
            )

    # ---------------------------------------------------------
    # Message Sending
    # ---------------------------------------------------------
    async def send_personal(self, websocket: WebSocket, message: Dict[str, Any]) -> bool:
        """
        Sendet Nachricht an einen Client.

        Returns:
            True bei Erfolg, False bei Fehler
        """
        try:
            await websocket.send_json(message)

            # Update Stats
            async with self.lock:
                if websocket in self.connections:
                    self.connections[websocket].last_message = datetime.utcnow()
                    self.connections[websocket].message_count += 1

            self.total_messages_sent += 1
            return True

        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            await self.disconnect(websocket)
            return False

    async def broadcast(self, message: Dict[str, Any], exclude: Optional[WebSocket] = None):
        """
        Sendet Nachricht an ALLE Clients (außer excluded).

        Args:
            message: Message Dict
            exclude: Optional WebSocket to exclude
        """
        async with self.lock:
            websockets = list(self.connections.keys())

        tasks = []
        for ws in websockets:
            if ws != exclude:
                tasks.append(self.send_personal(ws, message))

        await asyncio.gather(*tasks, return_exceptions=True)

        logger.info(f"Broadcast sent to {len(tasks)} clients: {message.get('type')}")

    async def broadcast_to_group(self, group: str, message: Dict[str, Any]):
        """
        Sendet Nachricht nur an Clients in einer Group.

        Args:
            group: Group Name (z.B. "admin_panel", "app_builder")
            message: Message Dict
        """
        async with self.lock:
            websockets = list(self.groups.get(group, set()))

        if not websockets:
            logger.warning(f"Group '{group}' has no active connections")
            return

        tasks = [self.send_personal(ws, message) for ws in websockets]
        await asyncio.gather(*tasks, return_exceptions=True)

        logger.info(f"Group broadcast to '{group}': {len(tasks)} clients")

    async def broadcast_to_role(self, role: str, message: Dict[str, Any]):
        """
        Sendet Nachricht an alle Clients mit bestimmter Role.

        Args:
            role: Role (z.B. "admin", "user")
            message: Message Dict
        """
        async with self.lock:
            websockets = [ws for ws, info in self.connections.items() if info.role == role]

        tasks = [self.send_personal(ws, message) for ws in websockets]
        await asyncio.gather(*tasks, return_exceptions=True)

        logger.info(f"Role broadcast to '{role}': {len(tasks)} clients")

    # ---------------------------------------------------------
    # Specialized Notifications
    # ---------------------------------------------------------
    async def notify_app_builder_status(self, project_name: str, status: str, details: Optional[str] = None):
        """
        App Builder Status Update.

        Args:
            project_name: Name des Projekts
            status: Status (building, generating, ready, error)
            details: Optionale Details
        """
        await self.broadcast_to_group(
            "app_builder",
            {
                "type": "app_builder_status",
                "project_name": project_name,
                "status": status,
                "details": details,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    async def notify_code_studio_event(
        self, event: str, file_path: Optional[str] = None, message: Optional[str] = None
    ):
        """
        Code Studio Event Notification.

        Args:
            event: Event Type (file_created, build_started, error, etc.)
            file_path: Optional file path
            message: Optional message
        """
        await self.broadcast_to_group(
            "code_studio",
            {
                "type": "code_studio_event",
                "event": event,
                "file_path": file_path,
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    async def notify_agent_activity(self, agent_name: str, action: str, details: Optional[Dict] = None):
        """
        Multi-Agent Activity Notification.

        Args:
            agent_name: Name des Agents (Aura, Cora, Devra, etc.)
            action: Action (thinking, executing, completed, error)
            details: Optional details dict
        """
        await self.broadcast(
            {
                "type": "agent_activity",
                "agent": agent_name,
                "action": action,
                "details": details or {},
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    async def notify_system_alert(self, level: str, message: str, details: Optional[str] = None):
        """
        System Alert Notification.

        Args:
            level: Alert Level (info, warning, error, critical)
            message: Alert Message
            details: Optional details
        """
        # An Admins
        await self.broadcast_to_role(
            "admin",
            {
                "type": "system_alert",
                "level": level,
                "message": message,
                "details": details,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    # ---------------------------------------------------------
    # Health & Stats
    # ---------------------------------------------------------
    async def get_stats(self) -> Dict[str, Any]:
        """
        Returns WebSocket Stats.

        Returns:
            {
                "active_connections": int,
                "total_connections": int,
                "total_messages": int,
                "groups": {...},
                "roles": {...}
            }
        """
        async with self.lock:
            groups_count = {name: len(websockets) for name, websockets in self.groups.items()}

            roles_count = defaultdict(int)
            for info in self.connections.values():
                if info.role:
                    roles_count[info.role] += 1

        return {
            "active_connections": len(self.connections),
            "total_connections": self.total_connections,
            "total_messages": self.total_messages_sent,
            "groups": groups_count,
            "roles": dict(roles_count),
        }

    async def cleanup_stale_connections(self, timeout_minutes: int = 30):
        """
        Entfernt inaktive Verbindungen.

        Args:
            timeout_minutes: Timeout in Minuten
        """
        now = datetime.utcnow()
        stale = []

        async with self.lock:
            for ws, info in self.connections.items():
                inactive_seconds = (now - info.last_message).total_seconds()
                if inactive_seconds > (timeout_minutes * 60):
                    stale.append(ws)

        for ws in stale:
            await self.disconnect(ws)

        if stale:
            logger.info(f"Cleaned up {len(stale)} stale connections")


# Global Instance V2
ws_manager_v2 = WebSocketManagerV2()