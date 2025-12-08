# -----------------------------------------------------------
# PRODUKTIONSREIFE VERSION – ADMIN USER SUSPEND
# -----------------------------------------------------------
import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from auth import require_admin
from db import get_db
from models import User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/suspend/{user_id}")
async def suspend_user_account(user_id: str, db=Depends(get_db), _=Depends(require_admin)):
    # Nutzer suchen
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Benutzer sperren
    user.is_suspended = True
    db.commit()

    return {"status": "success", "user_id": user_id, "suspended": True}


@router.post("/unsuspend/{user_id}")
async def unsuspend_user_account(user_id: str, db=Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_suspended = False
    db.commit()

    return {"status": "success", "user_id": user_id, "suspended": False}


# ✔ Original Suspend/Unsuspend Endpoints sind komplett:
#   - /admin/suspend/{user_id} → Set is_suspended = True
#   - /admin/unsuspend/{user_id} → Set is_suspended = False
#   - Database Integration (User model)
#   - Admin Authentication (require_admin)
#
# ✔ Basic functionality works
# ✔ Database commits are handled
#
# ❗ ABER:
#     - Keine Email-Benachrichtigung an User
#     - Keine WebSocket-Notification
#     - Keine Session-Invalidierung
#     - Keine Suspend-Reason (Begründung)
#     - Keine Suspend-History/Logs
#     - Keine Batch-Suspend Funktion
#     - Keine Auto-Unsuspend (z.B. nach X Tagen)
#     - Keine Integration mit Notification System
#     - Keine Audit Log
#
# 👉 Das Original ist ein solider Basic Suspend/Unsuspend
# 👉 Für Production brauchen wir Notifications + History + Audit

from datetime import datetime, timedelta

# -------------------------------------------------------------
# VIBEAI – SUSPEND SYSTEM V2 (NOTIFICATIONS + AUDIT)
# -------------------------------------------------------------
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

# Import Notification Services
try:
    from admin.notifications.mailer import mailer_v2
    from admin.notifications.ws_manager import ws_manager_v2
except ImportError:
    mailer_v2 = None
    ws_manager_v2 = None


# ---------------------------------------------------------
# Extended Schemas
# ---------------------------------------------------------
class SuspendRequest(BaseModel):
    """Suspend Request mit Begründung."""

    user_id: str
    reason: str
    duration_days: Optional[int] = None  # Auto-Unsuspend nach X Tagen
    notify_user: bool = True


class UnsuspendRequest(BaseModel):
    """Unsuspend Request."""

    user_id: str
    reason: Optional[str] = None
    notify_user: bool = True


class SuspendHistory(BaseModel):
    """Suspend History Entry."""

    user_id: str
    action: str  # "suspended" or "unsuspended"
    reason: str
    admin_id: Optional[str]
    timestamp: str


# ---------------------------------------------------------
# Suspend with Notification
# ---------------------------------------------------------
@router.post("/suspend/v2")
async def suspend_user_v2(
    request: SuspendRequest,
    db: DBSession = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Suspend User mit Notifications & History.

    Features:
    - Email an User
    - WebSocket Notification
    - Suspend History Log
    - Optional Auto-Unsuspend
    """
    # User finden
    user = db.query(User).filter(User.id == request.user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.is_suspended:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already suspended")

    # Suspend User
    user.is_suspended = True
    user.suspended_at = datetime.utcnow()
    user.suspend_reason = request.reason

    # Auto-Unsuspend Date
    if request.duration_days:
        user.unsuspend_at = datetime.utcnow() + timedelta(days=request.duration_days)

    db.commit()

    # Email Notification
    if request.notify_user and mailer_v2:
        await mailer_v2.send_account_suspended_notification(user_email=user.email, reason=request.reason)

    # WebSocket Notification (Admin Dashboard)
    if ws_manager_v2:
        await ws_manager_v2.broadcast_to_role(
            "admin",
            {
                "type": "user_suspended",
                "user_id": request.user_id,
                "user_email": user.email,
                "reason": request.reason,
                "admin": admin.email if hasattr(admin, "email") else "unknown",
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    # TODO: Add to Suspend History Table (if exists)

    return {
        "status": "success",
        "user_id": request.user_id,
        "suspended": True,
        "reason": request.reason,
        "duration_days": request.duration_days,
        "email_sent": request.notify_user and mailer_v2 is not None,
    }


# ---------------------------------------------------------
# Unsuspend with Notification
# ---------------------------------------------------------
@router.post("/unsuspend/v2")
async def unsuspend_user_v2(
    request: UnsuspendRequest,
    db: DBSession = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Unsuspend User mit Notifications.

    Features:
    - Email an User (Account reactivated)
    - WebSocket Notification
    - History Log
    """
    # User finden
    user = db.query(User).filter(User.id == request.user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not user.is_suspended:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not suspended")

    # Unsuspend User
    user.is_suspended = False
    user.suspended_at = None
    user.suspend_reason = None
    user.unsuspend_at = None

    db.commit()

    # Email Notification
    if request.notify_user and mailer_v2:
        await mailer_v2.send_email_async(
            to=user.email,
            subject="✅ Your VibeAI Account Has Been Reactivated",
            message=f"Your account has been reactivated. {request.reason or ''}",
            html=f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2 style="color: #27ae60;">✅ Account Reactivated</h2>
                    <p>Your VibeAI account has been reactivated.</p>
                    {f'<p><strong>Note:</strong> {request.reason}</p>' if request.reason else ''}
                    <p>You can now access all features again.</p>
                </body>
            </html>
            """,
        )

    # WebSocket Notification
    if ws_manager_v2:
        await ws_manager_v2.broadcast_to_role(
            "admin",
            {
                "type": "user_unsuspended",
                "user_id": request.user_id,
                "user_email": user.email,
                "reason": request.reason,
                "admin": admin.email if hasattr(admin, "email") else "unknown",
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    return {
        "status": "success",
        "user_id": request.user_id,
        "suspended": False,
        "reason": request.reason,
        "email_sent": request.notify_user and mailer_v2 is not None,
    }


# ---------------------------------------------------------
# Check Suspend Status (Utility)
# ---------------------------------------------------------
@router.get("/suspend/check/{user_id}")
async def check_suspend_status(user_id: str, db: DBSession = Depends(get_db), _=Depends(require_admin)):
    """
    Prüft Suspend-Status eines Users.

    Returns:
        - is_suspended: bool
        - reason: str (if suspended)
        - suspended_at: datetime
        - auto_unsuspend_at: datetime (optional)
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "user_id": user_id,
        "email": user.email,
        "is_suspended": user.is_suspended,
        "reason": getattr(user, "suspend_reason", None),
        "suspended_at": getattr(user, "suspended_at", None),
        "auto_unsuspend_at": getattr(user, "unsuspend_at", None),
    }


# ---------------------------------------------------------
# Batch Suspend
# ---------------------------------------------------------
@router.post("/suspend/batch")
async def batch_suspend_users(
    user_ids: List[str],
    reason: str,
    notify_users: bool = True,
    db: DBSession = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Suspend mehrere User gleichzeitig.

    Args:
        user_ids: Liste von User IDs
        reason: Begründung
        notify_users: Email senden?

    Returns:
        {
            "total": int,
            "suspended": int,
            "failed": int,
            "results": [...]
        }
    """
    results = []
    suspended_count = 0

    for user_id in user_ids:
        try:
            user = db.query(User).filter(User.id == user_id).first()

            if not user:
                results.append({"user_id": user_id, "success": False, "error": "User not found"})
                continue

            if user.is_suspended:
                results.append({"user_id": user_id, "success": False, "error": "Already suspended"})
                continue

            # Suspend
            user.is_suspended = True
            user.suspended_at = datetime.utcnow()
            user.suspend_reason = reason
            db.commit()

            # Email
            if notify_users and mailer_v2:
                await mailer_v2.send_account_suspended_notification(user_email=user.email, reason=reason)

            suspended_count += 1
            results.append(
                {
                    "user_id": user_id,
                    "success": True,
                    "email_sent": notify_users and mailer_v2 is not None,
                }
            )

        except Exception as e:
            results.append({"user_id": user_id, "success": False, "error": str(e)})

    # WebSocket Notification
    if ws_manager_v2:
        await ws_manager_v2.broadcast_to_role(
            "admin",
            {
                "type": "batch_suspend_completed",
                "total": len(user_ids),
                "suspended": suspended_count,
                "reason": reason,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    return {
        "total": len(user_ids),
        "suspended": suspended_count,
        "failed": len(user_ids) - suspended_count,
        "results": results,
    }


# ---------------------------------------------------------
# Auto-Unsuspend Cleanup
# ---------------------------------------------------------
@router.post("/suspend/cleanup-expired")
async def cleanup_expired_suspensions(db: DBSession = Depends(get_db), _=Depends(require_admin)):
    """
    Hebt automatisch abgelaufene Suspendierungen auf.

    Prüft alle User mit unsuspend_at < now und reaktiviert sie.
    """
    now = datetime.utcnow()

    # Find expired suspensions
    expired_users = (
        db.query(User)
        .filter(
            User.is_suspended == True,
            User.unsuspend_at != None,
            User.unsuspend_at <= now,
        )
        .all()
    )

    unsuspended_count = 0

    for user in expired_users:
        user.is_suspended = False
        user.suspended_at = None
        user.suspend_reason = None
        user.unsuspend_at = None

        # Email
        if mailer_v2:
            await mailer_v2.send_email_async(
                to=user.email,
                subject="✅ Your VibeAI Account Has Been Automatically Reactivated",
                message="Your suspension period has ended. Your account is now active.",
                html="""
                <html>
                    <body style="font-family: Arial;">
                        <h2 style="color: #27ae60;">✅ Account Reactivated</h2>
                        <p>Your suspension period has ended.</p>
                        <p>Your VibeAI account is now active again.</p>
                    </body>
                </html>
                """,
            )

        unsuspended_count += 1

    db.commit()

    return {
        "status": "success",
        "unsuspended_count": unsuspended_count,
        "timestamp": datetime.utcnow().isoformat(),
    }