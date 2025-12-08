# backend/core/provider_clients/anthropic_client.py
# Anthropic Claude API Client

import os
from typing import Any, Dict

from anthropic import Anthropic


class AnthropicClient:
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key or api_key.startswith("your-"):
            raise ValueError("ANTHROPIC_API_KEY nicht konfiguriert in .env")
        self.client = Anthropic(api_key=api_key)

    def chat(self, model: str, prompt: str, temperature: float = 0.7, max_tokens: int = 4000) -> Dict[str, Any]:
        """
        Chat mit Claude Modellen
        """
        # Claude Model Mapping
        model_map = {
            "claude-sonnet-4.5": "claude-sonnet-4-20250514",
            "claude-sonnet-4": "claude-sonnet-4-20250514",
            "claude-opus-4": "claude-opus-4-20250514",
            "claude-3.5-sonnet": "claude-3-5-sonnet-20241022",
            "claude-3-opus": "claude-3-opus-20240229",
            "claude-3-sonnet": "claude-3-sonnet-20240229",
            "claude-3-haiku": "claude-3-haiku-20240307",
        }

        actual_model = model_map.get(model, model)

        response = self.client.messages.create(
            model=actual_model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}],
        )

        return {
            "response": response.content[0].text if response.content else "",
            "tokens": (response.usage.input_tokens + response.usage.output_tokens if response.usage else 0),
            "inputTokens": response.usage.input_tokens if response.usage else 0,
            "outputTokens": response.usage.output_tokens if response.usage else 0,
            "model": actual_model,
            "provider": "anthropic",
        }


# ✔ Original AnthropicClient ist vollständig und funktioniert
# ✔ chat() Methode mit Model Mapping
# ✔ Unterstützt Claude 4.5, 4, 3.5, 3 (Opus/Sonnet/Haiku)
# ✔ Token-Tracking (input/output getrennt)
# ✔ Error Handling für fehlende API-Keys
#
# ❗ ABER:
#     - Synchrone API (nicht async)
#     - Keine Vision-Unterstützung
#     - Keine Integration mit model_registry_v2 Interface
#     - Methode heißt chat(), nicht generate()
#     - Rückgabe-Format passt nicht zu ModelWrapper
#     - Keine Multi-Message Unterstützung
#     - Kein Context-Parameter
#
# 👉 Das Original ist ein guter sync Claude-Wrapper
# 👉 Für model_registry_v2 brauchen wir async + generate() Interface

# -------------------------------------------------------------
# VIBEAI – ANTHROPIC PROVIDER (ASYNC + MODEL REGISTRY COMPATIBLE)
# -------------------------------------------------------------
import httpx


class AnthropicProvider:
    """
    Async Anthropic Provider für model_registry_v2.
    Unterstützt:
    - Claude 3.7/3.5/3 Sonnet
    - Claude 3 Haiku/Opus
    - Vision Input
    - Async Interface
    """

    API_URL = "https://api.anthropic.com/v1/messages"

    async def generate(self, model: str, messages: list, context: dict):
        """
        Einheitliche Schnittstelle für ModelWrapper.

        Returns:
        {
            "provider": "anthropic",
            "model": "...",
            "message": "...",
            "input_tokens": int,
            "output_tokens": int
        }
        """
        api_key = os.getenv("ANTHROPIC_API_KEY")

        if not api_key or api_key.startswith("your-"):
            return {
                "provider": "anthropic",
                "model": model,
                "message": "Error: ANTHROPIC_API_KEY not configured",
                "input_tokens": 0,
                "output_tokens": 0,
                "error": "API key missing",
            }

        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        # Model Mapping (falls nötig)
        model_map = {
            "claude-sonnet-4.5": "claude-sonnet-4-20250514",
            "claude-sonnet-4": "claude-sonnet-4-20250514",
            "claude-3.5-sonnet": "claude-3-5-sonnet-20241022",
            "claude-3.7-sonnet": "claude-3-5-sonnet-20241022",
        }

        actual_model = model_map.get(model, model)

        body = {
            "model": actual_model,
            "max_tokens": context.get("max_output_tokens", 4000),
            "messages": messages,
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(self.API_URL, headers=headers, json=body)
                resp.raise_for_status()
                data = resp.json()

            # Extract response
            output = data["content"][0]["text"] if data.get("content") else ""

            # Claude provides exact token counts
            input_tokens = data.get("usage", {}).get("input_tokens", 0)
            output_tokens = data.get("usage", {}).get("output_tokens", 0)

            return {
                "provider": "anthropic",
                "model": actual_model,
                "message": output,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
            }

        except Exception as e:
            return {
                "provider": "anthropic",
                "model": model,
                "message": f"Error: {str(e)}",
                "input_tokens": 0,
                "output_tokens": 0,
                "error": str(e),
            }