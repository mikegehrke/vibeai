"""
Payment Generator Demo
Zeigt alle Features des Payment Generators
"""

import asyncio

from payment_generator import (
    Framework,
    PaymentConfig,
    PaymentGenerator,
    PaymentProvider,
    PricingModel,
)


def print_section(title):
    """Print section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")


def print_code(code, language="python"):
    """Print generated code"""
    print(f"```{language}")
    print(code[:500])  # First 500 chars
    if len(code) > 500:
        print("...")
        print(f"(Total: {len(code)} characters)")
    print("```\n")


async def demo_stripe_subscription():
    """Demo: Stripe Subscription with Trial"""
    print_section("🎯 Demo 1: Stripe Subscription (SaaS Product)")

    generator = PaymentGenerator()

    config = PaymentConfig(
        provider=PaymentProvider.STRIPE,
        pricing_model=PricingModel.SUBSCRIPTION,
        subscription_interval="month",
        trial_days=7,
        success_url="https://yourapp.com/success",
        cancel_url="https://yourapp.com/cancel",
    )

    result = generator.generate_payment_system(
        config=config,
        backend_framework=Framework.FASTAPI,
        frontend_framework=Framework.REACT,
    )

    print("✅ Configuration:")
    print(f"   Provider: Stripe")
    print(f"   Pricing Model: Monthly Subscription")
    print(f"   Trial Period: 7 days")
    print(f"   Backend: FastAPI")
    print(f"   Frontend: React\n")

    print("📦 Generated Backend Code:")
    print_code(result.backend_code, "python")

    print("📦 Generated Frontend Code:")
    print_code(result.frontend_code, "javascript")

    print("🔔 Generated Webhook Code:")
    print_code(result.webhook_code, "python")

    print("🔐 Environment Variables:")
    for key, value in result.env_variables.items():
        print(f"   {key}={value}")

    print("\n📦 Installation Commands:")
    for cmd in result.installation_commands:
        print(f"   $ {cmd}")


async def demo_paypal_one_time():
    """Demo: PayPal One-Time Payment"""
    print_section("🎯 Demo 2: PayPal One-Time Payment (E-Commerce)")

    generator = PaymentGenerator()

    config = PaymentConfig(
        provider=PaymentProvider.PAYPAL,
        pricing_model=PricingModel.ONE_TIME,
        currency="usd",
        amount=49.99,
        success_url="https://store.com/success",
        cancel_url="https://store.com/cart",
    )

    result = generator.generate_payment_system(
        config=config,
        backend_framework=Framework.FASTAPI,
        frontend_framework=Framework.REACT,
    )

    print("✅ Configuration:")
    print(f"   Provider: PayPal")
    print(f"   Pricing Model: One-Time Payment")
    print(f"   Amount: $49.99")
    print(f"   Backend: FastAPI")
    print(f"   Frontend: React\n")

    print("📦 Generated Backend Code:")
    print_code(result.backend_code, "python")

    print("📦 Generated Frontend Code:")
    print_code(result.frontend_code, "javascript")


async def demo_flutter_stripe():
    """Demo: Flutter App with Stripe"""
    print_section("🎯 Demo 3: Mobile App Payment (Flutter + Stripe)")

    generator = PaymentGenerator()

    config = PaymentConfig(
        provider=PaymentProvider.STRIPE,
        pricing_model=PricingModel.SUBSCRIPTION,
        subscription_interval="month",
        trial_days=14,
        success_url="yourapp://success",
        cancel_url="yourapp://cancel",
    )

    result = generator.generate_payment_system(
        config=config,
        backend_framework=Framework.FASTAPI,
        frontend_framework=Framework.FLUTTER,
    )

    print("✅ Configuration:")
    print(f"   Provider: Stripe")
    print(f"   Pricing Model: Monthly Subscription")
    print(f"   Trial Period: 14 days")
    print(f"   Backend: FastAPI")
    print(f"   Frontend: Flutter\n")

    print("📦 Generated Backend Code:")
    print_code(result.backend_code, "python")

    print("📦 Generated Flutter Code:")
    print_code(result.frontend_code, "dart")


async def demo_both_providers():
    """Demo: Both Stripe and PayPal"""
    print_section("🎯 Demo 4: Multiple Providers (Stripe + PayPal)")

    generator = PaymentGenerator()

    config = PaymentConfig(
        provider=PaymentProvider.BOTH,
        pricing_model=PricingModel.SUBSCRIPTION,
        subscription_interval="year",
        trial_days=30,
        success_url="https://premium.app/success",
        cancel_url="https://premium.app/pricing",
    )

    result = generator.generate_payment_system(
        config=config,
        backend_framework=Framework.FASTAPI,
        frontend_framework=Framework.REACT,
    )

    print("✅ Configuration:")
    print(f"   Provider: Stripe + PayPal")
    print(f"   Pricing Model: Yearly Subscription")
    print(f"   Trial Period: 30 days")
    print(f"   Backend: FastAPI")
    print(f"   Frontend: React\n")

    print("📦 Generated Backend Code (Stripe + PayPal):")
    print(f"   Total Lines: {len(result.backend_code.split(chr(10)))}")
    print(f"   Supports both Stripe and PayPal APIs")

    print("\n🔔 Webhook Events Handled:")
    print("   Stripe:")
    print("     - payment_intent.succeeded")
    print("     - customer.subscription.created")
    print("     - customer.subscription.updated")
    print("     - invoice.payment_succeeded")
    print("   PayPal:")
    print("     - PAYMENT.CAPTURE.COMPLETED")
    print("     - BILLING.SUBSCRIPTION.ACTIVATED")


async def demo_code_stats():
    """Demo: Code Generation Stats"""
    print_section("📊 Payment Generator Statistics")

    generator = PaymentGenerator()

    # Generate different combinations
    configs = [
        ("Stripe Subscription", PaymentProvider.STRIPE, PricingModel.SUBSCRIPTION),
        ("Stripe One-Time", PaymentProvider.STRIPE, PricingModel.ONE_TIME),
        ("PayPal One-Time", PaymentProvider.PAYPAL, PricingModel.ONE_TIME),
        ("Both Providers", PaymentProvider.BOTH, PricingModel.SUBSCRIPTION),
    ]

    total_lines = 0

    print("Code Generation Stats:\n")
    for name, provider, pricing in configs:
        config = PaymentConfig(provider=provider, pricing_model=pricing)

        result = generator.generate_payment_system(
            config=config,
            backend_framework=Framework.FASTAPI,
            frontend_framework=Framework.REACT,
        )

        backend_lines = len(result.backend_code.split("\n"))
        webhook_lines = len(result.webhook_code.split("\n"))
        frontend_lines = len(result.frontend_code.split("\n"))
        total = backend_lines + webhook_lines + frontend_lines
        total_lines += total

        print(f"  {name}:")
        print(f"    Backend: {backend_lines} lines")
        print(f"    Webhooks: {webhook_lines} lines")
        print(f"    Frontend: {frontend_lines} lines")
        print(f"    Total: {total} lines\n")

    print(f"📊 Overall Stats:")
    print(f"   Total Generated Lines: {total_lines}")
    print(f"   Average per Config: {total_lines // len(configs)}")
    print(f"   Supported Providers: 3 (Stripe, PayPal, Both)")
    print(f"   Supported Pricing Models: 4")
    print(f"   Backend Frameworks: 4 (FastAPI fully supported)")
    print(f"   Frontend Frameworks: 4 (React, Flutter fully supported)")


async def demo_webhook_examples():
    """Demo: Webhook Event Handling"""
    print_section("🔔 Webhook Event Handling")

    print("Stripe Webhook Events:\n")
    stripe_events = {
        "payment_intent.succeeded": "Payment completed successfully",
        "payment_intent.payment_failed": "Payment failed - notify customer",
        "customer.subscription.created": "New subscription - activate features",
        "customer.subscription.updated": "Subscription changed - update access",
        "customer.subscription.deleted": "Subscription canceled - revoke access",
        "invoice.payment_succeeded": "Invoice paid - send receipt",
        "invoice.payment_failed": "Invoice failed - notify customer",
    }

    for event, description in stripe_events.items():
        print(f"  ✓ {event}")
        print(f"     → {description}\n")

    print("PayPal Webhook Events:\n")
    paypal_events = {
        "PAYMENT.CAPTURE.COMPLETED": "Payment captured successfully",
        "PAYMENT.CAPTURE.DENIED": "Payment denied - notify customer",
        "CHECKOUT.ORDER.APPROVED": "Order approved by customer",
        "BILLING.SUBSCRIPTION.ACTIVATED": "Subscription activated",
        "BILLING.SUBSCRIPTION.CANCELLED": "Subscription cancelled",
    }

    for event, description in paypal_events.items():
        print(f"  ✓ {event}")
        print(f"     → {description}\n")


async def main():
    """Run all demos"""
    print("\n" + "=" * 80)
    print("  💳 PAYMENT GENERATOR DEMO")
    print("  Automatische Stripe & PayPal Integration")
    print("=" * 80)

    # Run demos
    await demo_stripe_subscription()
    await demo_paypal_one_time()
    await demo_flutter_stripe()
    await demo_both_providers()
    await demo_code_stats()
    await demo_webhook_examples()

    print_section("✅ Demo Complete!")
    print("Features demonstrated:")
    print("  ✓ Stripe subscription with trial")
    print("  ✓ PayPal one-time payment")
    print("  ✓ Flutter mobile app integration")
    print("  ✓ Multiple payment providers")
    print("  ✓ Code generation statistics")
    print("  ✓ Webhook event handling")
    print("\nReady to integrate payments into your app! 🚀")


if __name__ == "__main__":
    asyncio.run(main())
