# -------------------------------------------------------------
# VIBEAI SUPER AGENT - TERMINAL CONTROLLER
# -------------------------------------------------------------
"""
Terminal command execution and monitoring.

Executes commands and monitors output for errors.
"""

import aiohttp
from typing import Dict, Optional
from vibeai.agent.event_stream.event_emitter import EventEmitter


class TerminalController:
    """
    Executes terminal commands and monitors output.
    
    Features:
    - Execute commands via API
    - Monitor output in real-time
    - Detect errors
    - Stream output
    """
    
    def __init__(self, project_id: str, event_emitter: EventEmitter, api_base_url: str = "http://localhost:8005"):
        self.project_id = project_id
        self.event_emitter = event_emitter
        self.api_base_url = api_base_url
    
    async def execute_command(self, command: str) -> Dict:
        """
        Execute terminal command via API.
        
        Returns command result.
        """
        await self.event_emitter.emit("terminal_command_started", {
            "command": command
        })
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/api/terminal/execute",
                    json={
                        "project_id": self.project_id,
                        "command": command
                    }
                ) as response:
                    result = await response.json()
                    
                    await self.event_emitter.emit("terminal_command_completed", {
                        "command": command,
                        "success": result.get("success", False),
                        "output": result.get("output", "")
                    })
                    
                    return result
        except Exception as e:
            await self.event_emitter.emit("terminal_command_error", {
                "command": command,
                "error": str(e)
            })
            
            return {
                "success": False,
                "error": str(e)
            }
    
    async def monitor_output(self, output: str) -> None:
        """
        Monitor terminal output for errors.
        """
        # Detect errors in output
        # This will be handled by ErrorHandler
        await self.event_emitter.emit("terminal_output", {
            "output": output
        })


