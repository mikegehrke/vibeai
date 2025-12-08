"""
Fallback system module
"""

from .fallback_system import (
    FallbackSystem,
    ProviderHealth,
    ProviderStatus,
    call_with_fallback,
    fallback_system,
    get_provider_status,
    is_provider_healthy,
)

__all__ = [
    "fallback_system",
    "FallbackSystem",
    "ProviderHealth",
    "ProviderStatus",
    "call_with_fallback",
    "is_provider_healthy",
    "get_provider_status",
]
