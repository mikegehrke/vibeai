# kernel/kernel_v1.py
# --------------------
# Kernel v1.1 - Orchestrator (System-Engineering)
#
# ARCHITEKTUR:
# - Runtime als Dependency Injection Container
# - Kernel NUR Orchestration, KEINE Business-Logik
# - Delegiert an Runtime-Komponenten
# - Bleibt schlank und wartbar
#
# PHILOSOPHIE:
# - Kernel ist Single Source of Truth
# - Runtime hält alle Komponenten
# - Alles ist ein Event
# - Kein State außer Runtime + FlowState
# - Restart-fähig über StateStore

from typing import Optional, Dict, Any
import asyncio

from kernel.events import (
    KernelEvent,
    EVENT_THOUGHT,
    EVENT_ANALYSIS,
    EVENT_PLAN,
    EVENT_TODO,
    EVENT_DONE,
    EVENT_ERROR,
)
from kernel.flow_state import FlowState, get_flow_state
from kernel.routing.intent_engine import IntentEngine, get_intent_engine
from kernel.action_graph import ActionGraph, ActionNode
from kernel.streamer import SSEStreamer


class KernelV1:
    """
    Kernel v1.1 - Schlanker Orchestrator.
    
    FEATURES:
    - Intent-basiertes Routing
    - Runtime Integration (v1.1)
    - Flow State Management
    - Action Graph (DAG) für Workflow
    - Event-basierte Kommunikation
    
    REGELN:
    - Runtime hält alle Komponenten
    - Kernel delegiert, macht keine Business-Logik
    - Jede Aktion ist ein Event
    - Restart-fähig
    """
    
    def __init__(
        self,
        streamer: SSEStreamer,
        runtime=None,  # KernelRuntime (v1.1)
        llm_router=None,
        seed: Optional[int] = None,
        deterministic: bool = False
    ):
        """
        Args:
            streamer: SSEStreamer für Events
            runtime: KernelRuntime (v1.1 Container)
            llm_router: LLMRouter für Dialog (optional)
            seed: Random seed für deterministische Ausführung
            deterministic: Deterministic mode aktivieren
        """
        self.streamer = streamer
        self.runtime = runtime  # v1.1: Alle Komponenten hier
        self.llm_router = llm_router
        self.seed = seed
        self.deterministic = deterministic
        
        # Core Components
        self.flow_state: FlowState = get_flow_state()
        self.intent_engine: IntentEngine = get_intent_engine()
        self.action_graph: ActionGraph = ActionGraph()
        
        # Agents (lazy loaded)
        self._agents = {}
        
        # Skills (lazy loaded)
        self.dialog_skill = None
        if llm_router:
            from kernel.skills.dialog_skill import DialogSkill
            self.dialog_skill = DialogSkill(llm_router)
        
        # Runtime Callback (circular dependency fix)
        if runtime:
            runtime.set_kernel(self)
    
    async def run(self, task: str, model_hint: Optional[str] = None):
        """
        Haupt-Einstiegspunkt für jede User-Aufgabe.
        
        WORKFLOW:
        1. Intent Detection
        2. Flow State Update
        3. Agent Routing
        4. Action Graph Execution
        5. Event Streaming
        
        Args:
            task: User-Input
            model_hint: Optionale Modell-Auswahl (für Dialog)
        """
        try:
            # 1. Intent Detection
            intent = self.intent_engine.decide(
                text=task,
                flow_active=self.flow_state.is_active()
            )
            
            mode = intent["mode"]
            project = intent.get("project")
            
            await self._emit_thought(f"Erkannter Modus: {mode}")
            
            # 2. Route basierend auf Modus
            if mode == "dialog":
                await self._handle_dialog(task, model_hint)
            elif mode == "flutter":
                await self._handle_flutter(task, project)
            elif mode == "react":
                await self._handle_react(task, project)
            elif mode == "python":
                await self._handle_python(task, project)
            elif mode == "fix":
                await self._handle_fix(task)
            elif mode == "git":
                await self._handle_git(task)
            elif mode == "terminal":
                await self._handle_terminal(task)
            elif mode == "continue":
                await self._handle_continue(task)
            else:
                # Fallback: Dialog
                await self._handle_dialog(task, model_hint)
            
            # Finale
            await self._emit_done("Aufgabe abgeschlossen.")
        
        except Exception as e:
            await self._emit_error(f"Kernel Error: {str(e)}")
            raise
    
    # -------------------------
    # MODE HANDLERS
    # -------------------------
    
    async def _handle_dialog(self, task: str, model_hint: Optional[str] = None):
        """Dialog-Modus: Direkte Konversation mit v1.1 Integration."""
        if not self.dialog_skill:
            await self._emit_error("Dialog-Skill nicht verfügbar (kein LLM Router)")
            return
        
        await self._emit_analysis("Dialog-Modus aktiviert")
        
        # v1.1: ModelRouter auswählen (wenn Runtime vorhanden)
        selected_model = model_hint
        if self.runtime and not model_hint:
            # TODO: ModelRouter Integration
            # decision = self.runtime.model_router.decide(task_type="chat", task=task)
            # selected_model = decision.selected_model
            pass
        
        # v1.1: Telemetry tracken
        if self.runtime:
            self.runtime.telemetry.track_agent_action("dialog", task, True, 0.0)
        
        # Wrapper für emit
        async def emit_event(event: KernelEvent):
            await self.streamer.send_event(event)
        
        await self.dialog_skill.run(
            prompt=task,
            emit=emit_event,
            model_hint=selected_model
        )
    
    async def _handle_flutter(self, task: str, project: Optional[str]):
        """Flutter-Projekt-Modus mit v1.1 Integration."""
        await self._emit_analysis(f"Flutter-Projekt erkannt: {project}")
        
        # v1.1: Security Check
        if self.runtime:
            allowed, reason = self.runtime.security.check_action("file_write")
            if not allowed:
                await self._emit_error(f"Security: {reason}")
                return
        
        # v1.1: Recovery Snapshot (vor irreversibler Aktion)
        if self.runtime:
            self.runtime.recovery.create_snapshot(self.flow_state, self.action_graph)
        
        # Starte Flow
        self.flow_state.start(mode="flutter", project=project)
        
        try:
            # Flutter-Generator laden
            from actions.flutter_project import CreateFlutterTodoProject
            action = CreateFlutterTodoProject(root=f"user_projects/{project}")
            
            await action.execute(self.streamer)
            
            # v1.1: Telemetry
            if self.runtime:
                self.runtime.telemetry.track_agent_action("flutter", project, True, 0.0)
        
        except Exception as e:
            # v1.1: Recovery
            if self.runtime:
                plan = self.runtime.recovery.classify_error(str(e), "flutter", {})
                await self._emit_error(f"Fehler: {e}. Recovery: {plan.retry_strategy.value}")
            raise
        
        finally:
            # Flow beenden
            self.flow_state.finish()
    
    async def _handle_react(self, task: str, project: Optional[str]):
        """React-Projekt-Modus."""
        await self._emit_analysis(f"React-Projekt erkannt: {project}")
        await self._emit_thought("React-Generator noch nicht implementiert")
        # TODO: React Generator implementieren
    
    async def _handle_python(self, task: str, project: Optional[str]):
        """Python-Projekt-Modus."""
        await self._emit_analysis(f"Python-Projekt erkannt: {project}")
        await self._emit_thought("Python-Generator noch nicht implementiert")
        # TODO: Python Generator implementieren
    
    async def _handle_fix(self, task: str):
        """Fix-Modus: Fehleranalyse & Reparatur."""
        await self._emit_analysis("Fix-Modus aktiviert")
        await self._emit_thought("FixAgent noch nicht implementiert")
        # TODO: FixAgent integrieren
    
    async def _handle_git(self, task: str):
        """Git-Operationen."""
        await self._emit_analysis("Git-Modus aktiviert")
        await self._emit_thought("Git-Agent noch nicht implementiert")
        # TODO: Git-Agent implementieren
    
    async def _handle_terminal(self, task: str):
        """Terminal-Befehle."""
        await self._emit_analysis("Terminal-Modus aktiviert")
        await self._emit_thought("Terminal-Agent noch nicht implementiert")
        # TODO: Terminal-Agent implementieren
    
    async def _handle_continue(self, task: str):
        """Continue-Modus: Mach weiter mit aktivem Flow."""
        mode = self.flow_state.get_mode()
        await self._emit_thought(f"Continue mit Modus: {mode}")
        # TODO: Flow-basierte Fortsetzung implementieren
    
    # -------------------------
    # EVENT HELPERS
    # -------------------------
    
    async def _emit_thought(self, message: str):
        """Emittiert einen Thought-Event (kurz, menschlich)."""
        await self.streamer.send_event(KernelEvent(
            type=EVENT_THOUGHT,
            message=message
        ))
        await asyncio.sleep(0.04)  # Human-like streaming
    
    async def _emit_analysis(self, message: str):
        """Emittiert einen Analysis-Event."""
        await self.streamer.send_event(KernelEvent(
            type=EVENT_ANALYSIS,
            message=message
        ))
    
    async def _emit_plan(self, message: str, data: Optional[Dict] = None):
        """Emittiert einen Plan-Event."""
        await self.streamer.send_event(KernelEvent(
            type=EVENT_PLAN,
            message=message,
            data=data
        ))
    
    async def _emit_todo(self, todos: list):
        """Emittiert eine To-Do-Liste."""
        await self.streamer.send_event(KernelEvent(
            type=EVENT_TODO,
            message=f"{len(todos)} To-Dos erstellt",
            data={"todos": todos}
        ))
    
    async def _emit_done(self, message: str):
        """Emittiert Done-Event."""
        await self.streamer.send_event(KernelEvent(
            type=EVENT_DONE,
            message=message
        ))
    
    async def _emit_error(self, message: str):
        """Emittiert Error-Event."""
        await self.streamer.send_event(KernelEvent(
            type=EVENT_ERROR,
            message=message
        ))
    
    # -------------------------
    # AGENT MANAGEMENT
    # -------------------------
    
    def register_agent(self, name: str, agent_class):
        """Registriert einen Agenten (lazy loading)."""
        self._agents[name] = agent_class
    
    def get_agent(self, name: str):
        """Holt einen Agenten (lazy instantiation)."""
        if name not in self._agents:
            raise ValueError(f"Agent {name} not registered")
        return self._agents[name]


# Globale Kernel-Instanz (wird in main.py initialisiert)
_kernel_instance: Optional[KernelV1] = None


def init_kernel(streamer: SSEStreamer, runtime=None, llm_router=None) -> KernelV1:
    """
    Initialisiert die globale Kernel-Instanz (v1.1).
    
    Args:
        streamer: SSEStreamer
        runtime: KernelRuntime (v1.1)
        llm_router: LLMRouter
    """
    global _kernel_instance
    _kernel_instance = KernelV1(
        streamer=streamer,
        runtime=runtime,
        llm_router=llm_router
    )
    return _kernel_instance


def get_kernel() -> KernelV1:
    """Gibt die globale Kernel-Instanz zurück."""
    if _kernel_instance is None:
        raise RuntimeError("Kernel not initialized. Call init_kernel() first.")
    return _kernel_instance
