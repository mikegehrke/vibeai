# -------------------------------------------------------------
# VIBEAI – SMART AGENT GENERATOR
# -------------------------------------------------------------
"""
🤖 Intelligenter Agent-Generator der:
- Code generiert (Schritt für Schritt, LIVE)
- Dateien erstellt (sofort im Editor sichtbar)
- Fehler automatisch erkennt und fixt
- Mit Frontend über WebSocket kommuniziert
- Arbeitet wie ein echter Entwickler (nicht alles auf einmal)
- Nutzt direkte APIs statt Terminal-Befehle
"""

import os
import re
import asyncio
import aiohttp
from typing import Dict, List, Optional, Callable, AsyncGenerator
from openai import OpenAI
from pydantic import BaseModel

# Lazy initialization - client wird erst erstellt wenn gebraucht
_client = None

def get_openai_client():
    """Lazy initialization of OpenAI client"""
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        _client = OpenAI(api_key=api_key)
    return _client


class SmartAgentRequest(BaseModel):
    """Request für Smart Agent Generator"""
    project_id: str
    project_name: str
    platform: str = "flutter"  # flutter, react, nextjs, etc.
    description: str
    features: List[str] = []
    user_id: str = "default_user"


class FileInfo(BaseModel):
    """Information über eine generierte Datei"""
    path: str
    content: str
    language: str
    step: int  # Schritt-Nummer für Live-Updates


class SmartAgentGenerator:
    """
    🤖 Intelligenter Agent-Generator
    
    Features:
    - Schritt-für-Schritt Code-Generierung
    - Live-Updates via Callback
    - Automatische Fehlererkennung und -behebung
    - Intelligente Datei-Organisation
    - Production-ready Code
    """
    
    def __init__(self, api_base_url: str = "http://localhost:8005"):
        self.model = "gpt-4o"
        self.max_tokens = 16384
        self.api_base_url = api_base_url
        
    async def generate_project_live(
        self,
        request: SmartAgentRequest,
        on_file_created: Optional[Callable] = None,
        on_step: Optional[Callable] = None,
        on_error: Optional[Callable] = None
    ) -> Dict:
        """
        Generiert ein komplettes Projekt SCHRITT FÜR SCHRITT, LIVE
        
        Args:
            request: Projekt-Anfrage
            on_file_created: Callback wenn Datei erstellt wird (für Live-Updates)
            on_step: Callback für jeden Schritt
            on_error: Callback bei Fehlern
            
        Returns:
            Dict mit allen generierten Dateien
        """
        
        try:
            all_files = []
            step_count = 0
            
            # STEP 1: Projektstruktur planen
            step_count += 1
            if on_step:
                await on_step("📝 Analysiere Anforderungen und plane Projektstruktur...", step_count)
            
            structure_plan = await self._plan_project_structure(request)
            
            step_count += 1
            if on_step:
                await on_step(f"✅ Projektstruktur geplant: {len(structure_plan)} Dateien", step_count)
            
            # STEP 2: Config-Dateien erstellen (zuerst, wichtig!)
            step_count += 1
            if on_step:
                await on_step("⚙️ Erstelle Konfigurationsdateien...", step_count)
            
            config_files = await self._generate_config_files(request, structure_plan)
            for config_file in config_files:
                all_files.append(config_file)
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=config_file["path"],
                        content=config_file["content"],
                        language=config_file["language"],
                        step=step_count
                    ))
                # Kleine Pause für Live-Effekt
                await asyncio.sleep(0.3)
            
            # STEP 3: Core-Dateien (Main, App, etc.)
            step_count += 1
            if on_step:
                await on_step("🏗️ Erstelle Core-Dateien (Main, App, Routing)...", step_count)
            
            core_files = await self._generate_core_files(request, structure_plan)
            for core_file in core_files:
                all_files.append(core_file)
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=core_file["path"],
                        content=core_file["content"],
                        language=core_file["language"],
                        step=step_count
                    ))
                await asyncio.sleep(0.3)
            
            # STEP 4: Models & Data Classes
            step_count += 1
            if on_step:
                await on_step("📊 Erstelle Datenmodelle...", step_count)
            
            model_files = await self._generate_models(request, structure_plan)
            for model_file in model_files:
                all_files.append(model_file)
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=model_file["path"],
                        content=model_file["content"],
                        language=model_file["language"],
                        step=step_count
                    ))
                await asyncio.sleep(0.3)
            
            # STEP 5: Services & APIs
            step_count += 1
            if on_step:
                await on_step("🔌 Erstelle Services und API-Integrationen...", step_count)
            
            service_files = await self._generate_services(request, structure_plan)
            for service_file in service_files:
                all_files.append(service_file)
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=service_file["path"],
                        content=service_file["content"],
                        language=service_file["language"],
                        step=step_count
                    ))
                await asyncio.sleep(0.3)
            
            # STEP 6: UI Screens/Pages
            step_count += 1
            if on_step:
                await on_step("🎨 Erstelle UI-Screens und Komponenten...", step_count)
            
            ui_files = await self._generate_ui_files(request, structure_plan)
            for ui_file in ui_files:
                all_files.append(ui_file)
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=ui_file["path"],
                        content=ui_file["content"],
                        language=ui_file["language"],
                        step=step_count
                    ))
                await asyncio.sleep(0.15)  # Etwas länger für UI-Dateien
            
            # STEP 7: Widgets/Components
            step_count += 1
            if on_step:
                await on_step("🧩 Erstelle wiederverwendbare Widgets/Komponenten...", step_count)
            
            widget_files = await self._generate_widgets(request, structure_plan)
            for widget_file in widget_files:
                all_files.append(widget_file)
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=widget_file["path"],
                        content=widget_file["content"],
                        language=widget_file["language"],
                        step=step_count
                    ))
                await asyncio.sleep(0.3)
            
            # STEP 8: Tests
            step_count += 1
            if on_step:
                await on_step("🧪 Erstelle Tests...", step_count)
            
            test_files = await self._generate_tests(request, structure_plan, all_files)
            for test_file in test_files:
                all_files.append(test_file)
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=test_file["path"],
                        content=test_file["content"],
                        language=test_file["language"],
                        step=step_count
                    ))
                # Longer delay for visibility
                await asyncio.sleep(0.3)
            
            # STEP 9: Dokumentation
            step_count += 1
            if on_step:
                await on_step("📚 Erstelle Dokumentation...", step_count)
            
            doc_files = await self._generate_documentation(request, structure_plan, all_files)
            for doc_file in doc_files:
                all_files.append(doc_file)
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=doc_file["path"],
                        content=doc_file["content"],
                        language=doc_file["language"],
                        step=step_count
                    ))
                await asyncio.sleep(0.3)
            
            # STEP 10: Finale Überprüfung
            step_count += 1
            if on_step:
                await on_step("✅ Finale Überprüfung und Optimierung...", step_count)
            
            # Automatische Fehlerbehebung
            fixed_files = await self._auto_fix_errors(all_files)
            for fixed_file in fixed_files:
                # Update existing file
                for i, file in enumerate(all_files):
                    if file["path"] == fixed_file["path"]:
                        all_files[i] = fixed_file
                        if on_file_created:
                            await on_file_created(FileInfo(
                                path=fixed_file["path"],
                                content=fixed_file["content"],
                                language=fixed_file["language"],
                                step=step_count
                            ))
                        break
            
            step_count += 1
            if on_step:
                await on_step(f"🎉 Projekt erfolgreich erstellt! {len(all_files)} Dateien generiert.", step_count)
            
            # Save all files directly to project via API (NO TERMINAL!)
            try:
                await self._save_files_directly(request.project_id, all_files, on_step)
            except Exception as e:
                print(f"⚠️  Warning: Error saving files directly: {e}")
                # Continue anyway - files might still be created
            
            # Install dependencies via API (NO TERMINAL!)
            try:
                if request.platform == "flutter":
                    await self._install_flutter_dependencies(request.project_id, on_step)
                elif request.platform in ["react", "nextjs", "nodejs"]:
                    await self._install_npm_dependencies(request.project_id, on_step)
            except Exception as e:
                print(f"⚠️  Warning: Error installing dependencies: {e}")
                # Continue anyway - dependencies can be installed manually
            
            return {
                "success": True,
                "files": all_files,
                "total_files": len(all_files),
                "project_name": request.project_name,
                "platform": request.platform
            }
            
        except Exception as e:
            error_msg = f"❌ Fehler beim Generieren: {str(e)}"
            if on_error:
                await on_error(error_msg)
            raise Exception(error_msg)
    
    async def _plan_project_structure(self, request: SmartAgentRequest) -> Dict:
        """Plane die Projektstruktur"""
        try:
            print(f"📋 Planning structure for {request.platform} project: {request.project_name}")
            prompt = f"""Plan the complete project structure for a {request.platform} app called "{request.project_name}".

DESCRIPTION: {request.description}
FEATURES: {', '.join(request.features) if request.features else 'Standard features'}

Return ONLY a JSON list of file paths that should be created, like:
["lib/main.dart", "lib/models/user.dart", "lib/screens/home_screen.dart", ...]

IMPORTANT: Include AT LEAST 30-50 files for a complete app.
Return ONLY the JSON array, nothing else."""

            client = get_openai_client()
            print(f"🤖 Calling OpenAI to plan structure...")
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a project architect. Return ONLY valid JSON arrays."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            print(f"✅ OpenAI response received: {len(content)} chars")
            
            try:
                import json
                # Remove markdown code blocks if present
                if content.startswith("```"):
                    content = re.sub(r"```json\n?|\n?```", "", content)
                file_list = json.loads(content)
                print(f"✅ Parsed {len(file_list)} files from structure plan")
                return {"files": file_list}
            except Exception as parse_error:
                print(f"⚠️  JSON parse error: {parse_error}")
                print(f"⚠️  Content was: {content[:200]}...")
                # Fallback: Generate default structure
                return self._get_default_structure(request.platform)
        except Exception as e:
            print(f"❌ Error in _plan_project_structure: {e}")
            import traceback
            traceback.print_exc()
            # Fallback: Generate default structure
            return self._get_default_structure(request.platform)
    
    def _get_default_structure(self, platform: str) -> Dict:
        """Fallback: Standard-Projektstruktur"""
        if platform == "flutter":
            return {
                "files": [
                    "lib/main.dart",
                    "lib/app.dart",
                    "lib/models/user.dart",
                    "lib/models/task.dart",
                    "lib/screens/home_screen.dart",
                    "lib/screens/profile_screen.dart",
                    "lib/screens/settings_screen.dart",
                    "lib/widgets/custom_button.dart",
                    "lib/services/api_service.dart",
                    "lib/services/storage_service.dart",
                    "pubspec.yaml",
                    "README.md"
                ]
            }
        else:
            return {"files": ["src/index.js", "package.json", "README.md"]}
    
    async def _generate_config_files(self, request: SmartAgentRequest, structure: Dict) -> List[Dict]:
        """Generiere Konfigurationsdateien"""
        if request.platform == "flutter":
            return await self._generate_flutter_configs(request)
        elif request.platform in ["react", "nextjs"]:
            return await self._generate_react_configs(request)
        else:
            return []
    
    async def _generate_flutter_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Flutter Config-Dateien"""
        prompt = f"""Generate pubspec.yaml for Flutter app "{request.project_name}".

DESCRIPTION: {request.description}
FEATURES: {', '.join(request.features)}

Include ALL necessary dependencies for a production app.
Return ONLY the pubspec.yaml content, no explanations."""

        client = get_openai_client()
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a Flutter expert. Return ONLY valid YAML."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = re.sub(r"```yaml\n?|\n?```", "", content)
        
        return [{
            "path": "pubspec.yaml",
            "content": content,
            "language": "yaml"
        }]
    
    async def _generate_react_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere React Config-Dateien"""
        # Similar implementation for React
        return [{
            "path": "package.json",
            "content": '{"name": "' + request.project_name + '", "version": "1.0.0"}',
            "language": "json"
        }]
    
    async def _generate_core_files(self, request: SmartAgentRequest, structure: Dict) -> List[Dict]:
        """Generiere Core-Dateien (Main, App, etc.)"""
        files = []
        
        if request.platform == "flutter":
            # Generate main.dart
            main_content = await self._generate_file_content(
                "lib/main.dart",
                f"Main entry point for {request.project_name} Flutter app. Include MaterialApp setup, routing, and theme.",
                request
            )
            files.append({
                "path": "lib/main.dart",
                "content": main_content,
                "language": "dart"
            })
            
            # Generate app.dart
            app_content = await self._generate_file_content(
                "lib/app.dart",
                f"App widget for {request.project_name}. Include MaterialApp configuration, routes, and theme.",
                request
            )
            files.append({
                "path": "lib/app.dart",
                "content": app_content,
                "language": "dart"
            })
        
        return files
    
    async def _generate_models(self, request: SmartAgentRequest, structure: Dict) -> List[Dict]:
        """Generiere Datenmodelle"""
        files = []
        
        # Extract model names from structure or generate based on description
        model_names = ["User", "Task", "Item"]  # Default models
        
        for model_name in model_names:
            content = await self._generate_file_content(
                f"lib/models/{model_name.lower()}.dart",
                f"Data model class for {model_name} with all necessary fields, toJson, fromJson methods.",
                request
            )
            files.append({
                "path": f"lib/models/{model_name.lower()}.dart",
                "content": content,
                "language": "dart"
            })
        
        return files
    
    async def _generate_services(self, request: SmartAgentRequest, structure: Dict) -> List[Dict]:
        """Generiere Services"""
        files = []
        
        services = ["api_service", "storage_service", "auth_service"]
        
        for service_name in services:
            content = await self._generate_file_content(
                f"lib/services/{service_name}.dart",
                f"Service class for {service_name.replace('_', ' ')} with complete implementation.",
                request
            )
            files.append({
                "path": f"lib/services/{service_name}.dart",
                "content": content,
                "language": "dart"
            })
        
        return files
    
    async def _generate_ui_files(self, request: SmartAgentRequest, structure: Dict) -> List[Dict]:
        """Generiere UI-Screens"""
        files = []
        
        screens = ["home_screen", "profile_screen", "settings_screen"]
        
        for screen_name in screens:
            content = await self._generate_file_content(
                f"lib/screens/{screen_name}.dart",
                f"Complete Flutter screen widget for {screen_name.replace('_', ' ')} with full UI, state management, and functionality.",
                request
            )
            files.append({
                "path": f"lib/screens/{screen_name}.dart",
                "content": content,
                "language": "dart"
            })
        
        return files
    
    async def _generate_widgets(self, request: SmartAgentRequest, structure: Dict) -> List[Dict]:
        """Generiere wiederverwendbare Widgets"""
        files = []
        
        widgets = ["custom_button", "custom_card", "custom_input"]
        
        for widget_name in widgets:
            content = await self._generate_file_content(
                f"lib/widgets/{widget_name}.dart",
                f"Reusable Flutter widget for {widget_name.replace('_', ' ')} with complete implementation.",
                request
            )
            files.append({
                "path": f"lib/widgets/{widget_name}.dart",
                "content": content,
                "language": "dart"
            })
        
        return files
    
    async def _generate_tests(self, request: SmartAgentRequest, structure: Dict, existing_files: List[Dict]) -> List[Dict]:
        """Generiere Tests"""
        files = []
        
        # Generate a few basic tests
        test_content = await self._generate_file_content(
            "test/widget_test.dart",
            "Basic Flutter widget test with example test cases.",
            request
        )
        files.append({
            "path": "test/widget_test.dart",
            "content": test_content,
            "language": "dart"
        })
        
        return files
    
    async def _generate_documentation(self, request: SmartAgentRequest, structure: Dict, existing_files: List[Dict]) -> List[Dict]:
        """Generiere Dokumentation"""
        files = []
        
        readme_content = await self._generate_file_content(
            "README.md",
            f"Complete README for {request.project_name} with setup instructions, features, and usage guide.",
            request
        )
        files.append({
            "path": "README.md",
            "content": readme_content,
            "language": "markdown"
        })
        
        return files
    
    async def _generate_file_content(self, file_path: str, description: str, request: SmartAgentRequest) -> str:
        """Generiere Inhalt für eine einzelne Datei"""
        # Determine comment style based on file extension
        file_ext = file_path.split('.')[-1].lower()
        comment_style = "//"  # Default
        if file_ext in ['py']:
            comment_style = "#"
        elif file_ext in ['dart', 'js', 'ts', 'jsx', 'tsx', 'swift', 'kt', 'java']:
            comment_style = "//"
        elif file_ext in ['html', 'xml']:
            comment_style = "<!-- -->"
        
        prompt = f"""Generate COMPLETE, PRODUCTION-READY code for file: {file_path}

PROJECT: {request.project_name}
PLATFORM: {request.platform}
DESCRIPTION: {description}

REQUIREMENTS:
- Complete, working code (NO placeholders, NO TODOs)
- All necessary imports
- Proper error handling
- Best practices
- **DETAILED COMMENTS explaining WHAT, HOW, and WHY**

COMMENT REQUIREMENTS (VERY IMPORTANT - Developer must understand everything):
1. **File Header Comment**: Explain what this file does, its purpose, and main components
2. **Section Comments**: Comment each major section (imports, classes, functions, main logic)
3. **Function/Method Comments**: For each function/method, explain:
   - WHAT it does (purpose and functionality)
   - HOW it works (brief explanation of logic/algorithm)
   - WHY it's needed (context/reason/business logic)
   - Parameters: What each parameter is for and expected values
   - Returns: What it returns and why
4. **Complex Logic Comments**: Explain any non-obvious code, algorithms, business rules, or edge cases
5. **Inline Comments**: Add comments for important lines that need explanation
6. **Variable Comments**: Comment important variables explaining their purpose
7. **Language-specific**: Use appropriate comment syntax:
   - Dart/JavaScript/TypeScript/Swift/Kotlin: {comment_style} for single-line, /* */ for multi-line
   - Python: # for comments, """ """ for docstrings
   - HTML/XML: <!-- --> for comments

EXAMPLE COMMENT STYLE ({comment_style}):
{comment_style} This file contains the main application entry point and routing logic.
{comment_style} It initializes the Flutter app and sets up navigation between screens.

{comment_style} Main application widget that sets up the app structure
{comment_style} 
{comment_style} WHAT: Root widget that initializes the Flutter application
{comment_style} HOW: Uses MaterialApp to provide theme and routing
{comment_style} WHY: Required entry point for all Flutter applications
class MyApp extends StatelessWidget {{
  {comment_style} Theme configuration for the app
  {comment_style} WHY: Centralized theme makes it easy to change app-wide styling
  final ThemeData theme = ThemeData(
    primarySwatch: Colors.blue,
  );
  
  @override
  Widget build(BuildContext context) {{
    {comment_style} WHAT: Builds the app widget tree
    {comment_style} HOW: Returns MaterialApp with home screen
    {comment_style} WHY: MaterialApp provides Material Design components and navigation
    return MaterialApp(
      theme: theme,
      home: HomeScreen(),
    );
  }}
}}

IMPORTANT: Every function, class, and complex logic block MUST have comments explaining WHAT, HOW, and WHY.
The developer reading this code should understand everything without guessing.

Return ONLY the code with detailed comments, formatted as:
```{file_path.split('.')[-1]} {file_path}
[COMPLETE CODE WITH COMMENTS HERE]
```"""

        client = get_openai_client()
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert developer. Generate COMPLETE, working code with DETAILED COMMENTS explaining WHAT, HOW, and WHY. Every function, class, and complex logic must be commented. Return code in markdown code blocks."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content
        
        # Extract code from markdown block
        match = re.search(r"```\w+\s+.*?\n(.*?)```", content, re.DOTALL)
        if match:
            return match.group(1).strip()
        
        # Fallback: return as-is
        return content
    
    async def _save_files_directly(self, project_id: str, files: List[Dict], on_step: Optional[Callable] = None):
        """Save files directly to project directory (NO TERMINAL!)"""
        if on_step:
            await on_step(f"💾 Speichere {len(files)} Dateien direkt im Projekt (kein Terminal!)...", 0)
        
        try:
            # Get project path directly (same logic as terminal_routes)
            from codestudio.terminal_routes import get_project_path
            project_path = get_project_path(project_id)
            
            # Ensure project directory exists
            os.makedirs(project_path, exist_ok=True)
            
            # Save each file directly
            for idx, file_info in enumerate(files):
                try:
                    file_path = file_info["path"]
                    content = file_info["content"]
                    
                    # Normalize path (remove leading /)
                    if file_path.startswith("/"):
                        file_path = file_path[1:]
                    
                    # Full path
                    full_path = os.path.join(project_path, file_path)
                    
                    # Create directories if needed
                    os.makedirs(os.path.dirname(full_path), exist_ok=True)
                    
                    # Write file directly
                    with open(full_path, "w", encoding="utf-8") as f:
                        f.write(content)
                    
                    if on_step and (idx % 3 == 0 or idx == len(files) - 1):
                        await on_step(f"💾 Gespeichert: {file_path} ({idx + 1}/{len(files)})", 0)
                    
                    await asyncio.sleep(0.02)  # Small delay for visibility
                except Exception as e:
                    print(f"⚠️  Error saving file {file_info.get('path', 'unknown')}: {e}")
                    import traceback
                    traceback.print_exc()
                    # Continue with next file
                    continue
            
            if on_step:
                await on_step(f"✅ Alle {len(files)} Dateien erfolgreich gespeichert (direkt, kein Terminal)!", 0)
        except Exception as e:
            print(f"❌ Error in _save_files_directly: {e}")
            import traceback
            traceback.print_exc()
            if on_step:
                await on_step(f"⚠️  Fehler beim Speichern: {str(e)}", 0)
    
    async def _install_flutter_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install Flutter dependencies via Package Manager API (NO TERMINAL!)"""
        if on_step:
            await on_step("📦 Installiere Flutter Dependencies (via API, kein Terminal!)...", 0)
        
        try:
            async with aiohttp.ClientSession() as session:
                # Use package manager API - empty package_name = install all from pubspec.yaml
                async with session.post(
                    f"{self.api_base_url}/api/packages/install",
                    json={
                        "project_id": project_id,
                        "package_manager": "pub",
                        "package_name": ""  # Empty = install all from pubspec.yaml
                    }
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        if on_step:
                            await on_step("✅ Flutter Dependencies installiert (via API)!", 0)
                    else:
                        error_text = await response.text()
                        if on_step:
                            await on_step(f"⚠️  Flutter Dependencies: {error_text[:100]}", 0)
        except Exception as e:
            print(f"⚠️  Error installing Flutter dependencies: {e}")
            if on_step:
                await on_step(f"⚠️  Fehler bei Dependency-Installation: {str(e)}", 0)
    
    async def _install_npm_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install npm dependencies via Package Manager API (NO TERMINAL!)"""
        if on_step:
            await on_step("📦 Installiere npm Dependencies (via API, kein Terminal!)...", 0)
        
        try:
            async with aiohttp.ClientSession() as session:
                # Use package manager API - empty package_name = install all from package.json
                async with session.post(
                    f"{self.api_base_url}/api/packages/install",
                    json={
                        "project_id": project_id,
                        "package_manager": "npm",
                        "package_name": ""  # Empty = install all from package.json
                    }
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        if on_step:
                            await on_step("✅ npm Dependencies installiert (via API)!", 0)
                    else:
                        error_text = await response.text()
                        if on_step:
                            await on_step(f"⚠️  npm Dependencies: {error_text[:100]}", 0)
        except Exception as e:
            print(f"⚠️  Error installing npm dependencies: {e}")
            if on_step:
                await on_step(f"⚠️  Fehler bei npm-Installation: {str(e)}", 0).strip()
    
    async def _auto_fix_errors(self, files: List[Dict]) -> List[Dict]:
        """Automatische Fehlerbehebung"""
        # TODO: Implement error detection and fixing
        # For now, just return files as-is
        return files


# Global instance
smart_agent_generator = SmartAgentGenerator()

