# -------------------------------------------------------------
# VIBEAI SUPER AGENT - EVENT EMITTER
# -------------------------------------------------------------
"""
Real-time event system for agent actions.

Events:
- file_announced: Before creating a file
- code_streaming: While writing code (line by line)
- file_created: After file is saved
- file_modified: When file is updated
- folder_created: When folder is created
- code_written: When code is written
- log_entry: Log message
- error_detected: When error is found
- error_fixed: When error is fixed
- syntax_validated: After syntax check
- build_started: When build starts
- build_completed: When build finishes
"""

import asyncio
from typing import Dict, Optional, Callable, List
from datetime import datetime


class EventEmitter:
    """
    Event emitter for real-time agent actions.
    
    All agent actions emit events that are immediately
    visible in the frontend.
    """
    
    def __init__(self, on_event: Optional[Callable] = None):
        self.on_event = on_event
        self.listeners: List[Callable] = []
        
        if on_event:
            self.listeners.append(on_event)
    
    async def emit(self, event_type: str, data: Dict) -> Dict:
        """
        Emit an event immediately.
        
        Returns event dict for streaming.
        """
        event = {
            "event": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Notify all listeners
        for listener in self.listeners:
            try:
                if asyncio.iscoroutinefunction(listener):
                    await listener(event)
                else:
                    listener(event)
            except Exception as e:
                print(f"⚠️  Event listener error: {e}")
        
        return event
    
    def add_listener(self, listener: Callable):
        """Add event listener."""
        self.listeners.append(listener)
    
    def remove_listener(self, listener: Callable):
        """Remove event listener."""
        if listener in self.listeners:
            self.listeners.remove(listener)

