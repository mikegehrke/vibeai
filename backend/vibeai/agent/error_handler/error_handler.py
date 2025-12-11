# -------------------------------------------------------------
# VIBEAI SUPER AGENT - ERROR HANDLER
# -------------------------------------------------------------
"""
Automatic error detection and fixing.

Detects errors from:
- Terminal output
- Build logs
- Syntax validation
- Runtime errors

Auto-fixes errors when possible.
"""

import re
from typing import Dict, List, Optional, AsyncGenerator
from vibeai.agent.event_stream.event_emitter import EventEmitter
from vibeai.agent.file_writer.live_file_writer import LiveFileWriter


class ErrorHandler:
    """
    Detects and fixes errors automatically.
    
    Features:
    - Error detection from terminal/build logs
    - Automatic error fixing
    - Live error display in editor
    - Fix validation
    """
    
    def __init__(self, project_id: str, event_emitter: EventEmitter):
        self.project_id = project_id
        self.event_emitter = event_emitter
        self.file_writer = LiveFileWriter(project_id, event_emitter)
    
    def detect_errors(self, output: str) -> List[Dict]:
        """
        Detect errors from terminal/build output.
        
        Returns list of error dicts with:
        - message: Error message
        - file: Affected file (if detectable)
        - line: Line number (if detectable)
        - type: Error type
        - auto_fixable: Whether error can be auto-fixed
        """
        errors = []
        
        # Flutter errors
        flutter_error_pattern = r"Error: (.+?)(?:\n|$)"
        for match in re.finditer(flutter_error_pattern, output):
            errors.append({
                "message": match.group(1),
                "type": "flutter_error",
                "auto_fixable": False
            })
        
        # Dart syntax errors
        dart_error_pattern = r"lib/(.+?):(\d+):(\d+): (.+)"
        for match in re.finditer(dart_error_pattern, output):
            errors.append({
                "message": match.group(4),
                "file": match.group(1),
                "line": int(match.group(2)),
                "column": int(match.group(3)),
                "type": "syntax_error",
                "auto_fixable": True
            })
        
        # npm/build errors
        npm_error_pattern = r"npm ERR! (.+)"
        for match in re.finditer(npm_error_pattern, output):
            errors.append({
                "message": match.group(1),
                "type": "npm_error",
                "auto_fixable": False
            })
        
        return errors
    
    async def fix_file_errors(
        self,
        file_path: str,
        errors: List[Dict]
    ) -> AsyncGenerator[Dict, None]:
        """
        Fix errors in a file.
        
        Yields fix events as errors are fixed.
        """
        for error in errors:
            if not error.get("auto_fixable"):
                continue
            
            # Emit fix started
            yield await self.event_emitter.emit("error_fix_started", {
                "path": file_path,
                "error": error
            })
            
            # Generate fix
            fix = await self._generate_fix(file_path, error)
            
            if fix:
                # Apply fix
                await self.file_writer.update_file(file_path, fix["content"])
                
                # Emit fix applied
                yield await self.event_emitter.emit("error_fixed", {
                    "path": file_path,
                    "error": error,
                    "fix": fix["description"]
                })
    
    async def fix_error(self, error: Dict) -> AsyncGenerator[Dict, None]:
        """
        Fix a single error.
        
        Yields fix events.
        """
        file_path = error.get("file")
        
        if not file_path:
            return
        
        async for event in self.fix_file_errors(file_path, [error]):
            yield event
    
    async def _generate_fix(self, file_path: str, error: Dict) -> Optional[Dict]:
        """
        Generate fix for an error using AI.
        
        Returns fix dict with:
        - content: Fixed file content
        - description: Description of fix
        """
        from openai import OpenAI
        import os
        
        # Get OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return None
        
        client = OpenAI(api_key=api_key)
        
        # Read current file content
        from codestudio.terminal_routes import get_project_path
        project_path = get_project_path(self.project_id)
        full_path = os.path.join(project_path, file_path)
        
        if not os.path.exists(full_path):
            return None
        
        with open(full_path, 'r', encoding='utf-8') as f:
            current_content = f.read()
        
        # Build fix prompt
        error_message = error.get("message", "Unknown error")
        error_line = error.get("line", 0)
        error_type = error.get("type", "syntax_error")
        
        prompt = f"""Fix the following error in file {file_path}:

ERROR TYPE: {error_type}
ERROR MESSAGE: {error_message}
ERROR LINE: {error_line}

CURRENT FILE CONTENT:
```{file_path.split('.')[-1]}
{current_content}
```

REQUIREMENTS:
- Fix ONLY the error, don't change other code
- Keep the same code style
- Return the COMPLETE fixed file content

Return ONLY the fixed code in a markdown code block:
```{file_path.split('.')[-1]} {file_path}
[FIXED CODE HERE]
```"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a code fixer. Fix errors precisely without changing working code."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=4000
            )
            
            content = response.choices[0].message.content.strip()
            
            # Extract code from markdown block
            import re
            match = re.search(r"```\w+\s+.*?\n(.*?)```", content, re.DOTALL)
            if match:
                fixed_content = match.group(1).strip()
                return {
                    "content": fixed_content,
                    "description": f"Fixed {error_type}: {error_message}"
                }
            
            return None
        except Exception as e:
            print(f"❌ Error generating fix: {e}")
            return None

