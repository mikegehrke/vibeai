# -------------------------------------------------------------
# VIBEAI – SESSION STORE
# -------------------------------------------------------------
"""
Session Management für User-Sessions, Preferences & Memory
"""

from datetime import datetime, timedelta
from typing import Any, Dict, Optional


class SessionStore:
    """
    In-Memory Session Store für Development
    Für Production: Redis/PostgreSQL nutzen
    """

    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.preferences: Dict[str, Dict[str, Any]] = {}

    async def set_preference(self, user_id: str, key: str, value: Any) -> None:
        """Speichere User Preference"""
        if user_id not in self.preferences:
            self.preferences[user_id] = {}
        self.preferences[user_id][key] = value

    async def get_preference(self, user_id: str, key: str, default: Any = None) -> Any:
        """Lese User Preference"""
        if user_id not in self.preferences:
            return default
        return self.preferences[user_id].get(key, default)

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Lese Session"""
        return self.sessions.get(session_id)

    async def create_session(self, user_id: str, session_data: Optional[Dict[str, Any]] = None) -> str:
        """Erstelle neue Session"""
        import secrets

        session_id = secrets.token_urlsafe(32)
        self.sessions[session_id] = {
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "data": session_data or {},
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


# ========== FASTAPI ROUTER ==========
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from auth import get_current_user

router = APIRouter()


class CreateSessionRequest(BaseModel):
    data: Optional[Dict[str, Any]] = None


@router.post("/create")
async def create_session(request: CreateSessionRequest, current_user=Depends(get_current_user)):
    """Create new session"""
    user_id = str(current_user.get("user_id"))
    session_id = await session_store.create_session(user_id, request.data)
    return {"session_id": session_id}


@router.get("/{session_id}")
async def get_session(session_id: str, current_user=Depends(get_current_user)):
    """Get session by ID"""
    session = await session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/{session_id}")
async def delete_session(session_id: str, current_user=Depends(get_current_user)):
    """Delete session"""
    success = await session_store.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted"}

