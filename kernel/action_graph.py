# kernel/action_graph.py
# -----------------------
# Action Graph - DAG for Workflow Management (Kernel v1.0)
#
# VORTEILE:
# - Undo möglich
# - Re-Run möglich
# - Simulation ohne Ausführung
# - Parallele Agenten
# - Erweiterbar ohne Umbau

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Callable
from enum import Enum
import asyncio


class ActionStatus(Enum):
    """Status eines Action-Nodes."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class ActionNode:
    """
    Ein Node im Action-Graph (DAG).
    
    Attribute:
    - id: Eindeutige ID
    - requires: Liste von IDs, die vorher abgeschlossen sein müssen
    - reversible: Kann rückgängig gemacht werden?
    - action: Die auszuführende Funktion
    - undo_action: Funktion zum Rückgängigmachen (optional)
    - status: Aktueller Status
    - result: Ergebnis der Ausführung
    """
    id: str
    action: Callable
    requires: List[str] = field(default_factory=list)
    reversible: bool = True
    undo_action: Optional[Callable] = None
    status: ActionStatus = ActionStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None
    
    def can_execute(self, completed_ids: set) -> bool:
        """Prüft ob alle Dependencies erfüllt sind."""
        return all(req_id in completed_ids for req_id in self.requires)
    
    async def execute(self, *args, **kwargs):
        """Führt die Action aus."""
        self.status = ActionStatus.RUNNING
        try:
            self.result = await self.action(*args, **kwargs)
            self.status = ActionStatus.COMPLETED
            return self.result
        except Exception as e:
            self.status = ActionStatus.FAILED
            self.error = str(e)
            raise
    
    async def undo(self):
        """Macht die Action rückgängig."""
        if not self.reversible:
            raise ValueError(f"Action {self.id} is not reversible")
        if not self.undo_action:
            raise ValueError(f"Action {self.id} has no undo_action defined")
        
        try:
            await self.undo_action(self.result)
            self.status = ActionStatus.PENDING
            self.result = None
        except Exception as e:
            raise ValueError(f"Undo failed for {self.id}: {e}")


class ActionGraph:
    """
    Directed Acyclic Graph für Workflow-Management.
    
    FEATURES:
    - Dependency-basierte Ausführung
    - Parallele Actions wo möglich
    - Undo/Redo
    - Simulation Mode
    """
    
    def __init__(self):
        self.nodes: Dict[str, ActionNode] = {}
        self.execution_order: List[str] = []
    
    def add_node(self, node: ActionNode):
        """Fügt einen Node zum Graph hinzu."""
        if node.id in self.nodes:
            raise ValueError(f"Node {node.id} already exists")
        self.nodes[node.id] = node
    
    def get_node(self, node_id: str) -> Optional[ActionNode]:
        """Holt einen Node by ID."""
        return self.nodes.get(node_id)
    
    def get_executable_nodes(self) -> List[ActionNode]:
        """Gibt alle Nodes zurück, die jetzt ausgeführt werden können."""
        completed_ids = {
            node_id for node_id, node in self.nodes.items()
            if node.status == ActionStatus.COMPLETED
        }
        
        return [
            node for node in self.nodes.values()
            if node.status == ActionStatus.PENDING and node.can_execute(completed_ids)
        ]
    
    async def execute_all(self, simulate: bool = False):
        """
        Führt alle Nodes im Graph aus (mit Dependency-Auflösung).
        
        Args:
            simulate: Wenn True → nur Validierung, keine Ausführung
        """
        if simulate:
            # Validiere DAG ohne Ausführung
            return self._validate_dag()
        
        while True:
            executable = self.get_executable_nodes()
            
            if not executable:
                # Prüfe ob fertig oder Deadlock
                pending = [n for n in self.nodes.values() if n.status == ActionStatus.PENDING]
                if not pending:
                    break  # Alle fertig
                else:
                    raise RuntimeError("Deadlock detected in ActionGraph")
            
            # Führe alle executable Nodes parallel aus
            tasks = [node.execute() for node in executable]
            await asyncio.gather(*tasks)
            
            # Merke Ausführungsreihenfolge
            self.execution_order.extend([n.id for n in executable])
    
    async def undo_last(self):
        """Macht die letzte Action rückgängig."""
        if not self.execution_order:
            raise ValueError("No actions to undo")
        
        last_id = self.execution_order.pop()
        node = self.nodes[last_id]
        await node.undo()
    
    async def undo_all(self):
        """Macht alle Actions rückgängig (in umgekehrter Reihenfolge)."""
        for node_id in reversed(self.execution_order):
            node = self.nodes[node_id]
            if node.reversible:
                await node.undo()
        self.execution_order = []
    
    def _validate_dag(self) -> bool:
        """Validiert dass der Graph ein DAG ist (keine Zyklen)."""
        visited = set()
        rec_stack = set()
        
        def has_cycle(node_id: str) -> bool:
            visited.add(node_id)
            rec_stack.add(node_id)
            
            node = self.nodes[node_id]
            for dep_id in node.requires:
                if dep_id not in visited:
                    if has_cycle(dep_id):
                        return True
                elif dep_id in rec_stack:
                    return True
            
            rec_stack.remove(node_id)
            return False
        
        for node_id in self.nodes:
            if node_id not in visited:
                if has_cycle(node_id):
                    raise ValueError(f"Cycle detected in ActionGraph involving {node_id}")
        
        return True
    
    def get_stats(self) -> Dict[str, int]:
        """Gibt Statistiken über den Graph zurück."""
        return {
            "total": len(self.nodes),
            "pending": sum(1 for n in self.nodes.values() if n.status == ActionStatus.PENDING),
            "running": sum(1 for n in self.nodes.values() if n.status == ActionStatus.RUNNING),
            "completed": sum(1 for n in self.nodes.values() if n.status == ActionStatus.COMPLETED),
            "failed": sum(1 for n in self.nodes.values() if n.status == ActionStatus.FAILED),
        }
