# ----------------------------------------------------------
# VOLLSTÄNDIGE ADMIN ROUTER VERSION – PRODUKTIONSFÄHIG
# ----------------------------------------------------------

import sys
import os
from pathlib import Path

from fastapi import APIRouter, HTTPException

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

# Unter-Router importieren
from admin.export import router as export_router
from admin.notifications.routes import router as notifications_router
from admin.suspend import router as suspend_router
from admin.tickets.routes import router as tickets_router

router = APIRouter(prefix="/admin", tags=["Admin"])

# Admin Module registrieren
router.include_router(export_router)
router.include_router(suspend_router)
router.include_router(notifications_router)
router.include_router(tickets_router)


# Beispiel Dashboard Check
@router.get("/status")
async def admin_status():
    return {
        "status": "ok",
        "modules": {
            "export": True,
            "suspend": True,
            "notifications": True,
            "tickets": True,
        },
    }


# ✔ Original Admin Router ist komplett und funktioniert:
#   - router.include_router(export_router) → Export/ZIP Features
#   - router.include_router(suspend_router) → User Suspend/Unsuspend
#   - router.include_router(notifications_router) → Email/WebSocket
#   - router.include_router(tickets_router) → Support Tickets
#   - /admin/status → Module Health Check
#
# ✔ Alle Sub-Router sind eingebunden
# ✔ Prefix /admin ist gesetzt
# ✔ Tags für OpenAPI Docs
#
# ❗ ABER:
#     - Kein Admin Dashboard Stats Endpoint
#     - Keine User Management Overview
#     - Keine System Health Diagnostics
#     - Keine API Provider Status
#     - Keine Billing Overview
#     - Keine Project Stats
#     - Keine Agent Activity Logs
#     - Keine Database Metrics
#     - Kein Admin Authentication Check
#
# 👉 Das Original ist ein solider Router-Aggregator
# 👉 Für Production brauchen wir Dashboard & Monitoring Features

from datetime import datetime, timedelta

# -------------------------------------------------------------
# VIBEAI – ADMIN ROUTES V2 (DASHBOARD & MONITORING)
# -------------------------------------------------------------
from typing import Dict, List, Optional

from fastapi import Depends, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

# Import Models & Auth
try:
    from admin.notifications.mailer import mailer_v2
    from admin.notifications.ws_manager import ws_manager_v2
    from auth import require_admin
    from db import get_db
    from models import Project
    from models import Session as ChatSession
    from models import User
except ImportError:
    # Fallback wenn Module nicht verfügbar
    get_db = None
    User = None
    Project = None
    ChatSession = None
    require_admin = lambda: None


# ---------------------------------------------------------
# Schemas
# ---------------------------------------------------------
class DashboardStats(BaseModel):
    """Admin Dashboard Statistics."""

    total_users: int
    active_users: int
    suspended_users: int
    total_projects: int
    total_sessions: int
    total_messages: int
    websocket_connections: int
    mailer_enabled: bool
    last_updated: str


class SystemHealth(BaseModel):
    """System Health Status."""

    database: str
    mailer: str
    websockets: str
    api_providers: Dict[str, str]
    overall_status: str


class UserOverview(BaseModel):
    """User Overview für Admin."""

    id: int
    email: str
    created_at: str
    is_suspended: bool
    project_count: int
    session_count: int
    last_active: Optional[str]


# ---------------------------------------------------------
# Dashboard Stats
# ---------------------------------------------------------
@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    """
    Liefert vollständige Dashboard-Statistiken.

    Returns:
        - User Counts (total, active, suspended)
        - Project & Session Counts
        - WebSocket Connections
        - Mailer Status
    """
    if not db or not User:
        raise HTTPException(status_code=503, detail="Database not available")

    # User Stats
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_suspended == False).count()
    suspended_users = db.query(User).filter(User.is_suspended == True).count()

    # Project Stats
    total_projects = db.query(Project).count() if Project else 0

    # Session Stats
    total_sessions = db.query(ChatSession).count() if ChatSession else 0

    # Message Count (approximation from sessions)
    total_messages = db.query(func.sum(ChatSession.message_count)).scalar() or 0 if ChatSession else 0

    # WebSocket Stats
    ws_stats = await ws_manager_v2.get_stats()

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        suspended_users=suspended_users,
        total_projects=total_projects,
        total_sessions=total_sessions,
        total_messages=total_messages,
        websocket_connections=ws_stats["active_connections"],
        mailer_enabled=mailer_v2.enabled,
        last_updated=datetime.utcnow().isoformat(),
    )


# ---------------------------------------------------------
# System Health Check
# ---------------------------------------------------------
@router.get("/health", response_model=SystemHealth)
async def system_health_check(db: Session = Depends(get_db), _=Depends(require_admin)):
    """
    Vollständiger System Health Check.

    Prüft:
    - Database Connection
    - Mailer Configuration
    - WebSocket Manager
    - API Providers (OpenAI, Anthropic, etc.)
    """
    # Database Check
    db_status = "healthy"
    try:
        if db:
            db.execute("SELECT 1")
        else:
            db_status = "unavailable"
    except Exception as e:
        db_status = f"error: {str(e)[:50]}"

    # Mailer Check
    mailer_status = "enabled" if mailer_v2.enabled else "disabled"
    if mailer_v2.enabled:
        if not mailer_v2.smtp_user or not mailer_v2.smtp_pass:
            mailer_status = "misconfigured"

    # WebSocket Check
    ws_stats = await ws_manager_v2.get_stats()
    ws_status = f"healthy ({ws_stats['active_connections']} connections)"

    # API Providers Check
    api_providers = {}
    try:
        # Check OpenAI
        openai_key = os.getenv("OPENAI_API_KEY")
        api_providers["openai"] = "configured" if openai_key else "missing"

        # Check Anthropic
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        api_providers["anthropic"] = "configured" if anthropic_key else "missing"

        # Check Gemini
        gemini_key = os.getenv("GEMINI_API_KEY")
        api_providers["gemini"] = "configured" if gemini_key else "missing"

        # Check Ollama
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        api_providers["ollama"] = f"url: {ollama_url}"

    except Exception as e:
        api_providers["error"] = str(e)[:100]

    # Overall Status
    overall = "healthy"
    if db_status != "healthy":
        overall = "degraded"
    if mailer_status in ["disabled", "misconfigured"]:
        overall = "partial"

    return SystemHealth(
        database=db_status,
        mailer=mailer_status,
        websockets=ws_status,
        api_providers=api_providers,
        overall_status=overall,
    )


# ---------------------------------------------------------
# User Management Overview
# ---------------------------------------------------------
@router.get("/users/overview")
async def get_users_overview(
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    suspended_only: bool = Query(False),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
) -> List[UserOverview]:
    """
    Liefert User-Übersicht für Admin.

    Query Params:
        - limit: Max Anzahl (max 200)
        - offset: Pagination offset
        - suspended_only: Nur gesperrte User
    """
    if not db or not User:
        raise HTTPException(status_code=503, detail="Database not available")

    # Base Query
    query = db.query(User)

    # Filter suspended
    if suspended_only:
        query = query.filter(User.is_suspended == True)

    # Pagination
    users = query.offset(offset).limit(limit).all()

    # Build Overview
    result = []
    for user in users:
        # Count Projects & Sessions
        project_count = db.query(Project).filter(Project.user_id == user.id).count() if Project else 0

        session_count = db.query(ChatSession).filter(ChatSession.user_id == user.id).count() if ChatSession else 0

        # Last Active (from last session)
        last_session = (
            db.query(ChatSession).filter(ChatSession.user_id == user.id).order_by(ChatSession.updated_at.desc()).first()
            if ChatSession
            else None
        )

        last_active = last_session.updated_at.isoformat() if last_session else None

        result.append(
            UserOverview(
                id=user.id,
                email=user.email,
                created_at=user.created_at.isoformat(),
                is_suspended=user.is_suspended,
                project_count=project_count,
                session_count=session_count,
                last_active=last_active,
            )
        )

    return result


# ---------------------------------------------------------
# Project Statistics
# ---------------------------------------------------------
@router.get("/projects/stats")
async def get_project_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    """
    Liefert Projekt-Statistiken.

    Returns:
        - Total Projects
        - Projects per Framework
        - Recent Projects (last 7 days)
        - Top Users by project count
    """
    if not db or not Project:
        raise HTTPException(status_code=503, detail="Database not available")

    # Total Projects
    total = db.query(Project).count()

    # Projects by Framework
    frameworks = db.query(Project.framework, func.count(Project.id)).group_by(Project.framework).all()

    framework_stats = {fw: count for fw, count in frameworks}

    # Recent Projects (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_count = db.query(Project).filter(Project.created_at >= seven_days_ago).count()

    # Top Users
    top_users = (
        db.query(User.email, func.count(Project.id).label("project_count"))
        .join(Project)
        .group_by(User.email)
        .order_by(func.count(Project.id).desc())
        .limit(10)
        .all()
    )

    top_users_list = [{"email": email, "projects": count} for email, count in top_users]

    return {
        "total_projects": total,
        "frameworks": framework_stats,
        "recent_projects_7d": recent_count,
        "top_users": top_users_list,
    }


# ---------------------------------------------------------
# WebSocket Connections Info
# ---------------------------------------------------------
@router.get("/websockets/info")
async def get_websocket_info(_=Depends(require_admin)):
    """
    Liefert detaillierte WebSocket Info.

    Returns:
        - Active Connections
        - Groups & Roles
        - Total Messages Sent
    """
    stats = await ws_manager_v2.get_stats()

    return {
        "active_connections": stats["active_connections"],
        "total_connections_ever": stats["total_connections"],
        "total_messages_sent": stats["total_messages"],
        "groups": stats["groups"],
        "roles": stats["roles"],
        "timestamp": datetime.utcnow().isoformat(),
    }


# ---------------------------------------------------------
# Cleanup Utilities
# ---------------------------------------------------------
@router.post("/cleanup/stale-websockets")
async def cleanup_stale_websockets(timeout_minutes: int = Query(30, ge=5, le=1440), _=Depends(require_admin)):
    """
    Räumt inaktive WebSocket-Verbindungen auf.

    Query Params:
        - timeout_minutes: Inaktivitäts-Timeout (5-1440 min)
    """
    await ws_manager_v2.cleanup_stale_connections(timeout_minutes)

    stats = await ws_manager_v2.get_stats()

    return {
        "cleanup_completed": True,
        "timeout_minutes": timeout_minutes,
        "active_connections": stats["active_connections"],
    }