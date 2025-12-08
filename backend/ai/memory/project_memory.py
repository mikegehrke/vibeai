# -------------------------------------------------------------
# VIBEAI – PROJECT LONG TERM MEMORY
# -------------------------------------------------------------
import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List

logger = logging.getLogger("project_memory")


class ProjectMemory:
    """
    Langzeitgedächtnis für Projekte.

    Speichert:
    - Projekt-Präferenzen (z.B. "nutze Riverpod statt Provider")
    - Code-Stil (z.B. "verwende camelCase")
    - Architektur-Entscheidungen
    - UI/UX Standards
    - Tech Stack Präferenzen
    - Frühere Features & Entscheidungen
    - User Feedback
    - Performance Metriken

    Damit die AI:
    - Konsistenten Code schreibt
    - Frühere Entscheidungen beachtet
    - User-Präferenzen merkt
    - Nicht wiederholt fragt
    """

    def __init__(self):
        self.memory_dir = os.getenv("MEMORY_DIR", "./data/project_memory")
        os.makedirs(self.memory_dir, exist_ok=True)

        self.default_memory = {
            "preferences": {},
            "code_style": {},
            "architecture": {},
            "ui_standards": {},
            "tech_stack": {},
            "features": {},
            "decisions": {},
            "feedback": {},
            "metrics": {},
        }

    def _get_memory_path(self, project_id: str) -> str:
        """Get path to project memory file."""
        return os.path.join(self.memory_dir, f"{project_id}.json")

    def load(self, project_id: str) -> Dict:
        """
        Load project memory.

        Args:
            project_id: Project ID

        Returns:
            Memory dict
        """
        path = self._get_memory_path(project_id)

        if not os.path.exists(path):
            return self.default_memory.copy()

        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"❌ Failed to load memory for {project_id}: {e}")
            return self.default_memory.copy()

    def save(self, project_id: str, data: Dict):
        """
        Save project memory.

        Args:
            project_id: Project ID
            data: Memory data to save
        """
        path = self._get_memory_path(project_id)

        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            logger.info(f"💾 Saved memory for project {project_id}")

        except Exception as e:
            logger.error(f"❌ Failed to save memory for {project_id}: {e}")

    def remember(self, project_id: str, key: str, value: Any, category: str = "preferences"):
        """
        Remember something about the project.

        Args:
            project_id: Project ID
            key: Memory key (e.g. "state_management")
            value: Value to remember (e.g. "riverpod")
            category: Memory category (preferences, code_style, etc.)
        """
        data = self.load(project_id)

        if category not in data:
            data[category] = {}

        data[category][key] = {"value": value, "timestamp": datetime.now().isoformat()}

        self.save(project_id, data)

        logger.info(f"🧠 Remembered {category}.{key} = {value} for {project_id}")

    def recall(
        self,
        project_id: str,
        key: str,
        category: str = "preferences",
        default: Any = None,
    ) -> Any:
        """
        Recall something about the project.

        Args:
            project_id: Project ID
            key: Memory key
            category: Memory category
            default: Default value if not found

        Returns:
            Remembered value or default
        """
        data = self.load(project_id)

        if category not in data:
            return default

        memory = data[category].get(key)

        if memory is None:
            return default

        # Return value from memory object
        if isinstance(memory, dict) and "value" in memory:
            return memory["value"]

        return memory

    def forget(self, project_id: str, key: str, category: str = "preferences"):
        """
        Forget something about the project.

        Args:
            project_id: Project ID
            key: Memory key to forget
            category: Memory category
        """
        data = self.load(project_id)

        if category in data and key in data[category]:
            del data[category][key]
            self.save(project_id, data)

            logger.info(f"🗑️ Forgot {category}.{key} for {project_id}")

    def get_all_memories(self, project_id: str) -> Dict:
        """
        Get all memories for a project.

        Args:
            project_id: Project ID

        Returns:
            All project memories
        """
        return self.load(project_id)

    def clear_project_memory(self, project_id: str):
        """
        Clear all memories for a project.

        Args:
            project_id: Project ID
        """
        path = self._get_memory_path(project_id)

        if os.path.exists(path):
            os.remove(path)
            logger.info(f"🗑️ Cleared all memory for {project_id}")

    def add_feature_history(self, project_id: str, feature_name: str, feature_data: Dict):
        """
        Add feature to project history.

        Args:
            project_id: Project ID
            feature_name: Name of feature
            feature_data: Feature details
        """
        data = self.load(project_id)

        if "features" not in data:
            data["features"] = {}

        data["features"][feature_name] = {
            **feature_data,
            "created_at": datetime.now().isoformat(),
        }

        self.save(project_id, data)

    def add_decision(self, project_id: str, decision: str, reason: str):
        """
        Record an architectural/technical decision.

        Args:
            project_id: Project ID
            decision: Decision made
            reason: Reason for decision
        """
        data = self.load(project_id)

        if "decisions" not in data:
            data["decisions"] = []

        data["decisions"].append(
            {
                "decision": decision,
                "reason": reason,
                "timestamp": datetime.now().isoformat(),
            }
        )

        self.save(project_id, data)

    def add_feedback(self, project_id: str, feedback: str, category: str = "general"):
        """
        Add user feedback.

        Args:
            project_id: Project ID
            feedback: User feedback text
            category: Feedback category
        """
        data = self.load(project_id)

        if "feedback" not in data:
            data["feedback"] = []

        data["feedback"].append(
            {
                "category": category,
                "text": feedback,
                "timestamp": datetime.now().isoformat(),
            }
        )

        self.save(project_id, data)

    def update_metrics(self, project_id: str, metric_name: str, value: float):
        """
        Update project performance metrics.

        Args:
            project_id: Project ID
            metric_name: Metric name (e.g. "build_time")
            value: Metric value
        """
        data = self.load(project_id)

        if "metrics" not in data:
            data["metrics"] = {}

        if metric_name not in data["metrics"]:
            data["metrics"][metric_name] = {
                "values": [],
                "avg": 0,
                "min": value,
                "max": value,
            }

        metrics = data["metrics"][metric_name]
        metrics["values"].append({"value": value, "timestamp": datetime.now().isoformat()})

        # Keep only last 100 values
        if len(metrics["values"]) > 100:
            metrics["values"] = metrics["values"][-100:]

        # Update stats
        values = [v["value"] for v in metrics["values"]]
        metrics["avg"] = sum(values) / len(values)
        metrics["min"] = min(values)
        metrics["max"] = max(values)
        metrics["latest"] = value

        self.save(project_id, data)

    def get_context_for_ai(self, project_id: str) -> str:
        """
        Get formatted memory context for AI prompts.

        Args:
            project_id: Project ID

        Returns:
            Formatted context string
        """
        data = self.load(project_id)

        context_parts = []

        # Preferences
        if data.get("preferences"):
            prefs = [f"- {k}: {v['value']}" for k, v in data["preferences"].items()]
            context_parts.append("**Project Preferences:**\n" + "\n".join(prefs))

        # Code Style
        if data.get("code_style"):
            styles = [f"- {k}: {v['value']}" for k, v in data["code_style"].items()]
            context_parts.append("**Code Style:**\n" + "\n".join(styles))

        # Architecture
        if data.get("architecture"):
            arch = [f"- {k}: {v['value']}" for k, v in data["architecture"].items()]
            context_parts.append("**Architecture:**\n" + "\n".join(arch))

        # Recent Decisions
        if data.get("decisions"):
            recent = data["decisions"][-5:]  # Last 5
            decisions = [f"- {d['decision']} (Reason: {d['reason']})" for d in recent]
            context_parts.append("**Recent Decisions:**\n" + "\n".join(decisions))

        return "\n\n".join(context_parts) if context_parts else "No project memory yet."

    def list_all_projects(self) -> List[str]:
        """
        List all projects with memories.

        Returns:
            List of project IDs
        """
        if not os.path.exists(self.memory_dir):
            return []

        files = os.listdir(self.memory_dir)
        return [f.replace(".json", "") for f in files if f.endswith(".json")]


# Global Instance
project_memory = ProjectMemory()