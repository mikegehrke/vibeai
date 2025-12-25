# kernel/agents/agent_registry.py
# ----------------------------------
# Agent Registry - Lifecycle Management (Phase 1B)
#
# PHILOSOPHIE:
# - Agenten haben einen Lebenszyklus
# - Aktivieren, Pausieren, Upgraden, Entfernen
# - Persist across Restarts
# - Version Management
#
# VORTEILE:
# - User arbeitet MIT Agenten, nicht nur durch sie
# - Agenten "leben" im System
# - Nachvollziehbare Historie

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set
from enum import Enum
import json
import time
from pathlib import Path

from kernel.agents.agent_factory import AgentInstance, AgentTemplate


class AgentStatus(Enum):
    """Agent-Status im Lifecycle."""
    CREATED = "created"        # Gerade erstellt
    ACTIVE = "active"          # Aktiv und bereit
    PAUSED = "paused"          # Pausiert
    UPGRADING = "upgrading"    # Wird upgegradet
    DEPRECATED = "deprecated"  # Veraltet, aber noch nutzbar
    REMOVED = "removed"        # Entfernt
    ERROR = "error"            # Fehlerzustand


@dataclass
class AgentVersion:
    """
    Agent-Version für Versionierung.
    
    Attribute:
    - version: Version-String (z.B. "1.0", "1.1")
    - changes: Änderungen in dieser Version
    - created_at: Erstellungs-Zeitpunkt
    - deprecated: Ist deprecated?
    """
    version: str
    changes: List[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    deprecated: bool = False


@dataclass
class AgentHistoryEntry:
    """
    Historien-Eintrag für Agent.
    
    Attribute:
    - timestamp: Zeitpunkt
    - action: Aktion (activated, paused, upgraded, etc.)
    - details: Details
    - user: Wer hat die Aktion ausgeführt
    """
    timestamp: float
    action: str
    details: Dict = field(default_factory=dict)
    user: str = "system"


class AgentRegistry:
    """
    Agent Registry (Phase 1B) - Lifecycle Management.
    
    FEATURES:
    - Register/Unregister Agents
    - Activate/Pause/Resume
    - Version Management
    - Persist Agent State
    - History Tracking
    
    VERWENDUNG:
    ```python
    registry = AgentRegistry()
    
    # Registriere Agent
    registry.register(agent_instance)
    
    # Lifecycle
    registry.pause("agent-id")
    registry.resume("agent-id")
    registry.upgrade("agent-id", "2.0")
    
    # Persistenz
    registry.save()
    registry.load()
    ```
    """
    
    def __init__(self, storage_path: str = "./kernel_state/agents"):
        """
        Args:
            storage_path: Pfad für Agent-Persistenz
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        # Registrierte Agenten
        self.agents: Dict[str, AgentInstance] = {}
        
        # Status Tracking
        self.status: Dict[str, AgentStatus] = {}
        
        # Versionen
        self.versions: Dict[str, List[AgentVersion]] = {}
        
        # History
        self.history: Dict[str, List[AgentHistoryEntry]] = {}
        
        # Metadata
        self.created_at = time.time()
    
    def register(
        self,
        agent: AgentInstance,
        initial_status: AgentStatus = AgentStatus.ACTIVE
    ) -> str:
        """
        Registriert einen Agenten.
        
        Args:
            agent: Agent-Instanz
            initial_status: Initialer Status
            
        Returns:
            Agent-ID
        """
        agent_id = agent.agent_id
        
        # Registriere
        self.agents[agent_id] = agent
        self.status[agent_id] = initial_status
        self.versions[agent_id] = [
            AgentVersion(version=agent.template.version)
        ]
        self.history[agent_id] = []
        
        # History-Eintrag
        self._add_history(
            agent_id,
            "registered",
            {"name": agent.name, "template": agent.template.name}
        )
        
        return agent_id
    
    def unregister(self, agent_id: str):
        """Entfernt einen Agenten aus Registry."""
        if agent_id not in self.agents:
            return
        
        # History
        self._add_history(agent_id, "unregistered")
        
        # Entferne
        self.status[agent_id] = AgentStatus.REMOVED
        # Behalte in Registry für History, aber markiere als removed
    
    def activate(self, agent_id: str):
        """Aktiviert einen Agenten."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} nicht registriert")
        
        self.status[agent_id] = AgentStatus.ACTIVE
        self.agents[agent_id].active = True
        
        self._add_history(agent_id, "activated")
    
    def pause(self, agent_id: str):
        """Pausiert einen Agenten."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} nicht registriert")
        
        self.status[agent_id] = AgentStatus.PAUSED
        self.agents[agent_id].active = False
        
        self._add_history(agent_id, "paused")
    
    def resume(self, agent_id: str):
        """Setzt pausierten Agenten fort."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} nicht registriert")
        
        if self.status[agent_id] == AgentStatus.PAUSED:
            self.activate(agent_id)
            self._add_history(agent_id, "resumed")
    
    def upgrade(
        self,
        agent_id: str,
        new_version: str,
        changes: Optional[List[str]] = None
    ):
        """
        Upgraded einen Agenten auf neue Version.
        
        Args:
            agent_id: Agent-ID
            new_version: Neue Version
            changes: Liste der Änderungen
        """
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} nicht registriert")
        
        # Status: Upgrading
        old_status = self.status[agent_id]
        self.status[agent_id] = AgentStatus.UPGRADING
        
        # Neue Version hinzufügen
        version = AgentVersion(
            version=new_version,
            changes=changes or []
        )
        self.versions[agent_id].append(version)
        
        # Template-Version updaten
        self.agents[agent_id].template.version = new_version
        
        # Zurück zu altem Status
        self.status[agent_id] = old_status
        
        self._add_history(
            agent_id,
            "upgraded",
            {"version": new_version, "changes": changes}
        )
    
    def deprecate(self, agent_id: str):
        """Markiert Agent als deprecated."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} nicht registriert")
        
        self.status[agent_id] = AgentStatus.DEPRECATED
        
        # Aktuelle Version als deprecated markieren
        if self.versions[agent_id]:
            self.versions[agent_id][-1].deprecated = True
        
        self._add_history(agent_id, "deprecated")
    
    def get_agent(self, agent_id: str) -> Optional[AgentInstance]:
        """Holt Agent by ID."""
        return self.agents.get(agent_id)
    
    def get_status(self, agent_id: str) -> Optional[AgentStatus]:
        """Holt Agent-Status."""
        return self.status.get(agent_id)
    
    def list_agents(
        self,
        status_filter: Optional[AgentStatus] = None,
        active_only: bool = False
    ) -> List[AgentInstance]:
        """
        Listet Agenten.
        
        Args:
            status_filter: Nur Agenten mit diesem Status
            active_only: Nur aktive Agenten
            
        Returns:
            Liste von AgentInstance
        """
        agents = list(self.agents.values())
        
        if status_filter:
            agents = [
                a for a in agents
                if self.status.get(a.agent_id) == status_filter
            ]
        
        if active_only:
            agents = [a for a in agents if a.active]
        
        return agents
    
    def get_history(self, agent_id: str) -> List[AgentHistoryEntry]:
        """Gibt Agent-History zurück."""
        return self.history.get(agent_id, [])
    
    def get_versions(self, agent_id: str) -> List[AgentVersion]:
        """Gibt Agent-Versionen zurück."""
        return self.versions.get(agent_id, [])
    
    def _add_history(self, agent_id: str, action: str, details: Optional[Dict] = None):
        """Fügt History-Eintrag hinzu."""
        if agent_id not in self.history:
            self.history[agent_id] = []
        
        entry = AgentHistoryEntry(
            timestamp=time.time(),
            action=action,
            details=details or {}
        )
        
        self.history[agent_id].append(entry)
    
    def save(self):
        """
        Speichert Registry auf Disk.
        
        Format: JSON mit allen Agenten, Stati, Versionen, History
        """
        data = {
            "created_at": self.created_at,
            "agents": {},
            "status": {},
            "versions": {},
            "history": {}
        }
        
        # Serialize Agenten (vereinfacht, da Templates komplex sind)
        for agent_id, agent in self.agents.items():
            data["agents"][agent_id] = {
                "agent_id": agent.agent_id,
                "name": agent.name,
                "template_name": agent.template.name,
                "active": agent.active,
                "context": agent.context,
                "stats": agent.stats,
                "created_at": agent.created_at,
                "last_used": agent.last_used,
                "use_count": agent.use_count
            }
        
        # Status
        for agent_id, status in self.status.items():
            data["status"][agent_id] = status.value
        
        # Versionen
        for agent_id, versions in self.versions.items():
            data["versions"][agent_id] = [
                {
                    "version": v.version,
                    "changes": v.changes,
                    "created_at": v.created_at,
                    "deprecated": v.deprecated
                }
                for v in versions
            ]
        
        # History
        for agent_id, history in self.history.items():
            data["history"][agent_id] = [
                {
                    "timestamp": h.timestamp,
                    "action": h.action,
                    "details": h.details,
                    "user": h.user
                }
                for h in history
            ]
        
        # Speichere
        registry_file = self.storage_path / "agent_registry.json"
        with open(registry_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def load(self):
        """Lädt Registry von Disk."""
        registry_file = self.storage_path / "agent_registry.json"
        
        if not registry_file.exists():
            return
        
        with open(registry_file, "r") as f:
            data = json.load(f)
        
        self.created_at = data.get("created_at", time.time())
        
        # Lade Status
        for agent_id, status_str in data.get("status", {}).items():
            self.status[agent_id] = AgentStatus(status_str)
        
        # Lade Versionen
        for agent_id, versions_data in data.get("versions", {}).items():
            self.versions[agent_id] = [
                AgentVersion(
                    version=v["version"],
                    changes=v["changes"],
                    created_at=v["created_at"],
                    deprecated=v.get("deprecated", False)
                )
                for v in versions_data
            ]
        
        # Lade History
        for agent_id, history_data in data.get("history", {}).items():
            self.history[agent_id] = [
                AgentHistoryEntry(
                    timestamp=h["timestamp"],
                    action=h["action"],
                    details=h["details"],
                    user=h.get("user", "system")
                )
                for h in history_data
            ]
        
        # Note: Agenten selbst müssen aus Factory neu erstellt werden
        # da Templates nicht vollständig serialisiert sind
    
    def get_stats(self) -> Dict:
        """Gibt Registry-Statistiken zurück."""
        return {
            "total_agents": len(self.agents),
            "active_agents": sum(1 for s in self.status.values() if s == AgentStatus.ACTIVE),
            "paused_agents": sum(1 for s in self.status.values() if s == AgentStatus.PAUSED),
            "deprecated_agents": sum(1 for s in self.status.values() if s == AgentStatus.DEPRECATED),
            "removed_agents": sum(1 for s in self.status.values() if s == AgentStatus.REMOVED),
            "status_breakdown": {
                status.value: sum(1 for s in self.status.values() if s == status)
                for status in AgentStatus
            },
            "uptime_seconds": time.time() - self.created_at
        }


# Singleton
_registry: Optional[AgentRegistry] = None


def get_agent_registry() -> AgentRegistry:
    """Gibt globale Agent Registry zurück."""
    global _registry
    if _registry is None:
        _registry = AgentRegistry()
        _registry.load()  # Load from disk
    return _registry
