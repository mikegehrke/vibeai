#!/usr/bin/env python3
"""
⭐ BLOCK A — KI-PREISDATENBANK
Global Model Pricing Table with Auto-Update
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional


class ModelSpeed(Enum):
    """Model speed categories"""

    VERY_FAST = "very_fast"
    FAST = "fast"
    MEDIUM = "medium"
    SLOW = "slow"


class ModelCapability(Enum):
    """Model capabilities"""

    TEXT = "text"
    CODE = "code"
    VISION = "vision"
    AUDIO = "audio"
    EMBEDDINGS = "embeddings"
    FUNCTION_CALLING = "function_calling"


@dataclass
class ModelPricing:
    """Model pricing information"""

    model_id: str
    provider: str
    input_price: float  # € per 1K tokens
    output_price: float  # € per 1K tokens
    speed: ModelSpeed
    quality: int  # 1-10
    capabilities: List[ModelCapability]
    context_window: int
    max_output: int
    last_updated: datetime


# -------------------------------------------------------------
# VIBEAI – GLOBAL MODEL PRICING TABLE
# Updated: December 3, 2025
# -------------------------------------------------------------

MODEL_PRICING = {
    # OpenAI Models
    "openai:gpt-5.1": {
        "provider": "openai",
        "input": 0.010,  # €/1K tokens
        "output": 0.030,
        "speed": ModelSpeed.FAST,
        "quality": 10,
        "capabilities": [
            ModelCapability.TEXT,
            ModelCapability.CODE,
            ModelCapability.VISION,
            ModelCapability.FUNCTION_CALLING,
        ],
        "context_window": 128000,
        "max_output": 16384,
        "description": "Latest GPT-5.1 - Best quality, reasoning",
    },
    "openai:gpt-5.1-mini": {
        "provider": "openai",
        "input": 0.002,
        "output": 0.004,
        "speed": ModelSpeed.VERY_FAST,
        "quality": 8,
        "capabilities": [
            ModelCapability.TEXT,
            ModelCapability.CODE,
            ModelCapability.FUNCTION_CALLING,
        ],
        "context_window": 128000,
        "max_output": 16384,
        "description": "Fast, affordable GPT-5 variant",
    },
    "openai:gpt-4o": {
        "provider": "openai",
        "input": 0.005,
        "output": 0.015,
        "speed": ModelSpeed.FAST,
        "quality": 9,
        "capabilities": [
            ModelCapability.TEXT,
            ModelCapability.CODE,
            ModelCapability.VISION,
            ModelCapability.FUNCTION_CALLING,
        ],
        "context_window": 128000,
        "max_output": 4096,
        "description": "GPT-4o - Optimized for speed",
    },
    "openai:gpt-4o-mini": {
        "provider": "openai",
        "input": 0.00015,
        "output": 0.0006,
        "speed": ModelSpeed.VERY_FAST,
        "quality": 7,
        "capabilities": [
            ModelCapability.TEXT,
            ModelCapability.CODE,
            ModelCapability.FUNCTION_CALLING,
        ],
        "context_window": 128000,
        "max_output": 16384,
        "description": "Most affordable OpenAI model",
    },
    # Anthropic Models
    "anthropic:claude-3.5-sonnet": {
        "provider": "anthropic",
        "input": 0.003,
        "output": 0.015,
        "speed": ModelSpeed.FAST,
        "quality": 10,
        "capabilities": [
            ModelCapability.TEXT,
            ModelCapability.CODE,
            ModelCapability.VISION,
        ],
        "context_window": 200000,
        "max_output": 8192,
        "description": "Claude 3.5 Sonnet - Best for code",
    },
    "anthropic:claude-3-opus": {
        "provider": "anthropic",
        "input": 0.015,
        "output": 0.075,
        "speed": ModelSpeed.MEDIUM,
        "quality": 10,
        "capabilities": [
            ModelCapability.TEXT,
            ModelCapability.CODE,
            ModelCapability.VISION,
        ],
        "context_window": 200000,
        "max_output": 4096,
        "description": "Most powerful Claude model",
    },
    "anthropic:claude-3-haiku": {
        "provider": "anthropic",
        "input": 0.00025,
        "output": 0.00125,
        "speed": ModelSpeed.VERY_FAST,
        "quality": 7,
        "capabilities": [ModelCapability.TEXT, ModelCapability.CODE],
        "context_window": 200000,
        "max_output": 4096,
        "description": "Fastest, cheapest Claude",
    },
    # Google Models
    "google:gemini-2.0-flash": {
        "provider": "google",
        "input": 0.0005,
        "output": 0.0015,
        "speed": ModelSpeed.VERY_FAST,
        "quality": 7,
        "capabilities": [
            ModelCapability.TEXT,
            ModelCapability.CODE,
            ModelCapability.VISION,
            ModelCapability.AUDIO,
        ],
        "context_window": 1000000,
        "max_output": 8192,
        "description": "Gemini 2.0 Flash - Ultra-fast",
    },
    "google:gemini-1.5-pro": {
        "provider": "google",
        "input": 0.00125,
        "output": 0.005,
        "speed": ModelSpeed.FAST,
        "quality": 9,
        "capabilities": [
            ModelCapability.TEXT,
            ModelCapability.CODE,
            ModelCapability.VISION,
            ModelCapability.AUDIO,
        ],
        "context_window": 2000000,
        "max_output": 8192,
        "description": "Gemini 1.5 Pro - Huge context",
    },
    # Meta/Llama Models (via Ollama/Groq)
    "ollama:llama3.2": {
        "provider": "ollama",
        "input": 0.0,
        "output": 0.0,
        "speed": ModelSpeed.MEDIUM,
        "quality": 6,
        "capabilities": [ModelCapability.TEXT, ModelCapability.CODE],
        "context_window": 8192,
        "max_output": 2048,
        "description": "Local Llama3.2 - Free",
    },
    "groq:llama3-70b": {
        "provider": "groq",
        "input": 0.00059,
        "output": 0.00079,
        "speed": ModelSpeed.VERY_FAST,
        "quality": 8,
        "capabilities": [ModelCapability.TEXT, ModelCapability.CODE],
        "context_window": 8192,
        "max_output": 8192,
        "description": "Groq Llama3-70B - Ultra-fast inference",
    },
    # Mistral Models
    "mistral:mixtral-8x7b": {
        "provider": "mistral",
        "input": 0.001,
        "output": 0.002,
        "speed": ModelSpeed.FAST,
        "quality": 7,
        "capabilities": [ModelCapability.TEXT, ModelCapability.CODE],
        "context_window": 32000,
        "max_output": 4096,
        "description": "Mixtral 8x7B - Good value",
    },
    "mistral:mistral-large": {
        "provider": "mistral",
        "input": 0.004,
        "output": 0.012,
        "speed": ModelSpeed.FAST,
        "quality": 9,
        "capabilities": [
            ModelCapability.TEXT,
            ModelCapability.CODE,
            ModelCapability.FUNCTION_CALLING,
        ],
        "context_window": 128000,
        "max_output": 4096,
        "description": "Mistral Large - Flagship model",
    },
    # Cohere Models
    "cohere:command-r-plus": {
        "provider": "cohere",
        "input": 0.003,
        "output": 0.015,
        "speed": ModelSpeed.FAST,
        "quality": 8,
        "capabilities": [ModelCapability.TEXT, ModelCapability.CODE],
        "context_window": 128000,
        "max_output": 4096,
        "description": "Cohere Command R+ - RAG optimized",
    },
    # DeepSeek Models
    "deepseek:deepseek-coder": {
        "provider": "deepseek",
        "input": 0.0002,
        "output": 0.0004,
        "speed": ModelSpeed.FAST,
        "quality": 8,
        "capabilities": [ModelCapability.CODE],
        "context_window": 16000,
        "max_output": 4096,
        "description": "DeepSeek Coder - Specialized for code",
    },
}

# Provider Status & Health
PROVIDER_STATUS = {
    "openai": {
        "status": "operational",
        "uptime": 99.9,
        "avg_latency_ms": 800,
        "rate_limit_rpm": 500,
        "rate_limit_tpm": 150000,
    },
    "anthropic": {
        "status": "operational",
        "uptime": 99.8,
        "avg_latency_ms": 1200,
        "rate_limit_rpm": 50,
        "rate_limit_tpm": 100000,
    },
    "google": {
        "status": "operational",
        "uptime": 99.7,
        "avg_latency_ms": 600,
        "rate_limit_rpm": 60,
        "rate_limit_tpm": 1000000,
    },
    "ollama": {
        "status": "operational",
        "uptime": 100.0,
        "avg_latency_ms": 2000,
        "rate_limit_rpm": 9999,
        "rate_limit_tpm": 9999999,
    },
    "groq": {
        "status": "operational",
        "uptime": 99.5,
        "avg_latency_ms": 400,
        "rate_limit_rpm": 30,
        "rate_limit_tpm": 14400,
    },
    "mistral": {
        "status": "operational",
        "uptime": 99.6,
        "avg_latency_ms": 900,
        "rate_limit_rpm": 60,
        "rate_limit_tpm": 100000,
    },
    "cohere": {
        "status": "operational",
        "uptime": 99.7,
        "avg_latency_ms": 850,
        "rate_limit_rpm": 100,
        "rate_limit_tpm": 100000,
    },
    "deepseek": {
        "status": "operational",
        "uptime": 99.4,
        "avg_latency_ms": 1100,
        "rate_limit_rpm": 60,
        "rate_limit_tpm": 100000,
    },
}


class PricingDatabase:
    """Global pricing database with auto-update"""

    def __init__(self):
        self.pricing = MODEL_PRICING
        self.provider_status = PROVIDER_STATUS
        self.last_update = datetime.now()

    def get_model_price(self, model_id: str) -> Optional[Dict]:
        """Get pricing for a specific model"""
        return self.pricing.get(model_id)

    def get_cheapest_model(self, quality_min: int = 5, capabilities: Optional[List[ModelCapability]] = None) -> str:
        """Find cheapest model meeting requirements"""

        candidates = []
        for model_id, data in self.pricing.items():
            # Check quality
            if data["quality"] < quality_min:
                continue

            # Check capabilities
            if capabilities:
                model_caps = set(data["capabilities"])
                required_caps = set(capabilities)
                if not required_caps.issubset(model_caps):
                    continue

            # Calculate avg cost (input + output)
            avg_cost = (data["input"] + data["output"]) / 2
            candidates.append((model_id, avg_cost))

        if not candidates:
            return "openai:gpt-4o-mini"  # Fallback

        # Return cheapest
        candidates.sort(key=lambda x: x[1])
        return candidates[0][0]

    def get_fastest_model(self, quality_min: int = 5, max_price: Optional[float] = None) -> str:
        """Find fastest model meeting requirements"""

        speed_ranking = {
            ModelSpeed.VERY_FAST: 4,
            ModelSpeed.FAST: 3,
            ModelSpeed.MEDIUM: 2,
            ModelSpeed.SLOW: 1,
        }

        candidates = []
        for model_id, data in self.pricing.items():
            # Check quality
            if data["quality"] < quality_min:
                continue

            # Check price
            if max_price:
                avg_cost = (data["input"] + data["output"]) / 2
                if avg_cost > max_price:
                    continue

            speed_score = speed_ranking.get(data["speed"], 0)
            candidates.append((model_id, speed_score))

        if not candidates:
            return "openai:gpt-4o-mini"

        # Return fastest
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[0][0]

    def get_best_quality_model(
        self,
        max_price: Optional[float] = None,
        capabilities: Optional[List[ModelCapability]] = None,
    ) -> str:
        """Find highest quality model meeting requirements"""

        candidates = []
        for model_id, data in self.pricing.items():
            # Check price
            if max_price:
                avg_cost = (data["input"] + data["output"]) / 2
                if avg_cost > max_price:
                    continue

            # Check capabilities
            if capabilities:
                model_caps = set(data["capabilities"])
                required_caps = set(capabilities)
                if not required_caps.issubset(model_caps):
                    continue

            candidates.append((model_id, data["quality"]))

        if not candidates:
            return "openai:gpt-4o"

        # Return highest quality
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[0][0]

    def calculate_cost(self, model_id: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost for a request"""

        pricing = self.get_model_price(model_id)
        if not pricing:
            return 0.0

        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (output_tokens / 1000) * pricing["output"]

        return input_cost + output_cost

    def get_provider_models(self, provider: str) -> List[str]:
        """Get all models from a provider"""
        return [model_id for model_id, data in self.pricing.items() if data["provider"] == provider]

    def get_available_providers(self) -> List[str]:
        """Get list of all providers"""
        return list(set(data["provider"] for data in self.pricing.values()))

    def is_provider_healthy(self, provider: str) -> bool:
        """Check if provider is operational"""
        status = self.provider_status.get(provider, {})
        return status.get("status") == "operational"

    def get_provider_latency(self, provider: str) -> int:
        """Get average latency for provider"""
        status = self.provider_status.get(provider, {})
        return status.get("avg_latency_ms", 9999)

    def update_provider_status(self, provider: str, status: str):
        """Update provider status"""
        if provider in self.provider_status:
            self.provider_status[provider]["status"] = status

    def get_model_stats(self, model_id: str) -> Dict:
        """Get comprehensive model statistics"""
        pricing = self.get_model_price(model_id)
        if not pricing:
            return {}

        provider = pricing["provider"]
        provider_stats = self.provider_status.get(provider, {})

        return {
            "model_id": model_id,
            "provider": provider,
            "pricing": {
                "input": pricing["input"],
                "output": pricing["output"],
                "avg": (pricing["input"] + pricing["output"]) / 2,
            },
            "performance": {
                "quality": pricing["quality"],
                "speed": pricing["speed"].value,
                "latency_ms": provider_stats.get("avg_latency_ms", 0),
            },
            "capabilities": [c.value for c in pricing["capabilities"]],
            "limits": {
                "context_window": pricing["context_window"],
                "max_output": pricing["max_output"],
            },
            "provider_status": {
                "operational": provider_stats.get("status") == "operational",
                "uptime": provider_stats.get("uptime", 0),
            },
        }


# Global instance
pricing_db = PricingDatabase()


# Helper functions
def get_model_price(model_id: str) -> Optional[Dict]:
    """Get model pricing"""
    return pricing_db.get_model_price(model_id)


def calculate_cost(model_id: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate request cost"""
    return pricing_db.calculate_cost(model_id, input_tokens, output_tokens)


def get_cheapest_model(**kwargs) -> str:
    """Get cheapest model"""
    return pricing_db.get_cheapest_model(**kwargs)


def get_best_quality_model(**kwargs) -> str:
    """Get best quality model"""
    return pricing_db.get_best_quality_model(**kwargs)


def get_fastest_model(**kwargs) -> str:
    """Get fastest model"""
    return pricing_db.get_fastest_model(**kwargs)


if __name__ == "__main__":
    # Demo
    print("🏷️ AI Model Pricing Database")
    print(f"Total Models: {len(MODEL_PRICING)}")
    print(f"Total Providers: {len(pricing_db.get_available_providers())}\n")

    print("💰 Cheapest Model (Quality ≥ 7):")
    cheapest = get_cheapest_model(quality_min=7)
    print(f"  {cheapest} - {MODEL_PRICING[cheapest]['description']}\n")

    print("🚀 Fastest Model (Quality ≥ 8):")
    fastest = get_fastest_model(quality_min=8)
    print(f"  {fastest} - {MODEL_PRICING[fastest]['description']}\n")

    print("🏆 Best Quality (Max €0.01/1K):")
    best = get_best_quality_model(max_price=0.01)
    print(f"  {best} - Quality: {MODEL_PRICING[best]['quality']}\n")

    print("📊 Cost Calculation (1M input, 100K output):")
    cost = calculate_cost("openai:gpt-5.1", 1000000, 100000)
    print(f"  GPT-5.1: €{cost:.2f}")
    cost = calculate_cost("anthropic:claude-3-haiku", 1000000, 100000)
    print(f"  Claude Haiku: €{cost:.2f}")
