def calculate_cost(tokens_used: int, model: str) -> float:
    # simple cost calculation based on model
    model_rates = {
        "gpt-4o": 0.000006,
        "gpt-4.1": 0.000005,
        "gpt-4.1-mini": 0.0000005,
        "claude-3.5-sonnet": 0.000004,
        "claude-3-haiku": 0.000002,
        "llama-3.1": 0.000001,
    }

    rate = model_rates.get(model, 0.000001)
    return tokens_used * rate


# -------------------------------------------------------------
# VIBEAI – UNIFIED COST CALCULATOR (GPT / CLAUDE / GEMINI / COPILOT / OLLAMA)
# -------------------------------------------------------------
from typing import Tuple

# Preise pro 1 Token (umgerechnet auf realistische value rates)
MODEL_COSTS = {
    # -------------------------------
    # OpenAI – GPT models
    # -------------------------------
    "gpt-4o": (0.000005, 0.000015),         # (input, output)
    "gpt-4.1": (0.000004, 0.000012),
    "gpt-4.1-mini": (0.0000004, 0.0000005),
    "gpt-o3": (0.000008, 0.000020),

    # -------------------------------
    # Anthropic – Claude models
    # -------------------------------
    "claude-3.7-sonnet": (0.0000035, 0.000008),
    "claude-3.5-sonnet": (0.0000030, 0.000007),
    "claude-3-haiku": (0.0000010, 0.0000025),

    # -------------------------------
    # Google – Gemini models
    # -------------------------------
    "gemini-2.0-ultra": (0.0000045, 0.000010),
    "gemini-2.0-flash": (0.00000015, 0.00000030),

    # -------------------------------
    # GitHub Copilot Models (flat-rate / pseudo cost)
    # -------------------------------
    "copilot-gpt4": (0.0000005, 0.0000005),
    "copilot-editor": (0.0000002, 0.0000002),

    # -------------------------------
    # Ollama – Local models (0 cost)
    # -------------------------------
    "llama-3.1": (0, 0),
    "mixtral": (0, 0),
    "phi3": (0, 0),
    "neural-chat": (0, 0),
    "qwen2.5-coder:7b": (0, 0),

    # -------------------------------
    # VibeAI internal agents (tools)
    # -------------------------------
    "builder": (0.000001, 0.000002),
    "code-agent": (0.000001, 0.000003),
    "planner": (0.0000005, 0.000001),
    "composer": (0.0000008, 0.0000015),
}


def get_cost_rates(model: str) -> Tuple[float, float]:
    """
    Liefert (input_rate, output_rate).
    Fallback: safest default.
    """
    return MODEL_COSTS.get(model, (0.000001, 0.000002))


def calculate_cost_v2(model: str, input_tokens: int, output_tokens: int) -> float:
    """
    Realistische Kostenberechnung unter Berücksichtigung von:
    - verschiedenen Token-Kosten (Input/Output)
    - Anbieter (GPT/Claude/Gemini/Copilot/Ollama)
    - umfangreicher Fallback-Regel
    """
    in_rate, out_rate = get_cost_rates(model)

    return round(
        (input_tokens * in_rate) + (output_tokens * out_rate),
        6
    )


def calculate_total_cost(model: str, input_tokens: int, output_tokens: int) -> dict:
    """
    Erweiterte Version mit Details
    """
    in_rate, out_rate = get_cost_rates(model)
    input_cost = input_tokens * in_rate
    output_cost = output_tokens * out_rate
    total = input_cost + output_cost

    return {
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": input_tokens + output_tokens,
        "input_cost_usd": round(input_cost, 6),
        "output_cost_usd": round(output_cost, 6),
        "total_cost_usd": round(total, 6),
        "provider": get_provider_from_model(model)
    }


def get_provider_from_model(model: str) -> str:
    """
    Bestimmt Provider basierend auf Model-Name
    """
    if "gpt" in model or "o3" in model:
        return "openai"
    elif "claude" in model:
        return "anthropic"
    elif "gemini" in model:
        return "google"
    elif "copilot" in model:
        return "github"
    elif any(x in model for x in ["llama", "mixtral", "phi", "qwen", "neural"]):
        return "ollama"
    elif any(x in model for x in ["builder", "code-agent", "planner", "composer"]):
        return "vibeai-internal"
    else:
        return "unknown"
