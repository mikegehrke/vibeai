# -------------------------------------------------------------
# VIBEAI – PREVIEW AUTO RELOAD
# -------------------------------------------------------------
"""
Preview Auto-Reload System

Automatically reloads live preview when files change.

Features:
- WebSocket broadcast
- Multi-user support
- Project-specific reload
- Integration with file write operations
"""

import asyncio  # Ensure asyncio is imported for async functions

class PreviewReloader:
    """
    Preview reload manager.

    Notifies preview clients when files change.
    """

    def __init__(self):
        self.active_connections = {}

    async def notify_reload(self, user: str, project_id: str):
        """
        Notify preview clients to reload.

        Args:
            user: User email
            project_id: Project ID
        """
        try:
            # Try to use WebSocket manager
            from preview.preview_ws import preview_ws

            await preview_ws.broadcast(user=user, port=0, text="__reload__")  # All ports

            print(f"✅ Preview reload notification sent: {user}/{project_id}")
        except (ImportError, AttributeError) as e:
            # WebSocket not available
            print(f"⚠️  Preview reload not available: {e}")
        except Exception as e:
            print(f"❌ Preview reload error: {e}")

    async def notify_specific_port(self, user: str, project_id: str, port: int):
        """
        Notify specific preview port to reload.

        Args:
            user: User email
            project_id: Project ID
            port: Preview server port
        """
        try:
            from preview.preview_ws import preview_ws

            await preview_ws.broadcast(user=user, port=port, text="__reload__")

            print(f"✅ Preview reload sent to port {port}")
        except Exception as e:
            print(f"❌ Preview reload error: {e}")

    async def notify_build_complete(self, user: str, project_id: str):
        """
        Notify that build completed and preview should reload.

        Args:
            user: User email
            project_id: Project ID
        """
        await self.notify_reload(user, project_id)


# Global instance
preview_reload = PreviewReloader()