# -------------------------------------------------------------
# VIBEAI SUPER AGENT - CORE ENGINE
# -------------------------------------------------------------
"""
Central orchestration engine for the VibeAI Super Agent.

Features:
- File-by-file generation (never all at once)
- Live streaming of code
- Immediate responses (<1 second)
- Transparent actions
- Autonomous development mode
"""

import asyncio
import os
from typing import Dict, List, Optional, Callable, AsyncGenerator
from datetime import datetime
from enum import Enum

from vibeai.agent.event_stream.event_emitter import EventEmitter
from vibeai.agent.file_writer.live_file_writer import LiveFileWriter
from vibeai.agent.streaming.code_streamer import CodeStreamer
from vibeai.agent.editor_controller.editor_controller import EditorController
from vibeai.agent.error_handler.error_handler import ErrorHandler
from vibeai.agent.terminal_controller.terminal_controller import TerminalController
from vibeai.agent.project_analyzer.project_analyzer import ProjectAnalyzer


class AgentState(Enum):
    """Agent execution states"""
    IDLE = "idle"
    ANALYZING = "analyzing"
    GENERATING = "generating"
    WRITING = "writing"
    TESTING = "testing"
    FIXING = "fixing"
    COMPLETED = "completed"
    ERROR = "error"


class SuperAgentCore:
    """
    🚀 VibeAI Super Agent Core
    
    Orchestrates all agent operations with:
    - File-by-file generation
    - Live streaming
    - Immediate responses
    - Full system access
    """
    
    def __init__(
        self,
        project_id: str,
        api_base_url: str = "http://localhost:8005",
        on_event: Optional[Callable] = None
    ):
        self.project_id = project_id
        self.api_base_url = api_base_url
        self.state = AgentState.IDLE
        
        # Core modules
        self.event_emitter = EventEmitter(on_event)
        self.file_writer = LiveFileWriter(project_id, self.event_emitter)
        self.code_streamer = CodeStreamer(self.event_emitter)
        self.editor_controller = EditorController(project_id, self.event_emitter)
        self.error_handler = ErrorHandler(project_id, self.event_emitter)
        self.terminal_controller = TerminalController(project_id, self.event_emitter, api_base_url)
        self.project_analyzer = ProjectAnalyzer(project_id, self.event_emitter)
        
        # Generation queue
        self.generation_queue: List[Dict] = []
        self.current_file_index = 0
        
    async def start_project_generation(
        self,
        project_name: str,
        platform: str,
        description: str,
        features: List[str] = None
    ) -> AsyncGenerator[Dict, None]:
        # Store context for code generation
        self.project_name = project_name
        self.platform = platform
        self.description = description
        self.features = features or []
        """
        Start project generation with live streaming.
        
        Yields events as they happen:
        - file_announced: Before creating a file
        - code_streaming: While writing code
        - file_created: After file is saved
        - error_detected: When errors occur
        - error_fixed: When errors are fixed
        """
        try:
            self.state = AgentState.ANALYZING
            
            # STEP 1: Analyze project structure
            yield await self.event_emitter.emit("project_analysis_started", {
                "project_name": project_name,
                "platform": platform
            })
            
            analysis = await self.project_analyzer.analyze_project(
                project_name, platform, description, features or []
            )
            
            yield await self.event_emitter.emit("project_analysis_complete", {
                "structure": analysis["structure"],
                "total_files": len(analysis["files_to_create"])
            })
            
            # STEP 2: Plan generation order
            self.generation_queue = analysis["files_to_create"]
            # Convert missing_components from List[str] to List[Dict] if needed
            missing_components_raw = analysis.get("missing_components", [])
            missing_components = []
            for comp in missing_components_raw:
                if isinstance(comp, dict):
                    missing_components.append(comp)
                else:
                    # Legacy format: just a path string
                    missing_components.append({
                        "path": comp,
                        "type": "unknown",
                        "priority": 999,
                        "reason": "Required component"
                    })
            
            # ⚡ AUTONOMER MODUS: Zeige fehlende Komponenten
            if missing_components:
                yield await self.event_emitter.emit("missing_components_detected", {
                    "count": len(missing_components),
                    "components": missing_components,
                    "message": f"🔍 {len(missing_components)} fehlende Komponenten erkannt. Generiere automatisch..."
                })
            
            self.current_file_index = 0
            
            self.state = AgentState.GENERATING
            
            # STEP 3: Generate files ONE BY ONE (autonom!)
            for file_info in self.generation_queue:
                # ⚡ Zeige welche Datei als nächstes kommt
                yield await self.event_emitter.emit("file_generation_starting", {
                    "path": file_info.get("path", ""),
                    "step": self.current_file_index + 1,
                    "total": len(self.generation_queue),
                    "type": file_info.get("type", "code")
                })
                
                async for event in self._generate_file_live(file_info):
                    yield event
                
                self.current_file_index += 1
                
                # Small delay for visibility
                await asyncio.sleep(0.1)
            
            # STEP 4: ⚡ AUTONOMER MODUS - Erkenne und generiere fehlende Komponenten
            if missing_components:
                yield await self.event_emitter.emit("generating_missing_components", {
                    "count": len(missing_components)
                })
                
                for component in missing_components:
                    # Generiere fehlende Komponente
                    component_file_info = {
                        "path": component["path"],
                        "type": component["type"],
                        "description": f"Generate missing {component['type']}: {component['path']}",
                        "priority": component["priority"]
                    }
                    
                    async for event in self._generate_file_live(component_file_info):
                        yield event
            
            # STEP 5: ⚡ AUTONOMER MODUS - Installiere Dependencies automatisch
            self.state = AgentState.TESTING
            yield await self.event_emitter.emit("installing_dependencies", {
                "platform": platform,
                "message": f"📦 Installiere Dependencies für {platform}..."
            })
            
            try:
                if platform == "flutter":
                    result = await self.terminal_controller.execute_command("flutter pub get")
                    if result.get("success"):
                        yield await self.event_emitter.emit("dependencies_installed", {
                            "platform": platform,
                            "message": "✅ Flutter Dependencies installiert"
                        })
                elif platform in ["react", "nextjs", "nodejs"]:
                    result = await self.terminal_controller.execute_command("npm install")
                    if result.get("success"):
                        yield await self.event_emitter.emit("dependencies_installed", {
                            "platform": platform,
                            "message": "✅ npm Dependencies installiert"
                        })
            except Exception as e:
                yield await self.event_emitter.emit("dependency_install_error", {
                    "error": str(e),
                    "message": f"⚠️ Fehler beim Installieren: {e}"
                })
            
            # STEP 6: ⚡ AUTONOMER MODUS - Baue Projekt und erkenne Fehler
            yield await self.event_emitter.emit("building_project", {
                "platform": platform,
                "message": f"🏗️ Baue Projekt ({platform})..."
            })
            
            try:
                if platform == "flutter":
                    build_result = await self.terminal_controller.execute_command("flutter build web")
                elif platform in ["react", "nextjs"]:
                    build_result = await self.terminal_controller.execute_command("npm run build")
                else:
                    build_result = {"success": True, "output": ""}
                
                # ⚡ Analysiere Build-Output auf Fehler
                if build_result.get("output"):
                    await self.handle_terminal_output(build_result["output"])
                
                if build_result.get("success"):
                    yield await self.event_emitter.emit("build_success", {
                        "message": "✅ Build erfolgreich!"
                    })
                else:
                    yield await self.event_emitter.emit("build_failed", {
                        "output": build_result.get("output", ""),
                        "message": "❌ Build fehlgeschlagen - Fehler werden analysiert..."
                    })
            except Exception as e:
                yield await self.event_emitter.emit("build_error", {
                    "error": str(e)
                })
            
            # STEP 7: ⚡ AUTONOMER MODUS - Starte Preview automatisch
            yield await self.event_emitter.emit("starting_preview", {
                "platform": platform,
                "message": f"🚀 Starte Preview für {platform}..."
            })
            
            try:
                from vibeai.agent.preview_controller.preview_controller import PreviewController
                preview_controller = PreviewController(self.project_id, self.event_emitter)
                preview_result = await preview_controller.start_preview(platform)
                
                if preview_result.get("success"):
                    yield await self.event_emitter.emit("preview_started", {
                        "url": preview_result.get("url"),
                        "message": f"✅ Preview gestartet: {preview_result.get('url')}"
                    })
            except Exception as e:
                yield await self.event_emitter.emit("preview_error", {
                    "error": str(e)
                })
            
            # STEP 8: ⚡ AUTONOMER MODUS - Git Auto-Commit
            yield await self.event_emitter.emit("git_auto_commit", {
                "message": "📝 Erstelle Git Commit..."
            })
            
            try:
                from vibeai.agent.git_controller.git_controller import GitController
                git_controller = GitController(self.project_id, self.event_emitter)
                commit_result = await git_controller.commit(
                    f"Auto-generated: {project_name} ({platform})"
                )
                
                if commit_result.get("success"):
                    # Extract commit hash from output if available
                    output = commit_result.get("output", "")
                    commit_hash = ""
                    if output:
                        # Try to extract hash from git commit output
                        import re
                        match = re.search(r'\[(\w+)\]', output)
                        if match:
                            commit_hash = match.group(1)
                        else:
                            # Try to get from git log
                            try:
                                import subprocess
                                from codestudio.terminal_routes import get_project_path
                                project_path = get_project_path(self.project_id)
                                result = subprocess.run(
                                    ["git", "log", "-1", "--format=%H"],
                                    cwd=project_path,
                                    capture_output=True,
                                    text=True
                                )
                                if result.returncode == 0:
                                    commit_hash = result.stdout.strip()[:7]
                            except:
                                pass
                    
                    yield await self.event_emitter.emit("git_committed", {
                        "commit_hash": commit_hash,
                        "message": f"✅ Git Commit erstellt: {commit_hash or 'N/A'}"
                    })
            except Exception as e:
                yield await self.event_emitter.emit("git_error", {
                    "error": str(e)
                })
            
            self.state = AgentState.COMPLETED
            
            yield await self.event_emitter.emit("project_generation_complete", {
                "total_files": len(self.generation_queue) + len(missing_components),
                "generated_files": len(self.generation_queue),
                "missing_components_generated": len(missing_components),
                "message": f"🎉 Projekt erfolgreich generiert! {len(self.generation_queue) + len(missing_components)} Dateien erstellt."
            })
            
        except Exception as e:
            self.state = AgentState.ERROR
            yield await self.event_emitter.emit("error", {
                "error": str(e),
                "type": "generation_error"
            })
    
    async def _generate_file_live(self, file_info: Dict) -> AsyncGenerator[Dict, None]:
        """
        Generate a single file with live streaming.
        
        Process:
        1. Announce file creation
        2. Stream code line by line
        3. Write file to disk
        4. Validate syntax
        5. Report completion
        """
        file_path = file_info["path"]
        file_type = file_info.get("type", "code")
        description = file_info.get("description", f"Generate {file_path}")
        
        # STEP 1: Announce file
        yield await self.event_emitter.emit("file_announced", {
            "path": file_path,
            "type": file_type,
            "step": self.current_file_index + 1,
            "total": len(self.generation_queue)
        })
        
        self.state = AgentState.WRITING
        
        # STEP 2: Open file in editor FIRST (before generating)
        await self.editor_controller.open_file(file_path, line=1, column=1)
        await self.editor_controller.show_typing_indicator(file_path, True)
        
        yield await self.event_emitter.emit("file_opened_in_editor", {
            "path": file_path,
            "status": "typing"
        })
        
        # STEP 3: Generate code content
        code_content = await self._generate_code_content(file_info)
        
        # STEP 4: Stream code CHARACTER BY CHARACTER with live editor updates
        async for chunk in self.code_streamer.stream_code(file_path, code_content, typing_speed=1.0):
            # Update editor content in real-time
            if chunk["event"] == "code_character_written":
                await self.editor_controller.update_file_content(
                    file_path,
                    chunk["data"]["content"],
                    chunk["data"]["line"],
                    chunk["data"]["column"]
                )
                await self.editor_controller.set_cursor_position(
                    file_path,
                    chunk["data"]["line"],
                    chunk["data"]["column"]
                )
            
            yield chunk
        
        # Hide typing indicator
        await self.editor_controller.show_typing_indicator(file_path, False)
        
        # STEP 5: Write file to disk (after streaming is complete)
        await self.file_writer.write_file(file_path, code_content)
        
        yield await self.event_emitter.emit("file_created", {
            "path": file_path,
            "size": len(code_content),
            "lines": code_content.count("\n") + 1
        })
        
        # STEP 6: Validate syntax
        validation = await self._validate_file(file_path, code_content)
        
        if not validation["valid"]:
            yield await self.event_emitter.emit("syntax_error_detected", {
                "path": file_path,
                "errors": validation["errors"]
            })
            
            # Auto-fix errors
            async for fix_event in self.error_handler.fix_file_errors(file_path, validation["errors"]):
                yield fix_event
    
    async def _generate_code_content(self, file_info: Dict) -> str:
        """Generate code content for a file using OpenAI."""
        from openai import OpenAI
        import os
        import re
        
        # Get OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return f"// Error: OPENAI_API_KEY not set\n// File: {file_info['path']}\n"
        
        client = OpenAI(api_key=api_key)
        
        # Build prompt
        file_path = file_info["path"]
        file_type = file_info.get("type", "code")
        description = file_info.get("description", f"Generate {file_path}")
        
        # Get project context from request if available
        project_name = getattr(self, 'project_name', 'Project')
        platform = getattr(self, 'platform', 'flutter')
        
        prompt = f"""Generate COMPLETE, PRODUCTION-READY code for file: {file_path}

PROJECT: {project_name}
PLATFORM: {platform}
FILE TYPE: {file_type}
DESCRIPTION: {description}

REQUIREMENTS:
- Complete, working code (NO placeholders, NO TODOs)
- All necessary imports
- Proper error handling
- Best practices
- **DETAILED COMMENTS explaining WHAT, HOW, and WHY**

COMMENT REQUIREMENTS (VERY IMPORTANT):
1. **File Header Comment**: Explain what this file does, its purpose, and main components
2. **Section Comments**: Comment each major section (imports, classes, functions, main logic)
3. **Function/Method Comments**: For each function/method, explain:
   - WHAT it does (purpose)
   - HOW it works (brief explanation of logic)
   - WHY it's needed (context/reason)
   - Parameters: What each parameter is for
   - Returns: What it returns and why
4. **Complex Logic Comments**: Explain any non-obvious code, algorithms, or business logic
5. **Inline Comments**: Add comments for important lines that need explanation
6. **Language-specific**: Use appropriate comment syntax:
   - Dart: // for single-line, /* */ for multi-line
   - JavaScript/TypeScript: // for single-line, /* */ for multi-line
   - Python: # for comments, """ """ for docstrings
   - Swift: // for single-line, /* */ for multi-line
   - Kotlin: // for single-line, /* */ for multi-line

EXAMPLE COMMENT STYLE:
```dart
// This file contains the main application entry point and routing logic.
// It initializes the Flutter app and sets up navigation between screens.

import 'package:flutter/material.dart';

/// Main application widget that sets up the app structure
/// 
/// WHAT: Root widget that initializes the Flutter application
/// HOW: Uses MaterialApp to provide theme and routing
/// WHY: Required entry point for all Flutter applications
class MyApp extends StatelessWidget {{
  // Theme configuration for the app
  // WHY: Centralized theme makes it easy to change app-wide styling
  final ThemeData theme = ThemeData(
    primarySwatch: Colors.blue,
  );
  
  @override
  Widget build(BuildContext context) {{
    // WHAT: Builds the app widget tree
    // HOW: Returns MaterialApp with home screen
    // WHY: MaterialApp provides Material Design components and navigation
    return MaterialApp(
      theme: theme,
      home: HomeScreen(),
    );
  }}
}}
```

Return ONLY the code with detailed comments, formatted as:
```{file_path.split('.')[-1]} {file_path}
[COMPLETE CODE WITH COMMENTS HERE]
```"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert developer. Generate COMPLETE, working code. Return code in markdown code blocks."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=4000
            )
            
            content = response.choices[0].message.content.strip()
            
            # Extract code from markdown block
            match = re.search(r"```\w+\s+.*?\n(.*?)```", content, re.DOTALL)
            if match:
                return match.group(1).strip()
            
            # Fallback: remove markdown code blocks if present
            if content.startswith("```"):
                lines = content.split("\n")
                if len(lines) > 1:
                    lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                content = "\n".join(lines)
            
            return content.strip()
        except Exception as e:
            return f"// Error generating code: {str(e)}\n// File: {file_path}\n"
    
    async def _validate_file(self, file_path: str, content: str) -> Dict:
        """Validate file syntax."""
        # Basic validation
        errors = []
        
        # Check for basic syntax issues
        if file_path.endswith(".dart"):
            if "import" in content and ";" not in content.split("import")[1].split("\n")[0]:
                errors.append("Missing semicolon after import")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
    
    async def handle_terminal_output(self, output: str) -> None:
        """
        ⚡ Handle terminal output and detect errors - AUTO-FIX PIPELINE!
        
        Process:
        1. Analyze terminal output for errors
        2. Detect affected files and lines
        3. Generate fixes automatically
        4. Apply fixes live in editor
        5. Re-run build/test until errors are fixed
        """
        errors = self.error_handler.detect_errors(output)
        
        if errors:
            await self.event_emitter.emit("errors_detected", {
                "count": len(errors),
                "errors": errors
            })
            
            # ⚡ AUTO-FIX PIPELINE: Fix each error automatically
            for error in errors:
                await self.event_emitter.emit("error_detected", {
                    "error": error["message"],
                    "file": error.get("file"),
                    "line": error.get("line"),
                    "type": error.get("type", "build_error"),
                    "auto_fixable": error.get("auto_fixable", False)
                })
                
                # ⚡ AUTO-FIX if possible
                if error.get("auto_fixable"):
                    file_path = error.get("file")
                    if file_path:
                        # Show error in editor
                        await self.editor_controller.show_error(
                            file_path,
                            error.get("line", 1),
                            error["message"]
                        )
                        
                        # Fix error
                        async for fix_event in self.error_handler.fix_error(error):
                            await self.event_emitter.emit(fix_event["event"], fix_event["data"])
                            
                            # If fix was applied, show in editor
                            if fix_event["event"] == "error_fixed":
                                await self.editor_controller.highlight_code(
                                    file_path,
                                    error.get("line", 1),
                                    error.get("line", 1),
                                    "fixed"
                                )

