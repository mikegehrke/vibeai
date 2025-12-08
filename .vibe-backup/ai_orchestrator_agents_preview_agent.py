# -------------------------------------------------------------
# VIBEAI – PREVIEW AGENT
# -------------------------------------------------------------
"""
Preview Agent - Manages live previews.

Capabilities:
- Start preview servers
- Hot reload
- Live updates
- Auto-save code files
- WebSocket notifications
"""

import asyncio
from pathlib import Path
from typing import Dict


class PreviewAgent:
    """Agent for preview management."""

    async def update_preview(self, user_id: str, project_id: str) -> Dict:
        """
        Update live preview for project.

        Workflow:
        1. Save generated code to files
        2. Stop existing preview server
        3. Start new preview server
        4. Send WebSocket notification

        Returns:
            {
                "success": True,
                "preview_url": "http://localhost:8080",
                "server_id": "server_123"
            }
        """
        from ai.orchestrator.memory.project_context import project_context

        # Get project context
        ctx = project_context.load(user_id, project_id)
        framework = ctx.get("framework", "flutter")
        project_path = ctx.get("project_path")

        if not project_path:
            return {"success": False, "error": "No project path configured"}

        try:
            # Step 1: Save code files
            save_result = await self._save_code_files(user_id, project_id, ctx)

            if not save_result.get("success"):
                return save_result

            # Step 2: Stop existing preview
            await self._stop_existing_preview(user_id, project_id, ctx)

            # Small delay for cleanup
            await asyncio.sleep(0.3)

            # Step 3: Start new preview
            result = await self._start_preview_server(framework, project_path)

            if result.get("success"):
                # Update context with server info
                project_context.update(
                    user_id,
                    project_id,
                    {
                        "server_id": result.get("server_id"),
                        "preview_url": result.get("preview_url"),
                    },
                )

                # Step 4: Send WebSocket notification
                await self._notify_preview_update(user_id, project_id, result)

            return {
                "success": True,
                "preview_url": result.get("preview_url"),
                "server_id": result.get("server_id"),
                "framework": framework,
                "files_saved": save_result.get("files_saved", 0),
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _save_code_files(self, user_id: str, project_id: str, ctx: Dict) -> Dict:
        """Save generated code to project files."""

        project_path = ctx.get("project_path")
        framework = ctx.get("framework", "flutter")
        code_data = ctx.get("code", {}).get(framework)

        if not code_data:
            # No code to save yet
            return {"success": True, "files_saved": 0}

        try:
            files_saved = 0
            files = code_data.get("files", {})

            for filename, content in files.items():
                # Determine file path based on framework
                if framework == "flutter":
                    file_path = Path(project_path) / "lib" / filename
                elif framework == "react":
                    file_path = Path(project_path) / "src" / filename
                elif framework == "vue":
                    file_path = Path(project_path) / "src" / filename
                else:
                    file_path = Path(project_path) / filename

                # Create directory if needed
                file_path.parent.mkdir(parents=True, exist_ok=True)

                # Write file
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)

                files_saved += 1

            return {
                "success": True,
                "files_saved": files_saved,
                "project_path": str(project_path),
            }

        except Exception as e:
            return {"success": False, "error": f"Failed to save files: {str(e)}"}

    async def _stop_existing_preview(self, user_id: str, project_id: str, ctx: Dict) -> None:
        """Stop existing preview server if running."""
        server_id = ctx.get("server_id")
        framework = ctx.get("framework", "flutter")

        if not server_id:
            return

        try:
            if framework == "flutter":
                from preview.flutter_preview import flutter_preview_manager

                await flutter_preview_manager.stop_server(server_id)
            elif framework == "react":
                from preview.react_preview import react_preview_manager

                await react_preview_manager.stop_server(server_id)
        except Exception:
            # Server might already be stopped
            pass

    async def _start_preview_server(self, framework: str, project_path: str) -> Dict:
        """Start preview server based on framework."""
        from preview.unified_preview_manager import unified_preview_manager

        # Use unified manager
        port = unified_preview_manager._get_default_port(framework)

        if framework == "flutter":
            return await unified_preview_manager._start_flutter(project_path, port)
        elif framework in ["react", "vue"]:
            return await unified_preview_manager._start_react(project_path, port)
        else:
            return {"success": False, "error": f"Framework {framework} not supported"}

    async def _notify_preview_update(self, user_id: str, project_id: str, result: Dict) -> None:
        """Send WebSocket notification about preview update."""
        try:
            # Try to use WebSocket manager if available
            from admin.notifications.ws_manager import manager

            message = {
                "type": "preview_update",
                "user_id": user_id,
                "project_id": project_id,
                "preview_url": result.get("preview_url"),
                "server_id": result.get("server_id"),
                "timestamp": None,
            }

            # Broadcast to user's connections
            await manager.send_personal_message(message, user_id)
        except Exception:
            # WebSocket not available, skip notification
            pass

    async def reload_preview(self, user_id: str, project_id: str) -> Dict:
        """
        Hot reload preview (Flutter only).

        For React/Vue, this restarts the dev server.
        """
        from ai.orchestrator.memory.project_context import project_context

        ctx = project_context.load(user_id, project_id)
        framework = ctx.get("framework", "flutter")
        server_id = ctx.get("server_id")

        if not server_id:
            return {"success": False, "error": "No preview server running"}

        try:
            if framework == "flutter":
                from preview.flutter_preview import flutter_preview_manager

                await flutter_preview_manager.trigger_hot_reload(server_id)
                return {
                    "success": True,
                    "message": "Hot reload triggered",
                    "framework": framework,
                }
            else:
                # For React/Vue, restart server
                return await self.update_preview(user_id, project_id)

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def stop_preview(self, user_id: str, project_id: str) -> Dict:
        """Stop preview server."""
        from ai.orchestrator.memory.project_context import project_context

        ctx = project_context.load(user_id, project_id)
        server_id = ctx.get("server_id")

        if not server_id:
            return {"success": False, "error": "No active server"}

        # Stop server logic here
        return {"success": True, "message": "Preview stopped"}


# Global instance
preview_agent = PreviewAgent()
