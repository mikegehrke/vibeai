# kernel/telemetry.py
# --------------------
# Observability & Telemetrie (Kernel v1.1)
#
# PHILOSOPHIE:
# - Nicht Logs, sondern strukturelle Telemetrie
# - Grundlage für Agent-Optimierung
# - Grundlage für Enterprise-Features
# - Grundlage für Auto-Tuning
#
# FEATURES:
# - Metriken sammeln
# - Agent-Performance tracken
# - Modell-Qualität messen
# - Kosten überwachen

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from enum import Enum
import time


class MetricType(Enum):
    """Typen von Metriken."""
    COUNTER = "counter"       # Zähler (immer steigend)
    GAUGE = "gauge"           # Aktueller Wert
    HISTOGRAM = "histogram"   # Verteilung
    TIMER = "timer"           # Zeit-Messung


@dataclass
class Metric:
    """
    Einzelne Metrik.
    
    Attribute:
    - name: Metrik-Name
    - type: MetricType
    - value: Aktueller Wert
    - unit: Einheit (ms, count, usd, etc.)
    - labels: Zusätzliche Labels
    - timestamp: Zeitstempel
    """
    name: str
    type: MetricType
    value: float
    unit: str
    labels: Dict[str, str] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)


@dataclass
class AgentMetrics:
    """
    Metriken für einen Agenten.
    
    Attribute:
    - agent_name: Name des Agenten
    - total_invocations: Gesamt-Aufrufe
    - successful_actions: Erfolgreiche Aktionen
    - failed_actions: Fehlgeschlagene Aktionen
    - avg_duration_ms: Durchschnittliche Dauer
    - total_duration_ms: Gesamt-Dauer
    - success_rate: Erfolgsquote
    """
    agent_name: str
    total_invocations: int = 0
    successful_actions: int = 0
    failed_actions: int = 0
    avg_duration_ms: float = 0.0
    total_duration_ms: float = 0.0
    
    @property
    def success_rate(self) -> float:
        """Berechnet Erfolgsquote."""
        total = self.successful_actions + self.failed_actions
        if total == 0:
            return 0.0
        return self.successful_actions / total


@dataclass
class ModelMetrics:
    """
    Metriken für ein Modell.
    
    Attribute:
    - model_name: Name des Modells
    - total_requests: Gesamt-Requests
    - total_tokens: Gesamt-Tokens
    - avg_latency_ms: Durchschnittliche Latenz
    - total_cost_usd: Gesamt-Kosten
    - error_rate: Fehlerquote
    """
    model_name: str
    total_requests: int = 0
    total_tokens: int = 0
    avg_latency_ms: float = 0.0
    total_cost_usd: float = 0.0
    errors: int = 0
    
    @property
    def error_rate(self) -> float:
        """Berechnet Fehlerquote."""
        if self.total_requests == 0:
            return 0.0
        return self.errors / self.total_requests


class TelemetrySystem:
    """
    Telemetry System (Kernel v1.1) - Observability & Metriken.
    
    FEATURES:
    - Sammelt Metriken von allen Komponenten
    - Agent-Performance Tracking
    - Modell-Performance Tracking
    - Kosten-Tracking
    - Auto-Aggregation
    
    VORTEILE:
    - Optimierungs-Grundlage
    - Debugging-Hilfe
    - Enterprise-Reporting
    - Cost-Awareness
    """
    
    def __init__(self):
        # Metriken-Speicher
        self.metrics: List[Metric] = []
        self.agent_metrics: Dict[str, AgentMetrics] = {}
        self.model_metrics: Dict[str, ModelMetrics] = {}
        
        # Konfiguration
        self.max_metrics = 10000
        self.retention_seconds = 3600  # 1 Stunde
    
    def record_metric(
        self,
        name: str,
        value: float,
        metric_type: MetricType = MetricType.GAUGE,
        unit: str = "count",
        labels: Optional[Dict[str, str]] = None
    ):
        """
        Zeichnet Metrik auf.
        
        Args:
            name: Metrik-Name
            value: Wert
            metric_type: Typ
            unit: Einheit
            labels: Optional Labels
        """
        metric = Metric(
            name=name,
            type=metric_type,
            value=value,
            unit=unit,
            labels=labels or {}
        )
        
        self.metrics.append(metric)
        
        # Cleanup alte Metriken
        self._cleanup_old_metrics()
    
    def track_agent_action(
        self,
        agent_name: str,
        success: bool,
        duration_ms: float
    ):
        """
        Trackt Agent-Aktion.
        
        Args:
            agent_name: Name des Agenten
            success: Erfolgreich?
            duration_ms: Dauer in ms
        """
        # Agent-Metriken initialisieren falls neu
        if agent_name not in self.agent_metrics:
            self.agent_metrics[agent_name] = AgentMetrics(agent_name=agent_name)
        
        metrics = self.agent_metrics[agent_name]
        metrics.total_invocations += 1
        
        if success:
            metrics.successful_actions += 1
        else:
            metrics.failed_actions += 1
        
        # Durchschnitt aktualisieren
        metrics.total_duration_ms += duration_ms
        metrics.avg_duration_ms = (
            metrics.total_duration_ms / metrics.total_invocations
        )
        
        # Als Metrik aufzeichnen
        self.record_metric(
            name="agent_action_duration",
            value=duration_ms,
            metric_type=MetricType.TIMER,
            unit="ms",
            labels={"agent": agent_name, "success": str(success)}
        )
    
    def track_model_request(
        self,
        model_name: str,
        tokens: int,
        latency_ms: float,
        cost_usd: float,
        success: bool = True
    ):
        """
        Trackt Modell-Request.
        
        Args:
            model_name: Name des Modells
            tokens: Anzahl Tokens
            latency_ms: Latenz
            cost_usd: Kosten
            success: Erfolgreich?
        """
        # Model-Metriken initialisieren falls neu
        if model_name not in self.model_metrics:
            self.model_metrics[model_name] = ModelMetrics(model_name=model_name)
        
        metrics = self.model_metrics[model_name]
        metrics.total_requests += 1
        metrics.total_tokens += tokens
        metrics.total_cost_usd += cost_usd
        
        if not success:
            metrics.errors += 1
        
        # Durchschnitt aktualisieren
        metrics.avg_latency_ms = (
            (metrics.avg_latency_ms * (metrics.total_requests - 1) + latency_ms)
            / metrics.total_requests
        )
        
        # Als Metriken aufzeichnen
        self.record_metric(
            name="model_latency",
            value=latency_ms,
            metric_type=MetricType.TIMER,
            unit="ms",
            labels={"model": model_name}
        )
        
        self.record_metric(
            name="model_tokens",
            value=tokens,
            metric_type=MetricType.COUNTER,
            unit="tokens",
            labels={"model": model_name}
        )
        
        self.record_metric(
            name="model_cost",
            value=cost_usd,
            metric_type=MetricType.COUNTER,
            unit="usd",
            labels={"model": model_name}
        )
    
    def get_agent_stats(self, agent_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Gibt Agent-Statistiken zurück.
        
        Args:
            agent_name: Optionaler Agent-Filter
            
        Returns:
            Dict mit Statistiken
        """
        if agent_name:
            if agent_name not in self.agent_metrics:
                return {}
            metrics = self.agent_metrics[agent_name]
            return {
                "agent": agent_name,
                "invocations": metrics.total_invocations,
                "success_rate": round(metrics.success_rate, 3),
                "avg_duration_ms": round(metrics.avg_duration_ms, 2)
            }
        
        # Alle Agenten
        return {
            agent: {
                "invocations": m.total_invocations,
                "success_rate": round(m.success_rate, 3),
                "avg_duration_ms": round(m.avg_duration_ms, 2)
            }
            for agent, m in self.agent_metrics.items()
        }
    
    def get_model_stats(self, model_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Gibt Modell-Statistiken zurück.
        
        Args:
            model_name: Optionaler Modell-Filter
            
        Returns:
            Dict mit Statistiken
        """
        if model_name:
            if model_name not in self.model_metrics:
                return {}
            metrics = self.model_metrics[model_name]
            return {
                "model": model_name,
                "requests": metrics.total_requests,
                "tokens": metrics.total_tokens,
                "avg_latency_ms": round(metrics.avg_latency_ms, 2),
                "total_cost_usd": round(metrics.total_cost_usd, 4),
                "error_rate": round(metrics.error_rate, 3)
            }
        
        # Alle Modelle
        return {
            model: {
                "requests": m.total_requests,
                "tokens": m.total_tokens,
                "avg_latency_ms": round(m.avg_latency_ms, 2),
                "total_cost_usd": round(m.total_cost_usd, 4),
                "error_rate": round(m.error_rate, 3)
            }
            for model, m in self.model_metrics.items()
        }
    
    def get_summary(self) -> Dict[str, Any]:
        """Gibt Gesamt-Zusammenfassung zurück."""
        total_cost = sum(m.total_cost_usd for m in self.model_metrics.values())
        total_tokens = sum(m.total_tokens for m in self.model_metrics.values())
        total_agent_calls = sum(m.total_invocations for m in self.agent_metrics.values())
        
        return {
            "total_metrics": len(self.metrics),
            "total_cost_usd": round(total_cost, 4),
            "total_tokens": total_tokens,
            "total_agent_calls": total_agent_calls,
            "unique_agents": len(self.agent_metrics),
            "unique_models": len(self.model_metrics)
        }
    
    def _cleanup_old_metrics(self):
        """Löscht alte Metriken."""
        if len(self.metrics) > self.max_metrics:
            # Behalte neueste max_metrics
            self.metrics = self.metrics[-self.max_metrics:]
        
        # Lösche alte (nach Retention)
        cutoff = time.time() - self.retention_seconds
        self.metrics = [m for m in self.metrics if m.timestamp > cutoff]
    
    def reset(self):
        """Setzt alle Metriken zurück (für Tests)."""
        self.metrics = []
        self.agent_metrics = {}
        self.model_metrics = {}


# Singleton
_telemetry: Optional[TelemetrySystem] = None


def init_telemetry_system(kernel) -> TelemetrySystem:
    """Initialisiert globales Telemetry System."""
    global _telemetry
    _telemetry = TelemetrySystem(kernel)
    return _telemetry


def get_telemetry_system() -> TelemetrySystem:
    """Gibt globales Telemetry-System zurück."""
    if _telemetry is None:
        raise RuntimeError("Telemetry not initialized")
    return _telemetry
