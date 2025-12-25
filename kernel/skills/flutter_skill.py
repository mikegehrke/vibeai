# kernel/skills/flutter_skill.py
# -------------------------------
# Flutter-Projekt-Skill
# Erkennt "erstelle Flutter App" und delegiert an FlutterProjectGenerator

import asyncio
from kernel.events import AgentEvent, EVENT_MESSAGE
from actions.flutter_project import FlutterProjectGenerator


class FlutterSkill:
    """
    Skill für Flutter-Projekt-Erstellung.
    """
    
    def __init__(self, projects_base_path: str = "user_projects"):
        self.base_path = projects_base_path
    
    async def run(self, prompt: str, emit):
        """
        Führt Flutter-Projekt-Erstellung aus.
        
        Args:
            prompt: User-Anfrage (z.B. "Erstelle eine To-Do App")
            emit: Event-Callback
        """
        # Projekt-Name aus Prompt extrahieren (vereinfacht)
        project_name = "todo_app"
        
        if "name" in prompt.lower():
            # Versuche Namen zu extrahieren
            words = prompt.split()
            for i, word in enumerate(words):
                if word.lower() == "name" and i + 1 < len(words):
                    project_name = words[i + 1].strip('",.')
        
        # Generator initialisieren und ausführen
        generator = FlutterProjectGenerator(self.base_path, emit)
        await generator.create_todo_app(project_name)
