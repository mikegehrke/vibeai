# -------------------------------------------------------------
# VIBEAI SUPER AGENT - CODE STREAMER
# -------------------------------------------------------------
"""
Live code streaming engine with character-by-character typing effect.

Streams code character by character like a human typing.
"""

import asyncio
import random
from typing import AsyncGenerator, Dict
from vibeai.agent.event_stream.event_emitter import EventEmitter


class CodeStreamer:
    """
    Streams code character by character with realistic typing effect.
    
    Shows code as it's being written, character by character,
    like a real human typing in the editor.
    """
    
    def __init__(self, event_emitter: EventEmitter):
        self.event_emitter = event_emitter
    
    def _get_typing_delay(self, char: str) -> float:
        """
        Get realistic typing delay for a character.
        
        Different characters have different typing speeds:
        - Normal chars: 30-80ms
        - Spaces: 20-40ms
        - Newlines: 50-100ms
        - Special chars: 40-100ms
        """
        if char == '\n':
            return random.uniform(0.05, 0.1)  # 50-100ms for newline
        elif char == ' ':
            return random.uniform(0.02, 0.04)  # 20-40ms for space
        elif char in '{}[]()':
            return random.uniform(0.04, 0.08)  # 40-80ms for brackets
        elif char in '.,;:':
            return random.uniform(0.03, 0.06)  # 30-60ms for punctuation
        else:
            return random.uniform(0.03, 0.08)  # 30-80ms for normal chars
    
    async def stream_code(
        self,
        file_path: str,
        code_content: str,
        typing_speed: float = 1.0  # Multiplier for typing speed (1.0 = normal, 2.0 = 2x faster)
    ) -> AsyncGenerator[Dict, None]:
        """
        Stream code character by character with realistic typing effect.
        
        Yields events for each character written, making it look
        like a human is typing in the editor.
        """
        total_chars = len(code_content)
        current_content = ""
        current_line = 1
        current_column = 1
        
        # Announce streaming start
        yield await self.event_emitter.emit("code_streaming_started", {
            "path": file_path,
            "total_chars": total_chars,
            "total_lines": code_content.count("\n") + 1
        })
        
        # Stream character by character
        for char_index, char in enumerate(code_content):
            # Add character to current content
            current_content += char
            
            # Update line/column tracking
            if char == '\n':
                current_line += 1
                current_column = 1
            else:
                current_column += 1
            
            # Emit character written event
            yield await self.event_emitter.emit("code_character_written", {
                "path": file_path,
                "content": current_content,  # Full content so far
                "character": char,
                "char_index": char_index + 1,
                "total_chars": total_chars,
                "line": current_line,
                "column": current_column,
                "progress": ((char_index + 1) / total_chars) * 100
            })
            
            # Realistic typing delay
            delay = self._get_typing_delay(char) / typing_speed
            await asyncio.sleep(delay)
            
            # Every 10 characters, also emit a "chunk" event for smoother updates
            if (char_index + 1) % 10 == 0:
                yield await self.event_emitter.emit("code_chunk_written", {
                    "path": file_path,
                    "content": current_content,
                    "char_index": char_index + 1,
                    "total_chars": total_chars,
                    "line": current_line,
                    "column": current_column,
                    "progress": ((char_index + 1) / total_chars) * 100
                })
        
        # Streaming complete
        yield await self.event_emitter.emit("code_streaming_complete", {
            "path": file_path,
            "total_lines": current_line,
            "total_chars": total_chars,
            "final_content": current_content
        })

