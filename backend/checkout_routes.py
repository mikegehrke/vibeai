"""
Checkout Routes - Payment calculation and processing
Ready for Stripe and PayPal integration - just add API keys!
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import os

router = APIRouter(prefix="/api/checkout", tags=["checkout"])

# Try to import payment SDKs (will work after pip install)
try:
    import stripe
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False
    stripe = None

try:
    from paypalrestsdk import Payment, configure as paypal_configure
    PAYPAL_AVAILABLE = True
except ImportError:
    PAYPAL_AVAILABLE = False
    Payment = None
    paypal_configure = None

# Initialize payment providers from environment variables
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")  # "sandbox" or "live"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Configure Stripe if key is available
if STRIPE_AVAILABLE and STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

# Configure PayPal if credentials are available
if PAYPAL_AVAILABLE and PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET:
    paypal_configure({
        "mode": PAYPAL_MODE,
        "client_id": PAYPAL_CLIENT_ID,
        "client_secret": PAYPAL_CLIENT_SECRET
    })


class CheckoutRequest(BaseModel):
    plan: str
    is_yearly: bool
    email: EmailStr
    promo_code: Optional[str] = None
    amount: Optional[float] = None  # For on-demand plans


class CheckoutCalculationResponse(BaseModel):
    plan_name: str
    base_price: float
    discount: float
    subtotal: float
    vat_rate: float
    vat_amount: float
    total: float
    currency: str
    billing_period: str
    monthly_equivalent: float
    credits: int


class PaymentIntentRequest(BaseModel):
    plan: str
    is_yearly: bool
    email: EmailStr
    payment_method: str  # 'stripe' or 'paypal'
    promo_code: Optional[str] = None
    amount: Optional[float] = None  # For on-demand plans


class PaymentIntentResponse(BaseModel):
    payment_intent_id: str
    client_secret: Optional[str] = None
    redirect_url: Optional[str] = None
    amount: float
    currency: str


# Plan data matching frontend
PLAN_DATA = {
    'core': {
        'name': 'Vibe AI Core',
        'price_monthly': 29.99,
        'price_yearly': 287.88,
        'price_yearly_monthly': 23.99,
        'currency': '€',
        'credits': 30
    },
    'pro-plus': {
        'name': 'Vibe AI Pro+',
        'price_monthly': 39.99,
        'price_yearly': 383.90,
        'price_yearly_monthly': 31.99,
        'currency': '€',
        'credits': 40
    },
    'ultra': {
        'name': 'Vibe AI Ultra',
        'price_monthly': 54.99,
        'price_yearly': 527.90,
        'price_yearly_monthly': 43.99,
        'currency': '€',
        'credits': 50
    },
    'ultra-plus': {
        'name': 'Vibe AI Ultra+',
        'price_monthly': 79.99,
        'price_yearly': 767.90,
        'price_yearly_monthly': 63.99,
        'currency': '€',
        'credits': 75
    },
    'teams': {
        'name': 'Vibe AI Teams',
        'price_monthly': 99.99,
        'price_yearly': 959.88,
        'price_yearly_monthly': 79.99,
        'currency': '€',
        'credits': 100
    },
    'starter': {
        'name': 'Starter',
        'price_monthly': 0,
        'price_yearly': 0,
        'price_yearly_monthly': 0,
        'currency': '€',
        'credits': 0
    },
    'on-demand': {
        'name': 'On Demand',
        'price_monthly': 0,  # Will be set from request.amount
        'price_yearly': 0,
        'price_yearly_monthly': 0,
        'currency': '€',
        'credits': 0
    }
}

# VAT rate (19% for Germany/EU)
VAT_RATE = 0.19

# Promo codes (in production, this would be in a database)
PROMO_CODES = {
    'WELCOME20': 0.20,  # 20% discount
    'SAVE10': 0.10,     # 10% discount
    'EARLYBIRD': 0.15   # 15% discount
}


@router.post("/calculate", response_model=CheckoutCalculationResponse)
async def calculate_checkout(request: CheckoutRequest):
    """
    Calculate checkout totals including VAT and discounts
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
        monthly_equivalent = request.amount
        billing_period = 'one-time'
    else:
        # Get base price
        if request.is_yearly:
            base_price = plan['price_yearly']
            monthly_equivalent = plan['price_yearly_monthly']
            billing_period = 'yearly'
        else:
            base_price = plan['price_monthly']
            monthly_equivalent = plan['price_monthly']
            billing_period = 'monthly'
    
    # Apply promo code discount if provided
    discount_rate = 0.0
    if request.promo_code:
        promo_code_upper = request.promo_code.upper()
        if promo_code_upper in PROMO_CODES:
            discount_rate = PROMO_CODES[promo_code_upper]
    
    discount_amount = base_price * discount_rate
    subtotal = base_price - discount_amount
    
    # Calculate VAT
    vat_amount = subtotal * VAT_RATE
    total = subtotal + vat_amount
    
    return CheckoutCalculationResponse(
        plan_name=plan['name'],
        base_price=round(base_price, 2),
        discount=round(discount_amount, 2),
        subtotal=round(subtotal, 2),
        vat_rate=VAT_RATE,
        vat_amount=round(vat_amount, 2),
        total=round(total, 2),
        currency=plan['currency'],
        billing_period=billing_period,
        monthly_equivalent=round(monthly_equivalent, 2),
        credits=plan['credits']
    )


@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: PaymentIntentRequest):
    """
    Create a payment intent for Stripe or PayPal
    In production, this would integrate with actual payment providers
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
        if not STRIPE_AVAILABLE:
            raise HTTPException(
                status_code=500, 
                detail="Stripe SDK not installed. Run: pip install stripe"
            )
        if not STRIPE_SECRET_KEY:
            raise HTTPException(
                status_code=500,
                detail="Stripe API key not configured. Set STRIPE_SECRET_KEY environment variable."
            )
        
        try:
            # Create Stripe PaymentIntent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency='eur',
                metadata={
                    'plan': plan_key,
                    'email': request.email,
                    'is_yearly': str(request.is_yearly),
                    'promo_code': request.promo_code or '',
                    'amount': str(total),
                    'subtotal': str(subtotal),
                    'vat': str(vat_amount)
                },
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            return PaymentIntentResponse(
                payment_intent_id=payment_intent.id,
                client_secret=payment_intent.client_secret,
                redirect_url=None,
                amount=round(total, 2),
                currency=plan['currency']
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")
    
    elif request.payment_method == 'paypal':
        if not PAYPAL_AVAILABLE:
            raise HTTPException(
                status_code=500,
                detail="PayPal SDK not installed. Run: pip install paypalrestsdk"
            )
        if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
            raise HTTPException(
                status_code=500,
                detail="PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables."
            )
        
        try:
            # Create PayPal Order
            payment = Payment({
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "transactions": [{
                    "amount": {
                        "total": f"{total:.2f}",
                        "currency": "EUR"
                    },
                    "description": f"Vibe AI {plan['name']} - {request.email}",
                    "custom": f"plan:{plan_key},yearly:{request.is_yearly},email:{request.email}"
                }],
                "redirect_urls": {
                    "return_url": f"{FRONTEND_URL}/payment/success?plan={plan_key}",
                    "cancel_url": f"{FRONTEND_URL}/payment/cancel?plan={plan_key}"
                }
            })
            
            if payment.create():
                approval_url = next(
                    (link['href'] for link in payment.links if link['rel'] == 'approval_url'),
                    None
                )
                if not approval_url:
                    raise HTTPException(status_code=500, detail="PayPal approval URL not found")
                
                return PaymentIntentResponse(
                    payment_intent_id=payment.id,
                    client_secret=None,
                    redirect_url=approval_url,
                    amount=round(total, 2),
                    currency=plan['currency']
                )
            else:
                error_msg = payment.error.get('message', 'Unknown PayPal error') if payment.error else 'Unknown error'
                raise HTTPException(status_code=500, detail=f"PayPal error: {error_msg}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PayPal error: {str(e)}")
    
    else:
        raise HTTPException(status_code=400, detail="Invalid payment method. Use 'stripe' or 'paypal'")


@router.post("/verify-promo-code")
async def verify_promo_code(promo_code: str):
    """
    Verify if a promo code is valid and return discount rate
    """
    promo_code_upper = promo_code.upper()
    
    if promo_code_upper in PROMO_CODES:
        return {
            "valid": True,
            "discount_rate": PROMO_CODES[promo_code_upper],
            "message": f"Promo code applied: {int(PROMO_CODES[promo_code_upper] * 100)}% discount"
        }
    else:
        return {
            "valid": False,
            "discount_rate": 0.0,
            "message": "Invalid promo code"
        }


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events
    Configure this URL in Stripe Dashboard: https://yourdomain.com/api/checkout/webhook/stripe
    
    Events to listen for:
    - payment_intent.succeeded
    - payment_intent.payment_failed
    - customer.subscription.created
    - customer.subscription.updated
    - customer.subscription.deleted
    """
    if not STRIPE_AVAILABLE or not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Stripe webhook secret not configured")
    
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing stripe-signature header")
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        
        # Handle different event types
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # TODO: Update database, send confirmation email, add credits, etc.
            # plan = payment_intent.metadata.get('plan')
            # email = payment_intent.metadata.get('email')
            # amount = payment_intent.amount / 100
            # ... process payment
            print(f"Payment succeeded: {payment_intent['id']}")
        
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            # TODO: Handle failed payment
            print(f"Payment failed: {payment_intent['id']}")
        
        return {"status": "received", "event_type": event['type']}
    
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail=f"Invalid signature: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook error: {str(e)}")


@router.post("/webhook/paypal")
async def paypal_webhook(request: Request):
    """
    Handle PayPal webhook events
    Configure this URL in PayPal Dashboard
    
    Events to listen for:
    - PAYMENT.SALE.COMPLETED
    - PAYMENT.SALE.DENIED
    - PAYMENT.SALE.REFUNDED
    """
    if not PAYPAL_AVAILABLE:
        raise HTTPException(status_code=500, detail="PayPal not configured")
    
    try:
        body = await request.json()
        event_type = body.get('event_type')
        resource = body.get('resource', {})
        
        if event_type == 'PAYMENT.SALE.COMPLETED':
            # TODO: Update database, send confirmation email, add credits, etc.
            # payment_id = resource.get('parent_payment')
            # amount = resource.get('amount', {}).get('total')
            # ... process payment
            print(f"PayPal payment completed: {resource.get('id')}")
        
        elif event_type == 'PAYMENT.SALE.DENIED':
            # TODO: Handle denied payment
            print(f"PayPal payment denied: {resource.get('id')}")
        
        return {"status": "received", "event_type": event_type}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook error: {str(e)}")

