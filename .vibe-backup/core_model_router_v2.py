# -------------------------------------------------------------
# VIBEAI – MODEL ROUTER V2 (INTELLIGENT MODEL SELECTION)
# -------------------------------------------------------------
from core.model_registry_v2 import resolve_model


class ModelRouterV2:
    """
    Erkennt Art des Prompts und wählt das optimale Modell.

    Features:
    - Automatische Task-Erkennung (reasoning, coding, creative, image, chat)
    - Agent-basierte Modellwahl (Aura, Cora, Devra, Lumi)
    - Kostenoptimierung (kurze Chats → günstig, komplexe Tasks → premium)
    - Fallback-Kaskaden bei Provider-Ausfällen
    - Multi-Agent & Builder Support
    """

    def __init__(self):
        # Modellkategorien nach Leistung
        self.fast_models = ["gpt-4o-mini", "gemini-2.0-flash"]
        self.normal_models = ["gpt-4o", "claude-3-7-sonnet"]
        self.reasoning_models = ["o3", "o1", "claude-3-7-opus"]
        self.vision_models = ["gemini-2.0-pro", "gpt-4o", "claude-3-7-sonnet"]

    # ---------------------------------------------------------
    # Intelligente Modell-Auswahl basierend auf Nachricht & Agent
    # ---------------------------------------------------------
    def pick_model(self, message: str, agent: str = "aura") -> str:
        """
        Wählt das optimale Modell basierend auf:
        - Nachrichteninhalt (Keywords, Länge)
        - Agent-Typ (Aura/Cora/Devra/Lumi)
        - Task-Art (reasoning, coding, creative, vision)

        Args:
            message: User-Nachricht
            agent: Agent-Name (aura, cora, devra, lumi)

        Returns:
            Modell-Name (z.B. "gpt-4o", "o3", "gemini-2.0-pro")
        """
        m = message.lower()

        # 1) Reasoning Erkennung
        # → o3 für tiefes Denken, Erklärungen, lange Kontexte
        if agent == "devra" or "why" in m or "explain" in m or "analyze" in m or len(m) > 350:
            return "o3"

        # 2) Coding Tasks
        # → gpt-4o für Code-Generierung, Fixes, Refactoring
        if agent == "cora" or "code" in m or "fix" in m or "refactor" in m or "debug" in m or "function" in m:
            return "gpt-4o"

        # 3) Kreative Tasks
        # → gpt-4o für Storytelling, UI/UX, Marketing
        if agent == "lumi" or "story" in m or "design" in m or "creative" in m or "write" in m or "marketing" in m:
            return "gpt-4o"

        # 4) Bilder / Vision / Multimodal
        # → gemini-2.0-pro für Vision, Bildanalyse, OCR
        if "image" in m or "photo" in m or "vision" in m or "picture" in m or "screenshot" in m:
            return "gemini-2.0-pro"

        # 5) Planung / Strukturierung
        # → gpt-4o für Builder, Planner, Composer
        if agent in ["planner", "builder", "composer"] or "plan" in m or "structure" in m or "architecture" in m:
            return "gpt-4o"

        # 6) Default Chat
        # → gpt-4o-mini für kurze, einfache Chats (kostenoptimiert)
        return "gpt-4o-mini"

    # ---------------------------------------------------------
    # Fallback-Kette bei Provider-Ausfällen
    # ---------------------------------------------------------
    def fallback_chain(self, model_name: str) -> list:
        """
        Gibt Fallback-Modelle zurück falls primäres Modell nicht verfügbar.

        Strategie:
        - Reasoning Models → Claude Opus → Gemini Pro → GPT-4o
        - GPT-4o → Claude Sonnet → Gemini Flash → GPT-4o-mini
        - Default → Gemini Flash → GPT-4o-mini

        Args:
            model_name: Primäres Modell

        Returns:
            Liste von Fallback-Modellen (in Prioritäts-Reihenfolge)
        """
        # Reasoning Models Fallback
        if model_name in ["o3", "o1"]:
            return ["claude-3-7-opus", "gemini-2.0-pro", "gpt-4o"]

        # GPT-4o Fallback
        if model_name == "gpt-4o":
            return ["claude-3-7-sonnet", "gemini-2.0-flash", "gpt-4o-mini"]

        # Claude Sonnet Fallback
        if model_name == "claude-3-7-sonnet":
            return ["gpt-4o", "gemini-2.0-flash", "gpt-4o-mini"]

        # Gemini Pro Fallback
        if model_name == "gemini-2.0-pro":
            return ["gpt-4o", "claude-3-7-sonnet", "gemini-2.0-flash"]

        # Default Fallback (für alle anderen)
        return ["gemini-2.0-flash", "gpt-4o-mini"]

    # ---------------------------------------------------------
    # Vollständiges Modell-Objekt zurückgeben (mit Provider Info)
    # ---------------------------------------------------------
    def resolve(self, model_name: str):
        """
        Gibt vollständiges Modell-Objekt zurück aus model_registry_v2.

        Args:
            model_name: Modell-Name

        Returns:
            Model-Objekt mit provider, tier, pricing, etc.
        """
        return resolve_model(model_name)

    # ---------------------------------------------------------
    # User-Tier basierte Modellauswahl (Free/Pro/Ultra)
    # ---------------------------------------------------------
    def pick_for_tier(self, message: str, agent: str, user_tier: str = "free") -> str:
        """
        Wählt Modell basierend auf User-Tier + Task.

        Tiers:
        - Free: Nur fast_models (gpt-4o-mini, gemini-flash)
        - Pro: Normal + Fast models (gpt-4o, claude-sonnet, etc.)
        - Ultra: Alle Models inkl. Reasoning (o3, o1, claude-opus)

        Args:
            message: User-Nachricht
            agent: Agent-Name
            user_tier: "free", "pro", "ultra"

        Returns:
            Modell-Name passend zum Tier
        """
        # Basismodell ermitteln
        optimal_model = self.pick_model(message, agent)

        # Free User → Downgrade zu fast models
        if user_tier == "free":
            if optimal_model in self.reasoning_models or optimal_model in self.normal_models:
                return "gpt-4o-mini"  # Günstigstes Modell
            return optimal_model

        # Pro User → Normal models erlaubt, kein Reasoning
        if user_tier == "pro":
            if optimal_model in self.reasoning_models:
                return "gpt-4o"  # Downgrade von o3 → gpt-4o
            return optimal_model

        # Ultra User → Alle Modelle erlaubt
        return optimal_model

    # ---------------------------------------------------------
    # Quick Helper: Ist Modell verfügbar?
    # ---------------------------------------------------------
    def is_model_available(self, model_name: str) -> bool:
        """
        Prüft ob Modell in Registry existiert.

        Args:
            model_name: Modell-Name

        Returns:
            True wenn verfügbar, False sonst
        """
        try:
            self.resolve(model_name)
            return True
        except Exception:
            return False


# -------------------------------------------------------------
# Globale Instanz
# -------------------------------------------------------------
model_router_v2 = ModelRouterV2()

# Backward compatibility
model_router = model_router_v2
