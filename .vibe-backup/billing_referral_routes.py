# ============================================================
# VIBEAI – REFERRAL SYSTEM (PRODUCTION 2025)
# ============================================================
# ✔ Invite Code Generation (secure, base64)
# ✔ Referral Tracking (inviter → invitees)
# ✔ Bonus Credits System
# ✔ Multi-Tier Rewards (Free/Pro/Ultra)
# ✔ Anti-Abuse Protection
# ✔ Database Integration
# ✔ Compatible with: Chat, Builder, Code Studio, App Studio
# ============================================================

import base64
import json
import secrets
import uuid
from datetime import datetime

from auth import get_current_user_v2
from billing.models import BillingAuditLogDB, ReferralBonusDB, UserCreditsDB
from db import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import User

router = APIRouter(prefix="/billing/referral", tags=["Billing - Referral"])

# ============================================================
# REFERRAL CONFIGURATION
# ============================================================

REFERRAL_REWARDS = {
    "inviter": {
        "credits": 10.00,  # $10 in credits for inviter
        "bonus_tokens": 100000,  # 100k tokens bonus
    },
    "invitee": {
        "credits": 5.00,  # $5 welcome bonus for new user
        "bonus_tokens": 50000,  # 50k tokens bonus
    },
}

# Tier-based multipliers
TIER_MULTIPLIERS = {
    "free": 1.0,
    "pro": 1.5,  # Pro users get 50% more referral rewards
    "ultra": 2.0,  # Ultra users get 2x referral rewards
    "enterprise": 3.0,
}

# Anti-abuse limits
MAX_REFERRALS_PER_USER = 100
MAX_PENDING_CODES = 10

# ============================================================
# INVITE CODE GENERATION
# ============================================================


@router.post("/generate-code")
async def generate_invite_code(current_user=Depends(get_current_user_v2), db=Depends(get_db)):
    """
    Generiert einen sicheren Einladungs-Code.

    Returns:
        {
            "invite_code": "ABC123XYZ",
            "invite_link": "https://vibeai.app/invite/ABC123XYZ",
            "expires_at": "2025-12-31T23:59:59"
        }
    """
    user_id = str(current_user.id)

    # Check pending codes limit
    pending_count = (
        db.query(ReferralBonusDB)
        .filter(ReferralBonusDB.user_id == user_id, ReferralBonusDB.status == "pending")
        .count()
    )

    if pending_count >= MAX_PENDING_CODES:
        raise HTTPException(
            status_code=429,
            detail=f"Maximum {MAX_PENDING_CODES} pending invite codes allowed",
        )

    # Generate secure code
    code = base64.urlsafe_b64encode(secrets.token_bytes(12)).decode("utf-8").rstrip("=")

    # Store in database
    referral = ReferralBonusDB(
        id=str(uuid.uuid4()),
        user_id=user_id,
        referred_user_id=f"pending:{code}",
        bonus_tokens=0,
        status="pending",
    )
    db.add(referral)
    db.commit()

    # Audit log
    audit = BillingAuditLogDB(
        id=str(uuid.uuid4()),
        user_id=user_id,
        event_type="referral_code_generated",
        event_data=json.dumps({"code": code}),
    )
    db.add(audit)
    db.commit()

    frontend_url = "https://vibeai.app"  # In production: os.getenv("FRONTEND_URL")

    return {
        "status": "success",
        "invite_code": code,
        "invite_link": f"{frontend_url}/invite/{code}",
        "expires_at": None,  # Future: implement expiration
    }


# ============================================================
# USE INVITE CODE (Sign-up with referral)
# ============================================================


@router.post("/use-code/{code}")
async def use_invite_code(code: str, current_user=Depends(get_current_user_v2), db=Depends(get_db)):
    """
    Neuer Benutzer verwendet einen Einladungs-Code.

    Rewards:
    - Inviter: $10 credits + 100k tokens
    - Invitee: $5 credits + 50k tokens
    """
    new_user_id = str(current_user.id)

    # Find pending referral
    referral = (
        db.query(ReferralBonusDB)
        .filter(
            ReferralBonusDB.referred_user_id == f"pending:{code}",
            ReferralBonusDB.status == "pending",
        )
        .first()
    )

    if not referral:
        raise HTTPException(status_code=404, detail="Invalid or expired invite code")

    inviter_id = referral.user_id

    # Check if user already used a referral code
    existing = (
        db.query(ReferralBonusDB)
        .filter(
            ReferralBonusDB.referred_user_id == new_user_id,
            ReferralBonusDB.status == "applied",
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="You have already used a referral code")

    # Get inviter tier for multiplier
    inviter = db.query(User).filter(User.id == int(inviter_id)).first()
    tier = getattr(inviter, "subscription_level", "free") or "free"
    multiplier = TIER_MULTIPLIERS.get(tier, 1.0)

    # Calculate rewards
    inviter_credits = REFERRAL_REWARDS["inviter"]["credits"] * multiplier
    inviter_tokens = int(REFERRAL_REWARDS["inviter"]["bonus_tokens"] * multiplier)
    invitee_credits = REFERRAL_REWARDS["invitee"]["credits"]
    invitee_tokens = REFERRAL_REWARDS["invitee"]["bonus_tokens"]

    # Update referral record
    referral.referred_user_id = new_user_id
    referral.bonus_tokens = inviter_tokens
    referral.status = "applied"
    referral.applied_at = datetime.utcnow()

    # Add credits to inviter
    inviter_credits_db = db.query(UserCreditsDB).filter(UserCreditsDB.user_id == inviter_id).first()

    if inviter_credits_db:
        inviter_credits_db.credits += inviter_credits
        inviter_credits_db.bonus_credits += inviter_credits
        inviter_credits_db.lifetime_credits += inviter_credits
        inviter_credits_db.updated_at = datetime.utcnow()
    else:
        inviter_credits_db = UserCreditsDB(
            id=str(uuid.uuid4()),
            user_id=inviter_id,
            credits=inviter_credits,
            bonus_credits=inviter_credits,
            lifetime_credits=inviter_credits,
        )
        db.add(inviter_credits_db)

    # Add credits to invitee (new user)
    invitee_credits_db = db.query(UserCreditsDB).filter(UserCreditsDB.user_id == new_user_id).first()

    if invitee_credits_db:
        invitee_credits_db.credits += invitee_credits
        invitee_credits_db.bonus_credits += invitee_credits
        invitee_credits_db.lifetime_credits += invitee_credits
        invitee_credits_db.updated_at = datetime.utcnow()
    else:
        invitee_credits_db = UserCreditsDB(
            id=str(uuid.uuid4()),
            user_id=new_user_id,
            credits=invitee_credits,
            bonus_credits=invitee_credits,
            lifetime_credits=invitee_credits,
        )
        db.add(invitee_credits_db)

    # Audit logs
    audit_inviter = BillingAuditLogDB(
        id=str(uuid.uuid4()),
        user_id=inviter_id,
        event_type="referral_bonus_received",
        event_data=json.dumps(
            {
                "referred_user": new_user_id,
                "credits": inviter_credits,
                "tokens": inviter_tokens,
            }
        ),
    )
    db.add(audit_inviter)

    audit_invitee = BillingAuditLogDB(
        id=str(uuid.uuid4()),
        user_id=new_user_id,
        event_type="referral_bonus_applied",
        event_data=json.dumps(
            {
                "inviter": inviter_id,
                "credits": invitee_credits,
                "tokens": invitee_tokens,
            }
        ),
    )
    db.add(audit_invitee)

    db.commit()

    return {
        "status": "success",
        "message": "Referral bonus applied!",
        "inviter_bonus": {"credits": inviter_credits, "tokens": inviter_tokens},
        "your_bonus": {"credits": invitee_credits, "tokens": invitee_tokens},
    }


# ============================================================
# GET MY CREDITS (incl. referral bonuses)
# ============================================================


@router.get("/my-credits")
async def get_my_credits(current_user=Depends(get_current_user_v2), db=Depends(get_db)):
    """
    Zeigt alle Credits (gekauft + Referral-Bonus).

    Verwendbar für:
    - Chat AI Tokens
    - App Builder Projects
    - Code Studio Operations
    - App Studio UI Generations
    """
    user_id = str(current_user.id)

    credits = db.query(UserCreditsDB).filter(UserCreditsDB.user_id == user_id).first()

    if not credits:
        return {
            "credits": 0.0,
            "bonus_credits": 0.0,
            "lifetime_credits": 0.0,
            "usage": {
                "chat": "Available for AI Chat tokens",
                "builder": "Available for App Builder projects",
                "code_studio": "Available for Code Studio operations",
                "app_studio": "Available for App Studio UI generations",
            },
        }

    return {
        "credits": credits.credits,
        "bonus_credits": credits.bonus_credits,
        "lifetime_credits": credits.lifetime_credits,
        "last_purchase": credits.last_purchase_date,
        "usage": {
            "chat": "Available for AI Chat tokens",
            "builder": "Available for App Builder projects",
            "code_studio": "Available for Code Studio operations",
            "app_studio": "Available for App Studio UI generations",
        },
    }


# ============================================================
# MY REFERRALS (list of invited users)
# ============================================================


@router.get("/my-referrals")
async def get_my_referrals(current_user=Depends(get_current_user_v2), db=Depends(get_db)):
    """
    Liste aller eingeladenen Benutzer.
    """
    user_id = str(current_user.id)

    referrals = db.query(ReferralBonusDB).filter(ReferralBonusDB.user_id == user_id).all()

    result = []
    total_earned = 0.0

    for ref in referrals:
        if ref.status == "pending":
            result.append(
                {
                    "status": "pending",
                    "code": ref.referred_user_id.split(":")[-1],
                    "created_at": ref.created_at,
                }
            )
        else:
            # Calculate earned credits
            tier = getattr(current_user, "subscription_level", "free") or "free"
            multiplier = TIER_MULTIPLIERS.get(tier, 1.0)
            earned = REFERRAL_REWARDS["inviter"]["credits"] * multiplier
            total_earned += earned

            result.append(
                {
                    "status": "completed",
                    "referred_user": ref.referred_user_id,
                    "bonus_earned": earned,
                    "created_at": ref.created_at,
                    "applied_at": ref.applied_at,
                }
            )

    return {
        "total_referrals": len(referrals),
        "pending_codes": len([r for r in referrals if r.status == "pending"]),
        "completed_referrals": len([r for r in referrals if r.status == "applied"]),
        "total_earned": total_earned,
        "referrals": result,
    }


# ============================================================
# REFERRAL STATS (Admin)
# ============================================================


@router.get("/stats")
async def get_referral_stats(current_user=Depends(get_current_user_v2), db=Depends(get_db)):
    """
    Statistiken über Referral-Programm (für Dashboard).
    """
    user_id = str(current_user.id)

    # Count stats
    total_codes = db.query(ReferralBonusDB).filter(ReferralBonusDB.user_id == user_id).count()

    completed = (
        db.query(ReferralBonusDB)
        .filter(ReferralBonusDB.user_id == user_id, ReferralBonusDB.status == "applied")
        .count()
    )

    pending = (
        db.query(ReferralBonusDB)
        .filter(ReferralBonusDB.user_id == user_id, ReferralBonusDB.status == "pending")
        .count()
    )

    # Get credits
    credits = db.query(UserCreditsDB).filter(UserCreditsDB.user_id == user_id).first()

    bonus_credits = credits.bonus_credits if credits else 0.0

    # Calculate tier bonus
    tier = getattr(current_user, "subscription_level", "free") or "free"
    multiplier = TIER_MULTIPLIERS.get(tier, 1.0)

    return {
        "total_codes_generated": total_codes,
        "completed_referrals": completed,
        "pending_codes": pending,
        "bonus_credits_earned": bonus_credits,
        "current_tier": tier,
        "tier_multiplier": f"{multiplier}x",
        "next_referral_reward": REFERRAL_REWARDS["inviter"]["credits"] * multiplier,
        "limits": {
            "max_referrals": MAX_REFERRALS_PER_USER,
            "max_pending_codes": MAX_PENDING_CODES,
        },
    }
