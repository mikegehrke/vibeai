# backend/actions/editor.py
# -------------------------
# Code-Schreiben Zeile für Zeile
# Wie Cursor/Copilot - sichtbar für User

import asyncio
from kernel.events import AgentEvent, EVENT_MESSAGE, EVENT_STEP


class WriteCode:
    """Schreibt Code Zeile für Zeile in eine Datei"""
    
    def __init__(self, path: str, lines: list):
        self.path = path
        self.lines = lines
    
    def describe(self):
        return f"Schreibe Code in {self.path}"
    
    async def execute(self, streamer):
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message=f"⌨️  {self.describe()} ({len(self.lines)} Zeilen)"
        ))
        
        # Datei öffnen (append mode falls bereits existiert)
        with open(self.path, 'a', encoding='utf-8') as f:
            for i, line in enumerate(self.lines, 1):
                f.write(line + '\n')
                
                # Live-Event für jede Zeile
                if i % 5 == 0 or i == len(self.lines):  # Nicht jede Zeile einzeln
                    await streamer.send_event(AgentEvent(
                        type=EVENT_STEP,
                        message=f"Zeile {i}/{len(self.lines)}: {line[:50]}...",
                        data={
                            "action": "write_code",
                            "path": self.path,
                            "line": i,
                            "content": line
                        }
                    ))
                    await asyncio.sleep(0.02)  # Kurze Pause für Typing-Effekt
        
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message=f"✅ Code in {self.path} fertig geschrieben"
        ))


class EditCode:
    """Bearbeitet existierenden Code (Zeile ersetzen, einfügen, löschen)"""
    
    def __init__(self, path: str, line_number: int, new_content: str, operation: str = "replace"):
        self.path = path
        self.line_number = line_number
        self.new_content = new_content
        self.operation = operation  # replace, insert, delete
    
    def describe(self):
        ops = {"replace": "Ersetze", "insert": "Füge ein", "delete": "Lösche"}
        return f"{ops[self.operation]} Zeile {self.line_number} in {self.path}"
    
    async def execute(self, streamer):
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message=f"✏️  {self.describe()}"
        ))
        
        # Datei lesen
        with open(self.path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Operation ausführen
        if self.operation == "replace":
            lines[self.line_number - 1] = self.new_content + '\n'
        elif self.operation == "insert":
            lines.insert(self.line_number - 1, self.new_content + '\n')
        elif self.operation == "delete":
            del lines[self.line_number - 1]
        
        # Datei schreiben
        with open(self.path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        
        await streamer.send_event(AgentEvent(
            type=EVENT_STEP,
            message=f"Code bearbeitet: {self.path}",
            data={"action": "edit_code", "path": self.path, "line": self.line_number}
        ))
        
        await asyncio.sleep(0.05)
