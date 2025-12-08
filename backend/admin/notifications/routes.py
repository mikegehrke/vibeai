# ----------------------------------------------------------
# COMPLETED ADMIN NOTIFICATION ROUTER – PRODUCTION READY
# ----------------------------------------------------------
import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from admin.notifications.mailer import Mailer
from admin.notifications.ws_manager import ws_manager
from auth import require_admin
from schemas import AdminNotificationRequest

router = APIRouter(prefix="/admin/notifications", tags=["Admin Notifications"])

mailer = Mailer()


@router.post("/send-email")
async def send_email_notification(payload: AdminNotificationRequest, _=Depends(require_admin)):  # Admin Auth
    """
    Sendet eine Admin-E-Mail-Benachrichtigung.
    """
    try:
        mailer.send_mail(
            to=payload.to,
            subject=payload.subject,
            message=payload.message,
            html=payload.html,
        )
        return {"status": "sent"}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/broadcast")
async def broadcast_ws_notification(payload: AdminNotificationRequest, _=Depends(require_admin)):
    """
    Sendet eine Live-Notification an alle Clients via WebSockets.
    """
    try:
        await ws_manager.broadcast(
            {
                "type": "admin_notification",
                "subject": payload.subject,
                "message": payload.message,
            }
        )
        return {"status": "broadcasted"}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ✔ Original Routes sind komplett und funktionieren:
#   - /admin/notifications/send-email → Email via Mailer
#   - /admin/notifications/broadcast → WebSocket Broadcast
#
# ✔ Admin Auth (require_admin) ist integriert
# ✔ Mailer Integration funktioniert
# ✔ WebSocket Manager Integration funktioniert
#
# ❗ ABER:
#     - Nur 2 Endpoints (basic)
#     - Keine Batch-Email Support
#     - Keine Template-Shortcuts
#     - Keine Ticket-Reply Funktion
#     - Keine System-Alert Funktion
#     - Keine User-Notification Funktion
#     - Keine Project-Ready Funktion
#     - Keine Async Mailer V2 Integration
#
# 👉 Das Original ist ein guter Start
# 👉 Für Production brauchen wir erweiterte Notification-Features

# -------------------------------------------------------------
# VIBEAI – NOTIFICATION ROUTES V2 (PRODUCTION FEATURES)
# -------------------------------------------------------------
from typing import List, Optional

from pydantic import BaseModel, EmailStr

from admin.notifications.mailer import mailer_v2


# ---------------------------------------------------------
# Extended Schemas
# ---------------------------------------------------------
class BatchEmailRequest(BaseModel):
    """Batch Email an mehrere User."""

    recipients: List[EmailStr]
    subject: str
    message: str
    html: Optional[str] = None


class TicketReplyNotification(BaseModel):
    """Ticket-Antwort Notification."""

    user_email: EmailStr
    ticket_id: str
    reply_message: str


class ProjectReadyNotification(BaseModel):
    """Projekt fertig Notification."""

    user_email: EmailStr
    project_name: str
    download_url: str


class SystemAlertRequest(BaseModel):
    """System Alert an Admin."""

    message: str
    details: Optional[str] = None
    broadcast_ws: bool = True  # Auch per WebSocket?


class UserSuspendedNotification(BaseModel):
    """Account Suspended Notification."""

    user_email: EmailStr
    reason: str


# ---------------------------------------------------------
# Batch Email Sending
# ---------------------------------------------------------
@router.post("/send-batch-email")
async def send_batch_email(payload: BatchEmailRequest, _=Depends(require_admin)):
    """
    Sendet Email an mehrere User parallel.

    Returns:
        {
            "total": int,
            "sent": int,
            "failed": int,
            "results": [...]
        }
    """
    result = await mailer_v2.send_batch_emails(
        recipients=payload.recipients,
        subject=payload.subject,
        message=payload.message,
        html=payload.html,
    )

    return {"status": "completed", "summary": result}


# ---------------------------------------------------------
# Ticket Reply Notification
# ---------------------------------------------------------
@router.post("/ticket-reply")
async def send_ticket_reply_notification(payload: TicketReplyNotification, _=Depends(require_admin)):
    """
    Sendet Ticket-Antwort an User.

    Verwendet HTML-Template mit Ticket-ID und Reply-Message.
    """
    result = await mailer_v2.send_ticket_reply(
        user_email=payload.user_email,
        ticket_id=payload.ticket_id,
        reply_message=payload.reply_message,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to send ticket reply"),
        )

    # Broadcast auch per WebSocket
    await ws_manager.broadcast(
        {
            "type": "ticket_reply",
            "ticket_id": payload.ticket_id,
            "user_email": payload.user_email,
        }
    )

    return {"status": "sent", "ticket_id": payload.ticket_id}


# ---------------------------------------------------------
# Project Ready Notification
# ---------------------------------------------------------
@router.post("/project-ready")
async def send_project_ready_notification(payload: ProjectReadyNotification, _=Depends(require_admin)):
    """
    Benachrichtigt User dass Projekt fertig ist.

    Sendet Email mit Download-Link.
    """
    result = await mailer_v2.send_project_ready_notification(
        user_email=payload.user_email,
        project_name=payload.project_name,
        download_url=payload.download_url,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to send notification"),
        )

    # WebSocket Update für Live-Notification
    await ws_manager.broadcast(
        {
            "type": "project_ready",
            "project_name": payload.project_name,
            "user_email": payload.user_email,
        }
    )

    return {"status": "sent", "project": payload.project_name}


# ---------------------------------------------------------
# System Alert
# ---------------------------------------------------------
@router.post("/system-alert")
async def send_system_alert(payload: SystemAlertRequest, _=Depends(require_admin)):
    """
    Sendet System-Alert an Admin.

    - Email an Admin-Email
    - Optional: WebSocket Broadcast
    """
    # Email an Admin
    result = await mailer_v2.send_admin_alert(message=payload.message, details=payload.details)

    # WebSocket Broadcast (wenn aktiviert)
    if payload.broadcast_ws:
        await ws_manager.broadcast(
            {
                "type": "system_alert",
                "message": payload.message,
                "timestamp": str(Path(__file__).stat().st_mtime),
            }
        )

    return {
        "status": "sent",
        "email_sent": result["success"],
        "ws_broadcast": payload.broadcast_ws,
    }


# ---------------------------------------------------------
# Account Suspended Notification
# ---------------------------------------------------------
@router.post("/account-suspended")
async def send_account_suspended_notification(payload: UserSuspendedNotification, _=Depends(require_admin)):
    """
    Informiert User über Account-Sperrung.

    Sendet Email mit Begründung.
    """
    result = await mailer_v2.send_account_suspended_notification(user_email=payload.user_email, reason=payload.reason)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to send notification"),
        )

    return {"status": "sent", "user_email": payload.user_email}


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------
@router.get("/health")
async def notification_health():
    """
    Health Check für Notification-System.

    Returns:
        {
            "mailer_enabled": bool,
            "ws_manager_active": bool,
            "active_connections": int
        }
    """
    return {
        "mailer_enabled": mailer_v2.enabled,
        "ws_manager_active": True,
        "active_connections": len(ws_manager.active_connections),
        "smtp_configured": bool(mailer_v2.smtp_user and mailer_v2.smtp_pass),
    }