# kernel/agent_kernel.py
# ---------------------
# Zentrale Agenten-State-Machine.
#
# Diese Klasse steuert:
# - Analyse
# - Planung
# - schrittweise Ausführung
# - Live-Events für Chat & Editor
#
# Kein Agent darf außerhalb dieses Kernels arbeiten.

from typing import List, Dict, Any, Optional
from kernel.events import (
    AgentEvent,
    EVENT_ANALYSIS,
    EVENT_PLAN,
    EVENT_STEP,
    EVENT_DONE,
    EVENT_ERROR,
)


class AgentKernel:
    """
    Zentrale Steuerung für alle Agenten-Aktionen.

    Der Kernel:
    - erzwingt sichtbares Denken
    - erzwingt Planung
    - erzwingt Schritt-für-Schritt-Ausführung
    - unterstützt Dialog via DialogSkill
    """

    def __init__(self, streamer, llm_router=None):
        """
        :param streamer:
            Eine Instanz von SSEStreamer (oder kompatibel),
            über die Events live an das Frontend gesendet werden.
        :param llm_router:
            Optionaler LLMRouter für Dialog-Funktionen
        """
        self.streamer = streamer
        self.llm_router = llm_router
        self.dialog_skill = None
        
        # Initialisiere Dialog-Skill wenn Router vorhanden
        if llm_router:
            from kernel.skills.dialog_skill import DialogSkill
            self.dialog_skill = DialogSkill(llm_router)

    async def run(self, task: str, model_hint: Optional[str] = None):
        """
        Startpunkt für jede Agenten-Aufgabe.

        :param task:
            Die vom User gewünschte Aufgabe (z.B. "Erstelle eine React App")
        :param model_hint:
            Optionale explizite Modell-Auswahl für Dialog
        """
        try:
            # -------------------------
            # 0. HEURISTIK: Dialog oder Job?
            # -------------------------
            is_dialog = self._is_dialog_task(task)
            
            if is_dialog and self.dialog_skill:
                # Dialog-Modus: Direkte Antwort ohne Plan
                await self._emit(
                    EVENT_ANALYSIS,
                    "Dialog erkannt - hole Antwort...",
                )
                
                # Wrapper für emit - DialogSkill übergibt AgentEvent, _emit braucht Argumente
                async def emit_event(event: AgentEvent):
                    await self.streamer.send_event(event)
                
                await self.dialog_skill.run(
                    prompt=task,
                    emit=emit_event,
                    model_hint=model_hint
                )
                
                await self._emit(
                    EVENT_DONE,
                    "Dialog abgeschlossen.",
                )
                return
            
            # -------------------------
            # 1. ANALYSE (Job-Modus)
            # -------------------------
            await self._emit(
                EVENT_ANALYSIS,
                f"Ich analysiere die Aufgabe: {task}",
            )
            
            # -------------------------
            # 1.5 SPEZIAL-JOBS (Actions)
            # -------------------------
            # Flutter To-Do App
            if "flutter" in task.lower() and ("todo" in task.lower() or "to-do" in task.lower() or "aufgabe" in task.lower()):
                await self._emit(
                    EVENT_ANALYSIS,
                    "Flutter To-Do App erkannt - starte Projekt-Generator...",
                )
                
                # Action direkt ausführen
                from actions.flutter_project import CreateFlutterTodoProject
                action = CreateFlutterTodoProject()
                await action.execute(self.streamer)
                
                await self._emit(
                    EVENT_DONE,
                    "Flutter-Projekt erfolgreich erstellt.",
                )
                return

            # -------------------------
            # 2. PLANUNG
            # -------------------------
            plan = self._create_plan(task)

            await self._emit(
                EVENT_PLAN,
                "Plan:\n" + "\n".join(
                    f"{idx + 1}. {step['description']}"
                    for idx, step in enumerate(plan)
                ),
                data={"steps": plan},
            )

            # -------------------------
            # 3. AUSFÜHRUNG
            # -------------------------
            for step in plan:
                await self._emit(
                    EVENT_STEP,
                    step["description"],
                    data=step,
                )

                # Hier wird später die echte Logik aufgerufen
                await self._execute_step(step)

            # -------------------------
            # 4. DONE
            # -------------------------
            await self._emit(
                EVENT_DONE,
                "Aufgabe abgeschlossen.",
            )

        except Exception as exc:
            # Fehler werden IMMER sichtbar gemacht
            await self._emit(
                EVENT_ERROR,
                f"Fehler im AgentKernel: {exc}",
            )

    # ------------------------------------------------------------------
    # Interne Hilfsfunktionen
    # ------------------------------------------------------------------

    async def _emit(self, event_type: str, message: str, data: Dict[str, Any] = None):
        """
        Erzeugt ein AgentEvent und streamt es sofort.
        """
        event = AgentEvent(
            type=event_type,
            message=message,
            data=data,
        )
        await self.streamer.send_event(event)

    def _create_plan(self, task: str) -> List[Dict[str, Any]]:
        """
        Erstellt einen sehr einfachen Plan.

        Wichtig:
        - Noch KEIN LLM
        - Kein Magic
        - Nur saubere Struktur

        Später wird dieser Teil durch ein LLM ersetzt.
        """
        return [
            {
                "id": 1,
                "description": "Aufgabe verstehen und Ziel klären",
                "action": "analyze",
            },
            {
                "id": 2,
                "description": "Benötigte Dateien identifizieren",
                "action": "identify_files",
            },
            {
                "id": 3,
                "description": "Code oder Struktur vorbereiten",
                "action": "prepare_code",
            },
        ]

    def _is_dialog_task(self, task: str) -> bool:
        """
        Heuristik: Ist dies eine Dialog-Anfrage oder ein Job?
        
        Dialog:
        - Kurze Fragen
        - Grüße
        - Konversation
        
        Job:
        - "Erstelle..."
        - "Baue..."
        - "Implementiere..."
        """
        task_lower = task.lower()
        
        # Job-Keywords
        job_keywords = [
            "erstelle", "baue", "build", "implementiere", "generate",
            "create", "mach", "fix", "repariere", "füge hinzu",
            "app", "projekt", "flutter", "react", "component"
        ]
        
        if any(keyword in task_lower for keyword in job_keywords):
            return False
        
        # Kurze Anfragen sind meist Dialog
        if len(task.split()) <= 15:
            return True
            
        return False

    async def _execute_step(self, step: Dict[str, Any]):
        """
        Führt einen einzelnen Schritt aus.

        Aktuell:
        - nur Platzhalter-Logik
        - bewusst leer

        Später:
        - Aufruf von Skills (Code schreiben, App bauen, etc.)
        """
        # Hier passiert NOCH nichts.
        # Wichtig ist zuerst:
        # - Reihenfolge
        # - Events
        # - Transparenz
        pass
