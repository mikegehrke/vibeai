# ============================================================
# VIBEAI – PRICING RULES ENGINE (PRODUCTION 2025)
# ============================================================
# ✔ Multi-Provider Pricing (OpenAI/Claude/Gemini/Copilot/Ollama)
# ✔ Model-specific Pricing (GPT-5, o3, Claude 4, Gemini 2.0)
# ✔ Token-based Billing (Input/Output separated)
# ✔ Feature-based Pricing (Builder/Chat/Studio/Code)
# ✔ Dynamic Cost Calculation
# ✔ Cost Optimization (cheapest provider selection)
# ✔ Tier-based Discounts
# ============================================================

from typing import Dict, Tuple, Optional


# ============================================================
# MODEL PRICING (per 1M tokens)
# ============================================================
# Source: OpenAI, Anthropic, Google official pricing (Dec 2025)

MODEL_PRICING: Dict[str, Dict[str, float]] = {
    # ---------------------------------------------------------
    # OPENAI GPT MODELS
    # ---------------------------------------------------------
    "gpt-5": {"input": 15.00, "output": 60.00},
    "gpt-5.1": {"input": 12.00, "output": 48.00},
    "gpt-5-mini": {"input": 3.00, "output": 12.00},
    "gpt-5.1-mini": {"input": 2.50, "output": 10.00},
    
    "gpt-4.1": {"input": 8.00, "output": 32.00},
    "gpt-4.1-mini": {"input": 1.00, "output": 4.00},
    
    "gpt-4o": {"input": 5.00, "output": 15.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4o-2024-11-20": {"input": 2.50, "output": 10.00},
    
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-4": {"input": 30.00, "output": 60.00},
    
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    "gpt-3.5-turbo-16k": {"input": 3.00, "output": 4.00},
    
    # ---------------------------------------------------------
    # OPENAI O-SERIES (Reasoning)
    # ---------------------------------------------------------
    "o1": {"input": 15.00, "output": 60.00},
    "o1-preview": {"input": 15.00, "output": 60.00},
    "o1-mini": {"input": 3.00, "output": 12.00},
    "o3": {"input": 10.00, "output": 40.00},
    "o3-mini": {"input": 2.00, "output": 8.00},
    
    # ---------------------------------------------------------
    # ANTHROPIC CLAUDE
    # ---------------------------------------------------------
    "claude-4": {"input": 20.00, "output": 100.00},
    "claude-3.7-sonnet": {"input": 6.00, "output": 18.00},
    "claude-3.7-opus": {"input": 15.00, "output": 75.00},
    "claude-3.7-haiku": {"input": 0.25, "output": 1.00},
    "claude-3.5-sonnet-20241022": {"input": 3.00, "output": 15.00},
    "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25},
    "claude-3-opus": {"input": 15.00, "output": 75.00},
    
    # ---------------------------------------------------------
    # GOOGLE GEMINI
    # ---------------------------------------------------------
    "gemini-2.0-ultra": {"input": 5.00, "output": 20.00},
    "gemini-2.0-flash": {"input": 0.00, "output": 0.00},  # FREE (rate limited)
    "gemini-2.0-flash-exp": {"input": 0.00, "output": 0.00},
    "gemini-exp-1206": {"input": 0.00, "output": 0.00},
    "gemini-1.5-pro": {"input": 1.25, "output": 5.00},
    "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
    
    # ---------------------------------------------------------
    # GITHUB COPILOT MODELS (FREE via GitHub Models API)
    # ---------------------------------------------------------
    "copilot-gpt-4o": {"input": 0.00, "output": 0.00},
    "copilot-gpt-4o-mini": {"input": 0.00, "output": 0.00},
    "copilot-llama-3.1-405b": {"input": 0.00, "output": 0.00},
    "copilot-mistral-large": {"input": 0.00, "output": 0.00},
    
    # ---------------------------------------------------------
    # OLLAMA (Local Models - 0€ but compute costs)
    # ---------------------------------------------------------
    "ollama": {"input": 0.00, "output": 0.00},
    "llama3.1": {"input": 0.00, "output": 0.00},
    "qwen2.5-coder": {"input": 0.00, "output": 0.00},
    "phi3": {"input": 0.00, "output": 0.00},
    "deepseek-coder": {"input": 0.00, "output": 0.00},
    
    # ---------------------------------------------------------
    # EMBEDDINGS
    # ---------------------------------------------------------
    "text-embedding-3-small": {"input": 0.02, "output": 0.00},
    "text-embedding-3-large": {"input": 0.13, "output": 0.00},
    "text-embedding-ada-002": {"input": 0.10, "output": 0.00},
}


# ============================================================
# PROVIDER BASE COSTS (per request overhead)
# ============================================================
PROVIDER_BASE_COSTS = {
    "openai": 0.0001,      # Minimal overhead per request
    "anthropic": 0.0001,
    "google": 0.0000,      # Free tier exists
    "github": 0.0000,      # Free API
    "ollama": 0.0000,      # Local, no API cost
}


# ============================================================
# FEATURE PRICING
# ============================================================
FEATURE_PRICING = {
    # Chat
    "chat_message": 0.001,                    # Base cost per message
    "chat_with_vision": 0.005,                # Image analysis
    "chat_with_tools": 0.002,                 # Function calling
    
    # App Builder
    "builder_create_project": 0.10,           # New project creation
    "builder_generate_screen": 0.05,          # Screen generation
    "builder_generate_component": 0.02,       # Component generation
    "builder_preview": 0.01,                  # Live preview
    "builder_export": 0.05,                   # Export to ZIP
    
    # Code Studio
    "code_studio_file_edit": 0.01,            # Single file edit
    "code_studio_refactor": 0.05,             # Refactoring
    "code_studio_analyze": 0.03,              # Code analysis
    "code_studio_test_gen": 0.04,             # Test generation
    "code_studio_debug": 0.03,                # Debug assistance
    
    # App Studio
    "app_studio_ui_gen": 0.03,                # UI generation
    "app_studio_interaction": 0.02,           # Interaction design
    "app_studio_export": 0.05,                # Export design
    
    # Multi-Agent
    "agent_planning": 0.005,                  # Planner agent
    "agent_execution": 0.010,                 # Worker agent
    "agent_composition": 0.005,               # Composer agent
    "agent_reasoning": 0.015,                 # Advanced reasoning
}


# ============================================================
# TIER-BASED DISCOUNTS
# ============================================================
TIER_DISCOUNTS = {
    "free": 1.0,        # No discount
    "pro": 0.9,         # 10% discount
    "ultra": 0.8,       # 20% discount
    "enterprise": 0.7,  # 30% discount
}


# ============================================================
# COST CALCULATION FUNCTIONS
# ============================================================

def calculate_token_cost(
    model: str,
    input_tokens: int,
    output_tokens: int,
    provider: str = "openai"
) -> float:
    """
    Berechnet Kosten basierend auf Tokens.
    
    Args:
        model: Model name (gpt-5, claude-3.5-sonnet, etc.)
        input_tokens: Input token count
        output_tokens: Output token count
        provider: Provider name
    
    Returns:
        Cost in USD
    """
    # Normalisiere Model-Name
    model_key = normalize_model_name(model)
    
    # Get pricing
    pricing = MODEL_PRICING.get(model_key, MODEL_PRICING.get("gpt-4o-mini"))
    
    # Calculate token costs
    input_cost = (input_tokens / 1_000_000) * pricing["input"]
    output_cost = (output_tokens / 1_000_000) * pricing["output"]
    
    # Add provider overhead
    provider_overhead = PROVIDER_BASE_COSTS.get(provider, 0.0)
    
    total_cost = input_cost + output_cost + provider_overhead
    
    return round(total_cost, 6)


def calculate_feature_cost(feature: str, tier: str = "free") -> float:
    """
    Berechnet Feature-Kosten mit Tier-Discount.
    
    Args:
        feature: Feature name (builder_create_project, etc.)
        tier: User tier (free/pro/ultra/enterprise)
    
    Returns:
        Cost in USD
    """
    base_cost = FEATURE_PRICING.get(feature, 0.0)
    discount = TIER_DISCOUNTS.get(tier, 1.0)
    
    return round(base_cost * discount, 6)


def calculate_total_cost(
    model: str,
    input_tokens: int,
    output_tokens: int,
    features: list = None,
    tier: str = "free",
    provider: str = "openai"
) -> Dict[str, float]:
    """
    Berechnet Gesamtkosten (Tokens + Features).
    
    Returns:
        {
            "token_cost": float,
            "feature_cost": float,
            "total": float
        }
    """
    token_cost = calculate_token_cost(model, input_tokens, output_tokens, provider)
    
    feature_cost = 0.0
    if features:
        for feature in features:
            feature_cost += calculate_feature_cost(feature, tier)
    
    total = token_cost + feature_cost
    
    return {
        "token_cost": round(token_cost, 6),
        "feature_cost": round(feature_cost, 6),
        "total": round(total, 6),
        "breakdown": {
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "model": model,
            "provider": provider,
            "tier": tier,
            "discount": TIER_DISCOUNTS.get(tier, 1.0)
        }
    }


def normalize_model_name(model: str) -> str:
    """
    Normalisiert Model-Namen für Pricing Lookup.
    
    Examples:
        "gpt-5-2025-08-07" -> "gpt-5"
        "claude-3-5-sonnet-20241022" -> "claude-3.5-sonnet-20241022"
    """
    # Check exact match first
    if model in MODEL_PRICING:
        return model
    
    # Check prefixes
    for known_model in MODEL_PRICING.keys():
        if model.startswith(known_model):
            return known_model
    
    # Check patterns
    if "gpt-5" in model:
        return "gpt-5"
    elif "gpt-4.1" in model:
        return "gpt-4.1"
    elif "gpt-4o" in model:
        return "gpt-4o"
    elif "gpt-4" in model:
        return "gpt-4"
    elif "claude-4" in model:
        return "claude-4"
    elif "claude-3.7" in model or "claude-3-7" in model:
        if "sonnet" in model:
            return "claude-3.7-sonnet"
        elif "opus" in model:
            return "claude-3.7-opus"
        elif "haiku" in model:
            return "claude-3.7-haiku"
    elif "claude-3.5" in model or "claude-3-5" in model:
        return "claude-3.5-sonnet-20241022"
    elif "gemini-2.0" in model or "gemini-2-0" in model:
        if "ultra" in model:
            return "gemini-2.0-ultra"
        else:
            return "gemini-2.0-flash"
    elif "gemini-1.5" in model:
        if "pro" in model:
            return "gemini-1.5-pro"
        else:
            return "gemini-1.5-flash"
    elif "o3" in model:
        if "mini" in model:
            return "o3-mini"
        return "o3"
    elif "o1" in model:
        if "mini" in model:
            return "o1-mini"
        elif "preview" in model:
            return "o1-preview"
        return "o1"
    
    # Fallback to cheapest model
    return "gpt-4o-mini"


def get_cheapest_provider(
    input_tokens: int,
    output_tokens: int,
    available_providers: list = None
) -> Tuple[str, str, float]:
    """
    Findet den günstigsten Provider für gegebene Token-Anzahl.
    
    Args:
        input_tokens: Input token count
        output_tokens: Output token count
        available_providers: List of available provider names
    
    Returns:
        (provider, model, cost)
    """
    if available_providers is None:
        available_providers = ["openai", "anthropic", "google", "github", "ollama"]
    
    # Provider → Model Mapping (best/cheapest model per provider)
    provider_models = {
        "openai": "gpt-4o-mini",
        "anthropic": "claude-3-haiku-20240307",
        "google": "gemini-2.0-flash",
        "github": "copilot-gpt-4o",
        "ollama": "ollama"
    }
    
    costs = []
    for provider in available_providers:
        if provider in provider_models:
            model = provider_models[provider]
            cost = calculate_token_cost(model, input_tokens, output_tokens, provider)
            costs.append((provider, model, cost))
    
    # Sort by cost
    costs.sort(key=lambda x: x[2])
    
    return costs[0] if costs else ("openai", "gpt-4o-mini", 0.0)


def estimate_request_cost(
    prompt_length: int,
    expected_response_length: int,
    model: str = "gpt-4o",
    provider: str = "openai",
    features: list = None,
    tier: str = "free"
) -> Dict:
    """
    Schätzt Kosten basierend auf Text-Längen.
    
    Args:
        prompt_length: Length of prompt in characters
        expected_response_length: Expected response length in characters
        model: Model name
        provider: Provider name
        features: List of features used
        tier: User tier
    
    Returns:
        Cost breakdown dict
    """
    # Estimate tokens (rough: 1 token ≈ 4 characters)
    input_tokens = prompt_length // 4
    output_tokens = expected_response_length // 4
    
    return calculate_total_cost(
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        features=features,
        tier=tier,
        provider=provider
    )


# ============================================================
# PRICING INFO FUNCTIONS
# ============================================================

def get_model_info(model: str) -> Dict:
    """
    Gibt Pricing-Info für ein Modell zurück.
    """
    normalized = normalize_model_name(model)
    pricing = MODEL_PRICING.get(normalized, {"input": 0.0, "output": 0.0})
    
    return {
        "model": model,
        "normalized": normalized,
        "input_price_per_1m": pricing["input"],
        "output_price_per_1m": pricing["output"],
        "currency": "USD"
    }


def list_all_models() -> list:
    """
    Listet alle verfügbaren Modelle mit Pricing.
    """
    return [
        {
            "model": model,
            "input_price": pricing["input"],
            "output_price": pricing["output"]
        }
        for model, pricing in MODEL_PRICING.items()
    ]
