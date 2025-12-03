# -------------------------------------------------------------
# VIBEAI – SESSION STORE
# -------------------------------------------------------------
"""
Session Management für User-Sessions, Preferences & Memory
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class SessionStore:
    """
    In-Memory Session Store für Development
    Für Production: Redis/PostgreSQL nutzen
    """

    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.preferences: Dict[str, Dict[str, Any]] = {}

    async def set_preference(
        self,
        user_id: str,
        key: str,
        value: Any
    ) -> None:
        """Speichere User Preference"""
        if user_id not in self.preferences:
            self.preferences[user_id] = {}
        self.preferences[user_id][key] = value

    async def get_preference(
        self,
        user_id: str,
        key: str,
        default: Any = None
    ) -> Any:
        """Lese User Preference"""
        if user_id not in self.preferences:
            return default
        return self.preferences[user_id].get(key, default)

    async def get_session(
        self,
        session_id: str
    ) -> Optional[Dict[str, Any]]:
        """Lese Session"""
        return self.sessions.get(session_id)

    async def create_session(
        self,
        user_id: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Erstelle neue Session"""
        import secrets
        session_id = secrets.token_urlsafe(32)
        self.sessions[session_id] = {
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "data": session_data or {}
        }
        return session_id

    async def delete_session(self, session_id: str) -> bool:
        """Lösche Session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False


# Globale Instanz
session_store = SessionStore()


# Backward Compatibility
class SessionDB:
    """Legacy Session DB Klasse"""
    def __init__(self):
        self.sessions = {}
