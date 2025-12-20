# -------------------------------------------------------------
# VIBEAI SUPER AGENT - PREVIEW CONTROLLER
# -------------------------------------------------------------
"""
Preview and emulator control.

Starts/stops previews and monitors status.
"""

import aiohttp
from typing import Dict
from vibeai.agent.event_stream.event_emitter import EventEmitter


class PreviewController:
    """
    Controls preview and emulator.
    
    Features:
    - Start preview
    - Stop preview
    - Monitor preview status
    - Update preview
    """
    
    def __init__(self, project_id: str, event_emitter: EventEmitter, api_base_url: str = "http://localhost:8005"):
        self.project_id = project_id
        self.event_emitter = event_emitter
        self.api_base_url = api_base_url
    
    async def start_preview(self, project_type: str) -> Dict:
        """
        Start preview for project.
        """
        await self.event_emitter.emit("preview_starting", {
            "project_type": project_type
        })
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/api/preview/start",
                    json={
                        "project_id": self.project_id,
                        "project_type": project_type
                    }
                ) as response:
                    result = await response.json()
                    
                    await self.event_emitter.emit("preview_started", {
                        "url": result.get("url"),
                        "project_type": project_type
                    })
                    
                    return result
        except Exception as e:
            await self.event_emitter.emit("preview_error", {
                "error": str(e)
            })
            
            return {"success": False, "error": str(e)}
    
    async def stop_preview(self) -> None:
        """Stop preview."""
        await self.event_emitter.emit("preview_stopping", {})
        
        # Implementation for stopping preview
        await self.event_emitter.emit("preview_stopped", {})








