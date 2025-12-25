# backend/llm/router.py
# --------------------
# LLM-Router: Wählt das richtige Modell basierend auf Task.
# Zentrale Stelle für:
# - Kostenkontrolle
# - Qualitäts-Tuning
# - Performance-Optimierung

from typing import Dict, Optional
from llm.base import BaseLLM


class LLMRouter:
    """
    Intelligenter Router für LLM-Auswahl.
    
    Entscheidet basierend auf:
    - Expliziter Modell-Auswahl (UI)
    - Task-Charakteristik
    - Kosten vs. Qualität
    """

    def __init__(self, clients: Dict[str, BaseLLM]):
        """
        Args:
            clients: Dictionary mit registrierten LLM-Clients
                     z.B. {"openai": OpenAIClient(), "anthropic": ClaudeClient()}
        """
        self.clients = clients

    def choose(self, task: str, model_hint: Optional[str] = None) -> BaseLLM:
        """
        Wählt den besten LLM-Client für die Task.
        
        Args:
            task: User-Aufgabe/Prompt
            model_hint: Optionale explizite Modell-Auswahl (z.B. "gpt-4o")
            
        Returns:
            BaseLLM: Ausgewählter Client
        """
        # 1️⃣ Explizite Auswahl hat Priorität
        if model_hint and model_hint in self.clients:
            return self.clients[model_hint]

        task_lower = task.lower()

        # 2️⃣ Kurzer Dialog → schnelles/günstiges Modell
        if len(task.split()) <= 20 and not any(
            keyword in task_lower
            for keyword in ["code", "app", "build", "fix", "flutter", "react"]
        ):
            return self.clients.get("openai-mini", self.clients.get("openai"))

        # 3️⃣ Code/Build/App → starkes Modell
        if any(
            keyword in task_lower
            for keyword in ["flutter", "code", "app", "build", "fix", "react", "component"]
        ):
            return self.clients.get("openai", self.clients.get("anthropic"))

        # 4️⃣ Fallback: Standard-Modell
        return self.clients.get("openai", list(self.clients.values())[0])
