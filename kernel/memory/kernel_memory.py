# kernel/memory/kernel_memory.py
# --------------------------------
# KernelMemory - System-Gedächtnis (Phase 1E)
#
# VISION:
# "Das System erinnert sich. Nicht nur an die Session,
#  sondern an Projekte, Agenten, abgebrochene Vorhaben,
#  User-Präferenzen, Code-Style."
#
# KOMPONENTEN:
# - ProjectMemory: Projekt-Historie (was wurde wann gebaut)
# - AgentMemory: Agent-Verhalten (was hat welcher Agent gemacht)
# - UserMemory: User-Präferenzen (Style, Sprache, Patterns)
# - SessionMemory: Session-Übergreifend (abgebrochene Tasks)
#
# PERSISTENZ:
# - SQLite + JSON (hybrid)
# - Schneller Zugriff (in-memory cache)
# - Langzeit-Speicher (SQLite)

import json
import sqlite3
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import os


@dataclass
class ProjectRecord:
    """
    Ein Projekt im Gedächtnis.
    
    Attributes:
        id: Projekt-ID (UUID)
        name: Projekt-Name
        path: Pfad zum Projekt
        created_at: Erstellungszeitpunkt
        last_active: Letzte Aktivität
        tech_stack: Verwendete Technologien
        agents_used: Verwendete Agenten
        completion_status: Status (active, paused, completed, abandoned)
        notes: Notizen/Kontext
    """
    id: str
    name: str
    path: str
    created_at: str
    last_active: str
    tech_stack: List[str]
    agents_used: List[str]
    completion_status: str  # active | paused | completed | abandoned
    notes: str = ""


@dataclass
class AgentMemoryEntry:
    """
    Gedächtnis-Eintrag für Agent-Verhalten.
    
    Attributes:
        agent_id: Agent-ID
        action: Was hat der Agent gemacht
        timestamp: Wann
        project_id: In welchem Projekt
        success: War es erfolgreich
        context: Kontext/Details
    """
    agent_id: str
    action: str
    timestamp: str
    project_id: str
    success: bool
    context: Dict[str, Any]


@dataclass
class UserPreference:
    """
    User-Präferenz.
    
    Attributes:
        key: Präferenz-Key (z.B. "code_style", "language", "framework_preference")
        value: Wert
        updated_at: Letzte Änderung
    """
    key: str
    value: Any
    updated_at: str


@dataclass
class AbandonedTask:
    """
    Abgebrochenes Vorhaben.
    
    WARUM WICHTIG:
    - User startet Chat, bricht ab, vergisst.
    - System erinnert: "Du wolltest X bauen, bis Zeile Y"
    
    Attributes:
        id: Task-ID
        description: Was sollte gemacht werden
        context: Kontext (Code, Dateien, Stand)
        abandoned_at: Wann abgebrochen
        project_id: Projekt
        resume_hint: Wo weitermachen
    """
    id: str
    description: str
    context: Dict[str, Any]
    abandoned_at: str
    project_id: str
    resume_hint: str


class KernelMemory:
    """
    KernelMemory (Phase 1E) - Zentrales System-Gedächtnis.
    
    PHILOSOPHY:
    "Das System erinnert sich an alles, was wichtig war.
     Nicht wie ein Logfile, sondern wie ein Kollege:
     - Was haben wir gebaut?
     - Welche Agenten waren erfolgreich?
     - Was mag der User?
     - Was wurde abgebrochen?"
    
    USAGE:
        memory = KernelMemory()
        
        # Projekt speichern
        memory.add_project(ProjectRecord(...))
        
        # Agent-Verhalten tracken
        memory.track_agent_action(agent_id="code_dev_1", action="created_file", ...)
        
        # User-Präferenz
        memory.set_preference("code_style", "functional")
        
        # Abgebrochenes Vorhaben
        memory.mark_abandoned(task_id, description, context)
        
        # Später: Was war los?
        projects = memory.get_recent_projects()
        tasks = memory.get_abandoned_tasks()
    """
    
    def __init__(self, db_path: str = "./kernel_state/memory/kernel_memory.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # In-Memory Cache
        self.projects: Dict[str, ProjectRecord] = {}
        self.user_prefs: Dict[str, UserPreference] = {}
        
        # DB initialisieren
        self._init_db()
        
        # Cache laden
        self._load_cache()
    
    def _init_db(self):
        """Erstellt DB-Schema."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        # Projects
        c.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT,
                path TEXT,
                created_at TEXT,
                last_active TEXT,
                tech_stack TEXT,
                agents_used TEXT,
                completion_status TEXT,
                notes TEXT
            )
        """)
        
        # Agent Memory
        c.execute("""
            CREATE TABLE IF NOT EXISTS agent_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_id TEXT,
                action TEXT,
                timestamp TEXT,
                project_id TEXT,
                success INTEGER,
                context TEXT
            )
        """)
        
        # User Preferences
        c.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TEXT
            )
        """)
        
        # Abandoned Tasks
        c.execute("""
            CREATE TABLE IF NOT EXISTS abandoned_tasks (
                id TEXT PRIMARY KEY,
                description TEXT,
                context TEXT,
                abandoned_at TEXT,
                project_id TEXT,
                resume_hint TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _load_cache(self):
        """Lädt oft verwendete Daten in Memory."""
        # Projects (letzte 20)
        recent_projects = self.get_recent_projects(limit=20)
        for proj in recent_projects:
            self.projects[proj.id] = proj
        
        # User Prefs (alle)
        all_prefs = self._get_all_preferences()
        for pref in all_prefs:
            self.user_prefs[pref.key] = pref
    
    # --------------------------------------------------
    # PROJECT MEMORY
    # --------------------------------------------------
    
    def add_project(self, project: ProjectRecord):
        """Fügt Projekt zum Gedächtnis hinzu."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        c.execute("""
            INSERT OR REPLACE INTO projects
            (id, name, path, created_at, last_active, tech_stack, agents_used, completion_status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            project.id,
            project.name,
            project.path,
            project.created_at,
            project.last_active,
            json.dumps(project.tech_stack),
            json.dumps(project.agents_used),
            project.completion_status,
            project.notes
        ))
        
        conn.commit()
        conn.close()
        
        # Cache update
        self.projects[project.id] = project
    
    def get_project(self, project_id: str) -> Optional[ProjectRecord]:
        """Holt Projekt aus Gedächtnis."""
        # Cache first
        if project_id in self.projects:
            return self.projects[project_id]
        
        # DB lookup
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = c.fetchone()
        conn.close()
        
        if row:
            return self._row_to_project(row)
        return None
    
    def get_recent_projects(self, limit: int = 10) -> List[ProjectRecord]:
        """Holt zuletzt aktive Projekte."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT * FROM projects ORDER BY last_active DESC LIMIT ?", (limit,))
        rows = c.fetchall()
        conn.close()
        
        return [self._row_to_project(row) for row in rows]
    
    def update_project_activity(self, project_id: str):
        """Aktualisiert letzte Aktivität."""
        now = datetime.now().isoformat()
        
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("UPDATE projects SET last_active = ? WHERE id = ?", (now, project_id))
        conn.commit()
        conn.close()
        
        # Cache update
        if project_id in self.projects:
            self.projects[project_id].last_active = now
    
    # --------------------------------------------------
    # AGENT MEMORY
    # --------------------------------------------------
    
    def track_agent_action(self, agent_id: str, action: str, project_id: str, success: bool, context: Dict = None):
        """Trackt Agent-Aktion."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        c.execute("""
            INSERT INTO agent_memory (agent_id, action, timestamp, project_id, success, context)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            agent_id,
            action,
            datetime.now().isoformat(),
            project_id,
            1 if success else 0,
            json.dumps(context or {})
        ))
        
        conn.commit()
        conn.close()
    
    def get_agent_history(self, agent_id: str, limit: int = 50) -> List[AgentMemoryEntry]:
        """Holt Agent-Historie."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("""
            SELECT agent_id, action, timestamp, project_id, success, context
            FROM agent_memory
            WHERE agent_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        """, (agent_id, limit))
        rows = c.fetchall()
        conn.close()
        
        return [
            AgentMemoryEntry(
                agent_id=row[0],
                action=row[1],
                timestamp=row[2],
                project_id=row[3],
                success=bool(row[4]),
                context=json.loads(row[5])
            )
            for row in rows
        ]
    
    # --------------------------------------------------
    # USER PREFERENCES
    # --------------------------------------------------
    
    def set_preference(self, key: str, value: Any):
        """Setzt User-Präferenz."""
        pref = UserPreference(
            key=key,
            value=value,
            updated_at=datetime.now().isoformat()
        )
        
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("""
            INSERT OR REPLACE INTO user_preferences (key, value, updated_at)
            VALUES (?, ?, ?)
        """, (key, json.dumps(value), pref.updated_at))
        conn.commit()
        conn.close()
        
        # Cache
        self.user_prefs[key] = pref
    
    def get_preference(self, key: str, default: Any = None) -> Any:
        """Holt User-Präferenz."""
        # Cache
        if key in self.user_prefs:
            return self.user_prefs[key].value
        
        # DB
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT value FROM user_preferences WHERE key = ?", (key,))
        row = c.fetchone()
        conn.close()
        
        if row:
            return json.loads(row[0])
        return default
    
    def _get_all_preferences(self) -> List[UserPreference]:
        """Holt alle Präferenzen."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT key, value, updated_at FROM user_preferences")
        rows = c.fetchall()
        conn.close()
        
        return [
            UserPreference(key=row[0], value=json.loads(row[1]), updated_at=row[2])
            for row in rows
        ]
    
    # --------------------------------------------------
    # ABANDONED TASKS
    # --------------------------------------------------
    
    def mark_abandoned(self, task_id: str, description: str, context: Dict, project_id: str, resume_hint: str = ""):
        """Markiert Task als abgebrochen."""
        task = AbandonedTask(
            id=task_id,
            description=description,
            context=context,
            abandoned_at=datetime.now().isoformat(),
            project_id=project_id,
            resume_hint=resume_hint
        )
        
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("""
            INSERT OR REPLACE INTO abandoned_tasks
            (id, description, context, abandoned_at, project_id, resume_hint)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            task.id,
            task.description,
            json.dumps(task.context),
            task.abandoned_at,
            task.project_id,
            task.resume_hint
        ))
        conn.commit()
        conn.close()
    
    def get_abandoned_tasks(self, project_id: Optional[str] = None, limit: int = 20) -> List[AbandonedTask]:
        """Holt abgebrochene Tasks."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        if project_id:
            c.execute("""
                SELECT id, description, context, abandoned_at, project_id, resume_hint
                FROM abandoned_tasks
                WHERE project_id = ?
                ORDER BY abandoned_at DESC
                LIMIT ?
            """, (project_id, limit))
        else:
            c.execute("""
                SELECT id, description, context, abandoned_at, project_id, resume_hint
                FROM abandoned_tasks
                ORDER BY abandoned_at DESC
                LIMIT ?
            """, (limit,))
        
        rows = c.fetchall()
        conn.close()
        
        return [
            AbandonedTask(
                id=row[0],
                description=row[1],
                context=json.loads(row[2]),
                abandoned_at=row[3],
                project_id=row[4],
                resume_hint=row[5]
            )
            for row in rows
        ]
    
    def resolve_abandoned_task(self, task_id: str):
        """Markiert abgebrochenen Task als erledigt (löscht ihn)."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("DELETE FROM abandoned_tasks WHERE id = ?", (task_id,))
        conn.commit()
        conn.close()
    
    # --------------------------------------------------
    # STATS & INSIGHTS
    # --------------------------------------------------
    
    def get_stats(self) -> Dict[str, Any]:
        """Gibt Memory-Statistiken zurück."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        # Projekt-Counts
        c.execute("SELECT COUNT(*) FROM projects")
        total_projects = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM projects WHERE completion_status = 'active'")
        active_projects = c.fetchone()[0]
        
        # Agent Actions
        c.execute("SELECT COUNT(*) FROM agent_memory")
        total_actions = c.fetchone()[0]
        
        # Abandoned Tasks
        c.execute("SELECT COUNT(*) FROM abandoned_tasks")
        abandoned_count = c.fetchone()[0]
        
        conn.close()
        
        return {
            "total_projects": total_projects,
            "active_projects": active_projects,
            "total_agent_actions": total_actions,
            "abandoned_tasks": abandoned_count,
            "user_preferences": len(self.user_prefs)
        }
    
    # --------------------------------------------------
    # HELPERS
    # --------------------------------------------------
    
    def _row_to_project(self, row) -> ProjectRecord:
        """Konvertiert DB-Row zu ProjectRecord."""
        return ProjectRecord(
            id=row[0],
            name=row[1],
            path=row[2],
            created_at=row[3],
            last_active=row[4],
            tech_stack=json.loads(row[5]),
            agents_used=json.loads(row[6]),
            completion_status=row[7],
            notes=row[8]
        )


# Singleton
_kernel_memory = None

def get_kernel_memory():
    """Singleton Factory für KernelMemory."""
    global _kernel_memory
    if _kernel_memory is None:
        _kernel_memory = KernelMemory()
    return _kernel_memory
