# kernel/agents/smart_agent.py
# -----------------------------
# SmartAgent - Code & Struktur (Kernel v1.0)
#
# AUFGABEN:
# - Ordner erstellen
# - Dateien anlegen
# - Code schreiben
# - Kommentare hinzufügen
#
# REGEL:
# - Nur strukturierte Ergebnisse (Events)
# - Keine direkten UI/Editor-Zugriffe

from typing import Dict, Any
from kernel.events import KernelEvent, EVENT_FILE_CREATE, EVENT_FILE_UPDATE, EVENT_TODO


class SmartAgent:
    """
    SmartAgent (Kernel v1.0) - Code & Struktur Generator.
    
    CAPABILITY CONTRACT:
    can: ["file_create", "file_update", "folder_create", "add_comment"]
    cannot: ["git_push", "delete_project", "terminal_exec"]
    """
    
    def __init__(self, kernel):
        self.kernel = kernel
        self.capabilities = ["file_create", "file_update", "folder_create", "add_comment"]
    
    async def create_project(self, project_type: str, project_name: str):
        """
        Erstellt ein vollständiges Projekt.
        
        Args:
            project_type: flutter, react, python, etc.
            project_name: Name des Projekts
            
        Returns:
            Dict mit Events
        """
        # Generiere To-Do-Liste
        todos = self._generate_todos(project_type, project_name)
        
        # Emittiere To-Do-Liste als Event
        await self.kernel.streamer.send_event(KernelEvent(
            type=EVENT_TODO,
            message=f"{len(todos)} Schritte geplant",
            data={"todos": todos}
        ))
        
        # Führe Todos aus (delegiert an Actions)
        for todo in todos:
            await self._execute_todo(todo)
        
        return {"status": "completed", "project": project_name}
    
    def _generate_todos(self, project_type: str, project_name: str) -> list:
        """Generiert To-Do-Liste für Projekt."""
        if project_type == "flutter":
            return [
                "Ordnerstruktur anlegen",
                "pubspec.yaml erstellen",
                "main.dart schreiben",
                "Models erstellen",
                "Screens implementieren"
            ]
        elif project_type == "react":
            return [
                "package.json erstellen",
                "src/ Ordner anlegen",
                "App.jsx schreiben",
                "Components erstellen"
            ]
        else:
            return ["Projekt-Struktur anlegen"]
    
    async def _execute_todo(self, todo: str):
        """Führt ein To-Do aus (delegiert an Actions)."""
        # TODO: Action-Mapping implementieren
        pass
    
    async def create_file(self, path: str, content: str = ""):
        """
        Erstellt eine Datei.
        
        Returns:
            Event-Dict
        """
        # Delegiert an FileSystem-Action
        from actions.filesystem import CreateFile
        action = CreateFile(path=path, content=content)
        await action.execute(self.kernel.streamer)
        
        return {
            "event": EVENT_FILE_CREATE,
            "data": {"path": path}
        }
    
    async def write_code(self, path: str, lines: list):
        """
        Schreibt Code Zeile für Zeile.
        
        Returns:
            Event-Dict
        """
        from actions.editor import WriteCode
        action = WriteCode(path=path, lines=lines)
        await action.execute(self.kernel.streamer)
        
        return {
            "event": EVENT_FILE_UPDATE,
            "data": {"path": path, "lines": len(lines)}
        }
    
    def get_capabilities(self) -> list:
        """Gibt Liste der Capabilities zurück."""
        return self.capabilities
