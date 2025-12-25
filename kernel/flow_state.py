# kernel/flow_state.py
# ---------------------
# Flow State Management (Kernel v1.0)
#
# REGELN:
# - active == True → keine neue Intent-Analyse
# - Jede User-Eingabe = "mach weiter"
# - Flow endet nur durch Kernel (done)
# - KEIN MEMORY, KEINE HISTORY

from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class FlowState:
    """
    Kernel Flow State - Single Source of Truth für aktiven Workflow.
    
    Attribute:
    - active:  Flow läuft (True) oder bereit für neue Aufgabe (False)
    - mode:    Aktueller Modus (flutter, react, fix, continue, observe_only)
    - project: Projekt-Name (optional)
    - step:    Aktueller Schritt (optional)
    - todo:    To-Do-Liste (wird abgearbeitet)
    
    PHILOSOPHIE:
    - Kein State = kein Memory
    - FlowState ist temporär, wird bei done gelöscht
    - User-Input während active == True → automatisch "continue"
    """
    active: bool = False
    mode: Optional[str] = None
    project: Optional[str] = None
    step: Optional[str] = None
    todo: List[str] = field(default_factory=list)
    
    def start(self, mode: str, project: Optional[str] = None):
        """Startet einen neuen Flow."""
        self.active = True
        self.mode = mode
        self.project = project
        self.step = None
        self.todo = []
    
    def next_step(self, step: str):
        """Setzt den nächsten Schritt."""
        self.step = step
    
    def add_todo(self, item: str):
        """Fügt ein To-Do hinzu."""
        self.todo.append(item)
    
    def complete_todo(self, item: str):
        """Entfernt ein erledigtes To-Do."""
        if item in self.todo:
            self.todo.remove(item)
    
    def finish(self):
        """Beendet den Flow - zurück zu Initialzustand."""
        self.active = False
        self.mode = None
        self.project = None
        self.step = None
        self.todo = []
    
    def is_active(self) -> bool:
        """Prüft ob Flow aktiv ist."""
        return self.active
    
    def get_mode(self) -> Optional[str]:
        """Gibt aktuellen Modus zurück."""
        return self.mode


# Global singleton für Kernel-weiten State
# (wird in kernel.py initialisiert)
_global_flow_state = FlowState()


def get_flow_state() -> FlowState:
    """Gibt den globalen FlowState zurück."""
    return _global_flow_state
