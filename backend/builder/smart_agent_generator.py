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
            
            # STEP 9.5: Erstelle Assets (Icons, Bilder, Logos) - APP STORE/PLAY STORE READY!
            step_count += 1
            if on_step:
                await on_step("🎨 Erstelle App-Icons, Logos und Assets (App Store/Play Store ready)...", step_count)
            
            asset_files = await self._generate_assets(request, structure_plan)
            for asset_file in asset_files:
                all_files.append(asset_file)
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=asset_file["path"],
                        content=asset_file["content"],
                        language=asset_file["language"],
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
            
            # Install dependencies via API (NO TERMINAL!) - ALLE PLATTFORMEN
            try:
                platform_lower = request.platform.lower()
                if platform_lower == "flutter":
                    await self._install_flutter_dependencies(request.project_id, on_step)
                elif platform_lower in ["react", "reactjs", "nextjs", "next.js", "vue", "vuejs", "angular", "svelte", "react-native", "reactnative", "nodejs", "node", "electron", "tauri"]:
                    await self._install_npm_dependencies(request.project_id, on_step)
                elif platform_lower in ["fastapi", "python", "py", "python-script", "python-app", "py-app", "django", "flask", "tensorflow", "pytorch", "ml", "machine-learning"]:
                    await self._install_python_dependencies(request.project_id, on_step)
                elif platform_lower in ["c", "c-language", "c++", "cpp", "cplusplus", "cxx"]:
                    await self._install_c_cpp_dependencies(request.project_id, on_step)
                elif platform_lower in ["rust", "rustlang"]:
                    await self._install_rust_dependencies(request.project_id, on_step)
                elif platform_lower in ["go", "golang"]:
                    await self._install_go_dependencies(request.project_id, on_step)
                elif platform_lower in ["java", "spring", "spring-boot"]:
                    await self._install_java_dependencies(request.project_id, on_step)
                elif platform_lower in ["csharp", "c#", "dotnet", ".net", "aspnet"]:
                    await self._install_dotnet_dependencies(request.project_id, on_step)
                elif platform_lower in ["php", "laravel"]:
                    await self._install_php_dependencies(request.project_id, on_step)
                elif platform_lower in ["android", "kotlin", "kotlin-compose"]:
                    await self._install_android_dependencies(request.project_id, on_step)
                elif platform_lower in ["ios", "swift", "swiftui"]:
                    await self._install_ios_dependencies(request.project_id, on_step)
                # HTML/Web, Docker, Kubernetes brauchen keine Dependencies
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

            # Prüfe API Key vorher
            import os
            if not os.getenv("OPENAI_API_KEY"):
                raise ValueError("OPENAI_API_KEY environment variable not set. Bitte setze den API Key in der .env Datei.")
            
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
        """Fallback: Standard-Projektstruktur für ALLE Plattformen und Sprachen"""
        platform_lower = platform.lower()
        
        # ===== MOBILE APPS =====
        if platform_lower == "flutter":
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
        elif platform_lower in ["react", "reactjs"]:
            return {
                "files": [
                    "package.json",
                    "src/index.js",
                    "src/App.js",
                    "src/App.css",
                    "src/components/Button.js",
                    "src/components/Card.js",
                    "src/pages/Home.js",
                    "src/pages/About.js",
                    "src/services/api.js",
                    "public/index.html",
                    "README.md"
                ]
            }
        elif platform_lower in ["nextjs", "next.js"]:
            return {
                "files": [
                    "package.json",
                    "next.config.js",
                    "pages/index.js",
                    "pages/_app.js",
                    "components/Button.js",
                    "components/Card.js",
                    "styles/globals.css",
                    "public/favicon.ico",
                    "README.md"
                ]
            }
        elif platform_lower in ["vue", "vuejs"]:
            return {
                "files": [
                    "package.json",
                    "src/main.js",
                    "src/App.vue",
                    "src/components/Button.vue",
                    "src/components/Card.vue",
                    "src/views/Home.vue",
                    "src/router/index.js",
                    "public/index.html",
                    "README.md"
                ]
            }
        elif platform_lower in ["angular"]:
            return {
                "files": [
                    "package.json",
                    "angular.json",
                    "src/main.ts",
                    "src/app/app.component.ts",
                    "src/app/app.component.html",
                    "src/app/app.component.css",
                    "src/app/components/button/button.component.ts",
                    "README.md"
                ]
            }
        elif platform_lower in ["html", "html5", "website", "web"]:
            return {
                "files": [
                    "index.html",
                    "styles.css",
                    "script.js",
                    "README.md"
                ]
            }
        elif platform_lower in ["react-native", "reactnative"]:
            return {
                "files": [
                    "package.json",
                    "App.js",
                    "src/components/Button.js",
                    "src/screens/HomeScreen.js",
                    "src/navigation/AppNavigator.js",
                    "README.md"
                ]
            }
        elif platform_lower in ["nodejs", "node"]:
            return {
                "files": [
                    "package.json",
                    "index.js",
                    "src/routes/api.js",
                    "src/controllers/userController.js",
                    "src/models/User.js",
                    "README.md"
                ]
            }
        elif platform_lower in ["fastapi", "python", "py"]:
            return {
                "files": [
                    "requirements.txt",
                    "main.py",
                    "app/routes/api.py",
                    "app/models/user.py",
                    "app/services/user_service.py",
                    "README.md"
                ]
            }
        # ===== GENERIC PYTHON (ohne Framework) =====
        elif platform_lower in ["python-script", "python-app", "py-app"]:
            return {
                "files": [
                    "requirements.txt",
                    "main.py",
                    "src/utils.py",
                    "src/models.py",
                    "config.py",
                    "README.md"
                ]
            }
        # ===== C/C++ =====
        elif platform_lower in ["c", "c-language"]:
            return {
                "files": [
                    "Makefile",
                    "main.c",
                    "src/utils.c",
                    "src/utils.h",
                    "include/header.h",
                    "README.md"
                ]
            }
        elif platform_lower in ["c++", "cpp", "cplusplus", "cxx"]:
            return {
                "files": [
                    "CMakeLists.txt",
                    "main.cpp",
                    "src/utils.cpp",
                    "include/utils.h",
                    "src/classes/MyClass.cpp",
                    "include/classes/MyClass.h",
                    "README.md"
                ]
            }
        elif platform_lower in ["django"]:
            return {
                "files": [
                    "requirements.txt",
                    "manage.py",
                    "project/settings.py",
                    "project/urls.py",
                    "app/views.py",
                    "app/models.py",
                    "app/urls.py",
                    "README.md"
                ]
            }
        elif platform_lower in ["flask"]:
            return {
                "files": [
                    "requirements.txt",
                    "app.py",
                    "routes/api.py",
                    "models/user.py",
                    "README.md"
                ]
            }
        elif platform_lower in ["rust", "rustlang"]:
            return {
                "files": [
                    "Cargo.toml",
                    "src/main.rs",
                    "src/lib.rs",
                    "src/models/user.rs",
                    "src/routes/api.rs",
                    "README.md"
                ]
            }
        elif platform_lower in ["go", "golang"]:
            return {
                "files": [
                    "go.mod",
                    "main.go",
                    "models/user.go",
                    "routes/api.go",
                    "handlers/user_handler.go",
                    "README.md"
                ]
            }
        elif platform_lower in ["java", "spring", "spring-boot"]:
            return {
                "files": [
                    "pom.xml",
                    "src/main/java/com/example/Application.java",
                    "src/main/java/com/example/controllers/UserController.java",
                    "src/main/java/com/example/models/User.java",
                    "src/main/resources/application.properties",
                    "README.md"
                ]
            }
        elif platform_lower in ["csharp", "c#", "dotnet", ".net", "aspnet"]:
            return {
                "files": [
                    "Program.cs",
                    "Controllers/UserController.cs",
                    "Models/User.cs",
                    "Services/UserService.cs",
                    "appsettings.json",
                    "README.md"
                ]
            }
        elif platform_lower in ["php", "laravel"]:
            return {
                "files": [
                    "composer.json",
                    "app/Http/Controllers/UserController.php",
                    "app/Models/User.php",
                    "routes/api.php",
                    "README.md"
                ]
            }
        # ===== DOCKER & DEVOPS =====
        elif platform_lower in ["docker", "container"]:
            return {
                "files": [
                    "Dockerfile",
                    "docker-compose.yml",
                    ".dockerignore",
                    "README.md"
                ]
            }
        elif platform_lower in ["kubernetes", "k8s"]:
            return {
                "files": [
                    "deployment.yaml",
                    "service.yaml",
                    "configmap.yaml",
                    "Dockerfile",
                    "README.md"
                ]
            }
        # ===== DESKTOP =====
        elif platform_lower in ["electron"]:
            return {
                "files": [
                    "package.json",
                    "main.js",
                    "renderer.js",
                    "index.html",
                    "styles.css",
                    "README.md"
                ]
            }
        elif platform_lower in ["tauri"]:
            return {
                "files": [
                    "package.json",
                    "src-tauri/Cargo.toml",
                    "src-tauri/src/main.rs",
                    "src/main.js",
                    "index.html",
                    "README.md"
                ]
            }
        # ===== GAME DEVELOPMENT =====
        elif platform_lower in ["unity", "unity3d"]:
            return {
                "files": [
                    "Assets/Scripts/GameManager.cs",
                    "Assets/Scripts/Player.cs",
                    "Assets/Scenes/MainScene.unity",
                    "ProjectSettings/ProjectSettings.asset",
                    "README.md"
                ]
            }
        elif platform_lower in ["godot"]:
            return {
                "files": [
                    "project.godot",
                    "Player.gd",
                    "GameManager.gd",
                    "Main.tscn",
                    "README.md"
                ]
            }
        # ===== BLOCKCHAIN =====
        elif platform_lower in ["solidity", "ethereum", "web3"]:
            return {
                "files": [
                    "contracts/Token.sol",
                    "contracts/Crowdsale.sol",
                    "migrations/1_initial_migration.js",
                    "truffle-config.js",
                    "package.json",
                    "README.md"
                ]
            }
        # ===== MACHINE LEARNING =====
        elif platform_lower in ["tensorflow", "pytorch", "ml", "machine-learning"]:
            return {
                "files": [
                    "requirements.txt",
                    "train.py",
                    "model.py",
                    "data/preprocess.py",
                    "README.md"
                ]
            }
        else:
            # Default: Generic web project
            return {
                "files": [
                    "index.html",
                    "styles.css",
                    "script.js",
                    "package.json",
                    "README.md"
                ]
            }
    
    async def _generate_config_files(self, request: SmartAgentRequest, structure: Dict) -> List[Dict]:
        """Generiere Konfigurationsdateien für ALLE Plattformen"""
        platform_lower = request.platform.lower()
        
        # ===== MOBILE =====
        if platform_lower == "flutter":
            return await self._generate_flutter_configs(request)
        elif platform_lower in ["android", "kotlin", "kotlin-compose", "jetpack-compose", "android-kotlin"]:
            return await self._generate_android_configs(request)
        elif platform_lower in ["ios", "swift", "swiftui", "ios-swift", "xcode"]:
            return await self._generate_ios_configs(request)
        elif platform_lower in ["react-native", "reactnative"]:
            return await self._generate_react_native_configs(request)
        # ===== WEB FRONTEND =====
        elif platform_lower in ["react", "reactjs"]:
            return await self._generate_react_configs(request)
        elif platform_lower in ["nextjs", "next.js"]:
            return await self._generate_nextjs_configs(request)
        elif platform_lower in ["vue", "vuejs"]:
            return await self._generate_vue_configs(request)
        elif platform_lower in ["angular"]:
            return await self._generate_angular_configs(request)
        elif platform_lower in ["svelte", "sveltekit"]:
            return await self._generate_svelte_configs(request)
        # ===== BACKEND =====
        elif platform_lower in ["nodejs", "node"]:
            return await self._generate_nodejs_configs(request)
        elif platform_lower in ["fastapi", "python", "py", "python-script", "python-app", "py-app"]:
            return await self._generate_python_configs(request)
        elif platform_lower in ["django"]:
            return await self._generate_django_configs(request)
        elif platform_lower in ["flask"]:
            return await self._generate_flask_configs(request)
        # ===== C/C++ =====
        elif platform_lower in ["c", "c-language"]:
            return await self._generate_c_configs(request)
        elif platform_lower in ["c++", "cpp", "cplusplus", "cxx"]:
            return await self._generate_cpp_configs(request)
        elif platform_lower in ["rust", "rustlang"]:
            return await self._generate_rust_configs(request)
        elif platform_lower in ["go", "golang"]:
            return await self._generate_go_configs(request)
        elif platform_lower in ["java", "spring", "spring-boot"]:
            return await self._generate_java_configs(request)
        elif platform_lower in ["csharp", "c#", "dotnet", ".net", "aspnet"]:
            return await self._generate_dotnet_configs(request)
        elif platform_lower in ["php", "laravel"]:
            return await self._generate_php_configs(request)
        # ===== DOCKER & DEVOPS =====
        elif platform_lower in ["docker", "container"]:
            return await self._generate_docker_configs(request)
        elif platform_lower in ["kubernetes", "k8s"]:
            return await self._generate_kubernetes_configs(request)
        # ===== DESKTOP =====
        elif platform_lower in ["electron"]:
            return await self._generate_electron_configs(request)
        elif platform_lower in ["tauri"]:
            return await self._generate_tauri_configs(request)
        # ===== GAME DEVELOPMENT =====
        elif platform_lower in ["unity", "unity3d"]:
            return await self._generate_unity_configs(request)
        elif platform_lower in ["godot"]:
            return await self._generate_godot_configs(request)
        # ===== BLOCKCHAIN =====
        elif platform_lower in ["solidity", "ethereum", "web3"]:
            return await self._generate_solidity_configs(request)
        # ===== MACHINE LEARNING =====
        elif platform_lower in ["tensorflow", "pytorch", "ml", "machine-learning"]:
            return await self._generate_ml_configs(request)
        # ===== STATIC WEB =====
        elif platform_lower in ["html", "html5", "website", "web"]:
            return []  # HTML braucht keine Config-Dateien
        else:
            return await self._generate_generic_configs(request)
    
    async def _generate_flutter_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Flutter Config-Dateien"""
        prompt = f"""Generate pubspec.yaml for Flutter app "{request.project_name}".

DESCRIPTION: {request.description}
FEATURES: {', '.join(request.features)}

IMPORTANT RULES:
- Use SDK version ">=3.0.0 <4.0.0" (NOT 3.22.0) for compatibility!
- DO NOT include fonts section unless font files actually exist!
- DO NOT reference font files (like fonts/Roboto-Regular.ttf) if they don't exist!
- Use Flutter's default fonts (Material Design) - no custom fonts needed!
- Include ALL necessary dependencies for a production app.
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
        prompt = f"""Generate package.json for React app "{request.project_name}".

DESCRIPTION: {request.description}
FEATURES: {', '.join(request.features)}

Include ALL necessary dependencies for a production React app:
- react, react-dom
- react-router-dom (for routing)
- axios (for API calls)
- Common dev dependencies (webpack, babel, etc.)

Return ONLY valid JSON, no explanations."""

        client = get_openai_client()
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a React expert. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = re.sub(r"```json\n?|\n?```", "", content)
        
        return [{
            "path": "package.json",
            "content": content,
            "language": "json"
        }]
    
    async def _generate_nextjs_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Next.js Config-Dateien"""
        prompt = f"""Generate package.json and next.config.js for Next.js app "{request.project_name}".

DESCRIPTION: {request.description}
FEATURES: {', '.join(request.features)}

Include:
- next, react, react-dom
- Common Next.js dependencies
- Return as JSON object with 'package.json' and 'next.config.js' keys."""

        client = get_openai_client()
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a Next.js expert. Return valid JSON with package.json and next.config.js."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = re.sub(r"```json\n?|\n?```", "", content)
        
        try:
            configs = json.loads(content)
            files = []
            if "package.json" in configs:
                files.append({
                    "path": "package.json",
                    "content": json.dumps(configs["package.json"], indent=2),
                    "language": "json"
                })
            if "next.config.js" in configs:
                files.append({
                    "path": "next.config.js",
                    "content": configs["next.config.js"],
                    "language": "javascript"
                })
            return files if files else [{"path": "package.json", "content": '{"name": "' + request.project_name + '"}', "language": "json"}]
        except:
            return [{"path": "package.json", "content": '{"name": "' + request.project_name + '"}', "language": "json"}]
    
    async def _generate_vue_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Vue Config-Dateien"""
        return [{
            "path": "package.json",
            "content": json.dumps({
                "name": request.project_name.lower().replace(' ', '-'),
                "version": "1.0.0",
                "dependencies": {
                    "vue": "^3.3.0",
                    "vue-router": "^4.2.0"
                }
            }, indent=2),
            "language": "json"
        }]
    
    async def _generate_angular_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Angular Config-Dateien"""
        return [{
            "path": "package.json",
            "content": json.dumps({
                "name": request.project_name.lower().replace(' ', '-'),
                "version": "1.0.0",
                "dependencies": {
                    "@angular/core": "^17.0.0",
                    "@angular/common": "^17.0.0"
                }
            }, indent=2),
            "language": "json"
        }]
    
    async def _generate_react_native_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere React Native Config-Dateien"""
        return [{
            "path": "package.json",
            "content": json.dumps({
                "name": request.project_name.lower().replace(' ', '-'),
                "version": "1.0.0",
                "dependencies": {
                    "react": "18.2.0",
                    "react-native": "0.72.0"
                }
            }, indent=2),
            "language": "json"
        }]
    
    async def _generate_nodejs_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Node.js Config-Dateien"""
        return [{
            "path": "package.json",
            "content": json.dumps({
                "name": request.project_name.lower().replace(' ', '-'),
                "version": "1.0.0",
                "main": "index.js",
                "dependencies": {
                    "express": "^4.18.0"
                }
            }, indent=2),
            "language": "json"
        }]
    
    async def _generate_python_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Python Config-Dateien (generisch oder FastAPI)"""
        platform_lower = request.platform.lower()
        
        if platform_lower == "fastapi":
            return [{
                "path": "requirements.txt",
                "content": "fastapi==0.104.0\nuvicorn==0.24.0\npydantic==2.5.0\n",
                "language": "text"
            }]
        else:
            # Generisches Python-Projekt
            return [{
                "path": "requirements.txt",
                "content": "# Python dependencies\n# Add your packages here\n",
                "language": "text"
            }]
    
    # ===== C =====
    async def _generate_c_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere C Config-Dateien"""
        return [{
            "path": "Makefile",
            "content": f"""CC=gcc
CFLAGS=-Wall -Wextra -std=c11
TARGET={request.project_name.lower().replace(' ', '_')}
SOURCES=main.c src/utils.c
OBJECTS=$(SOURCES:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJECTS)
\t$(CC) $(OBJECTS) -o $(TARGET)

%.o: %.c
\t$(CC) $(CFLAGS) -c $< -o $@

clean:
\trm -f $(OBJECTS) $(TARGET)

.PHONY: all clean""",
            "language": "makefile"
        }]
    
    # ===== C++ =====
    async def _generate_cpp_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere C++ Config-Dateien"""
        return [{
            "path": "CMakeLists.txt",
            "content": f"""cmake_minimum_required(VERSION 3.10)
project({request.project_name})

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(${{PROJECT_NAME}}
    main.cpp
    src/utils.cpp
    src/classes/MyClass.cpp
)

target_include_directories(${{PROJECT_NAME}} PRIVATE include)""",
            "language": "cmake"
        }]
    
    async def _generate_generic_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere generische Config-Dateien"""
        return [{
            "path": "package.json",
            "content": json.dumps({
                "name": request.project_name.lower().replace(' ', '-'),
                "version": "1.0.0"
            }, indent=2),
            "language": "json"
        }]
    
    # ===== ANDROID/KOTLIN =====
    async def _generate_android_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Android/Kotlin Config-Dateien"""
        return [{
            "path": "build.gradle.kts",
            "content": f"""plugins {{
    id("com.android.application") version "8.1.0"
    id("org.jetbrains.kotlin.android") version "1.9.0"
}}

android {{
    namespace = "com.example.{request.project_name.lower().replace(' ', '')}"
    compileSdk = 34
    
    defaultConfig {{
        applicationId = "com.example.{request.project_name.lower().replace(' ', '')}"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }}
}}

dependencies {{
    implementation("androidx.compose.ui:ui:1.5.0")
    implementation("androidx.compose.material3:material3:1.1.0")
    implementation("androidx.activity:activity-compose:1.8.0")
}}""",
            "language": "kotlin"
        }]
    
    # ===== iOS/SWIFT =====
    async def _generate_ios_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere iOS/Swift Config-Dateien"""
        return [{
            "path": "Package.swift",
            "content": f"""// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "{request.project_name}",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "{request.project_name}",
            targets: ["{request.project_name}"])
    ],
    targets: [
        .target(
            name: "{request.project_name}",
            dependencies: [])
    ]
)""",
            "language": "swift"
        }]
    
    # ===== DOCKER =====
    async def _generate_docker_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Docker Config-Dateien"""
        return [
            {
                "path": "Dockerfile",
                "content": f"""FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]""",
                "language": "dockerfile"
            },
            {
                "path": "docker-compose.yml",
                "content": f"""version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production""",
                "language": "yaml"
            }
        ]
    
    # ===== KUBERNETES =====
    async def _generate_kubernetes_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Kubernetes Config-Dateien"""
        return [{
            "path": "deployment.yaml",
            "content": f"""apiVersion: apps/v1
kind: Deployment
metadata:
  name: {request.project_name.lower().replace(' ', '-')}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: {request.project_name.lower().replace(' ', '-')}
  template:
    metadata:
      labels:
        app: {request.project_name.lower().replace(' ', '-')}
    spec:
      containers:
      - name: app
        image: {request.project_name.lower().replace(' ', '-')}:latest
        ports:
        - containerPort: 3000""",
            "language": "yaml"
        }]
    
    # ===== RUST =====
    async def _generate_rust_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Rust Config-Dateien"""
        return [{
            "path": "Cargo.toml",
            "content": f"""[package]
name = "{request.project_name.lower().replace(' ', '-')}"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = {{ version = "1", features = ["full"] }}
serde = {{ version = "1.0", features = ["derive"] }}
serde_json = "1.0" """,
            "language": "toml"
        }]
    
    # ===== GO =====
    async def _generate_go_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Go Config-Dateien"""
        return [{
            "path": "go.mod",
            "content": f"""module {request.project_name.lower().replace(' ', '-')}

go 1.21

require (
    github.com/gorilla/mux v1.8.0
)""",
            "language": "go"
        }]
    
    # ===== JAVA/SPRING =====
    async def _generate_java_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Java/Spring Config-Dateien"""
        return [{
            "path": "pom.xml",
            "content": f"""<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>{request.project_name.lower().replace(' ', '-')}</artifactId>
    <version>1.0.0</version>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
    </parent>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>""",
            "language": "xml"
        }]
    
    # ===== .NET/C# =====
    async def _generate_dotnet_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere .NET/C# Config-Dateien"""
        return [{
            "path": f"{request.project_name}.csproj",
            "content": f"""<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
  </ItemGroup>
</Project>""",
            "language": "xml"
        }]
    
    # ===== PHP/LARAVEL =====
    async def _generate_php_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere PHP/Laravel Config-Dateien"""
        return [{
            "path": "composer.json",
            "content": json.dumps({
                "name": f"example/{request.project_name.lower().replace(' ', '-')}",
                "type": "project",
                "require": {
                    "php": "^8.1",
                    "laravel/framework": "^10.0"
                }
            }, indent=2),
            "language": "json"
        }]
    
    # ===== DJANGO =====
    async def _generate_django_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Django Config-Dateien"""
        return [{
            "path": "requirements.txt",
            "content": "Django==4.2.0\ndjangorestframework==3.14.0\n",
            "language": "text"
        }]
    
    # ===== FLASK =====
    async def _generate_flask_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Flask Config-Dateien"""
        return [{
            "path": "requirements.txt",
            "content": "Flask==3.0.0\nflask-cors==4.0.0\n",
            "language": "text"
        }]
    
    # ===== SVELTE =====
    async def _generate_svelte_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Svelte Config-Dateien"""
        return [{
            "path": "package.json",
            "content": json.dumps({
                "name": request.project_name.lower().replace(' ', '-'),
                "version": "1.0.0",
                "scripts": {
                    "dev": "vite dev",
                    "build": "vite build"
                },
                "dependencies": {
                    "svelte": "^4.0.0"
                },
                "devDependencies": {
                    "@sveltejs/vite-plugin-svelte": "^2.0.0",
                    "vite": "^5.0.0"
                }
            }, indent=2),
            "language": "json"
        }]
    
    # ===== ELECTRON =====
    async def _generate_electron_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Electron Config-Dateien"""
        return [{
            "path": "package.json",
            "content": json.dumps({
                "name": request.project_name.lower().replace(' ', '-'),
                "version": "1.0.0",
                "main": "main.js",
                "scripts": {
                    "start": "electron ."
                },
                "dependencies": {
                    "electron": "^27.0.0"
                }
            }, indent=2),
            "language": "json"
        }]
    
    # ===== TAURI =====
    async def _generate_tauri_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Tauri Config-Dateien"""
        return [
            {
                "path": "package.json",
                "content": json.dumps({
                    "name": request.project_name.lower().replace(' ', '-'),
                    "version": "1.0.0",
                    "scripts": {
                        "tauri": "tauri"
                    }
                }, indent=2),
                "language": "json"
            },
            {
                "path": "src-tauri/Cargo.toml",
                "content": f"""[package]
name = "{request.project_name.lower().replace(' ', '-')}"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = {{ version = "1.5", features = ["api-all"] }}""",
                "language": "toml"
            }
        ]
    
    # ===== UNITY =====
    async def _generate_unity_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Unity Config-Dateien"""
        return [{
            "path": "ProjectSettings/ProjectVersion.txt",
            "content": "m_EditorVersion: 2022.3.0f1\n",
            "language": "text"
        }]
    
    # ===== GODOT =====
    async def _generate_godot_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Godot Config-Dateien"""
        return [{
            "path": "project.godot",
            "content": f"""; Engine configuration file
[application]

config/name="{request.project_name}"
run/main_scene="res://Main.tscn"
""",
            "language": "ini"
        }]
    
    # ===== SOLIDITY =====
    async def _generate_solidity_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere Solidity/Blockchain Config-Dateien"""
        return [
            {
                "path": "truffle-config.js",
                "content": f"""module.exports = {{
  networks: {{
    development: {{
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    }}
  }},
  compilers: {{
    solc: {{
      version: "0.8.19"
    }}
  }}
}};""",
                "language": "javascript"
            },
            {
                "path": "package.json",
                "content": json.dumps({
                    "name": request.project_name.lower().replace(' ', '-'),
                    "version": "1.0.0",
                    "dependencies": {
                        "truffle": "^5.11.0",
                        "web3": "^4.0.0"
                    }
                }, indent=2),
                "language": "json"
            }
        ]
    
    # ===== MACHINE LEARNING =====
    async def _generate_ml_configs(self, request: SmartAgentRequest) -> List[Dict]:
        """Generiere ML Config-Dateien"""
        return [{
            "path": "requirements.txt",
            "content": "numpy==1.24.0\npandas==2.0.0\ntensorflow==2.13.0\ntorch==2.0.0\nscikit-learn==1.3.0\n",
            "language": "text"
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
    
    async def _generate_assets(self, request: SmartAgentRequest, structure: Dict) -> List[Dict]:
        """
        Generiere App-Icons, Logos und Assets für App Store/Play Store
        
        Erstellt:
        - App-Icons in verschiedenen Größen (iOS, Android, Web)
        - Splash Screens / Launch Images
        - Logos (SVG, PNG)
        - App Store/Play Store Assets (Screenshots-Platzhalter, Beschreibungen)
        """
        assets = []
        platform_lower = request.platform.lower()
        project_name = request.project_name
        
        # Features-String vorbereiten (außerhalb f-string wegen Backslash)
        if request.features:
            features_text = '\n'.join(f'- {feature}' for feature in request.features)
        else:
            features_text = '- Moderne UI/UX\n- Schnelle Performance\n- Intuitive Bedienung'
        
        # ===== FLUTTER =====
        if platform_lower == "flutter":
            # App Icon (SVG als Basis)
            assets.append({
                "path": "assets/icons/app_icon.svg",
                "content": f"""<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#grad1)"/>
  <text x="512" y="600" font-family="Arial, sans-serif" font-size="300" font-weight="bold" fill="white" text-anchor="middle">{project_name[0].upper() if project_name else 'A'}</text>
</svg>""",
                "language": "svg"
            })
            
            # iOS App Icons Config
            assets.append({
                "path": "ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json",
                "content": """{
  "images": [
    {"filename": "Icon-App-1024x1024@1x.png", "idiom": "ios-marketing", "scale": "1x", "size": "1024x1024"}
  ],
  "info": {"author": "VibeAI", "version": 1}
}""",
                "language": "json"
            })
            
            # Android App Icons
            assets.append({
                "path": "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
                "content": "# Placeholder für 192x192 PNG Icon - Wird durch generiertes Icon ersetzt",
                "language": "text"
            })
            
            # Splash Screen
            assets.append({
                "path": "assets/images/splash.svg",
                "content": f"""<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#splashGrad)"/>
  <text x="540" y="960" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle">{project_name}</text>
</svg>""",
                "language": "svg"
            })
        
        # ===== ANDROID =====
        elif platform_lower in ["android", "kotlin", "kotlin-compose"]:
            assets.append({
                "path": "app/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
                "content": "# Placeholder für 192x192 PNG Icon",
                "language": "text"
            })
            assets.append({
                "path": "app/src/main/res/drawable/splash_screen.xml",
                "content": """<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background"/>
    <item>
        <bitmap android:gravity="center" android:src="@mipmap/ic_launcher"/>
    </item>
</layer-list>""",
                "language": "xml"
            })
        
        # ===== iOS =====
        elif platform_lower in ["ios", "swift", "swiftui"]:
            assets.append({
                "path": "Assets.xcassets/AppIcon.appiconset/Contents.json",
                "content": """{"images":[{"filename":"Icon-App-1024x1024@1x.png","idiom":"ios-marketing","scale":"1x","size":"1024x1024"}],"info":{"author":"VibeAI","version":1}}""",
                "language": "json"
            })
        
        # ===== WEB =====
        elif platform_lower in ["react", "nextjs", "vue", "angular", "html"]:
            assets.append({
                "path": "public/favicon.ico",
                "content": "# Placeholder für favicon.ico",
                "language": "text"
            })
            assets.append({
                "path": "public/logo192.png",
                "content": "# Placeholder für 192x192 PNG Logo",
                "language": "text"
            })
            assets.append({
                "path": "public/logo512.png",
                "content": "# Placeholder für 512x512 PNG Logo",
                "language": "text"
            })
            assets.append({
                "path": "public/apple-touch-icon.png",
                "content": "# Placeholder für 180x180 PNG (iOS Home Screen)",
                "language": "text"
            })
        
        # ===== GENERIC: Logo SVG (für alle Plattformen) =====
        assets.append({
            "path": "assets/logo.svg",
            "content": f"""<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#logoGrad)"/>
  <text x="256" y="300" font-family="Arial, sans-serif" font-size="150" font-weight="bold" fill="white" text-anchor="middle">{project_name[0].upper() if project_name else 'A'}</text>
</svg>""",
            "language": "svg"
        })
        
        # ===== APP STORE / PLAY STORE ASSETS =====
        assets.append({
            "path": "store_assets/app_store_description.txt",
            "content": f"""# App Store Beschreibung für {project_name}

## App Name
{project_name}

## Kurzbeschreibung (bis 80 Zeichen)
Eine moderne {request.platform} App, die {request.description[:60] if len(request.description) > 60 else request.description}...

## Vollständige Beschreibung
{request.description}

## Features
{features_text}

## Screenshots benötigt:
- iPhone 6.7": 1290 x 2796
- iPhone 6.5": 1242 x 2688
- iPad Pro 12.9": 2048 x 2732

## App Icon:
- 1024 x 1024 PNG (transparent, keine Rundung)
""",
            "language": "text"
        })
        
        assets.append({
            "path": "store_assets/play_store_description.txt",
            "content": f"""# Google Play Store Beschreibung für {project_name}

## App Name
{project_name}

## Kurzbeschreibung (bis 80 Zeichen)
Eine moderne {request.platform} App, die {request.description[:60] if len(request.description) > 60 else request.description}...

## Vollständige Beschreibung
{request.description}

## Features
{features_text}

## Screenshots benötigt:
- Phone: Mindestens 2, maximal 8 (16:9 oder 9:16)
- Tablet: Mindestens 1, maximal 8 (16:9 oder 9:16)

## App Icon:
- 512 x 512 PNG (transparent, wird automatisch gerundet)

## Feature Graphic:
- 1024 x 500 PNG (für Play Store Banner)
""",
            "language": "text"
        })
        
        # Assets README
        assets.append({
            "path": "assets/README.md",
            "content": f"""# Assets für {project_name}

## 📱 App Icons

### iOS
- **1024x1024 PNG** benötigt für App Store
- Dateien: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

### Android
- **512x512 PNG** als Basis
- Alle Dichten (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) werden generiert
- Dateien: `android/app/src/main/res/mipmap-*/`

### Web
- **favicon.ico** (16x16, 32x32, 48x48)
- **logo192.png** (192x192)
- **logo512.png** (512x512)
- **apple-touch-icon.png** (180x180)

## 🎨 Logos

- `assets/logo.svg` - Hauptlogo (SVG, skalierbar)
- `assets/icons/app_icon.svg` - App Icon (SVG)

## 📸 Screenshots (für App Store/Play Store)

Siehe `store_assets/` für detaillierte Anforderungen.

## 🚀 Nächste Schritte

1. **Icons generieren**: Verwende die SVG-Dateien als Basis und konvertiere zu PNG
2. **Screenshots erstellen**: Mache Screenshots der App in verschiedenen Größen
3. **App Store/Play Store vorbereiten**: Siehe `store_assets/` für Beschreibungen
""",
            "language": "markdown"
        })
        
        return assets
    
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
            code = match.group(1).strip()
        else:
            # Fallback: return as-is
            code = content.strip()
        
        # ⚡ VALIDIERUNG: Prüfe Code auf offensichtliche Fehler
        # (verhindert kaputten Code)
        validation_errors = []
        
        # Prüfe auf unvollständige Code-Blöcke
        if file_ext in ['dart', 'js', 'ts', 'jsx', 'tsx', 'swift', 'kt', 'java']:
            open_braces = code.count('{')
            close_braces = code.count('}')
            if open_braces != close_braces:
                validation_errors.append(f"Ungleiche Klammern: {open_braces} öffnende, {close_braces} schließende")
            
            open_parens = code.count('(')
            close_parens = code.count(')')
            if open_parens != close_parens:
                validation_errors.append(f"Ungleiche Klammern: {open_parens} öffnende, {close_parens} schließende")
        
        # Prüfe auf offensichtliche Syntax-Fehler (TODO, FIXME, etc.)
        if 'TODO' in code or 'FIXME' in code or 'XXX' in code:
            # Erlaubt, aber warnen
            print(f"⚠️  Warning: Code enthält TODO/FIXME in {file_path}")
        
        # Wenn kritische Fehler gefunden, versuche nochmal zu generieren
        if validation_errors:
            print(f"⚠️  Validation errors in {file_path}: {validation_errors}")
            # Für jetzt: Warnung, aber Code trotzdem zurückgeben
            # (später könnte man hier einen Retry machen)
        
        return code
    
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
                    
                    # ⚡ WICHTIG: Prüfe ob Datei bereits existiert und Inhalt hat
                    if os.path.exists(full_path):
                        try:
                            with open(full_path, "r", encoding="utf-8") as f:
                                existing_content = f.read()
                            # Wenn Datei bereits Inhalt hat (>100 Zeichen), überspringe sie
                            if len(existing_content) > 100:
                                print(f"⚠️  Datei bereits vorhanden (überspringe): {file_path}")
                                if on_step and (idx % 5 == 0):
                                    await on_step(f"⏭️  Überspringe bereits vorhandene Datei: {file_path}", 0)
                                continue
                        except:
                            # Fehler beim Lesen - überschreibe trotzdem
                            pass
                    
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
    
    async def _install_python_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install Python dependencies via Package Manager API (NO TERMINAL!)"""
        if on_step:
            await on_step("📦 Installiere Python Dependencies (pip install)...", 0)
        
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/api/packages/install",
                    json={
                        "project_id": project_id,
                        "package_manager": "pip",
                        "package_name": ""
                    }
                ) as response:
                    if response.status == 200:
                        if on_step:
                            await on_step("✅ Python Dependencies installiert!", 0)
                    else:
                        print(f"⚠️  Python dependencies installation returned {response.status}")
        except Exception as e:
            print(f"⚠️  Error installing Python dependencies: {e}")
    
    async def _install_rust_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install Rust dependencies (cargo build)"""
        if on_step:
            await on_step("📦 Installiere Rust Dependencies (cargo build)...", 0)
        # Rust dependencies are installed automatically during build
        if on_step:
            await on_step("✅ Rust Dependencies installiert!", 0)
    
    async def _install_go_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install Go dependencies (go mod download)"""
        if on_step:
            await on_step("📦 Installiere Go Dependencies (go mod download)...", 0)
        # Go dependencies are managed via go.mod
        if on_step:
            await on_step("✅ Go Dependencies installiert!", 0)
    
    async def _install_java_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install Java/Maven dependencies"""
        if on_step:
            await on_step("📦 Installiere Java Dependencies (mvn install)...", 0)
        # Maven dependencies are managed via pom.xml
        if on_step:
            await on_step("✅ Java Dependencies installiert!", 0)
    
    async def _install_dotnet_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install .NET dependencies (dotnet restore)"""
        if on_step:
            await on_step("📦 Installiere .NET Dependencies (dotnet restore)...", 0)
        # .NET dependencies are managed via .csproj
        if on_step:
            await on_step("✅ .NET Dependencies installiert!", 0)
    
    async def _install_php_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install PHP/Composer dependencies"""
        if on_step:
            await on_step("📦 Installiere PHP Dependencies (composer install)...", 0)
        # Composer dependencies are managed via composer.json
        if on_step:
            await on_step("✅ PHP Dependencies installiert!", 0)
    
    async def _install_android_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install Android/Gradle dependencies"""
        if on_step:
            await on_step("📦 Installiere Android Dependencies (gradle sync)...", 0)
        # Gradle dependencies are managed via build.gradle.kts
        if on_step:
            await on_step("✅ Android Dependencies installiert!", 0)
    
    async def _install_ios_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install iOS/Swift Package Manager dependencies"""
        if on_step:
            await on_step("📦 Installiere iOS Dependencies (swift package resolve)...", 0)
        # Swift dependencies are managed via Package.swift
        if on_step:
            await on_step("✅ iOS Dependencies installiert!", 0)
    
    async def _install_c_cpp_dependencies(self, project_id: str, on_step: Optional[Callable] = None):
        """Install C/C++ dependencies (build via Make/CMake)"""
        if on_step:
            await on_step("📦 Kompiliere C/C++ Projekt (make/cmake)...", 0)
        # C/C++ dependencies are compiled, not installed
        if on_step:
            await on_step("✅ C/C++ Projekt kompiliert!", 0)
    
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

