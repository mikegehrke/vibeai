# backend/actions/comments.py
# ---------------------------
# Kommentare im Code hinzufügen
# Für Lern-Modus & Code-Erklärungen

import asyncio
from kernel.events import AgentEvent, EVENT_MESSAGE, EVENT_STEP


class AddComment:
    """Fügt einen Kommentar am Dateianfang hinzu"""
    
    def __init__(self, path: str, comment: str, language: str = "dart"):
        self.path = path
        self.comment = comment
        self.language = language
    
    def describe(self):
        return f"Füge Kommentar zu {self.path} hinzu"
    
    def _format_comment(self):
        """Formatiert Kommentar je nach Sprache"""
        if self.language in ["dart", "javascript", "typescript", "java", "kotlin", "swift"]:
            return f"// {self.comment}\n"
        elif self.language in ["python"]:
            return f"# {self.comment}\n"
        elif self.language in ["html", "xml"]:
            return f"<!-- {self.comment} -->\n"
        else:
            return f"// {self.comment}\n"
    
    async def execute(self, streamer):
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message=f"💬 {self.describe()}"
        ))
        
        # Datei lesen
        with open(self.path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Kommentar am Anfang einfügen
        commented_content = self._format_comment() + content
        
        # Datei schreiben
        with open(self.path, 'w', encoding='utf-8') as f:
            f.write(commented_content)
        
        await streamer.send_event(AgentEvent(
            type=EVENT_STEP,
            message=f"Kommentar hinzugefügt: {self.path}",
            data={"action": "add_comment", "path": self.path, "comment": self.comment}
        ))
        
        await asyncio.sleep(0.05)


class ExplainCode:
    """Erklärt Code-Abschnitt im Chat (ohne Datei zu ändern)"""
    
    def __init__(self, path: str, line_start: int, line_end: int, explanation: str):
        self.path = path
        self.line_start = line_start
        self.line_end = line_end
        self.explanation = explanation
    
    def describe(self):
        return f"Erkläre {self.path} Zeilen {self.line_start}-{self.line_end}"
    
    async def execute(self, streamer):
        # Nur Chat-Nachricht, keine Datei-Änderung
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message=f"📚 **Code-Erklärung** ({self.path} Z.{self.line_start}-{self.line_end}):\n\n{self.explanation}"
        ))
        
        await asyncio.sleep(0.1)
