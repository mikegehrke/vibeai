# kernel/recovery_engine.py
# --------------------------
# Recovery Engine (Kernel v1.1)
#
# PHILOSOPHIE:
# - Kein "hängt fest"-Zustand mehr
# - Snapshot nach jedem Action-Block
# - Rollback möglich
# - Alternative Pfade
# - Saubere Fehler-Events
#
# FEATURES:
# - Automatic Snapshots
# - Rollback Strategies
# - Retry with Alternatives
# - Error Classification

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any, Callable
from enum import Enum
import time
import copy


class ErrorSeverity(Enum):
    """Schweregrad eines Fehlers."""
    INFO = "info"           # Ignorierbar
    WARNING = "warning"     # Fortsetzbar
    ERROR = "error"         # Behebbar
    CRITICAL = "critical"   # Rollback nötig
    FATAL = "fatal"         # Abbruch


class RetryStrategy(Enum):
    """Strategien für Retry."""
    IMMEDIATE = "immediate"                 # Sofort wiederholen
    ALTERNATIVE_DEPENDENCY = "alternative"  # Andere Abhängigkeit
    ROLLBACK_RETRY = "rollback"            # Zurück und neu
    SKIP_STEP = "skip"                     # Schritt überspringen
    MANUAL = "manual"                      # User eingreifen


@dataclass
class Snapshot:
    """
    System-Snapshot für Rollback.
    
    Attribute:
    - id: Eindeutige ID
    - timestamp: Erstellungs-Zeitpunkt
    - flow_state: Kopie des FlowState
    - action_graph_state: Kopie des ActionGraph
    - file_checksums: Datei-Hashes
    - description: Beschreibung
    """
    id: str
    timestamp: float
    flow_state: Dict[str, Any]
    action_graph_state: Dict[str, Any]
    file_checksums: Dict[str, str]
    description: str
    
    def __post_init__(self):
        """Validierung."""
        if not self.id:
            self.id = f"snapshot_{int(self.timestamp)}"


@dataclass
class RecoveryPlan:
    """
    Plan zur Fehler-Behebung.
    
    Attribute:
    - failed_action: Fehlgeschlagene Aktion
    - error_type: Art des Fehlers
    - severity: Schweregrad
    - rollback_snapshot: Snapshot-ID für Rollback
    - retry_strategy: Wie wiederholen?
    - alternative_actions: Alternative Aktionen
    - max_retries: Max. Wiederholungen
    - requires_human: Braucht User-Eingabe?
    """
    failed_action: str
    error_type: str
    severity: ErrorSeverity
    rollback_snapshot: Optional[str]
    retry_strategy: RetryStrategy
    alternative_actions: List[str] = field(default_factory=list)
    max_retries: int = 2
    requires_human: bool = False
    
    # Runtime
    retry_count: int = 0
    executed: bool = False


class RecoveryEngine:
    """
    Recovery Engine (Kernel v1.1) - Auto-Repair auf Kernel-Ebene.
    
    REGELN:
    - Snapshot vor jeder irreversiblen Aktion
    - Bei Fehler: automatische Klassifikation
    - Recovery-Plan erstellen
    - Rollback wenn nötig
    - Alternativen versuchen
    
    VORTEILE:
    - Keine hängenden Zustände
    - Automatische Fehler-Behebung
    - Nachvollziehbare Recovery
    - Zeit-Reise möglich (Debugging)
    """
    
    def __init__(self, kernel):
        """
        Args:
            kernel: Kernel-Instanz
        """
        self.kernel = kernel
        self.snapshots: List[Snapshot] = []
        self.recovery_plans: List[RecoveryPlan] = []
        
        # Konfiguration
        self.max_snapshots = 50  # Max. gespeicherte Snapshots
        self.auto_snapshot_interval = 5  # Alle 5 Actions
        self.action_counter = 0
    
    def create_snapshot(self, description: str = "Auto") -> Snapshot:
        """
        Erstellt System-Snapshot.
        
        Args:
            description: Beschreibung des Snapshots
            
        Returns:
            Snapshot-Objekt
        """
        snapshot = Snapshot(
            id=f"snapshot_{int(time.time())}",
            timestamp=time.time(),
            flow_state=self._capture_flow_state(),
            action_graph_state=self._capture_action_graph(),
            file_checksums=self._capture_file_checksums(),
            description=description
        )
        
        self.snapshots.append(snapshot)
        
        # Cleanup alte Snapshots
        if len(self.snapshots) > self.max_snapshots:
            self.snapshots = self.snapshots[-self.max_snapshots:]
        
        return snapshot
    
    def classify_error(self, error: Exception, context: Dict) -> ErrorSeverity:
        """
        Klassifiziert Fehler-Schweregrad.
        
        Args:
            error: Exception
            context: Fehler-Kontext
            
        Returns:
            ErrorSeverity
        """
        error_str = str(error).lower()
        
        # Critical: System-Fehler
        if "kernel" in error_str or "core" in error_str:
            return ErrorSeverity.CRITICAL
        
        # Fatal: Nicht behebbar
        if "permission denied" in error_str:
            return ErrorSeverity.FATAL
        
        # Error: Behebbar
        if "not found" in error_str or "syntax" in error_str:
            return ErrorSeverity.ERROR
        
        # Warning: Fortsetzbar
        if "warning" in error_str:
            return ErrorSeverity.WARNING
        
        # Default
        return ErrorSeverity.ERROR
    
    def create_recovery_plan(
        self,
        failed_action: str,
        error: Exception,
        context: Dict
    ) -> RecoveryPlan:
        """
        Erstellt Recovery-Plan.
        
        Args:
            failed_action: Fehlgeschlagene Aktion
            error: Exception
            context: Kontext
            
        Returns:
            RecoveryPlan
        """
        severity = self.classify_error(error, context)
        
        # Strategie basierend auf Severity
        if severity == ErrorSeverity.CRITICAL:
            strategy = RetryStrategy.ROLLBACK_RETRY
            snapshot_id = self.snapshots[-1].id if self.snapshots else None
        elif severity == ErrorSeverity.FATAL:
            strategy = RetryStrategy.MANUAL
            snapshot_id = None
        else:
            strategy = RetryStrategy.ALTERNATIVE_DEPENDENCY
            snapshot_id = None
        
        # Alternative Aktionen vorschlagen
        alternatives = self._suggest_alternatives(failed_action, error)
        
        plan = RecoveryPlan(
            failed_action=failed_action,
            error_type=type(error).__name__,
            severity=severity,
            rollback_snapshot=snapshot_id,
            retry_strategy=strategy,
            alternative_actions=alternatives,
            requires_human=(severity >= ErrorSeverity.CRITICAL)
        )
        
        self.recovery_plans.append(plan)
        return plan
    
    async def execute_recovery(self, plan: RecoveryPlan) -> bool:
        """
        Führt Recovery-Plan aus.
        
        Args:
            plan: RecoveryPlan
            
        Returns:
            True wenn erfolgreich
        """
        if plan.executed:
            return True
        
        # Retry-Limit prüfen
        if plan.retry_count >= plan.max_retries:
            return False
        
        plan.retry_count += 1
        
        # Strategie ausführen
        if plan.retry_strategy == RetryStrategy.ROLLBACK_RETRY:
            success = await self._execute_rollback(plan.rollback_snapshot)
            if success:
                # Nach Rollback: Original-Aktion nochmal
                # TODO: Aktion neu ausführen
                pass
        
        elif plan.retry_strategy == RetryStrategy.ALTERNATIVE_DEPENDENCY:
            # Alternative Aktionen probieren
            for alt_action in plan.alternative_actions:
                try:
                    # TODO: Alternative ausführen
                    plan.executed = True
                    return True
                except Exception:
                    continue
        
        elif plan.retry_strategy == RetryStrategy.SKIP_STEP:
            # Schritt überspringen
            plan.executed = True
            return True
        
        return False
    
    async def _execute_rollback(self, snapshot_id: Optional[str]) -> bool:
        """
        Führt Rollback auf Snapshot aus.
        
        Args:
            snapshot_id: Snapshot-ID
            
        Returns:
            True wenn erfolgreich
        """
        if not snapshot_id:
            return False
        
        # Snapshot finden
        snapshot = next((s for s in self.snapshots if s.id == snapshot_id), None)
        if not snapshot:
            return False
        
        # FlowState wiederherstellen
        self._restore_flow_state(snapshot.flow_state)
        
        # ActionGraph wiederherstellen
        self._restore_action_graph(snapshot.action_graph_state)
        
        # Dateien wiederherstellen (optional)
        # TODO: File-Rollback implementieren
        
        return True
    
    def _suggest_alternatives(self, failed_action: str, error: Exception) -> List[str]:
        """Schlägt alternative Aktionen vor."""
        # TODO: Intelligente Alternative-Vorschläge
        # Vorerst: Leere Liste
        return []
    
    def _capture_flow_state(self) -> Dict:
        """Erfasst FlowState."""
        flow_state = self.kernel.flow_state
        return {
            "active": flow_state.active,
            "mode": flow_state.mode,
            "project": flow_state.project,
            "step": flow_state.step,
            "todo": flow_state.todo.copy()
        }
    
    def _capture_action_graph(self) -> Dict:
        """Erfasst ActionGraph-State."""
        # TODO: ActionGraph serialisieren
        return {}
    
    def _capture_file_checksums(self) -> Dict[str, str]:
        """Berechnet Datei-Hashes."""
        # TODO: File-Hashing implementieren
        return {}
    
    def _restore_flow_state(self, state: Dict):
        """Stellt FlowState wieder her."""
        flow_state = self.kernel.flow_state
        flow_state.active = state["active"]
        flow_state.mode = state["mode"]
        flow_state.project = state["project"]
        flow_state.step = state["step"]
        flow_state.todo = state["todo"].copy()
    
    def _restore_action_graph(self, state: Dict):
        """Stellt ActionGraph wieder her."""
        # TODO: ActionGraph deserialisieren
        pass
    
    def get_latest_snapshot(self) -> Optional[Snapshot]:
        """Gibt neuesten Snapshot zurück."""
        return self.snapshots[-1] if self.snapshots else None
    
    def get_stats(self) -> Dict[str, Any]:
        """Gibt Statistiken zurück."""
        return {
            "total_snapshots": len(self.snapshots),
            "total_recoveries": len(self.recovery_plans),
            "successful_recoveries": sum(1 for p in self.recovery_plans if p.executed),
            "pending_recoveries": sum(1 for p in self.recovery_plans if not p.executed)
        }


# Singleton
_recovery_engine: Optional[RecoveryEngine] = None


def init_recovery_engine(kernel) -> RecoveryEngine:
    """Initialisiert globale Recovery Engine."""
    global _recovery_engine
    _recovery_engine = RecoveryEngine(kernel)
    return _recovery_engine


def get_recovery_engine() -> RecoveryEngine:
    """Gibt globale Recovery Engine zurück."""
    if _recovery_engine is None:
        raise RuntimeError("Recovery Engine not initialized")
    return _recovery_engine
