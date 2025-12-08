#!/usr/bin/env python3
"""
⭐ BLOCK E — FALLBACK SYSTEM
Automatic provider switching when one is down
"""

import time
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

from ai.pricing.pricing_table import PROVIDER_STATUS


class ProviderHealth(Enum):
    """Provider health status"""

    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    DOWN = "down"
    UNKNOWN = "unknown"


@dataclass
class ProviderStatus:
    """Provider status tracking"""

    provider: str
    health: ProviderHealth
    last_check: datetime
    consecutive_failures: int
    last_error: Optional[str] = None
    avg_latency_ms: Optional[int] = None


class FallbackSystem:
    """Automatic provider fallback with circuit breaker pattern"""

    def __init__(self):
        self.provider_status: Dict[str, ProviderStatus] = {}
        self.fallback_chain = ["openai", "anthropic", "google", "groq", "ollama"]
        self.circuit_breaker_threshold = 3  # Failures before marking as down
        self.circuit_breaker_timeout = 300  # Seconds before retry
        self._init_provider_status()

    def _init_provider_status(self):
        """Initialize provider status from pricing table"""

        for provider, status in PROVIDER_STATUS.items():
            self.provider_status[provider] = ProviderStatus(
                provider=provider,
                health=(ProviderHealth.OPERATIONAL if status["status"] == "operational" else ProviderHealth.UNKNOWN),
                last_check=datetime.now(),
                consecutive_failures=0,
                avg_latency_ms=status.get("avg_latency_ms"),
            )

    def call_with_fallback(self, model_id: str, prompt: str, call_fn: Callable, max_retries: int = 3) -> Dict[str, Any]:
        """
        Call model with automatic fallback

        Args:
            model_id: Model to call (e.g., "openai:gpt-4o")
            prompt: Prompt to send
            call_fn: Function to call the model
            max_retries: Max retry attempts per provider

        Returns:
            Dict with result and metadata
        """

        provider, model = self._parse_model_id(model_id)

        # Try primary model
        result = self._try_provider(provider, model_id, prompt, call_fn, max_retries)
        if result["success"]:
            return result

        # Try fallback chain
        for fallback_provider in self.fallback_chain:
            if fallback_provider == provider:
                continue  # Skip original provider

            # Check if provider is healthy
            if not self.is_provider_healthy(fallback_provider):
                continue

            # Find suitable model from this provider
            fallback_model = self._get_fallback_model(fallback_provider, model_id)
            if not fallback_model:
                continue

            result = self._try_provider(fallback_provider, fallback_model, prompt, call_fn, max_retries)

            if result["success"]:
                result["fallback_used"] = True
                result["original_model"] = model_id
                return result

        # All providers failed
        return {
            "success": False,
            "error": "All providers failed",
            "model_used": None,
            "fallback_used": False,
            "attempts": len(self.fallback_chain),
        }

    def _try_provider(
        self,
        provider: str,
        model_id: str,
        prompt: str,
        call_fn: Callable,
        max_retries: int,
    ) -> Dict[str, Any]:
        """Try calling a specific provider"""

        for attempt in range(max_retries):
            try:
                start_time = time.time()

                # Call the model
                result = call_fn(model_id, prompt)

                latency_ms = int((time.time() - start_time) * 1000)

                # Success - update status
                self._record_success(provider, latency_ms)

                return {
                    "success": True,
                    "result": result,
                    "model_used": model_id,
                    "provider": provider,
                    "latency_ms": latency_ms,
                    "attempts": attempt + 1,
                    "fallback_used": False,
                }

            except Exception as e:
                # Record failure
                self._record_failure(provider, str(e))

                if attempt < max_retries - 1:
                    time.sleep(0.5 * (attempt + 1))  # Exponential backoff
                    continue

        # All retries failed
        return {
            "success": False,
            "error": f"Provider {provider} failed after {max_retries} attempts",
            "model_used": model_id,
            "provider": provider,
            "attempts": max_retries,
            "fallback_used": False,
        }

    def _record_success(self, provider: str, latency_ms: int):
        """Record successful provider call"""

        if provider not in self.provider_status:
            self.provider_status[provider] = ProviderStatus(
                provider=provider,
                health=ProviderHealth.OPERATIONAL,
                last_check=datetime.now(),
                consecutive_failures=0,
            )

        status = self.provider_status[provider]
        status.health = ProviderHealth.OPERATIONAL
        status.consecutive_failures = 0
        status.last_check = datetime.now()
        status.last_error = None

        # Update average latency
        if status.avg_latency_ms is None:
            status.avg_latency_ms = latency_ms
        else:
            # Exponential moving average
            status.avg_latency_ms = int(status.avg_latency_ms * 0.7 + latency_ms * 0.3)

    def _record_failure(self, provider: str, error: str):
        """Record provider failure"""

        if provider not in self.provider_status:
            self.provider_status[provider] = ProviderStatus(
                provider=provider,
                health=ProviderHealth.UNKNOWN,
                last_check=datetime.now(),
                consecutive_failures=0,
            )

        status = self.provider_status[provider]
        status.consecutive_failures += 1
        status.last_check = datetime.now()
        status.last_error = error

        # Update health status
        if status.consecutive_failures >= self.circuit_breaker_threshold:
            status.health = ProviderHealth.DOWN
        elif status.consecutive_failures > 0:
            status.health = ProviderHealth.DEGRADED

    def is_provider_healthy(self, provider: str) -> bool:
        """Check if provider is healthy"""

        if provider not in self.provider_status:
            return True  # Unknown = assume healthy

        status = self.provider_status[provider]

        # Check if circuit breaker should reset
        if status.health == ProviderHealth.DOWN:
            time_since_last_check = (datetime.now() - status.last_check).total_seconds()
            if time_since_last_check > self.circuit_breaker_timeout:
                # Reset circuit breaker
                status.health = ProviderHealth.DEGRADED
                status.consecutive_failures = 0
                return True
            return False

        return status.health in [ProviderHealth.OPERATIONAL, ProviderHealth.DEGRADED]

    def get_provider_status(self, provider: str) -> Optional[Dict[str, Any]]:
        """Get provider status"""

        if provider not in self.provider_status:
            return None

        status = self.provider_status[provider]

        return {
            "provider": provider,
            "health": status.health.value,
            "consecutive_failures": status.consecutive_failures,
            "last_check": status.last_check.isoformat(),
            "last_error": status.last_error,
            "avg_latency_ms": status.avg_latency_ms,
        }

    def get_all_provider_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status for all providers"""

        return {provider: self.get_provider_status(provider) for provider in self.provider_status.keys()}

    def set_fallback_chain(self, providers: List[str]):
        """Set custom fallback chain"""
        self.fallback_chain = providers

    def get_fallback_chain(self) -> List[str]:
        """Get current fallback chain"""
        return self.fallback_chain.copy()

    def _parse_model_id(self, model_id: str) -> tuple:
        """Parse model_id into provider and model"""
        parts = model_id.split(":", 1)
        if len(parts) == 2:
            return parts[0], parts[1]
        return "unknown", model_id

    def _get_fallback_model(self, provider: str, original_model_id: str) -> Optional[str]:
        """Get suitable fallback model from provider"""

        from ai.pricing.pricing_table import MODEL_PRICING

        # Get original model info
        original_info = MODEL_PRICING.get(original_model_id)
        if not original_info:
            # Default fallback models per provider
            defaults = {
                "openai": "openai:gpt-4o",
                "anthropic": "anthropic:claude-3.5-sonnet",
                "google": "google:gemini-2.0-flash",
                "groq": "groq:llama3-70b",
                "ollama": "ollama:llama3.2",
            }
            return defaults.get(provider)

        # Find model from same provider with similar quality
        target_quality = original_info["quality"]
        provider_models = []

        for model_id, info in MODEL_PRICING.items():
            if info["provider"] == provider:
                quality_diff = abs(info["quality"] - target_quality)
                provider_models.append((model_id, quality_diff))

        if not provider_models:
            return None

        # Sort by quality difference (closest match first)
        provider_models.sort(key=lambda x: x[1])

        return provider_models[0][0]


# Global instance
fallback_system = FallbackSystem()


# Helper functions
def call_with_fallback(model_id: str, prompt: str, call_fn: Callable, max_retries: int = 3) -> Dict[str, Any]:
    """Call model with fallback"""
    return fallback_system.call_with_fallback(model_id, prompt, call_fn, max_retries)


def is_provider_healthy(provider: str) -> bool:
    """Check provider health"""
    return fallback_system.is_provider_healthy(provider)


def get_provider_status(provider: str) -> Optional[Dict[str, Any]]:
    """Get provider status"""
    return fallback_system.get_provider_status(provider)


if __name__ == "__main__":
    # Demo
    print("🔄 Fallback System Demo\n")

    print("1. All Provider Status:")
    all_status = fallback_system.get_all_provider_status()
    for provider, status in all_status.items():
        if status:
            print(f"   {provider}: {status['health']} (failures: {status['consecutive_failures']})")

    print("\n2. Fallback Chain:")
    chain = fallback_system.get_fallback_chain()
    print(f"   {' → '.join(chain)}")

    print("\n3. Provider Health Check:")
    for provider in ["openai", "anthropic", "google", "ollama"]:
        healthy = fallback_system.is_provider_healthy(provider)
        print(f"   {provider}: {'✅ Healthy' if healthy else '❌ Down'}")

    print("\n4. Simulate failure and recovery:")
    # Simulate 3 failures
    for i in range(3):
        fallback_system._record_failure("test_provider", "Connection timeout")

    status = fallback_system.get_provider_status("test_provider")
    print(f"   After 3 failures: {status['health']}")

    # Simulate success
    fallback_system._record_success("test_provider", 500)
    status = fallback_system.get_provider_status("test_provider")
    print(f"   After success: {status['health']}")
