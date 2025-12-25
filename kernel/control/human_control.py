# kernel/human_control.py
# ------------------------
# Human Override & Lernmodus (Kernel v1.1)
#
# PHILOSOPHIE:
# - User kann jederzeit eingreifen
# - Verschiedene Kontroll-Modi
# - Vertrauen durch Transparenz
# - Lernen durch Erklärungen
#
# FEATURES:
# - AUTO: Vollautonom
# - ASSISTED: Fragen bei Risiko
# - LEARNING: Alles erklären + pausieren
# - OBSERVE: Nur zuschauen

from dataclasses import dataclass
from typing import Optional, Callable, Any
from enum import Enum


class ControlMode(Enum):
    """
    Kontroll-Modi für Human-Agent-Interaktion.
    
    AUTO:
        - Kernel arbeitet vollautonom
        - Keine Pausen
        - Keine Fragen
        - Nur bei kritischen Fehlern stoppen
    
    ASSISTED:
        - Kernel fragt bei Risiko
        - Pause bei irreversiblen Aktionen
        - User kann überstimmen
        - Standardmodus für Produktion
    
    LEARNING:
        - Jeder Schritt wird erklärt
        - Pause nach jedem Schritt
        - Educational Mode
        - Ideal für Onboarding
    
    OBSERVE:
        - Kernel zeigt nur was er tun würde
        - Keine echten Aktionen
        - Dry-Run Mode
        - Ideal für Demos
    """
    AUTO = "auto"
    ASSISTED = "assisted"
    LEARNING = "learning"
    OBSERVE = "observe"


@dataclass
class HumanApproval:
    """
    Request für Human-Freigabe.
    
    Attribute:
    - action: Aktion die Freigabe braucht
    - reason: Warum Freigabe nötig?
    - risk_level: Risiko-Level (0-1)
    - reversible: Ist rückgängig machbar?
    - explanation: Detaillierte Erklärung
    """
    action: str
    reason: str
    risk_level: float
    reversible: bool
    explanation: str
    
    # Response
    approved: Optional[bool] = None
    user_feedback: Optional[str] = None


@dataclass
class LearningStep:
    """
    Lern-Schritt im LEARNING-Modus.
    
    Attribute:
    - step_number: Schritt-Nummer
    - action: Aktion
    - explanation: Was wird gemacht?
    - reasoning: Warum wird es gemacht?
    - alternatives: Was wären Alternativen?
    - ask_questions: Soll User Fragen stellen können?
    """
    step_number: int
    action: str
    explanation: str
    reasoning: str
    alternatives: list
    ask_questions: bool = True
    
    # Response
    user_understood: Optional[bool] = None
    user_questions: Optional[str] = None


class HumanControl:
    """
    Human Control (Kernel v1.1) - Mensch-in-der-Schleife.
    
    FEATURES:
    - Flexible Kontroll-Modi
    - Freigabe-Workflows
    - Learning-Mode mit Erklärungen
    - Observe-Mode (Dry-Run)
    
    VORTEILE:
    - Vertrauen durch Kontrolle
    - Lernen durch Transparenz
    - Sicherheit durch Freigaben
    - Flexibilität durch Modi
    """
    
    def __init__(self, kernel):
        """
        Args:
            kernel: Kernel-Instanz
        """
        self.kernel = kernel
        self.mode = ControlMode.ASSISTED  # Default
        
        # Callbacks für UI-Integration
        self.on_approval_needed: Optional[Callable] = None
        self.on_learning_step: Optional[Callable] = None
        self.on_mode_changed: Optional[Callable] = None
        
        # State
        self.pending_approvals: list = []
        self.learning_steps: list = []
        self.paused = False
    
    def set_mode(self, mode: ControlMode):
        """
        Setzt Kontroll-Modus.
        
        Args:
            mode: Neuer ControlMode
        """
        old_mode = self.mode
        self.mode = mode
        
        # Callback
        if self.on_mode_changed:
            self.on_mode_changed(old_mode, mode)
    
    def get_mode(self) -> ControlMode:
        """Gibt aktuellen Modus zurück."""
        return self.mode
    
    async def request_approval(
        self,
        action: str,
        reason: str,
        risk_level: float,
        reversible: bool = True,
        explanation: str = ""
    ) -> bool:
        """
        Fordert User-Freigabe an.
        
        Args:
            action: Aktion die Freigabe braucht
            reason: Grund
            risk_level: Risiko (0-1)
            reversible: Rückgängig machbar?
            explanation: Erklärung
            
        Returns:
            True wenn freigegeben
        """
        # Im AUTO-Modus: Nur bei sehr hohem Risiko fragen
        if self.mode == ControlMode.AUTO:
            if risk_level < 0.9:
                return True  # Auto-approve
        
        # Im OBSERVE-Modus: Nichts ausführen
        if self.mode == ControlMode.OBSERVE:
            return False  # Deny all
        
        # Approval erstellen
        approval = HumanApproval(
            action=action,
            reason=reason,
            risk_level=risk_level,
            reversible=reversible,
            explanation=explanation
        )
        
        self.pending_approvals.append(approval)
        
        # Callback für UI
        if self.on_approval_needed:
            result = await self.on_approval_needed(approval)
            approval.approved = result
            return result
        
        # Fallback: Im Zweifel ablehnen
        return False
    
    async def explain_step(
        self,
        step_number: int,
        action: str,
        explanation: str,
        reasoning: str,
        alternatives: Optional[list] = None
    ) -> bool:
        """
        Erklärt Schritt im LEARNING-Modus.
        
        Args:
            step_number: Schritt-Nummer
            action: Aktion
            explanation: Was wird gemacht?
            reasoning: Warum?
            alternatives: Alternativen
            
        Returns:
            True wenn User verstanden hat
        """
        # Nur im LEARNING-Modus
        if self.mode != ControlMode.LEARNING:
            return True  # Skip
        
        # Learning-Step erstellen
        step = LearningStep(
            step_number=step_number,
            action=action,
            explanation=explanation,
            reasoning=reasoning,
            alternatives=alternatives or []
        )
        
        self.learning_steps.append(step)
        
        # Pause für User
        self.paused = True
        
        # Callback für UI
        if self.on_learning_step:
            understood = await self.on_learning_step(step)
            step.user_understood = understood
            self.paused = False
            return understood
        
        # Fallback
        self.paused = False
        return True
    
    def pause(self):
        """Pausiert Kernel (User-Request)."""
        self.paused = True
    
    def resume(self):
        """Setzt Kernel fort."""
        self.paused = False
    
    def is_paused(self) -> bool:
        """Prüft ob pausiert."""
        return self.paused
    
    def override_action(self, action: str, replacement: str):
        """
        User überstimmt eine Aktion.
        
        Args:
            action: Original-Aktion
            replacement: Ersatz-Aktion
        """
        # TODO: Action-Override implementieren
        pass
    
    def skip_step(self):
        """User überspringt aktuellen Schritt."""
        # TODO: Step-Skip implementieren
        pass
    
    def get_pending_approvals(self) -> list:
        """Gibt offene Freigabe-Requests zurück."""
        return [a for a in self.pending_approvals if a.approved is None]
    
    def get_learning_history(self) -> list:
        """Gibt Learning-History zurück."""
        return self.learning_steps.copy()
    
    def get_stats(self) -> dict:
        """Gibt Statistiken zurück."""
        return {
            "mode": self.mode.value,
            "paused": self.paused,
            "pending_approvals": len(self.get_pending_approvals()),
            "learning_steps": len(self.learning_steps),
            "total_approvals": len(self.pending_approvals),
            "approved": sum(1 for a in self.pending_approvals if a.approved),
            "rejected": sum(1 for a in self.pending_approvals if a.approved == False)
        }


# Singleton
_human_control: Optional[HumanControl] = None


def init_human_control(kernel) -> HumanControl:
    """Initialisiert globales Human Control."""
    global _human_control
    _human_control = HumanControl(kernel)
    return _human_control


def get_human_control() -> HumanControl:
    """Gibt globales Human Control zurück."""
    if _human_control is None:
        raise RuntimeError("Human Control not initialized")
    return _human_control
