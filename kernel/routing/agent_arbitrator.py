# kernel/agent_arbitrator.py
# ---------------------------
# Agent Arbitration Engine (Kernel v1.1)
#
# PHILOSOPHIE:
# - Agenten konkurrieren nie direkt
# - Kernel ist der einzige Schiedsrichter
# - Entscheidung basierend auf Confidence, Risiko, Kontext
#
# FEATURES:
# - Agent-Proposals sammeln
# - Beste Proposal auswählen
# - Konfliktlösung
# - Priority-basierte Entscheidung

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum
import time


class ProposalStatus(Enum):
    """Status einer Agent-Proposal."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    TIMEOUT = "timeout"


@dataclass
class AgentProposal:
    """
    Vorschlag eines Agenten für nächste Aktion.
    
    Attribute:
    - agent: Name des Agenten
    - action: Vorgeschlagene Aktion
    - confidence: Wie sicher ist Agent? (0-1)
    - risk: Geschätztes Risiko (0-1)
    - priority: Wie wichtig? (0-1)
    - estimated_steps: Geschätzte Schritte
    - reasoning: Begründung
    - requires_human: Braucht menschliche Freigabe?
    """
    agent: str
    action: str
    confidence: float
    risk: float
    priority: float
    estimated_steps: int
    reasoning: str
    requires_human: bool = False
    
    # Runtime
    status: ProposalStatus = ProposalStatus.PENDING
    timestamp: float = field(default_factory=time.time)
    score: float = 0.0
    
    def __post_init__(self):
        """Berechne Score nach Init."""
        self.score = self._calculate_score()
    
    def _calculate_score(self) -> float:
        """
        Berechnet Gesamt-Score für Proposal.
        
        Formel:
        score = (confidence * priority) - (risk * 0.5)
        
        Returns:
            Score zwischen -0.5 und 1.0
        """
        return (self.confidence * self.priority) - (self.risk * 0.5)


@dataclass
class ArbitrationDecision:
    """
    Entscheidung des Arbitrators.
    
    Attribute:
    - selected_agent: Gewählter Agent
    - selected_action: Gewählte Aktion
    - reason: Begründung
    - rejected_proposals: Abgelehnte Vorschläge
    - confidence: Wie sicher ist Entscheidung?
    """
    selected_agent: str
    selected_action: str
    reason: str
    rejected_proposals: List[AgentProposal]
    confidence: float
    requires_human_approval: bool = False


class AgentArbitrator:
    """
    Agent Arbitrator (Kernel v1.1) - Konfliktlösung zwischen Agenten.
    
    REGELN:
    - Nur EIN Agent aktiv pro Schritt
    - Entscheidung basiert auf:
      * Confidence
      * Risk
      * Priority
      * Kontext (FlowState)
    - Bei Gleichstand: Konservativster Vorschlag gewinnt
    
    VORTEILE:
    - Keine Agent-Konflikte
    - Nachvollziehbare Entscheidungen
    - Risiko-Kontrolle
    - Human-in-the-Loop Option
    """
    
    def __init__(self, kernel):
        """
        Args:
            kernel: Kernel-Instanz für Kontext-Zugriff
        """
        self.kernel = kernel
        self.proposals: List[AgentProposal] = []
        self.decision_history: List[ArbitrationDecision] = []
        
        # Konfiguration
        self.timeout_seconds = 30
        self.min_confidence_threshold = 0.3
        self.max_risk_threshold = 0.8
    
    def submit_proposal(self, proposal: AgentProposal):
        """
        Agent reicht Vorschlag ein.
        
        Args:
            proposal: AgentProposal
        """
        self.proposals.append(proposal)
    
    def arbitrate(
        self,
        context: Optional[Dict] = None,
        allow_high_risk: bool = False
    ) -> ArbitrationDecision:
        """
        Entscheidet welcher Agent aktiv wird.
        
        Args:
            context: Optionaler Kontext (FlowState, etc.)
            allow_high_risk: Erlaube riskante Aktionen?
            
        Returns:
            ArbitrationDecision
        """
        if not self.proposals:
            raise ValueError("No proposals to arbitrate")
        
        # 1. Filter ungültige Proposals
        valid_proposals = self._filter_valid_proposals(allow_high_risk)
        
        if not valid_proposals:
            # Alle abgelehnt → Fallback
            return self._create_fallback_decision()
        
        # 2. Sortiere nach Score
        sorted_proposals = sorted(
            valid_proposals,
            key=lambda p: p.score,
            reverse=True
        )
        
        # 3. Wähle besten Vorschlag
        winner = sorted_proposals[0]
        rejected = sorted_proposals[1:]
        
        # 4. Prüfe ob Human-Approval nötig
        requires_human = (
            winner.requires_human or
            winner.risk > 0.7 or
            winner.confidence < 0.5
        )
        
        # 5. Decision erstellen
        decision = ArbitrationDecision(
            selected_agent=winner.agent,
            selected_action=winner.action,
            reason=winner.reasoning,
            rejected_proposals=rejected,
            confidence=winner.confidence,
            requires_human_approval=requires_human
        )
        
        # 6. Status aktualisieren
        winner.status = ProposalStatus.ACCEPTED
        for prop in rejected:
            prop.status = ProposalStatus.REJECTED
        
        # 7. History speichern
        self.decision_history.append(decision)
        
        # 8. Proposals clearen
        self.proposals = []
        
        return decision
    
    def _filter_valid_proposals(self, allow_high_risk: bool) -> List[AgentProposal]:
        """
        Filtert ungültige Proposals.
        
        Args:
            allow_high_risk: Erlaube riskante Vorschläge?
            
        Returns:
            Liste valider Proposals
        """
        valid = []
        
        for prop in self.proposals:
            # Zu alte Proposals (Timeout)
            age = time.time() - prop.timestamp
            if age > self.timeout_seconds:
                prop.status = ProposalStatus.TIMEOUT
                continue
            
            # Zu niedrige Confidence
            if prop.confidence < self.min_confidence_threshold:
                continue
            
            # Zu hohes Risiko (außer erlaubt)
            if not allow_high_risk and prop.risk > self.max_risk_threshold:
                continue
            
            valid.append(prop)
        
        return valid
    
    def _create_fallback_decision(self) -> ArbitrationDecision:
        """Erstellt Fallback-Decision wenn alle Proposals abgelehnt."""
        return ArbitrationDecision(
            selected_agent="SmartAgent",
            selected_action="wait",
            reason="Alle Proposals abgelehnt - Standard-Agent gewählt",
            rejected_proposals=self.proposals.copy(),
            confidence=0.5,
            requires_human_approval=True
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """Gibt Statistiken zurück."""
        if not self.decision_history:
            return {
                "total_decisions": 0,
                "avg_confidence": 0.0,
                "human_approvals_needed": 0
            }
        
        return {
            "total_decisions": len(self.decision_history),
            "avg_confidence": sum(d.confidence for d in self.decision_history) / len(self.decision_history),
            "human_approvals_needed": sum(1 for d in self.decision_history if d.requires_human_approval),
            "agents_used": self._count_agents_used()
        }
    
    def _count_agents_used(self) -> Dict[str, int]:
        """Zählt wie oft jeder Agent gewählt wurde."""
        counts = {}
        for decision in self.decision_history:
            agent = decision.selected_agent
            counts[agent] = counts.get(agent, 0) + 1
        return counts
    
    def clear_history(self):
        """Löscht Decision-History (für Tests/Debugging)."""
        self.decision_history = []


# Singleton
_arbitrator: Optional[AgentArbitrator] = None


def init_agent_arbitrator(kernel) -> AgentArbitrator:
    """Initialisiert globalen Arbitrator."""
    global _arbitrator
    _arbitrator = AgentArbitrator(kernel)
    return _arbitrator


def get_agent_arbitrator() -> AgentArbitrator:
    """Gibt globalen Arbitrator zurück."""
    if _arbitrator is None:
        raise RuntimeError("Arbitrator not initialized")
    return _arbitrator
