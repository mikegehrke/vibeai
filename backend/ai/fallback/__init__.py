"""
Fallback system module
"""

from .fallback_system import (
    fallback_system,
    FallbackSystem,
    ProviderHealth,
    ProviderStatus,
    call_with_fallback,
    is_provider_healthy,
    get_provider_status
)

__all__ = [
    'fallback_system',
    'FallbackSystem',
    'ProviderHealth',
    'ProviderStatus',
    'call_with_fallback',
    'is_provider_healthy',
    'get_provider_status'
]
