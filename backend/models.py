# -------------------------------------------------------------
# VIBEAI – MODELS (Re-exports from db.py)
# -------------------------------------------------------------
"""
Models werden in db.py definiert und hier re-exportiert
für Backward Compatibility
"""

from db import (
    User,
    UserRole,
    PlanType,
    ChatSession,
    Message,
    Session,
    AuditLog,
    Base
)

__all__ = [
    "User",
    "UserRole",
    "PlanType",
    "ChatSession",
    "Message",
    "Session",
    "AuditLog",
    "Base"
]
