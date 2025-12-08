from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from auth import get_current_user_v2
from billing.models import BillingRecordDB, SubscriptionDB
from db import get_db

router = APIRouter()

@router.get("/billing/test")
async def billing_test():
    return {"message": "Billing route is working"}

billing_router = APIRouter(prefix="/billing", tags=["Billing"])

# -------------------------------------------------------------
# 1. Billing Overview
# -------------------------------------------------------------
@billing_router.get("/overview")
async def billing_overview(current_user=Depends(get_current_user_v2), db: Session = Depends(get_db)):
    """
    Gibt Billing-Übersicht für aktuellen User zurück
    """
    subscription = db.query(SubscriptionDB).filter(SubscriptionDB.user_id == current_user.id).first()

    records = (
        db.query(BillingRecordDB)
        .filter(BillingRecordDB.user_id == current_user.id)
        .order_by(BillingRecordDB.created_at.desc())
        .limit(50)
        .all()
    )

    return {
        "subscription_level": subscription.tier if subscription else "free",
        "renewal_date": subscription.renewal_date if subscription else None,
        "usage_records": records,
    }

# -------------------------------------------------------------
# 2. Track Token Usage (GPT, Claude, Gemini, Copilot, Ollama)
# -------------------------------------------------------------
@billing_router.post("/usage")
async def log_usage(
    model: str,
    provider: str,
    tokens: int,
    cost_usd: float,
    current_user=Depends(get_current_user_v2),
    db: Session = Depends(get_db),
):
    """
    Loggt Token-Verbrauch für alle AI-Provider
    """
    record = BillingRecordDB(
        id=str(datetime.utcnow().timestamp()).replace(".", ""),
        user_id=current_user.id,
        model=model,
        provider=provider,
        tokens_used=tokens,
        cost_usd=cost_usd,
        created_at=datetime.utcnow(),
    )

    db.add(record)
    db.commit()

    return {"status": "logged", "model": model, "tokens": tokens, "cost_usd": cost_usd}

# -------------------------------------------------------------
# 3. Get Subscription (current plan)
# -------------------------------------------------------------
@billing_router.get("/subscription")
async def get_subscription(current_user=Depends(get_current_user_v2), db: Session = Depends(get_db)):
    """
    Gibt aktuelle Subscription des Users zurück
    """
    sub = db.query(SubscriptionDB).filter(SubscriptionDB.user_id == current_user.id).first()

    if not sub:
        return {"tier": "free"}

    return {
        "tier": sub.tier,
        "renewal_date": sub.renewal_date,
        "auto_renew": sub.auto_renew,
        "active": sub.is_active,
    }

# -------------------------------------------------------------
# 4. Cancel Subscription
# -------------------------------------------------------------
@billing_router.post("/cancel")
async def cancel_subscription(current_user=Depends(get_current_user_v2), db: Session = Depends(get_db)):
    """
    Kündigt aktive Subscription
    """
    sub = db.query(SubscriptionDB).filter(SubscriptionDB.user_id == current_user.id).first()

    if not sub:
        raise HTTPException(404, "No active subscription")

    sub.is_active = False
    db.commit()

    return {"status": "canceled"}