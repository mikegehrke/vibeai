# -------------------------------------------------------------
# VIBEAI SUPER AGENT - LIVE FILE WRITER
# -------------------------------------------------------------
"""
Live file writer with immediate visibility.

Writes files directly to disk and immediately
makes them visible in the editor.
"""

import os
from typing import Dict
from vibeai.agent.event_stream.event_emitter import EventEmitter
from codestudio.terminal_routes import get_project_path


class LiveFileWriter:
    """
    Writes files directly to project directory.
    
    Features:
    - Immediate file creation
    - Directory auto-creation
    - Event emission for visibility
    - No terminal commands
    """
    
    def __init__(self, project_id: str, event_emitter: EventEmitter):
        self.project_id = project_id
        self.event_emitter = event_emitter
        self.project_path = get_project_path(project_id)
        
        # Ensure project directory exists
        os.makedirs(self.project_path, exist_ok=True)
    
    async def write_file(self, file_path: str, content: str) -> Dict:
        """
        Write file directly to disk.
        
        Returns file info dict.
        """
        # Normalize path
        if file_path.startswith("/"):
            file_path = file_path[1:]
        
        # Full path
        full_path = os.path.join(self.project_path, file_path)
        
        # Create directories if needed
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        # Emit folder creation events
        dirs = os.path.dirname(file_path).split("/")
        current_path = ""
        for dir_name in dirs:
            if dir_name:
                current_path = os.path.join(current_path, dir_name) if current_path else dir_name
                folder_path = os.path.join(self.project_path, current_path)
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path, exist_ok=True)
                    await self.event_emitter.emit("folder_created", {
                        "path": current_path
                    })
        
        # Write file
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        # Emit file created event
        await self.event_emitter.emit("file_written", {
            "path": file_path,
            "full_path": full_path,
            "size": len(content),
            "lines": content.count("\n") + 1
        })
        
        return {
            "path": file_path,
            "full_path": full_path,
            "size": len(content),
            "lines": content.count("\n") + 1
        }
    
    async def update_file(self, file_path: str, content: str) -> Dict:
        """
        Update existing file.
        """
        # Normalize path
        if file_path.startswith("/"):
            file_path = file_path[1:]
        
        full_path = os.path.join(self.project_path, file_path)
        
        # Write updated content
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        # Emit file modified event
        await self.event_emitter.emit("file_modified", {
            "path": file_path,
            "size": len(content),
            "lines": content.count("\n") + 1
        })
        
        return {
            "path": file_path,
            "size": len(content),
            "lines": content.count("\n") + 1
        }

