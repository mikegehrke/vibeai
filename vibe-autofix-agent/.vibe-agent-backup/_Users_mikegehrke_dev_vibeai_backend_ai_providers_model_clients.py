#!/usr/bin/env python3
"""
VIBEAI – PROVIDER FALLBACK CLIENT
Unified interface for all AI providers with automatic fallback
"""

import os
from typing import Any, Dict

# Provider clients
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    import anthropic
except ImportError:
    anthropic = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

import subprocess

from ai.fallback.fallback_system import fallback_system


def call_model(model_id: str, prompt: str, max_retries: int = 3) -> str:
    """
    Call any AI model with automatic fallback

    Args:
        model_id: Model identifier (e.g., "openai:gpt-4o")
        prompt: Input prompt
        max_retries: Max retry attempts

    Returns:
        Model response as string
    """

    def _call_fn(model_id: str, prompt: str) -> str:
        """Internal call function"""

        provider, model_name = model_id.split(":", 1) if ":" in model_id else ("unknown", model_id)

        # OpenAI
        if provider == "openai":
            if not OpenAI:
                raise ImportError("OpenAI library not installed")

            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = client.chat.completions.create(model=model_name, messages=[{"role": "user", "content": prompt}])
            return response.choices[0].message.content

        # Anthropic
        elif provider == "anthropic":
            if not anthropic:
                raise ImportError("Anthropic library not installed")

            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            message = client.messages.create(
                model=model_name,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
            )
            return message.content[0].text

        # Google
        elif provider == "google":
            if not genai:
                raise ImportError("Google Generative AI library not installed")

            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return response.text

        # Groq
        elif provider == "groq":
            if not OpenAI:
                raise ImportError("OpenAI library not installed (used for Groq)")

            client = OpenAI(
                api_key=os.getenv("GROQ_API_KEY"),
                base_url="https://api.groq.com/openai/v1",
            )
            response = client.chat.completions.create(model=model_name, messages=[{"role": "user", "content": prompt}])
            return response.choices[0].message.content

        # Ollama (local)
        elif provider == "ollama":
            try:
                result = subprocess.run(
                    ["ollama", "run", model_name, prompt],
                    capture_output=True,
                    text=True,
                    timeout=30,
                )

                if result.returncode == 0:
                    return result.stdout.strip()
                else:
                    raise Exception(f"Ollama error: {result.stderr}")

            except subprocess.TimeoutExpired:
                raise Exception("Ollama timeout")
            except FileNotFoundError:
                raise Exception("Ollama not installed")

        else:
            raise ValueError(f"Unknown provider: {provider}")

    # Use fallback system
    result = fallback_system.call_with_fallback(
        model_id=model_id, prompt=prompt, call_fn=_call_fn, max_retries=max_retries
    )

    if result["success"]:
        return result["result"]
    else:
        raise Exception(result.get("error", "All providers failed"))


def call_model_with_metadata(model_id: str, prompt: str, max_retries: int = 3) -> Dict[str, Any]:
    """
    Call model and return full metadata

    Returns:
        Dict with 'result', 'model_used', 'latency_ms', 'fallback_used', etc.
    """

    def _call_fn(model_id: str, prompt: str) -> str:
        return call_model(model_id, prompt, max_retries=1)

    return fallback_system.call_with_fallback(
        model_id=model_id, prompt=prompt, call_fn=_call_fn, max_retries=max_retries
    )


if __name__ == "__main__":
    # Demo
    print("🤖 Provider Client Demo\n")

    print("Available providers:")
    print(f"  OpenAI: {'✅' if OpenAI else '❌'}")
    print(f"  Anthropic: {'✅' if anthropic else '❌'}")
    print(f"  Google: {'✅' if genai else '❌'}")
    print(f"  Ollama: {'✅' if subprocess.run(['which', 'ollama'], capture_output=True).returncode == 0 else '❌'}")

    print("\nFallback chain:")
    print(f"  {' → '.join(fallback_system.get_fallback_chain())}")

    print("\nProvider status:")
    status = fallback_system.get_all_provider_status()
    for provider, info in status.items():
        if info:
            print(f"  {provider}: {info['health']}")


# ========== MODEL CLIENT CLASS ==========
class ModelClient:
    """Unified model client for all providers"""

    def __init__(self, provider: str = "auto"):
        self.provider = provider

    async def generate(self, prompt: str, model: str = None) -> str:
        """Generate response from model"""
        model_id = f"{self.provider}:{model}" if model else self.provider
        return call_model(model_id, prompt)

    def call(self, prompt: str, model: str = None) -> str:
        """Synchronous call"""
        model_id = f"{self.provider}:{model}" if model else self.provider
        return call_model(model_id, prompt)
