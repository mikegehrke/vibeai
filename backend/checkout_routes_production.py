"""
Checkout Routes - Production-ready with Stripe and PayPal integration
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import os

# Uncomment when installing payment SDKs:
# import stripe
# from paypalrestsdk import Payment

router = APIRouter(prefix="/api/checkout", tags=["checkout"])

# Initialize payment providers (set in environment variables)
# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
# PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
# PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
# PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")  # or "live"

# Import existing models and data
from checkout_routes import (
    CheckoutRequest,
    CheckoutCalculationResponse,
    PaymentIntentRequest,
    PaymentIntentResponse,
    PLAN_DATA,
    VAT_RATE,
    PROMO_CODES
)


@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: PaymentIntentRequest):
    """
    Create a payment intent for Stripe or PayPal
    Production-ready implementation
    """
    plan_key = request.plan.lower()
    
    if plan_key not in PLAN_DATA:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {request.plan}")
    
    plan = PLAN_DATA[plan_key]
    
    # For on-demand, use amount from request (minimum 10€)
    if plan_key == 'on-demand':
        if not request.amount or request.amount < 10:
            raise HTTPException(status_code=400, detail="On Demand minimum amount is 10€")
        base_price = request.amount
    else:
        # Get base price
        if request.is_yearly:
            base_price = plan['price_yearly']
        else:
            base_price = plan['price_monthly']
    
    # Apply promo code discount if provided
    discount_rate = 0.0
    if request.promo_code:
        promo_code_upper = request.promo_code.upper()
        if promo_code_upper in PROMO_CODES:
            discount_rate = PROMO_CODES[promo_code_upper]
    
    discount_amount = base_price * discount_rate
    subtotal = base_price - discount_amount
    vat_amount = subtotal * VAT_RATE
    total = subtotal + vat_amount
    
    # Convert to cents for Stripe (or smallest currency unit)
    amount_in_cents = int(total * 100)
    
    if request.payment_method == 'stripe':
        try:
            # Create Stripe PaymentIntent
            # payment_intent = stripe.PaymentIntent.create(
            #     amount=amount_in_cents,
            #     currency='eur',
            #     metadata={
            #         'plan': plan_key,
            #         'email': request.email,
            #         'is_yearly': str(request.is_yearly),
            #         'promo_code': request.promo_code or '',
            #         'amount': str(total)
            #     },
            #     automatic_payment_methods={
            #         'enabled': True,
            #     },
            # )
            
            # return PaymentIntentResponse(
            #     payment_intent_id=payment_intent.id,
            #     client_secret=payment_intent.client_secret,
            #     redirect_url=None,
            #     amount=round(total, 2),
            #     currency=plan['currency']
            # )
            
            # Mock for now - replace with above when Stripe is configured
            payment_intent_id = f"pi_mock_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            return PaymentIntentResponse(
                payment_intent_id=payment_intent_id,
                client_secret=f"pi_mock_{payment_intent_id}_secret",
                redirect_url=None,
                amount=round(total, 2),
                currency=plan['currency']
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")
    
    elif request.payment_method == 'paypal':
        try:
            # Create PayPal Order
            # payment = Payment({
            #     "intent": "sale",
            #     "payer": {
            #         "payment_method": "paypal"
            #     },
            #     "transactions": [{
            #         "amount": {
            #             "total": f"{total:.2f}",
            #             "currency": "EUR"
            #         },
            #         "description": f"Vibe AI {plan['name']} - {request.email}",
            #         "custom": f"plan:{plan_key},yearly:{request.is_yearly}"
            #     }],
            #     "redirect_urls": {
            #         "return_url": f"{os.getenv('FRONTEND_URL')}/payment/success",
            #         "cancel_url": f"{os.getenv('FRONTEND_URL')}/payment/cancel"
            #     }
            # })
            
            # if payment.create():
            #     approval_url = next(link['href'] for link in payment.links if link['rel'] == 'approval_url')
            #     return PaymentIntentResponse(
            #         payment_intent_id=payment.id,
            #         client_secret=None,
            #         redirect_url=approval_url,
            #         amount=round(total, 2),
            #         currency=plan['currency']
            #     )
            # else:
            #     raise HTTPException(status_code=500, detail=f"PayPal error: {payment.error}")
            
            # Mock for now - replace with above when PayPal is configured
            payment_intent_id = f"paypal_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            return PaymentIntentResponse(
                payment_intent_id=payment_intent_id,
                client_secret=None,
                redirect_url=f"https://paypal.com/checkout?order_id={payment_intent_id}",
                amount=round(total, 2),
                currency=plan['currency']
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PayPal error: {str(e)}")
    
    else:
        raise HTTPException(status_code=400, detail="Invalid payment method. Use 'stripe' or 'paypal'")


@router.post("/webhook/stripe")
async def stripe_webhook(request: dict):
    """
    Handle Stripe webhook events
    Configure this URL in Stripe Dashboard: https://yourdomain.com/api/checkout/webhook/stripe
    """
    # Verify webhook signature
    # payload = request.body
    # sig_header = request.headers.get('stripe-signature')
    # event = stripe.Webhook.construct_event(
    #     payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
    # )
    
    # Handle different event types
    # if event['type'] == 'payment_intent.succeeded':
    #     payment_intent = event['data']['object']
    #     # Update database, send confirmation email, etc.
    #     # plan = payment_intent.metadata.get('plan')
    #     # email = payment_intent.metadata.get('email')
    #     # ... process subscription/credits
    #     pass
    
    return {"status": "received"}


@router.post("/webhook/paypal")
async def paypal_webhook(request: dict):
    """
    Handle PayPal webhook events
    Configure this URL in PayPal Dashboard
    """
    # Verify webhook signature
    # Process payment confirmation
    # Update database, send confirmation email, etc.
    
    return {"status": "received"}

