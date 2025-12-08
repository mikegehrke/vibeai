# -------------------------------------------------------------
# VIBEAI – UNIFIED PREVIEW MANAGER
# -------------------------------------------------------------
"""
Unified Preview Manager

Central manager for all preview server types.
Provides simple interface for starting/stopping previews.
"""

from typing import Dict, Optional


class UnifiedPreviewManager:
    """Unified manager for all preview server types."""

    def __init__(self):
        self.active_servers = {}

    async def start_preview(
        self,
        user_id: str,
        project_id: str,
        framework: str,
        project_path: str,
        port: Optional[int] = None,
    ) -> Dict:
        """
        Start preview server for any framework.

        Args:
            user_id: User identifier
            project_id: Project identifier
            framework: flutter | react | vue
            project_path: Path to project
            port: Optional port (auto-assigned if None)

        Returns:
            {
                "success": True,
                "server_id": "server_abc",
                "preview_url": "http://localhost:8080",
                "framework": "flutter",
                "port": 8080
            }
        """
        # Stop existing preview for this user/project
        await self.stop_preview(user_id, project_id)

        # Determine port
        if not port:
            port = self._get_default_port(framework)

        try:
            if framework == "flutter":
                result = await self._start_flutter(project_path, port)
            elif framework == "react":
                result = await self._start_react(project_path, port)
            elif framework == "vue":
                result = await self._start_vue(project_path, port)
            else:
                return {
                    "success": False,
                    "error": f"Framework {framework} not supported",
                }

            # Track active server
            key = f"{user_id}_{project_id}"
            self.active_servers[key] = {
                "server_id": result.get("server_id"),
                "framework": framework,
                "user_id": user_id,
                "project_id": project_id,
            }

            return {
                "success": True,
                "server_id": result.get("server_id"),
                "preview_url": result.get("url"),
                "framework": framework,
                "port": result.get("port", port),
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def stop_preview(self, user_id: str, project_id: str) -> Dict:
        """Stop preview server for user/project."""
        key = f"{user_id}_{project_id}"

        if key not in self.active_servers:
            return {"success": True, "message": "No active server"}

        server_info = self.active_servers[key]
        framework = server_info.get("framework")
        server_id = server_info.get("server_id")

        try:
            if framework == "flutter":
                from preview.flutter_preview import flutter_preview_manager

                await flutter_preview_manager.stop_server(server_id)
            elif framework in ["react", "vue"]:
                from preview.react_preview import react_preview_manager

                await react_preview_manager.stop_server(server_id)

            # Remove from tracking
            del self.active_servers[key]

            return {"success": True, "message": "Preview stopped"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def reload_preview(self, user_id: str, project_id: str) -> Dict:
        """Reload/hot reload preview."""
        key = f"{user_id}_{project_id}"

        if key not in self.active_servers:
            return {"success": False, "error": "No active server"}

        server_info = self.active_servers[key]
        framework = server_info.get("framework")
        server_id = server_info.get("server_id")

        try:
            if framework == "flutter":
                from preview.flutter_preview import flutter_preview_manager

                await flutter_preview_manager.trigger_hot_reload(server_id)
                return {"success": True, "message": "Hot reload triggered"}
            else:
                # React/Vue auto-reload via HMR
                return {"success": True, "message": "HMR active (auto-reload)"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_active_preview(self, user_id: str, project_id: str) -> Optional[Dict]:
        """Get active preview info."""
        key = f"{user_id}_{project_id}"
        return self.active_servers.get(key)

    def list_active_previews(self) -> Dict:
        """List all active previews."""
        return {
            "active_servers": list(self.active_servers.values()),
            "count": len(self.active_servers),
        }

    async def _start_flutter(self, project_path: str, port: int) -> Dict:
        """Start Flutter web preview."""
        from preview.flutter_preview import flutter_preview_manager

        return await flutter_preview_manager.start_server(project_path, port=port)

    async def _start_react(self, project_path: str, port: int) -> Dict:
        """Start React/Vite preview."""
        from preview.react_preview import react_preview_manager

        return await react_preview_manager.start_server(project_path, port=port)

    async def _start_vue(self, project_path: str, port: int) -> Dict:
        """Start Vue/Vite preview."""
        from preview.react_preview import react_preview_manager

        # Vue uses same Vite dev server
        return await react_preview_manager.start_server(project_path, port=port)

    def _get_default_port(self, framework: str) -> int:
        """Get default port for framework."""
        ports = {"flutter": 8080, "react": 5173, "vue": 5173}
        return ports.get(framework, 8080)


# Global instance
unified_preview_manager = UnifiedPreviewManager()
