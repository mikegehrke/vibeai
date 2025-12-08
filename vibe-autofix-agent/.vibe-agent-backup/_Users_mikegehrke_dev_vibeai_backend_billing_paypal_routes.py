from fastapi import APIRouter

router = APIRouter()


@router.get("/paypal/test")
async def test_paypal():
    return {"message": "PayPal test endpoint working"}


import os

import requests

# -------------------------------------------------------------
# VIBEAI – PAYPAL BILLING ROUTES (CREATE ORDER / CAPTURE / WEBHOOK)
# -------------------------------------------------------------
from fastapi import Depends, HTTPException, Request

from auth import get_current_user_v2
from db import get_db

paypal_router = APIRouter(prefix="/billing/paypal", tags=["Billing - PayPal"])

PAYPAL_CLIENT = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")

BASE_URL = "https://api-m.sandbox.paypal.com" if PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com"


def get_paypal_access_token():
    """
    Holt einen OAuth2 Access Token von PayPal
    """
    url = f"{BASE_URL}/v1/oauth2/token"
    resp = requests.post(
        url,
        data={"grant_type": "client_credentials"},
        auth=(PAYPAL_CLIENT, PAYPAL_SECRET),
    )
    if resp.status_code != 200:
        raise HTTPException(500, "PayPal auth failed")
    return resp.json()["access_token"]


@paypal_router.post("/create-order")
async def create_order(current_user=Depends(get_current_user_v2)):
    """
    Erstellt eine PayPal-Zahlungsanfrage für PRO-Abo
    """
    token = get_paypal_access_token()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "EUR",
                    "value": "14.99",  # Beispielpreis für PRO
                }
            }
        ],
    }

    url = f"{BASE_URL}/v2/checkout/orders"
    resp = requests.post(url, json=body, headers=headers)

    if resp.status_code != 201:
        raise HTTPException(500, "Failed to create PayPal order")

    return resp.json()


@paypal_router.post("/capture/{order_id}")
async def capture_order(order_id: str, current_user=Depends(get_current_user_v2), db=Depends(get_db)):
    """
    Bestätigt eine Zahlung und aktiviert PRO-Abo
    """
    token = get_paypal_access_token()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    url = f"{BASE_URL}/v2/checkout/orders/{order_id}/capture"
    resp = requests.post(url, headers=headers)

    if resp.status_code != 201:
        raise HTTPException(500, "Failed to capture payment")

    # Abo aktivieren
    if hasattr(current_user, "subscription_level"):
        current_user.subscription_level = "pro"
        db.commit()

    return {"status": "success", "tier": "pro"}


@paypal_router.post("/webhook")
async def paypal_webhook(request: Request):
    """
    Empfängt PayPal-Webhooks (Renewal, Payment Completed, Cancellation)
    """
    data = await request.json()
    event_type = data.get("event_type")

    # Logging
    print(f"💬 PayPal Webhook: {event_type}")

    # Hier können später spezifische Event-Handler ergänzt werden:
    # - PAYMENT.SALE.COMPLETED
    # - BILLING.SUBSCRIPTION.CANCELLED
    # - BILLING.SUBSCRIPTION.RENEWED

    return {"status": "received"}


# ============================================================
# ⭐ VIBEAI – ADVANCED PAYPAL INTEGRATION (2025)
# ============================================================
# ✔ Multi-Tier Support (Free → Pro → Ultra)
# ✔ Subscription Plans
# ✔ One-Time Payments (Credits)
# ✔ Webhook Event Handling
# ✔ Transaction Logging
# ✔ Refund Support
# ✔ Sandbox & Production Mode
# ============================================================

import json
import uuid
from datetime import datetime, timedelta

from billing.models import (
    BillingAuditLogDB,
    PaymentTransactionDB,
    SubscriptionDB,
    UserCreditsDB,
)

# ---------------------------------------------------------
# TIER PRICING
# ---------------------------------------------------------
TIER_PRICING = {
    "pro": {"monthly": 29.99, "yearly": 299.99, "currency": "USD"},
    "ultra": {"monthly": 99.99, "yearly": 999.99, "currency": "USD"},
}

CREDITS_PRICING = {
    "small": {"amount": 10.00, "credits": 100000},
    "medium": {"amount": 50.00, "credits": 600000},
    "large": {"amount": 100.00, "credits": 1500000},
}


# ---------------------------------------------------------
# SUBSCRIPTION ORDER
# ---------------------------------------------------------
@paypal_router.post("/create-subscription-order")
async def create_subscription_order(
    tier: str, billing_cycle: str = "monthly", current_user=Depends(get_current_user_v2)
):
    """
    Erstellt PayPal Order für Subscription (Pro/Ultra).
    """
    if tier not in TIER_PRICING:
        raise HTTPException(400, f"Invalid tier: {tier}")

    if billing_cycle not in ["monthly", "yearly"]:
        raise HTTPException(400, "Invalid billing cycle")

    pricing = TIER_PRICING[tier]
    amount = pricing[billing_cycle]

    token = get_paypal_access_token()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "description": f"VibeAI {tier.upper()} - {billing_cycle}",
                "amount": {"currency_code": pricing["currency"], "value": str(amount)},
                "custom_id": f"{current_user.id}:{tier}:{billing_cycle}",
            }
        ],
        "application_context": {
            "brand_name": "VibeAI",
            "return_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/billing/success",
            "cancel_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/billing/cancel",
        },
    }

    url = f"{BASE_URL}/v2/checkout/orders"
    resp = requests.post(url, json=body, headers=headers)

    if resp.status_code != 201:
        raise HTTPException(500, "Failed to create PayPal order")

    return resp.json()


# ---------------------------------------------------------
# CREDITS ORDER
# ---------------------------------------------------------
@paypal_router.post("/create-credits-order")
async def create_credits_order(package: str, current_user=Depends(get_current_user_v2)):
    """
    Erstellt PayPal Order für Credit-Pakete.
    """
    if package not in CREDITS_PRICING:
        raise HTTPException(400, f"Invalid package: {package}")

    pricing = CREDITS_PRICING[package]

    token = get_paypal_access_token()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "description": f"VibeAI Credits - {pricing['credits']} tokens",
                "amount": {"currency_code": "USD", "value": str(pricing["amount"])},
                "custom_id": f"{current_user.id}:credits:{package}",
            }
        ],
        "application_context": {
            "brand_name": "VibeAI",
            "return_url": f"{os.getenv('FRONTEND_URL')}/billing/success",
            "cancel_url": f"{os.getenv('FRONTEND_URL')}/billing/cancel",
        },
    }

    url = f"{BASE_URL}/v2/checkout/orders"
    resp = requests.post(url, json=body, headers=headers)

    if resp.status_code != 201:
        raise HTTPException(500, "Failed to create credits order")

    return resp.json()


# ---------------------------------------------------------
# ADVANCED CAPTURE WITH LOGGING
# ---------------------------------------------------------
@paypal_router.post("/capture-advanced/{order_id}")
async def capture_order_advanced(order_id: str, current_user=Depends(get_current_user_v2), db=Depends(get_db)):
    """
    Erweiterte Capture-Funktion mit:
    - Transaction Logging
    - Subscription Activation
    - Credits Addition
    - Audit Trail
    """
    token = get_paypal_access_token()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    url = f"{BASE_URL}/v2/checkout/orders/{order_id}/capture"
    resp = requests.post(url, headers=headers)

    if resp.status_code not in [200, 201]:
        raise HTTPException(500, "Failed to capture payment")

    capture_data = resp.json()

    # Parse custom_id (format: "user_id:type:value")
    custom_id = capture_data.get("purchase_units", [{}])[0].get("custom_id", "")
    parts = custom_id.split(":")

    if len(parts) >= 3:
        order_type = parts[1]  # "pro" / "ultra" / "credits"

        # 1. Log Transaction
        transaction = PaymentTransactionDB(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            provider="paypal",
            transaction_id=order_id,
            amount=float(capture_data["purchase_units"][0]["amount"]["value"]),
            currency=capture_data["purchase_units"][0]["amount"]["currency_code"],
            status="success",
            payment_method="paypal",
            description=capture_data["purchase_units"][0].get("description", ""),
            metadata=json.dumps(capture_data),
        )
        db.add(transaction)

        # 2. Handle Subscription
        if order_type in ["pro", "ultra"]:
            billing_cycle = parts[2] if len(parts) > 2 else "monthly"

            # Update or Create Subscription
            subscription = db.query(SubscriptionDB).filter(SubscriptionDB.user_id == str(current_user.id)).first()

            if subscription:
                subscription.tier = order_type
                subscription.is_active = True
                subscription.renewal_date = datetime.utcnow() + timedelta(days=365 if billing_cycle == "yearly" else 30)
                subscription.updated_at = datetime.utcnow()
            else:
                subscription = SubscriptionDB(
                    id=str(uuid.uuid4()),
                    user_id=str(current_user.id),
                    tier=order_type,
                    is_active=True,
                    renewal_date=datetime.utcnow() + timedelta(days=365 if billing_cycle == "yearly" else 30),
                )
                db.add(subscription)

            # Update User tier
            if hasattr(current_user, "subscription_level"):
                current_user.subscription_level = order_type

        # 3. Handle Credits
        elif order_type == "credits":
            package = parts[2] if len(parts) > 2 else "small"
            credits_to_add = CREDITS_PRICING.get(package, {}).get("credits", 0)

            user_credits = db.query(UserCreditsDB).filter(UserCreditsDB.user_id == str(current_user.id)).first()

            if user_credits:
                user_credits.credits += credits_to_add
                user_credits.lifetime_credits += credits_to_add
                user_credits.last_purchase_date = datetime.utcnow()
                user_credits.updated_at = datetime.utcnow()
            else:
                user_credits = UserCreditsDB(
                    id=str(uuid.uuid4()),
                    user_id=str(current_user.id),
                    credits=credits_to_add,
                    lifetime_credits=credits_to_add,
                    last_purchase_date=datetime.utcnow(),
                )
                db.add(user_credits)

        # 4. Audit Log
        audit = BillingAuditLogDB(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            event_type="payment_success",
            event_data=json.dumps(
                {
                    "order_id": order_id,
                    "type": order_type,
                    "amount": transaction.amount,
                    "currency": transaction.currency,
                }
            ),
        )
        db.add(audit)

        db.commit()

    return {"status": "success", "order_id": order_id, "capture_data": capture_data}


# ---------------------------------------------------------
# WEBHOOK EVENT HANDLERS
# ---------------------------------------------------------
@paypal_router.post("/webhook-advanced")
async def paypal_webhook_advanced(request: Request, db=Depends(get_db)):
    """
    Erweiterte Webhook-Verarbeitung mit Event-Handling.
    """
    data = await request.json()
    event_type = data.get("event_type")

    # Log Event
    print(f"📨 PayPal Webhook: {event_type}")

    # Handle Events
    if event_type == "PAYMENT.CAPTURE.COMPLETED":
        # Payment erfolgreich
        resource = data.get("resource", {})
        custom_id = resource.get("custom_id", "")

        # Audit Log
        audit = BillingAuditLogDB(
            id=str(uuid.uuid4()),
            user_id=custom_id.split(":")[0] if ":" in custom_id else "unknown",
            event_type="webhook_payment_completed",
            event_data=json.dumps(data),
        )
        db.add(audit)
        db.commit()

    elif event_type == "PAYMENT.CAPTURE.REFUNDED":
        # Refund
        resource = data.get("resource", {})
        # Handle refund logic

    elif event_type == "BILLING.SUBSCRIPTION.CANCELLED":
        # Subscription canceled
        # Handle cancellation
        pass

    return {"status": "received", "event_type": event_type}


# ---------------------------------------------------------
# REFUND
# ---------------------------------------------------------
@paypal_router.post("/refund/{capture_id}")
async def refund_payment(capture_id: str, current_user=Depends(get_current_user_v2), db=Depends(get_db)):
    """
    Erstattet eine Zahlung (Admin-Funktion).
    """
    # Admin Check
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(403, "Admin privileges required")

    token = get_paypal_access_token()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }

    url = f"{BASE_URL}/v2/payments/captures/{capture_id}/refund"
    resp = requests.post(url, headers=headers)

    if resp.status_code != 201:
        raise HTTPException(500, "Refund failed")

    # Log Refund
    audit = BillingAuditLogDB(
        id=str(uuid.uuid4()),
        user_id=str(current_user.id),
        event_type="refund_issued",
        event_data=json.dumps({"capture_id": capture_id}),
    )
    db.add(audit)
    db.commit()

    return {"status": "refunded", "data": resp.json()}
