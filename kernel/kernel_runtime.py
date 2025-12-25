# kernel/kernel_runtime.py
# -------------------------
# Kernel Runtime Container (v1.1)
#
# PHILOSOPHIE:
# - Runtime lebt ÜBER Kernel-Neustarts
# - Hält alle System-Komponenten
# - Ist serialisierbar
# - Single Source of Truth für State
#
# WICHTIG:
# - kernel_v1.py erzeugt KEINE Komponenten selbst
# - Runtime ist Dependency Injection Container
# - Ermöglicht Hot-Reload, Testing, Mocking

from typing import Optional
import time
import uuid

# v1.1 Komponenten
from kernel.routing.model_router import ModelRouter
from kernel.routing.agent_arbitrator import AgentArbitrator
from kernel.recovery.recovery_engine import RecoveryEngine
from kernel.telemetry.telemetry import TelemetrySystem
from kernel.control.human_control import HumanControl, ControlMode
from kernel.control.security_policy import SecurityPolicy, SecurityLevel


class KernelRuntime:
    """
    Kernel Runtime Container (v1.1).
    
    VERANTWORTLICHKEITEN:
    - Hält alle v1.1 Komponenten
    - Initialisiert Singletons
    - Bietet einheitlichen Zugriff
    - Ist serialisierbar für Restart
    
    LIFECYCLE:
    1. Erstelle Runtime
    2. Erstelle KernelV1(runtime)
    3. Bei Restart: lade Runtime aus Store
    4. Neue KernelV1(loaded_runtime)
    
    KOMPONENTEN:
    - ModelRouter: Task → Model Selection
    - AgentArbitrator: Agent Conflict Resolution
    - RecoveryEngine: Error Recovery & Rollback
    - TelemetrySystem: Metrics & Observability
    - HumanControl: User Override & Learning
    - SecurityPolicy: API Keys & Sandboxing
    """
    
    def __init__(
        self,
        security_level: SecurityLevel = SecurityLevel.NORMAL,
        control_mode: ControlMode = ControlMode.ASSISTED,
        kernel_instance=None  # Wird später gesetzt
    ):
        """
        Initialisiert Runtime mit allen v1.1 Komponenten.
        
        Args:
            security_level: Security-Level (STRICT/NORMAL/PERMISSIVE)
            control_mode: Human-Control-Modus (AUTO/ASSISTED/LEARNING/OBSERVE)
            kernel_instance: Kernel-Referenz (optional, für Callbacks)
        """
        # Metadata (Spec 3 - Session Management)
        self.session_id = str(uuid.uuid4())
        self.started_at = time.time()
        self.restart_count = 0
        self.kernel_version = "1.2"
        
        # Kernel-Referenz (für Komponenten die Kernel brauchen)
        self._kernel = kernel_instance
        
        # ===== INITIALISIERUNG DER v1.1 KOMPONENTEN =====
        
        # 1. Model Router (braucht available_models Dict)
        default_models = {
            "gpt-4o": {"cost_tier": "high", "streaming": True, "tasks": ["chat", "code", "analysis"]},
            "gpt-4o-mini": {"cost_tier": "low", "streaming": True, "tasks": ["chat", "simple"]},
        }
        self.model_router = ModelRouter(available_models=default_models)
        
        # 2. Telemetry (kein Parameter)
        self.telemetry = TelemetrySystem()
        
        # 3. Security Policy (braucht kernel, level)
        self.security = SecurityPolicy(self._kernel, level=security_level)
        
        # 4. Recovery Engine (braucht kernel)
        self.recovery = RecoveryEngine(self._kernel)
        
        # 5. Agent Arbitrator (braucht kernel)
        self.agent_arbitrator = AgentArbitrator(self._kernel)
        
        # 6. Human Control (braucht kernel)
        self.human_control = HumanControl(self._kernel)
        self.human_control.set_mode(control_mode)
        
        # State
        self._initialized = True
    
    def set_kernel(self, kernel):
        """
        Setzt Kernel-Referenz nach Erstellung.
        
        Warum?
        - Runtime wird vor Kernel erstellt
        - Kernel braucht Runtime
        - Circular Dependency wird so gelöst
        
        Args:
            kernel: KernelV1 Instanz
        """
        self._kernel = kernel
        
        # Update Komponenten
        self.model_router.kernel = kernel
        self.agent_arbitrator.kernel = kernel
        self.recovery.kernel = kernel
        self.telemetry.kernel = kernel
        self.human_control.kernel = kernel
        self.security.kernel = kernel
    
    def is_ready(self) -> bool:
        """Prüft ob Runtime bereit ist."""
        return self._initialized and self._kernel is not None
    
    def get_uptime(self) -> float:
        """Gibt Laufzeit in Sekunden zurück."""
        return time.time() - self.started_at
    
    def get_stats(self) -> dict:
        """
        Sammelt Statistiken von allen Komponenten.
        
        Returns:
            Aggregierte Stats
        """
        return {
            "runtime": {
                "version": self.kernel_version,
                "uptime_seconds": self.get_uptime(),
                "restart_count": self.restart_count,
                "ready": self.is_ready()
            },
            "model_router": self.model_router.get_stats(),
            "agent_arbitrator": self.agent_arbitrator.get_stats(),
            "recovery": self.recovery.get_stats(),
            "telemetry": self.telemetry.get_summary(),
            "human_control": self.human_control.get_stats(),
            "security": self.security.get_stats()
        }
    
    def to_dict(self) -> dict:
        """
        Serialisiert Runtime für Speicherung.
        
        Returns:
            Serialisierbare Dict-Repräsentation
        """
        return {
            "version": self.kernel_version,
            "session_id": self.session_id,
            "started_at": self.started_at,
            "restart_count": self.restart_count,
            "security_level": self.security.level.value,
            "control_mode": self.human_control.mode.value,
            # Komponenten-State (falls serialisierbar)
            "stats": self.get_stats()
        }
    
    @classmethod
    def from_dict(cls, data: dict, kernel=None):
        """
        Lädt Runtime aus gespeichertem State.
        
        Args:
            data: Serialisierte Daten
            kernel: Kernel-Instanz
            
        Returns:
            Wiederhergestellte Runtime
        """
        runtime = cls(
            security_level=SecurityLevel(data.get("security_level", "normal")),
            control_mode=ControlMode(data.get("control_mode", "assisted")),
            kernel_instance=kernel
        )
        
        # Restore Metadata
        runtime.started_at = data.get("started_at", time.time())
        runtime.restart_count = data.get("restart_count", 0) + 1
        
        return runtime


# ===== GLOBAL SINGLETON =====

_runtime: Optional[KernelRuntime] = None


def init_runtime(
    security_level: SecurityLevel = SecurityLevel.NORMAL,
    control_mode: ControlMode = ControlMode.ASSISTED,
    kernel=None
) -> KernelRuntime:
    """
    Initialisiert globale Kernel-Runtime.
    
    Args:
        security_level: Security-Level
        control_mode: Human-Control-Modus
        kernel: Kernel-Instanz
        
    Returns:
        Runtime-Instanz
    """
    global _runtime
    _runtime = KernelRuntime(
        security_level=security_level,
        control_mode=control_mode,
        kernel_instance=kernel
    )
    return _runtime


def get_runtime() -> KernelRuntime:
    """
    Gibt globale Runtime zurück.
    
    Returns:
        Runtime-Instanz
        
    Raises:
        RuntimeError: Wenn Runtime nicht initialisiert
    """
    if _runtime is None:
        raise RuntimeError("Runtime not initialized. Call init_runtime() first.")
    return _runtime


def reset_runtime():
    """
    Resettet globale Runtime.
    
    VORSICHT: Nur für Tests!
    """
    global _runtime
    _runtime = None
