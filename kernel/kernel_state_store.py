# kernel/kernel_state_store.py
# ------------------------------
# Kernel State Persistence (v1.1)
#
# PHILOSOPHIE:
# - System überlebt Neustarts
# - User schließt → öffnet morgen → macht weiter bei Schritt X
# - Kein Verlust von Context, Todos, Graph
#
# FEATURES:
# - FlowState speichern/laden
# - ActionGraph speichern/laden
# - Events speichern (letzte N)
# - Runtime-State speichern
# - Mehrere Backends: JSON, SQLite, Redis

import json
import os
import sqlite3
from typing import Optional, Dict, Any
from datetime import datetime
from pathlib import Path

from kernel.flow_state import FlowState
from kernel.action_graph import ActionGraph, ActionNode


class KernelStateStore:
    """
    Kernel State Persistence (v1.1).
    
    VERANTWORTLICHKEITEN:
    - Speichert vollständigen Kernel-Zustand
    - Ermöglicht Wiederherstellung nach Restart
    - Bietet mehrere Storage-Backends
    
    GESPEICHERT WIRD:
    - FlowState (active, mode, project, step, todos)
    - ActionGraph (nodes, edges, executed)
    - Runtime Config (security, control mode)
    - Events (letzte 1000)
    - Project Context
    
    BACKENDS:
    - JSON: Einfach, readable, für Dev
    - SQLite: Robust, queryable, für Prod
    - Redis: Schnell, distributed, für Scale
    """
    
    def __init__(self, backend: str = "json", base_path: str = "./kernel_state"):
        """
        Args:
            backend: "json", "sqlite", oder "redis"
            base_path: Basis-Pfad für State-Files
        """
        self.backend = backend
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        # Backend-spezifische Initialisierung
        if backend == "sqlite":
            self._init_sqlite()
    
    def _init_sqlite(self):
        """Initialisiert SQLite-Datenbank."""
        db_path = self.base_path / "kernel_state.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Flow State Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS flow_state (
                id INTEGER PRIMARY KEY,
                timestamp REAL,
                active BOOLEAN,
                mode TEXT,
                project TEXT,
                step INTEGER,
                todos TEXT,
                metadata TEXT
            )
        """)
        
        # Action Graph Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS action_graph (
                id INTEGER PRIMARY KEY,
                timestamp REAL,
                nodes TEXT,
                executed_nodes TEXT,
                metadata TEXT
            )
        """)
        
        # Events Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL,
                event_type TEXT,
                data TEXT
            )
        """)
        
        # Runtime Config Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS runtime_config (
                id INTEGER PRIMARY KEY,
                timestamp REAL,
                config TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    def save(
        self,
        flow_state: FlowState,
        action_graph: ActionGraph,
        runtime_config: Optional[Dict] = None,
        events: Optional[list] = None
    ) -> bool:
        """
        Speichert vollständigen Kernel-Zustand.
        
        Args:
            flow_state: FlowState-Instanz
            action_graph: ActionGraph-Instanz
            runtime_config: Runtime-Konfiguration
            events: Liste der letzten Events
            
        Returns:
            True wenn erfolgreich
        """
        if self.backend == "json":
            return self._save_json(flow_state, action_graph, runtime_config, events)
        elif self.backend == "sqlite":
            return self._save_sqlite(flow_state, action_graph, runtime_config, events)
        else:
            raise ValueError(f"Backend '{self.backend}' not supported")
    
    def _save_json(
        self,
        flow_state: FlowState,
        action_graph: ActionGraph,
        runtime_config: Optional[Dict],
        events: Optional[list]
    ) -> bool:
        """Speichert als JSON."""
        try:
            state = {
                "timestamp": datetime.now().isoformat(),
                "flow_state": {
                    "active": flow_state.active,
                    "mode": flow_state.mode,
                    "project": flow_state.project,
                    "step": flow_state.step,
                    "todo": flow_state.todo.copy()
                },
                "action_graph": {
                    "nodes": [
                        {
                            "id": node.id,
                            "status": node.status.value,
                            "requires": node.requires,
                            "reversible": node.reversible
                        }
                        for node in action_graph.nodes.values()
                    ]
                },
                "runtime_config": runtime_config or {},
                "events": events or []
            }
            
            # Speichere State
            state_file = self.base_path / "kernel_state.json"
            with open(state_file, "w") as f:
                json.dump(state, f, indent=2)
            
            # Backup (letzte 5)
            self._rotate_backups()
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to save state: {e}")
            return False
    
    def _save_sqlite(
        self,
        flow_state: FlowState,
        action_graph: ActionGraph,
        runtime_config: Optional[Dict],
        events: Optional[list]
    ) -> bool:
        """Speichert in SQLite."""
        try:
            db_path = self.base_path / "kernel_state.db"
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            timestamp = datetime.now().timestamp()
            
            # Flow State
            cursor.execute("""
                INSERT OR REPLACE INTO flow_state (id, timestamp, active, mode, project, step, todos, metadata)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?)
            """, (
                timestamp,
                flow_state.active,
                flow_state.mode,
                flow_state.project,
                flow_state.step,
                json.dumps(flow_state.todo),
                json.dumps({})
            ))
            
            # Action Graph
            cursor.execute("""
                INSERT OR REPLACE INTO action_graph (id, timestamp, nodes, executed_nodes, metadata)
                VALUES (1, ?, ?, ?, ?)
            """, (
                timestamp,
                json.dumps([
                    {
                        "id": n.id,
                        "status": n.status.value,
                        "requires": n.requires,
                        "reversible": n.reversible
                    }
                    for n in action_graph.nodes.values()
                ]),
                json.dumps([]),  # Legacy field, nicht mehr verwendet
                json.dumps({})
            ))
            
            # Runtime Config
            if runtime_config:
                cursor.execute("""
                    INSERT OR REPLACE INTO runtime_config (id, timestamp, config)
                    VALUES (1, ?, ?)
                """, (timestamp, json.dumps(runtime_config)))
            
            # Events (nur letzte 1000)
            if events:
                for event in events[-1000:]:
                    cursor.execute("""
                        INSERT INTO events (timestamp, event_type, data)
                        VALUES (?, ?, ?)
                    """, (
                        timestamp,
                        event.get("type", "unknown"),
                        json.dumps(event)
                    ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"❌ Failed to save to SQLite: {e}")
            return False
    
    def load(self) -> Optional[Dict[str, Any]]:
        """
        Lädt gespeicherten Kernel-Zustand.
        
        Returns:
            Dict mit flow_state, action_graph, runtime_config, events
            oder None wenn kein State vorhanden
        """
        if self.backend == "json":
            return self._load_json()
        elif self.backend == "sqlite":
            return self._load_sqlite()
        else:
            raise ValueError(f"Backend '{self.backend}' not supported")
    
    def _load_json(self) -> Optional[Dict]:
        """Lädt aus JSON."""
        state_file = self.base_path / "kernel_state.json"
        
        if not state_file.exists():
            return None
        
        try:
            with open(state_file, "r") as f:
                state = json.load(f)
            
            # Reconstruct FlowState
            flow_data = state["flow_state"]
            flow_state = FlowState()
            flow_state.active = flow_data["active"]
            flow_state.mode = flow_data["mode"]
            flow_state.project = flow_data["project"]
            flow_state.step = flow_data["step"]
            flow_state.todo = flow_data["todo"]
            
            # Reconstruct ActionGraph (nur Metadaten, keine Callables)
            graph_data = state["action_graph"]
            action_graph = ActionGraph()
            
            # Note: Actions können nicht wiederhergestellt werden (Callables nicht serialisierbar)
            # Nur Status-Info wird gespeichert
            # In Produktion müsste hier Action-Registry verwendet werden
            
            # Simplified: Speichere nur Node-IDs und Stati
            action_graph._saved_state = graph_data["nodes"]
            
            return {
                "flow_state": flow_state,
                "action_graph": action_graph,
                "runtime_config": state.get("runtime_config", {}),
                "events": state.get("events", []),
                "timestamp": state["timestamp"]
            }
            
        except Exception as e:
            print(f"❌ Failed to load state: {e}")
            return None
    
    def _load_sqlite(self) -> Optional[Dict]:
        """Lädt aus SQLite."""
        db_path = self.base_path / "kernel_state.db"
        
        if not db_path.exists():
            return None
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Load Flow State
            cursor.execute("SELECT * FROM flow_state WHERE id = 1")
            flow_row = cursor.fetchone()
            
            if not flow_row:
                conn.close()
                return None
            
            flow_state = FlowState()
            flow_state.active = bool(flow_row[2])
            flow_state.mode = flow_row[3]
            flow_state.project = flow_row[4]
            flow_state.step = flow_row[5]
            flow_state.todo = json.loads(flow_row[6])
            
            # Load Action Graph
            cursor.execute("SELECT * FROM action_graph WHERE id = 1")
            graph_row = cursor.fetchone()
            
            action_graph = ActionGraph()
            if graph_row:
                nodes_data = json.loads(graph_row[2])
                # Speichere nur Metadaten (Callables nicht serialisierbar)
                action_graph._saved_state = nodes_data
            
            # Load Runtime Config
            cursor.execute("SELECT config FROM runtime_config WHERE id = 1")
            config_row = cursor.fetchone()
            runtime_config = json.loads(config_row[0]) if config_row else {}
            
            # Load Events (letzte 100)
            cursor.execute("SELECT data FROM events ORDER BY id DESC LIMIT 100")
            events = [json.loads(row[0]) for row in cursor.fetchall()]
            
            conn.close()
            
            return {
                "flow_state": flow_state,
                "action_graph": action_graph,
                "runtime_config": runtime_config,
                "events": events,
                "timestamp": flow_row[1]
            }
            
        except Exception as e:
            print(f"❌ Failed to load from SQLite: {e}")
            return None
    
    def _rotate_backups(self, max_backups: int = 5):
        """Rotiert JSON-Backups."""
        state_file = self.base_path / "kernel_state.json"
        
        if not state_file.exists():
            return
        
        # Backup erstellen
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = self.base_path / f"kernel_state_{timestamp}.json"
        
        try:
            import shutil
            shutil.copy(state_file, backup_file)
            
            # Alte Backups löschen
            backups = sorted(self.base_path.glob("kernel_state_*.json"))
            if len(backups) > max_backups:
                for old_backup in backups[:-max_backups]:
                    old_backup.unlink()
                    
        except Exception as e:
            print(f"⚠️ Backup rotation failed: {e}")
    
    def clear(self):
        """Löscht gespeicherten State."""
        if self.backend == "json":
            state_file = self.base_path / "kernel_state.json"
            if state_file.exists():
                state_file.unlink()
        elif self.backend == "sqlite":
            db_path = self.base_path / "kernel_state.db"
            if db_path.exists():
                db_path.unlink()
