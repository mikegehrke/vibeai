# -------------------------------------------------------------
# VIBEAI SUPER AGENT - EDITOR CONTROLLER
# -------------------------------------------------------------
"""
Direct editor manipulation with live typing effect.

Opens files, shows live typing, highlights code, shows errors,
all in real-time with character-by-character updates.
"""

from typing import Dict
from vibeai.agent.event_stream.event_emitter import EventEmitter


class EditorController:
    """
    Controls editor state and file visibility with live typing.
    
    Features:
    - Open files in editor
    - Live character-by-character typing effect
    - Update editor content in real-time
    - Highlight code sections
    - Show error markers
    - Scroll to specific lines
    - Show cursor position
    """
    
    def __init__(self, project_id: str, event_emitter: EventEmitter):
        self.project_id = project_id
        self.event_emitter = event_emitter
        self.open_files = {}  # Track open files and their content
    
    async def open_file(self, file_path: str, line: int = 1, column: int = 1) -> None:
        """
        Open file in editor and focus it.
        """
        self.open_files[file_path] = {
            "content": "",
            "line": line,
            "column": column
        }
        
        await self.event_emitter.emit("editor_file_opened", {
            "path": file_path,
            "line": line,
            "column": column
        })
    
    async def update_file_content(
        self,
        file_path: str,
        content: str,
        line: int = None,
        column: int = None
    ) -> None:
        """
        Update file content in editor with live typing effect.
        
        This is called character by character to show
        the typing effect in the editor.
        """
        if file_path not in self.open_files:
            await self.open_file(file_path, line or 1, column or 1)
        
        self.open_files[file_path]["content"] = content
        
        await self.event_emitter.emit("editor_content_updated", {
            "path": file_path,
            "content": content,
            "line": line or self.open_files[file_path]["line"],
            "column": column or self.open_files[file_path]["column"],
            "length": len(content)
        })
    
    async def set_cursor_position(self, file_path: str, line: int, column: int) -> None:
        """
        Set cursor position in editor.
        """
        if file_path in self.open_files:
            self.open_files[file_path]["line"] = line
            self.open_files[file_path]["column"] = column
        
        await self.event_emitter.emit("editor_cursor_moved", {
            "path": file_path,
            "line": line,
            "column": column
        })
    
    async def highlight_code(self, file_path: str, start_line: int, end_line: int) -> None:
        """
        Highlight code section in editor.
        """
        await self.event_emitter.emit("editor_code_highlighted", {
            "path": file_path,
            "start_line": start_line,
            "end_line": end_line
        })
    
    async def show_error(self, file_path: str, line: int, message: str) -> None:
        """
        Show error marker in editor.
        """
        await self.event_emitter.emit("editor_error_shown", {
            "path": file_path,
            "line": line,
            "message": message
        })
    
    async def scroll_to_line(self, file_path: str, line: int) -> None:
        """
        Scroll editor to specific line.
        """
        await self.event_emitter.emit("editor_scrolled", {
            "path": file_path,
            "line": line
        })
    
    async def show_typing_indicator(self, file_path: str, is_typing: bool) -> None:
        """
        Show/hide typing indicator in editor.
        """
        await self.event_emitter.emit("editor_typing_indicator", {
            "path": file_path,
            "is_typing": is_typing
        })

