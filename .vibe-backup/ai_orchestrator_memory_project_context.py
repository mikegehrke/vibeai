# -------------------------------------------------------------
# VIBEAI – PROJECT CONTEXT MEMORY
# -------------------------------------------------------------
"""
Project Context Memory System - Complete State Management

Persistent storage for full project lifecycle:
- UI screens and components
- Generated code (all frameworks)
- Build configurations and artifacts
- Preview server state
- Deployment information
- Project metadata and history

Storage Strategy:
- Memory: Fast in-memory cache for active projects
- Disk: Persistent JSON files in /tmp/vibeai_contexts/

Features:
- Multi-user support
- Automatic persistence
- Code history tracking
- Project lifecycle management
- Lightweight summaries
- Global statistics
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class ProjectContext:
    """
    Complete project state manager.

    Handles all aspects of project context including:
    - UI/UX design (screens, components)
    - Code artifacts (multi-framework)
    - Build system state
    - Preview server management
    - Deployment tracking
    """

    def __init__(self):
        self.contexts: Dict[str, Dict] = {}
        self.storage_path = Path("/tmp/vibeai_contexts")
        self.storage_path.mkdir(exist_ok=True)

    def _get_key(self, user_id: str, project_id: str) -> str:
        """Get unique key for user+project."""
        return f"{user_id}_{project_id}"

    def load(self, user_id: str, project_id: str) -> Dict:
        """
        Load complete project context.

        Returns:
        {
            # Identity
            "user_id": "user123",
            "project_id": "myapp",
            "name": "My Awesome App",
            "description": "A social media app",

            # Timestamps
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T12:00:00Z",

            # Framework & Configuration
            "framework": "react",
            "project_path": "/tmp/vibeai_projects/myapp",
            "options": {},

            # UI/UX Design
            "screens": [
                {
                    "name": "LoginScreen",
                    "components": [...],
                    "created_at": "..."
                }
            ],
            "components": [],

            # Code Artifacts
            "code": {
                "flutter": "...",
                "react": "...",
                "vue": "..."
            },
            "code_history": [
                {
                    "framework": "react",
                    "code": "...",
                    "timestamp": "..."
                }
            ],

            # Build System
            "build_id": "build_abc123",
            "build_type": "apk",
            "last_build_status": "completed",
            "build_output": "/tmp/builds/myapp.apk",

            # Preview Server
            "server_id": "server_xyz789",
            "preview_url": "http://localhost:3001",
            "preview_port": 3001,

            # Deployment
            "deployment_platform": "vercel",
            "deployment_url": "https://myapp.vercel.app",
            "deployment_id": "deploy_123",
            "deployed_at": "2024-01-01T13:00:00Z",
            "deploy_url": "https://myapp.vercel.app",

            # Metadata
            "tags": ["social", "mobile"],
            "version": "1.0.0",
            "status": "active"
        }
        """
        key = self._get_key(user_id, project_id)

        # Try memory cache first (fast)
        if key in self.contexts:
            return self.contexts[key]

        # Try disk persistence
        file_path = self.storage_path / f"{key}.json"
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                context = json.load(f)
                self.contexts[key] = context
                return context

        # Create new context with full structure
        now = datetime.utcnow().isoformat()

        context = {
            # Identity
            "user_id": user_id,
            "project_id": project_id,
            "name": project_id,
            "description": "",
            # Timestamps
            "created_at": now,
            "updated_at": now,
            # Framework & Config
            "framework": "react",
            "project_path": None,
            "options": {},
            # UI/UX
            "screens": [],
            "components": [],
            # Code
            "code": {},
            "code_history": [],
            # Build
            "build_id": None,
            "build_type": None,
            "last_build_status": None,
            "build_output": None,
            # Preview
            "server_id": None,
            "preview_url": None,
            "preview_port": None,
            # Deployment
            "deployment_platform": None,
            "deployment_url": None,
            "deployment_id": None,
            "deployed_at": None,
            "deploy_url": None,
            # Metadata
            "tags": [],
            "version": "1.0.0",
            "status": "active",
        }

        self.contexts[key] = context
        self._save(key, context)

        return context

    def update(self, user_id: str, project_id: str, updates: Dict) -> Dict:
        """Update project context."""
        key = self._get_key(user_id, project_id)
        context = self.load(user_id, project_id)

        context.update(updates)
        self.contexts[key] = context
        self._save(key, context)

        return context

    def add_screen(self, user_id: str, project_id: str, screen: Dict) -> Dict:
        """Add UI screen to context."""
        context = self.load(user_id, project_id)

        if "screens" not in context:
            context["screens"] = []

        context["screens"].append(screen)
        return self.update(user_id, project_id, context)

    def get_last_screen(self, user_id: str, project_id: str) -> Optional[Dict]:
        """Get most recently added screen."""
        context = self.load(user_id, project_id)
        screens = context.get("screens", [])

        if screens:
            return screens[-1]

        return None

    def get_all_screens(self, user_id: str, project_id: str) -> List[Dict]:
        """Get all screens in project."""
        context = self.load(user_id, project_id)
        return context.get("screens", [])

    def get_code(self, user_id: str, project_id: str, framework: str) -> Optional[str]:
        """Get generated code for specific framework."""
        context = self.load(user_id, project_id)
        return context.get("code", {}).get(framework)

    def add_code(self, user_id: str, project_id: str, framework: str, code: str) -> Dict:
        """
        Add generated code for framework.

        Maintains code history (last 10 versions).

        Args:
            framework: react | flutter | vue | html
            code: Generated code string
        """
        context = self.load(user_id, project_id)

        if "code" not in context:
            context["code"] = {}
        if "code_history" not in context:
            context["code_history"] = []

        # Store current code
        context["code"][framework] = code

        # Add to history
        context["code_history"].append(
            {
                "framework": framework,
                "code": code,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        # Keep last 10 versions
        if len(context["code_history"]) > 10:
            context["code_history"] = context["code_history"][-10:]

        return self.update(user_id, project_id, context)

    def set_project_path(self, user_id: str, project_id: str, path: str) -> Dict:
        """Set project file system path."""
        return self.update(user_id, project_id, {"project_path": path})

    def set_server_id(self, user_id: str, project_id: str, server_id: str) -> Dict:
        """Set preview server ID."""
        return self.update(user_id, project_id, {"server_id": server_id})

    def set_build_id(self, user_id: str, project_id: str, build_id: str) -> Dict:
        """Set build ID."""
        return self.update(user_id, project_id, {"build_id": build_id})

    def list_projects(self, user_id: str) -> List[Dict]:
        """
        List all projects for user.

        Returns lightweight project summaries sorted by update time.
        """
        projects = []

        # Check memory cache
        for key in self.contexts.keys():
            if key.startswith(f"{user_id}_"):
                ctx = self.contexts[key]
                projects.append(
                    {
                        "project_id": ctx.get("project_id"),
                        "name": ctx.get("name", ctx.get("project_id")),
                        "framework": ctx.get("framework"),
                        "created_at": ctx.get("created_at"),
                        "updated_at": ctx.get("updated_at"),
                        "screens_count": len(ctx.get("screens", [])),
                        "has_code": bool(ctx.get("code")),
                        "build_status": ctx.get("last_build_status"),
                        "deployment_url": ctx.get("deployment_url"),
                        "status": ctx.get("status", "active"),
                    }
                )

        # Check disk for projects not in memory
        for file_path in self.storage_path.glob(f"{user_id}_*.json"):
            key = file_path.stem
            if key not in self.contexts:
                with open(file_path, "r", encoding="utf-8") as f:
                    ctx = json.load(f)
                    projects.append(
                        {
                            "project_id": ctx.get("project_id"),
                            "name": ctx.get("name", ctx.get("project_id")),
                            "framework": ctx.get("framework"),
                            "created_at": ctx.get("created_at"),
                            "updated_at": ctx.get("updated_at"),
                            "screens_count": len(ctx.get("screens", [])),
                            "has_code": bool(ctx.get("code")),
                            "build_status": ctx.get("last_build_status"),
                            "deployment_url": ctx.get("deployment_url"),
                            "status": ctx.get("status", "active"),
                        }
                    )

        # Sort by most recently updated
        projects.sort(key=lambda p: p.get("updated_at", ""), reverse=True)

        return projects

    def delete(self, user_id: str, project_id: str) -> bool:
        """Delete project context from memory and disk."""
        key = self._get_key(user_id, project_id)

        # Remove from memory
        if key in self.contexts:
            del self.contexts[key]

        # Remove from disk
        file_path = self.storage_path / f"{key}.json"
        if file_path.exists():
            file_path.unlink()

        return True

    def exists(self, user_id: str, project_id: str) -> bool:
        """Check if project exists in memory or disk."""
        key = self._get_key(user_id, project_id)

        # Check memory
        if key in self.contexts:
            return True

        # Check disk
        file_path = self.storage_path / f"{key}.json"
        return file_path.exists()

    def get_summary(self, user_id: str, project_id: str) -> Dict:
        """
        Get lightweight project summary.

        Returns essential info without full context.
        """
        context = self.load(user_id, project_id)

        return {
            "project_id": context.get("project_id"),
            "name": context.get("name"),
            "framework": context.get("framework"),
            "screens_count": len(context.get("screens", [])),
            "has_code": bool(context.get("code")),
            "deployment_url": context.get("deployment_url"),
            "created_at": context.get("created_at"),
            "updated_at": context.get("updated_at"),
            "status": context.get("status", "active"),
        }

    def clear_cache(self):
        """Clear in-memory cache (disk remains intact)."""
        self.contexts.clear()

    def get_stats(self) -> Dict:
        """Get global statistics about all projects."""
        total_files = len(list(self.storage_path.glob("*.json")))
        cached_projects = len(self.contexts)

        return {
            "total_projects": total_files,
            "cached_projects": cached_projects,
            "storage_path": str(self.storage_path),
            "cache_hit_ratio": (cached_projects / total_files if total_files > 0 else 0),
        }

    def _save(self, key: str, context: Dict) -> None:
        """Save context to disk with auto-timestamp update."""
        # Auto-update timestamp
        context["updated_at"] = datetime.utcnow().isoformat()

        file_path = self.storage_path / f"{key}.json"

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(context, f, indent=2)


# Global instance
project_context = ProjectContext()
