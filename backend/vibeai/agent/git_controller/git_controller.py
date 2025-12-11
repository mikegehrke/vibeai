# -------------------------------------------------------------
# VIBEAI SUPER AGENT - GIT CONTROLLER
# -------------------------------------------------------------
"""
Git operations and version control.

Handles git commands and repository management.
"""

import subprocess
import os
from typing import Dict, List
from vibeai.agent.event_stream.event_emitter import EventEmitter
from codestudio.terminal_routes import get_project_path


class GitController:
    """
    Manages Git operations.
    
    Features:
    - Git status
    - Auto-commits
    - Branch management
    - Conflict resolution
    """
    
    def __init__(self, project_id: str, event_emitter: EventEmitter):
        self.project_id = project_id
        self.event_emitter = event_emitter
        self.project_path = get_project_path(project_id)
    
    async def get_status(self) -> Dict:
        """Get git status."""
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.project_path,
                capture_output=True,
                text=True
            )
            
            return {
                "success": True,
                "status": result.stdout
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def commit(self, message: str) -> Dict:
        """Create commit."""
        await self.event_emitter.emit("git_commit_started", {
            "message": message
        })
        
        try:
            # Add all files
            subprocess.run(
                ["git", "add", "."],
                cwd=self.project_path,
                capture_output=True
            )
            
            # Commit
            result = subprocess.run(
                ["git", "commit", "-m", message],
                cwd=self.project_path,
                capture_output=True,
                text=True
            )
            
            await self.event_emitter.emit("git_commit_completed", {
                "message": message,
                "success": result.returncode == 0
            })
            
            return {
                "success": result.returncode == 0,
                "output": result.stdout
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

