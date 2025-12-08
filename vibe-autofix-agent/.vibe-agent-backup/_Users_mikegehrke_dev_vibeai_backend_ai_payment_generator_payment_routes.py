"""
Payment Generator API Routes
Endpoints für automatische Payment-Code-Generierung
"""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .payment_generator import (
    Framework,
    PaymentConfig,
    PaymentGenerator,
    PaymentProvider,
    PricingModel,
)

router = APIRouter(prefix="/payment-gen", tags=["Payment Generator"])

# Initialize generator
generator = PaymentGenerator()


class GenerateRequest(BaseModel):
    """Request für Payment Code Generation"""

    provider: PaymentProvider
    pricing_model: PricingModel
    backend_framework: Framework
    frontend_framework: Optional[Framework] = None
    currency: str = "usd"
    amount: Optional[float] = None
    subscription_interval: str = "month"
    trial_days: int = 0
    success_url: str = "https://yourapp.com/success"
    cancel_url: str = "https://yourapp.com/cancel"


@router.post("/generate")
async def generate_payment_system(request: GenerateRequest):
    """
    Generiere komplettes Payment-System

    Returns:
        - backend_code: Python/Node.js backend code
        - frontend_code: React/Flutter frontend code
        - webhook_code: Webhook handler code
        - env_variables: Environment variables
        - installation_commands: Installation commands
        - setup_instructions: Setup guide
    """
    try:
        # Create payment config
        config = PaymentConfig(
            provider=request.provider,
            pricing_model=request.pricing_model,
            currency=request.currency,
            amount=request.amount,
            subscription_interval=request.subscription_interval,
            trial_days=request.trial_days,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
        )

        # Generate code
        result = generator.generate_payment_system(
            config=config,
            backend_framework=request.backend_framework,
            frontend_framework=request.frontend_framework,
        )

        return {
            "success": True,
            "backend_code": result.backend_code,
            "frontend_code": result.frontend_code,
            "webhook_code": result.webhook_code,
            "env_variables": result.env_variables,
            "installation_commands": result.installation_commands,
            "setup_instructions": result.setup_instructions,
            "provider": request.provider,
            "pricing_model": request.pricing_model,
            "backend_framework": request.backend_framework,
            "frontend_framework": request.frontend_framework,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-checkout")
async def generate_checkout(request: GenerateRequest):
    """
    Generiere nur Checkout Code

    Returns:
        - checkout_code: Backend checkout endpoint
        - frontend_code: Frontend checkout UI
    """
    try:
        config = PaymentConfig(
            provider=request.provider,
            pricing_model=request.pricing_model,
            currency=request.currency,
            amount=request.amount,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
        )

        result = generator.generate_payment_system(
            config=config,
            backend_framework=request.backend_framework,
            frontend_framework=request.frontend_framework,
        )

        return {
            "success": True,
            "checkout_code": result.backend_code,
            "frontend_code": result.frontend_code,
            "installation_commands": result.installation_commands,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-webhook")
async def generate_webhook(provider: PaymentProvider, backend_framework: Framework = Framework.FASTAPI):
    """
    Generiere nur Webhook Handler

    Returns:
        - webhook_code: Webhook handler code
        - events: List of handled events
    """
    try:
        config = PaymentConfig(provider=provider, pricing_model=PricingModel.ONE_TIME)

        webhook_code = generator._generate_webhooks(config, backend_framework)

        # Event lists
        stripe_events = [
            "payment_intent.succeeded",
            "payment_intent.payment_failed",
            "customer.subscription.created",
            "customer.subscription.updated",
            "customer.subscription.deleted",
            "invoice.payment_succeeded",
            "invoice.payment_failed",
        ]

        paypal_events = [
            "PAYMENT.CAPTURE.COMPLETED",
            "PAYMENT.CAPTURE.DENIED",
            "CHECKOUT.ORDER.APPROVED",
            "BILLING.SUBSCRIPTION.ACTIVATED",
            "BILLING.SUBSCRIPTION.CANCELLED",
        ]

        events = []
        if provider in [PaymentProvider.STRIPE, PaymentProvider.BOTH]:
            events.extend(stripe_events)
        if provider in [PaymentProvider.PAYPAL, PaymentProvider.BOTH]:
            events.extend(paypal_events)

        return {
            "success": True,
            "webhook_code": webhook_code,
            "events": events,
            "provider": provider,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-subscription")
async def generate_subscription(
    provider: PaymentProvider,
    backend_framework: Framework = Framework.FASTAPI,
    frontend_framework: Optional[Framework] = Framework.REACT,
    interval: str = "month",
    trial_days: int = 0,
):
    """
    Generiere Subscription Code

    Returns:
        - backend_code: Subscription management endpoints
        - frontend_code: Subscription UI
    """
    try:
        config = PaymentConfig(
            provider=provider,
            pricing_model=PricingModel.SUBSCRIPTION,
            subscription_interval=interval,
            trial_days=trial_days,
        )

        result = generator.generate_payment_system(
            config=config,
            backend_framework=backend_framework,
            frontend_framework=frontend_framework,
        )

        return {
            "success": True,
            "backend_code": result.backend_code,
            "frontend_code": result.frontend_code,
            "webhook_code": result.webhook_code,
            "interval": interval,
            "trial_days": trial_days,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/providers")
async def list_providers():
    """
    Liste alle Payment Provider

    Returns:
        - providers: List of payment providers
    """
    return {
        "success": True,
        "providers": [
            {
                "id": "stripe",
                "name": "Stripe",
                "description": "Global payment platform with comprehensive APIs",
                "features": [
                    "Credit/Debit cards",
                    "Subscriptions",
                    "Invoices",
                    "Payment intents",
                    "Strong customer authentication",
                ],
                "fees": "2.9% + $0.30 per transaction",
                "test_cards": {
                    "success": "4242 4242 4242 4242",
                    "declined": "4000 0000 0000 0002",
                    "requires_auth": "4000 0025 0000 3155",
                },
            },
            {
                "id": "paypal",
                "name": "PayPal",
                "description": "Widely adopted payment platform",
                "features": [
                    "PayPal account payments",
                    "Credit/Debit cards",
                    "Subscriptions",
                    "Smart Payment Buttons",
                    "Express Checkout",
                ],
                "fees": "2.9% + $0.30 per transaction",
                "sandbox": "https://sandbox.paypal.com",
            },
            {
                "id": "both",
                "name": "Stripe + PayPal",
                "description": "Accept payments from both providers",
                "features": [
                    "Maximum payment coverage",
                    "Customer choice",
                    "Fallback options",
                ],
            },
        ],
    }


@router.get("/pricing-models")
async def list_pricing_models():
    """
    Liste alle Pricing Models

    Returns:
        - pricing_models: List of supported pricing models
    """
    return {
        "success": True,
        "pricing_models": [
            {
                "id": "one_time",
                "name": "One-Time Payment",
                "description": "Single payment for product/service",
                "use_cases": [
                    "E-commerce purchases",
                    "Digital downloads",
                    "One-time services",
                ],
                "example": "Buy premium theme - $49",
            },
            {
                "id": "subscription",
                "name": "Subscription",
                "description": "Recurring payments (monthly/yearly)",
                "use_cases": [
                    "SaaS products",
                    "Membership sites",
                    "Streaming services",
                ],
                "intervals": ["month", "year"],
                "features": ["Trial periods", "Cancellation", "Plan upgrades"],
                "example": "Premium Plan - $9.99/month",
            },
            {
                "id": "usage_based",
                "name": "Usage-Based",
                "description": "Pay for what you use",
                "use_cases": ["API calls", "Storage", "Computing resources"],
                "example": "API calls - $0.01 per request",
            },
            {
                "id": "tiered",
                "name": "Tiered Pricing",
                "description": "Different price tiers based on usage",
                "use_cases": [
                    "Volume discounts",
                    "Feature-based tiers",
                    "User-based pricing",
                ],
                "example": "Starter ($9) → Pro ($29) → Enterprise ($99)",
            },
        ],
    }


@router.get("/frameworks")
async def list_frameworks():
    """
    Liste alle unterstützten Frameworks

    Returns:
        - backend_frameworks: Supported backend frameworks
        - frontend_frameworks: Supported frontend frameworks
    """
    return {
        "success": True,
        "backend_frameworks": [
            {
                "id": "fastapi",
                "name": "FastAPI",
                "language": "Python",
                "status": "fully_supported",
                "features": ["Async/await", "Type hints", "Auto docs"],
            },
            {
                "id": "django",
                "name": "Django",
                "language": "Python",
                "status": "coming_soon",
            },
            {
                "id": "flask",
                "name": "Flask",
                "language": "Python",
                "status": "coming_soon",
            },
            {
                "id": "express",
                "name": "Express.js",
                "language": "JavaScript/TypeScript",
                "status": "coming_soon",
            },
        ],
        "frontend_frameworks": [
            {
                "id": "react",
                "name": "React",
                "language": "JavaScript/TypeScript",
                "status": "fully_supported",
                "libraries": ["@stripe/react-stripe-js", "PayPal SDK"],
            },
            {
                "id": "flutter",
                "name": "Flutter",
                "language": "Dart",
                "status": "fully_supported",
                "packages": ["flutter_stripe"],
            },
            {
                "id": "react_native",
                "name": "React Native",
                "language": "JavaScript/TypeScript",
                "status": "coming_soon",
            },
            {
                "id": "nextjs",
                "name": "Next.js",
                "language": "JavaScript/TypeScript",
                "status": "coming_soon",
            },
        ],
    }


@router.get("/templates/{provider}")
async def get_template(provider: str):
    """
    Get code template für Provider

    Returns:
        - template: Code template
        - examples: Usage examples
    """
    if provider == "stripe":
        return {
            "success": True,
            "provider": "stripe",
            "templates": {
                "one_time_payment": {
                    "backend": "FastAPI + Stripe Payment Intent",
                    "frontend": "React + Stripe Elements",
                    "lines": 120,
                },
                "subscription": {
                    "backend": "FastAPI + Stripe Subscriptions",
                    "frontend": "React + Checkout Session",
                    "lines": 180,
                },
                "webhook": {
                    "backend": "FastAPI + Webhook Handler",
                    "events": 7,
                    "lines": 150,
                },
            },
            "examples": [
                "Monthly SaaS subscription with 7-day trial",
                "One-time product purchase",
                "Usage-based API billing",
            ],
        }

    elif provider == "paypal":
        return {
            "success": True,
            "provider": "paypal",
            "templates": {
                "one_time_payment": {
                    "backend": "FastAPI + PayPal Orders API",
                    "frontend": "React + Smart Payment Buttons",
                    "lines": 140,
                },
                "subscription": {
                    "backend": "FastAPI + PayPal Subscriptions",
                    "frontend": "React + Subscription Buttons",
                    "lines": 160,
                },
                "webhook": {
                    "backend": "FastAPI + Webhook Verification",
                    "events": 5,
                    "lines": 120,
                },
            },
            "examples": [
                "E-commerce checkout",
                "Digital product purchase",
                "Membership subscription",
            ],
        }

    else:
        raise HTTPException(status_code=404, detail="Provider not found")


@router.post("/validate-config")
async def validate_config(request: GenerateRequest):
    """
    Validiere Payment Config

    Returns:
        - valid: boolean
        - issues: List of configuration issues
    """
    issues = []

    # Validate amount for one-time payments
    if request.pricing_model == PricingModel.ONE_TIME and not request.amount:
        issues.append("Amount is required for one-time payments")

    # Validate subscription interval
    if request.pricing_model == PricingModel.SUBSCRIPTION:
        if request.subscription_interval not in ["month", "year"]:
            issues.append("Subscription interval must be 'month' or 'year'")

    # Validate URLs
    if not request.success_url.startswith("http"):
        issues.append("Success URL must start with http:// or https://")
    if not request.cancel_url.startswith("http"):
        issues.append("Cancel URL must start with http:// or https://")

    # Validate framework compatibility
    if request.frontend_framework == Framework.FLUTTER:
        if request.provider == PaymentProvider.PAYPAL:
            issues.append("PayPal is not yet supported for Flutter (coming soon)")

    return {
        "success": True,
        "valid": len(issues) == 0,
        "issues": issues,
        "config": {
            "provider": request.provider,
            "pricing_model": request.pricing_model,
            "backend_framework": request.backend_framework,
            "frontend_framework": request.frontend_framework,
        },
    }


@router.get("/stats")
async def get_stats():
    """
    Payment Generator Statistics

    Returns:
        - total_providers: Number of providers
        - total_pricing_models: Number of pricing models
        - total_frameworks: Number of frameworks
    """
    return {
        "success": True,
        "stats": {
            "providers": 3,  # Stripe, PayPal, Both
            "pricing_models": 4,  # One-time, Subscription, Usage, Tiered
            "backend_frameworks": 4,  # FastAPI, Django, Flask, Express
            "frontend_frameworks": 4,  # React, Flutter, React Native, Next.js
            "fully_supported": {
                "backend": ["fastapi"],
                "frontend": ["react", "flutter"],
            },
            "coming_soon": {
                "backend": ["django", "flask", "express"],
                "frontend": ["react_native", "nextjs"],
            },
        },
        "features": [
            "Stripe checkout sessions",
            "Stripe subscriptions",
            "PayPal orders",
            "PayPal subscriptions",
            "Webhook handlers",
            "Frontend components",
            "Test mode support",
            "Security best practices",
        ],
    }
