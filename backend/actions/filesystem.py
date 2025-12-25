# backend/actions/filesystem.py
# -----------------------------
# Basis-Actions: Dateien & Ordner
# Atomic operations mit Live-Feedback

import os
import asyncio
from kernel.events import AgentEvent, EVENT_MESSAGE, EVENT_STEP


class CreateFile:
    """Legt eine Datei an (leer oder mit Inhalt)"""
    
    def __init__(self, path: str, content: str = ""):
        self.path = path
        self.content = content
    
    def describe(self):
        return f"Erstelle Datei {self.path}"
    
    async def execute(self, streamer):
        # Chat-Nachricht
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message=f"📄 {self.describe()}"
        ))
        
        # Datei anlegen
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        with open(self.path, 'w', encoding='utf-8') as f:
            f.write(self.content)
        
        # Technisches Event
        await streamer.send_event(AgentEvent(
            type=EVENT_STEP,
            message=f"Datei erstellt: {self.path}",
            data={"action": "create_file", "path": self.path}
        ))
        
        await asyncio.sleep(0.05)


class CreateFolder:
    """Legt einen Ordner an"""
    
    def __init__(self, path: str):
        self.path = path
    
    def describe(self):
        return f"Erstelle Ordner {self.path}"
    
    async def execute(self, streamer):
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message=f"📁 {self.describe()}"
        ))
        
        os.makedirs(self.path, exist_ok=True)
        
        await streamer.send_event(AgentEvent(
            type=EVENT_STEP,
            message=f"Ordner erstellt: {self.path}",
            data={"action": "create_folder", "path": self.path}
        ))
        
        await asyncio.sleep(0.05)
