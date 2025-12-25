# kernel/skills/dialog_skill.py
# -----------------------------
# Dialog-Skill: Holt eine Textantwort vom Modell
# und streamt sie als EVENT_MESSAGE.
#
# Verwendung:
# - Chat-Anwendungen
# - Frage-Antwort
# - Konversation

import asyncio
from kernel.events import AgentEvent, EVENT_MESSAGE


class DialogSkill:
    """
    Skill für Dialog-basierte Interaktionen.
    
    Streamt Modell-Antworten live an das Frontend
    via EVENT_MESSAGE Events.
    """

    def __init__(self, llm_router):
        """
        Args:
            llm_router: LLMRouter-Instanz zur Modell-Auswahl
        """
        self.router = llm_router

    async def run(self, prompt: str, emit, model_hint=None):
        """
        Führt einen Dialog-Turn aus.
        
        Args:
            prompt: User-Nachricht
            emit: Callback zum Streamen von Events (Kernel._emit)
            model_hint: Optionale Modell-Auswahl
        """
        # Wähle passendes Modell
        llm = self.router.choose(prompt, model_hint)

        # Stream Antwort Token für Token
        async for chunk in llm.stream(prompt):
            if not chunk:
                continue

            await emit(
                AgentEvent(
                    type=EVENT_MESSAGE,
                    message=chunk,
                )
            )

            # Kleines Yield für flüssige UI
            await asyncio.sleep(0)
