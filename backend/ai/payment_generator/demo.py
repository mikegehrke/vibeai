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
    print(f"