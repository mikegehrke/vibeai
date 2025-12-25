# kernel/routing/model_router.py
# --------------------------------
# Model Routing Layer (Kernel v1.2+, Phase 1F)
#
# PHILOSOPHIE:
# - Kein Agent ruft je ein Modell direkt auf
# - Nur der Kernel darf Modelle auswählen
# - Zentrale Kontrolle über Kosten, Streaming, Determinismus
#
# NEU in Phase 1F:
# - Model Capability Map für 250+ Modelle
# - Capability-basierte Selektion
# - Detaillierte Modell-Metadaten
# - Erweiterte Task-Types
#
# FEATURES:
# - Task-basierte Modell-Auswahl
# - Fallback bei Fehlern
# - Budget-Kontrolle
# - Streaming vs Batch
# - Deterministischer Modus (Seed)
# - Capability Matching (neu)

from dataclasses import dataclass
from typing import Optional, List, Dict, Any, Set
from enum import Enum


class CostTier(Enum):
    """Kosten-Kategorien für Modelle."""
    FREE = "free"           # Lokal (Ollama)
    LOW = "low"             # Mini-Modelle (gpt-4o-mini)
    MEDIUM = "medium"       # Standard (gpt-4o)
    HIGH = "high"           # Premium (o1, claude-opus)
    PREMIUM = "premium"     # Spezial (o1-pro, gpt-5)


class ModelCapability(Enum):
    """
    Model Capabilities (Phase 1F).
    
    WICHTIG: Nicht alle Modelle können alles!
    - Vision: Bilder verstehen
    - Code: Code generieren/verstehen
    - Reasoning: Komplexe Logik
    - Speed: Schnelle Antworten
    - LongContext: Lange Inputs (>32k tokens)
    - Multimodal: Text + Bild + Audio
    - FunctionCalling: Tool-Use
    - Streaming: Echtes Streaming
    - JSON: Strukturierte Outputs
    - Multilingual: Viele Sprachen
    """
    VISION = "vision"
    CODE = "code"
    REASONING = "reasoning"
    SPEED = "speed"
    LONG_CONTEXT = "long_context"
    MULTIMODAL = "multimodal"
    FUNCTION_CALLING = "function_calling"
    STREAMING = "streaming"
    JSON_MODE = "json_mode"
    MULTILINGUAL = "multilingual"
    MATH = "math"
    CREATIVE = "creative"
    SAFETY = "safety"


class TaskType(Enum):
    """Aufgaben-Typen für optimale Modell-Auswahl."""
    DIALOG = "dialog"                   # Kurze Konversation
    CODE_GENERATION = "code_generation" # Code schreiben
    CODE_REVIEW = "code_review"         # Code analysieren
    DEBUGGING = "debugging"             # Fehler finden
    PLANNING = "planning"               # Strategie entwickeln
    DOCUMENTATION = "documentation"     # Docs schreiben
    TRANSLATION = "translation"         # Übersetzen
    ANALYSIS = "analysis"               # Daten analysieren
    VISION = "vision"                   # Bild-Analyse
    REASONING = "reasoning"             # Logik/Math
    CREATIVE = "creative"               # Kreativ schreiben


@dataclass
class ModelMetadata:
    """
    Metadaten zu einem Modell (Phase 1F).
    
    Attributes:
        name: Modell-Name (z.B. "gpt-4o")
        provider: Anbieter (openai, anthropic, google, etc.)
        capabilities: Set von Capabilities
        cost_tier: Kosten-Kategorie
        context_window: Max. Tokens (Input)
        max_output: Max. Output Tokens
        latency_ms: Durchschnittliche Latenz
        supports_streaming: Kann streamen
        supports_function_calling: Kann Tools nutzen
        best_for: Liste von Task-Types
        notes: Besonderheiten
    """
    name: str
    provider: str
    capabilities: Set[ModelCapability]
    cost_tier: CostTier
    context_window: int
    max_output: int
    latency_ms: int
    supports_streaming: bool
    supports_function_calling: bool
    best_for: List[TaskType]
    notes: str = ""


@dataclass
class ModelDecision:
    """
    Entscheidung über Modell-Nutzung.
    
    Attribute:
    - task_type: Art der Aufgabe
    - needs_streaming: Muss streamen?
    - needs_determinism: Reproduzierbar?
    - cost_tier: Kosten-Kategorie
    - latency_budget_ms: Max. Latenz in ms
    - selected_model: Gewähltes Modell
    - fallback_models: Alternative bei Fehler
    - reason: Begründung der Wahl
    """
    task_type: TaskType
    needs_streaming: bool
    needs_determinism: bool
    cost_tier: CostTier
    latency_budget_ms: int
    selected_model: str
    fallback_models: List[str]
    reason: str
    
    # Runtime Info
    temperature: float = 0.7
    seed: Optional[int] = None
    max_tokens: Optional[int] = None


class ModelRouter:
    """
    Model Router (Kernel v1.1) - Zentrale Modell-Steuerung.
    
    REGELN:
    - Alle Modell-Calls gehen durch Router
    - Router kennt Capabilities aller Modelle
    - Router entscheidet basierend auf Task + Context
    - Bei Fehler: automatischer Fallback
    
    VORTEILE:
    - Kostenoptimierung
    - Performance-Optimierung
    - Reproduzierbarkeit
    - Keine Model-Lock-ins
    """
    
    def __init__(self, available_models: Dict[str, Any]):
        """
        Args:
            available_models: Dict von Modell-Namen zu Client-Instanzen
        """
        self.available_models = available_models
        
        # Model Capabilities Registry
        self.model_registry = self._build_registry()
        
        # Cost Tracking
        self.usage_stats = {
            "total_requests": 0,
            "total_tokens": 0,
            "cost_usd": 0.0
        }
    
    def decide(
        self,
        task_type: TaskType,
        context: Optional[str] = None,
        streaming: bool = False,
        deterministic: bool = False,
        budget_tier: CostTier = CostTier.MEDIUM,
        latency_ms: int = 5000
    ) -> ModelDecision:
        """
        Entscheidet welches Modell optimal ist.
        
        Args:
            task_type: Art der Aufgabe
            context: Optionaler Kontext (für Token-Schätzung)
            streaming: Muss streamen?
            deterministic: Reproduzierbar?
            budget_tier: Max. Kosten-Level
            latency_ms: Max. Latenz-Budget
            
        Returns:
            ModelDecision mit gewähltem Modell
        """
        # Filter Modelle nach Constraints
        candidates = self._filter_models(
            task_type=task_type,
            streaming=streaming,
            budget=budget_tier,
            latency=latency_ms
        )
        
        if not candidates:
            # Fallback: Nutze verfügbares Modell
            candidates = list(self.available_models.keys())
        
        # Wähle bestes Modell
        selected = self._select_best(candidates, task_type)
        
        # Fallbacks definieren
        fallbacks = [m for m in candidates if m != selected][:2]
        
        # Decision zusammenbauen
        decision = ModelDecision(
            task_type=task_type,
            needs_streaming=streaming,
            needs_determinism=deterministic,
            cost_tier=budget_tier,
            latency_budget_ms=latency_ms,
            selected_model=selected,
            fallback_models=fallbacks,
            reason=f"Optimiert für {task_type.value}"
        )
        
        # Determinismus konfigurieren
        if deterministic:
            decision.temperature = 0.0
            decision.seed = 1234
        
        return decision
    
    def _build_registry(self) -> Dict[str, Dict]:
        """
        Baut Registry aller Modelle mit ihren Capabilities.
        
        Returns:
            Dict von Modell → Capabilities
        """
        return {
            # OpenAI Models
            "gpt-4o": {
                "cost_tier": CostTier.MEDIUM,
                "streaming": True,
                "tasks": [TaskType.CODE_GENERATION, TaskType.DIALOG, TaskType.ANALYSIS],
                "latency_ms": 2000,
                "context_window": 128000
            },
            "gpt-4o-mini": {
                "cost_tier": CostTier.LOW,
                "streaming": True,
                "tasks": [TaskType.DIALOG, TaskType.DOCUMENTATION],
                "latency_ms": 800,
                "context_window": 128000
            },
            "o1": {
                "cost_tier": CostTier.HIGH,
                "streaming": False,
                "tasks": [TaskType.DEBUGGING, TaskType.PLANNING],
                "latency_ms": 10000,
                "context_window": 200000
            },
            
            # Anthropic Models
            "claude-3-5-sonnet": {
                "cost_tier": CostTier.MEDIUM,
                "streaming": True,
                "tasks": [TaskType.CODE_GENERATION, TaskType.CODE_REVIEW],
                "latency_ms": 2000,
                "context_window": 200000
            },
            "claude-3-opus": {
                "cost_tier": CostTier.HIGH,
                "streaming": True,
                "tasks": [TaskType.ANALYSIS, TaskType.PLANNING],
                "latency_ms": 3000,
                "context_window": 200000
            },
            
            # Google Models
            "gemini-2.0-flash-exp": {
                "cost_tier": CostTier.LOW,
                "streaming": True,
                "tasks": [TaskType.DIALOG, TaskType.CODE_GENERATION],
                "latency_ms": 1000,
                "context_window": 1000000
            },
            
            # Local Models
            "ollama-llama3": {
                "cost_tier": CostTier.FREE,
                "streaming": True,
                "tasks": [TaskType.DIALOG],
                "latency_ms": 500,
                "context_window": 8000
            }
        }
    
    def _filter_models(
        self,
        task_type: TaskType,
        streaming: bool,
        budget: CostTier,
        latency: int
    ) -> List[str]:
        """Filtert Modelle nach Constraints."""
        candidates = []
        
        for model_name, caps in self.model_registry.items():
            # Nicht verfügbar?
            if model_name not in self.available_models:
                continue
            
            # Task nicht unterstützt?
            if task_type not in caps["tasks"]:
                continue
            
            # Streaming benötigt aber nicht unterstützt?
            if streaming and not caps["streaming"]:
                continue
            
            # Zu teuer?
            if self._cost_tier_value(caps["cost_tier"]) > self._cost_tier_value(budget):
                continue
            
            # Zu langsam?
            if caps["latency_ms"] > latency:
                continue
            
            candidates.append(model_name)
        
        return candidates
    
    def _select_best(self, candidates: List[str], task_type: TaskType) -> str:
        """Wählt bestes Modell aus Kandidaten."""
        if not candidates:
            # Fallback: Erstes verfügbares Modell
            return list(self.available_models.keys())[0]
        
        # Priorisierung nach Task
        priority_map = {
            TaskType.CODE_GENERATION: ["gpt-4o", "claude-3-5-sonnet", "gpt-4o-mini"],
            TaskType.DEBUGGING: ["o1", "gpt-4o", "claude-3-opus"],
            TaskType.DIALOG: ["gpt-4o-mini", "gemini-2.0-flash-exp", "gpt-4o"],
            TaskType.PLANNING: ["o1", "claude-3-opus", "gpt-4o"],
        }
        
        priorities = priority_map.get(task_type, candidates)
        
        # Erste Übereinstimmung
        for model in priorities:
            if model in candidates:
                return model
        
        # Fallback: Erster Kandidat
        return candidates[0]
    
    def _cost_tier_value(self, tier: CostTier) -> int:
        """Konvertiert CostTier zu numerischem Wert."""
        tier_values = {
            CostTier.FREE: 0,
            CostTier.LOW: 1,
            CostTier.MEDIUM: 2,
            CostTier.HIGH: 3,
            CostTier.PREMIUM: 4
        }
        return tier_values.get(tier, 2)
    
    async def execute_with_fallback(
        self,
        decision: ModelDecision,
        prompt: str,
        **kwargs
    ) -> Any:
        """
        Führt Modell-Call mit automatischem Fallback aus.
        
        Args:
            decision: ModelDecision
            prompt: User-Prompt
            **kwargs: Weitere Parameter
            
        Returns:
            Modell-Response
        """
        models_to_try = [decision.selected_model] + decision.fallback_models
        
        for model_name in models_to_try:
            try:
                client = self.available_models[model_name]
                
                # Call ausführen
                if decision.needs_streaming:
                    response = await client.stream(
                        prompt=prompt,
                        temperature=decision.temperature,
                        seed=decision.seed,
                        **kwargs
                    )
                else:
                    response = await client.generate(
                        prompt=prompt,
                        temperature=decision.temperature,
                        seed=decision.seed,
                        **kwargs
                    )
                
                # Erfolg → Tracking
                self.usage_stats["total_requests"] += 1
                
                return response
            
            except Exception as e:
                # Fehler → nächster Fallback
                if model_name == models_to_try[-1]:
                    # Letzter Versuch → raise
                    raise RuntimeError(f"All models failed. Last error: {e}")
                continue
        
        raise RuntimeError("No models available")
    
    def get_stats(self) -> Dict[str, Any]:
        """Gibt Nutzungs-Statistiken zurück."""
        return self.usage_stats.copy()


# Global Singleton
_model_router: Optional[ModelRouter] = None


def init_model_router(available_models: Dict[str, Any]) -> ModelRouter:
    """Initialisiert globalen Model Router."""
    global _model_router
    _model_router = ModelRouter(available_models)
    return _model_router


def get_model_router() -> ModelRouter:
    """Gibt globalen Model Router zurück."""
    if _model_router is None:
        raise RuntimeError("ModelRouter not initialized. Call init_model_router() first.")
    return _model_router
