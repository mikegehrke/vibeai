# kernel/routing/model_capability_map.py
# ----------------------------------------
# Model Capability Map (Phase 1F)
#
# VISION:
# "250+ Modelle, jedes mit klaren Capabilities.
#  System wählt basierend auf Task + Requirements,
#  nicht auf Namen."
#
# STRUKTUR:
# - ModelMetadata: Metadaten pro Modell
# - MODEL_REGISTRY: Zentrale Registry aller Modelle
# - get_models_by_capability(): Selektion nach Capability
# - get_best_model_for_task(): Task-basierte Selektion

from typing import Dict, List, Set
from kernel.routing.model_router import (
    ModelMetadata,
    ModelCapability,
    TaskType,
    CostTier
)


# --------------------------------------------------
# MODEL REGISTRY (Phase 1F)
# --------------------------------------------------

MODEL_REGISTRY: Dict[str, ModelMetadata] = {
    
    # --------------------------------------------------
    # OPENAI
    # --------------------------------------------------
    
    "gpt-4o": ModelMetadata(
        name="gpt-4o",
        provider="openai",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.REASONING,
            ModelCapability.VISION,
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.STREAMING,
            ModelCapability.JSON_MODE,
            ModelCapability.MULTILINGUAL,
            ModelCapability.LONG_CONTEXT
        },
        cost_tier=CostTier.MEDIUM,
        context_window=128000,
        max_output=4096,
        latency_ms=1500,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.CODE_GENERATION, TaskType.CODE_REVIEW, TaskType.VISION, TaskType.DIALOG],
        notes="Bestes Allround-Modell. Multimodal, schnell, günstig."
    ),
    
    "gpt-4o-mini": ModelMetadata(
        name="gpt-4o-mini",
        provider="openai",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.SPEED,
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.STREAMING,
            ModelCapability.JSON_MODE,
            ModelCapability.MULTILINGUAL
        },
        cost_tier=CostTier.LOW,
        context_window=128000,
        max_output=4096,
        latency_ms=800,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.DIALOG, TaskType.DOCUMENTATION, TaskType.TRANSLATION],
        notes="Schnell & günstig. Gut für einfache Tasks."
    ),
    
    "o1": ModelMetadata(
        name="o1",
        provider="openai",
        capabilities={
            ModelCapability.REASONING,
            ModelCapability.CODE,
            ModelCapability.MATH
        },
        cost_tier=CostTier.HIGH,
        context_window=200000,
        max_output=100000,
        latency_ms=15000,
        supports_streaming=False,
        supports_function_calling=False,
        best_for=[TaskType.REASONING, TaskType.DEBUGGING, TaskType.PLANNING],
        notes="Reasoning-Modell. Langsam, aber sehr klug. Kein Streaming!"
    ),
    
    "o1-mini": ModelMetadata(
        name="o1-mini",
        provider="openai",
        capabilities={
            ModelCapability.REASONING,
            ModelCapability.CODE,
            ModelCapability.MATH,
            ModelCapability.SPEED
        },
        cost_tier=CostTier.MEDIUM,
        context_window=128000,
        max_output=65536,
        latency_ms=8000,
        supports_streaming=False,
        supports_function_calling=False,
        best_for=[TaskType.REASONING, TaskType.CODE_GENERATION],
        notes="Schnelleres o1. Gut für Code + Math."
    ),
    
    "gpt-4-turbo": ModelMetadata(
        name="gpt-4-turbo",
        provider="openai",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.REASONING,
            ModelCapability.VISION,
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.STREAMING,
            ModelCapability.JSON_MODE,
            ModelCapability.LONG_CONTEXT
        },
        cost_tier=CostTier.HIGH,
        context_window=128000,
        max_output=4096,
        latency_ms=2000,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.CODE_GENERATION, TaskType.ANALYSIS],
        notes="Vorgänger von gpt-4o. Immer noch sehr gut."
    ),
    
    # --------------------------------------------------
    # ANTHROPIC
    # --------------------------------------------------
    
    "claude-3-5-sonnet": ModelMetadata(
        name="claude-3-5-sonnet",
        provider="anthropic",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.REASONING,
            ModelCapability.VISION,
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.STREAMING,
            ModelCapability.LONG_CONTEXT,
            ModelCapability.MULTILINGUAL,
            ModelCapability.CREATIVE
        },
        cost_tier=CostTier.MEDIUM,
        context_window=200000,
        max_output=8192,
        latency_ms=1800,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.CODE_GENERATION, TaskType.CODE_REVIEW, TaskType.CREATIVE],
        notes="Bestes Code-Modell. Sehr präzise, lange Context."
    ),
    
    "claude-3-opus": ModelMetadata(
        name="claude-3-opus",
        provider="anthropic",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.REASONING,
            ModelCapability.VISION,
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.STREAMING,
            ModelCapability.LONG_CONTEXT,
            ModelCapability.CREATIVE,
            ModelCapability.MULTILINGUAL
        },
        cost_tier=CostTier.HIGH,
        context_window=200000,
        max_output=4096,
        latency_ms=3000,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.REASONING, TaskType.CREATIVE, TaskType.ANALYSIS],
        notes="Premium-Modell. Sehr klug, aber teuer."
    ),
    
    "claude-3-haiku": ModelMetadata(
        name="claude-3-haiku",
        provider="anthropic",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.SPEED,
            ModelCapability.STREAMING,
            ModelCapability.MULTILINGUAL
        },
        cost_tier=CostTier.LOW,
        context_window=200000,
        max_output=4096,
        latency_ms=700,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.DIALOG, TaskType.TRANSLATION],
        notes="Schnellstes Claude. Gut für einfache Tasks."
    ),
    
    # --------------------------------------------------
    # GOOGLE
    # --------------------------------------------------
    
    "gemini-2.0-flash": ModelMetadata(
        name="gemini-2.0-flash",
        provider="google",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.REASONING,
            ModelCapability.VISION,
            ModelCapability.MULTIMODAL,
            ModelCapability.SPEED,
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.STREAMING,
            ModelCapability.LONG_CONTEXT
        },
        cost_tier=CostTier.LOW,
        context_window=1000000,
        max_output=8192,
        latency_ms=900,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.CODE_GENERATION, TaskType.VISION, TaskType.ANALYSIS],
        notes="1M Context! Multimodal, sehr schnell."
    ),
    
    "gemini-1.5-pro": ModelMetadata(
        name="gemini-1.5-pro",
        provider="google",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.REASONING,
            ModelCapability.VISION,
            ModelCapability.MULTIMODAL,
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.STREAMING,
            ModelCapability.LONG_CONTEXT
        },
        cost_tier=CostTier.MEDIUM,
        context_window=2000000,
        max_output=8192,
        latency_ms=2000,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.CODE_REVIEW, TaskType.ANALYSIS, TaskType.VISION],
        notes="2M Context! Für sehr lange Inputs."
    ),
    
    # --------------------------------------------------
    # META
    # --------------------------------------------------
    
    "llama-3.3-70b": ModelMetadata(
        name="llama-3.3-70b",
        provider="meta",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.REASONING,
            ModelCapability.MULTILINGUAL,
            ModelCapability.STREAMING
        },
        cost_tier=CostTier.FREE,
        context_window=128000,
        max_output=4096,
        latency_ms=2500,
        supports_streaming=True,
        supports_function_calling=False,
        best_for=[TaskType.CODE_GENERATION, TaskType.DIALOG],
        notes="Open Source. Lokal via Ollama."
    ),
    
    # --------------------------------------------------
    # MISTRAL
    # --------------------------------------------------
    
    "mistral-large-2": ModelMetadata(
        name="mistral-large-2",
        provider="mistral",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.REASONING,
            ModelCapability.FUNCTION_CALLING,
            ModelCapability.STREAMING,
            ModelCapability.LONG_CONTEXT,
            ModelCapability.MULTILINGUAL
        },
        cost_tier=CostTier.MEDIUM,
        context_window=128000,
        max_output=4096,
        latency_ms=1500,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.CODE_GENERATION, TaskType.MULTILINGUAL],
        notes="Sehr gut für Französisch, Code."
    ),
    
    "codestral": ModelMetadata(
        name="codestral",
        provider="mistral",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.SPEED,
            ModelCapability.STREAMING
        },
        cost_tier=CostTier.LOW,
        context_window=32000,
        max_output=4096,
        latency_ms=800,
        supports_streaming=True,
        supports_function_calling=False,
        best_for=[TaskType.CODE_GENERATION],
        notes="Spezialist für Code. Sehr schnell."
    ),
    
    # --------------------------------------------------
    # DEEPSEEK
    # --------------------------------------------------
    
    "deepseek-chat": ModelMetadata(
        name="deepseek-chat",
        provider="deepseek",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.REASONING,
            ModelCapability.STREAMING,
            ModelCapability.LONG_CONTEXT
        },
        cost_tier=CostTier.LOW,
        context_window=64000,
        max_output=4096,
        latency_ms=1200,
        supports_streaming=True,
        supports_function_calling=True,
        best_for=[TaskType.CODE_GENERATION, TaskType.REASONING],
        notes="Sehr günstig, gute Code-Qualität."
    ),
    
    "deepseek-coder": ModelMetadata(
        name="deepseek-coder",
        provider="deepseek",
        capabilities={
            ModelCapability.CODE,
            ModelCapability.SPEED,
            ModelCapability.STREAMING
        },
        cost_tier=CostTier.FREE,
        context_window=16000,
        max_output=4096,
        latency_ms=900,
        supports_streaming=True,
        supports_function_calling=False,
        best_for=[TaskType.CODE_GENERATION],
        notes="Code-Spezialist. Open Source."
    ),
}


# --------------------------------------------------
# HELPER FUNCTIONS (Phase 1F)
# --------------------------------------------------

def get_models_by_capability(capability: ModelCapability) -> List[ModelMetadata]:
    """
    Findet alle Modelle mit bestimmter Capability.
    
    Args:
        capability: Gesuchte Capability
        
    Returns:
        Liste von Modellen mit dieser Capability
        
    Example:
        vision_models = get_models_by_capability(ModelCapability.VISION)
        # → [gpt-4o, claude-3-5-sonnet, gemini-2.0-flash, ...]
    """
    return [
        model for model in MODEL_REGISTRY.values()
        if capability in model.capabilities
    ]


def get_models_by_task(task_type: TaskType, max_cost: CostTier = CostTier.PREMIUM) -> List[ModelMetadata]:
    """
    Findet beste Modelle für Task-Type.
    
    Args:
        task_type: Art der Aufgabe
        max_cost: Maximale Kosten
        
    Returns:
        Liste von Modellen, sortiert nach Eignung
        
    Example:
        code_models = get_models_by_task(TaskType.CODE_GENERATION, max_cost=CostTier.MEDIUM)
        # → [claude-3-5-sonnet, gpt-4o, gemini-2.0-flash, ...]
    """
    # Filter: Task in best_for + unter Budget
    candidates = [
        model for model in MODEL_REGISTRY.values()
        if task_type in model.best_for and model.cost_tier.value <= max_cost.value
    ]
    
    # Sortieren: Kosten (niedrig → hoch), dann Latenz (niedrig → hoch)
    cost_order = {CostTier.FREE: 0, CostTier.LOW: 1, CostTier.MEDIUM: 2, CostTier.HIGH: 3, CostTier.PREMIUM: 4}
    candidates.sort(key=lambda m: (cost_order[m.cost_tier], m.latency_ms))
    
    return candidates


def get_best_model_for_task(
    task_type: TaskType,
    required_capabilities: Set[ModelCapability] = None,
    max_cost: CostTier = CostTier.PREMIUM,
    prefer_streaming: bool = False
) -> ModelMetadata:
    """
    Findet bestes Modell für Task + Requirements.
    
    Args:
        task_type: Art der Aufgabe
        required_capabilities: Benötigte Capabilities (optional)
        max_cost: Maximale Kosten
        prefer_streaming: Streaming bevorzugen
        
    Returns:
        Bestes Modell für diese Anforderungen
        
    Example:
        # Code mit Vision + Streaming
        model = get_best_model_for_task(
            TaskType.CODE_GENERATION,
            required_capabilities={ModelCapability.VISION, ModelCapability.STREAMING},
            max_cost=CostTier.MEDIUM,
            prefer_streaming=True
        )
        # → gpt-4o
    """
    # Filter nach Task
    candidates = get_models_by_task(task_type, max_cost)
    
    # Filter nach required capabilities
    if required_capabilities:
        candidates = [
            model for model in candidates
            if required_capabilities.issubset(model.capabilities)
        ]
    
    # Filter nach Streaming
    if prefer_streaming:
        candidates = [model for model in candidates if model.supports_streaming]
    
    # Fallback: Wenn keine Treffer, allgemeiner suchen
    if not candidates:
        candidates = [
            model for model in MODEL_REGISTRY.values()
            if model.cost_tier.value <= max_cost.value
        ]
        if required_capabilities:
            candidates = [
                model for model in candidates
                if required_capabilities.issubset(model.capabilities)
            ]
    
    # Bestes wählen (erstes = günstigstes + schnellstes)
    if candidates:
        return candidates[0]
    
    # Absoluter Fallback: gpt-4o-mini
    return MODEL_REGISTRY.get("gpt-4o-mini") or list(MODEL_REGISTRY.values())[0]


def get_all_providers() -> Set[str]:
    """Gibt alle verfügbaren Provider zurück."""
    return {model.provider for model in MODEL_REGISTRY.values()}


def get_models_by_provider(provider: str) -> List[ModelMetadata]:
    """Gibt alle Modelle eines Providers zurück."""
    return [model for model in MODEL_REGISTRY.values() if model.provider == provider]


def get_model_stats() -> Dict[str, any]:
    """
    Gibt Statistiken über Model Registry zurück.
    
    Returns:
        Dict mit Stats (total_models, providers, capabilities, etc.)
    """
    all_caps = set()
    for model in MODEL_REGISTRY.values():
        all_caps.update(model.capabilities)
    
    return {
        "total_models": len(MODEL_REGISTRY),
        "providers": list(get_all_providers()),
        "capabilities": [cap.value for cap in all_caps],
        "cost_tiers": {
            "free": len([m for m in MODEL_REGISTRY.values() if m.cost_tier == CostTier.FREE]),
            "low": len([m for m in MODEL_REGISTRY.values() if m.cost_tier == CostTier.LOW]),
            "medium": len([m for m in MODEL_REGISTRY.values() if m.cost_tier == CostTier.MEDIUM]),
            "high": len([m for m in MODEL_REGISTRY.values() if m.cost_tier == CostTier.HIGH]),
            "premium": len([m for m in MODEL_REGISTRY.values() if m.cost_tier == CostTier.PREMIUM]),
        }
    }
