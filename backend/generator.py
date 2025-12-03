# backend/generator.py
# KI-Code-Erzeugung mit OpenAI-API (oder lokalem Modell)

from openai import OpenAI
import os
from dotenv import load_dotenv

# Lade .env Datei
load_dotenv()

# Fallback für API Key wenn .env nicht funktioniert
api_key = os.getenv("OPENAI_API_KEY")
if not api_key or api_key.startswith("your-new"):
    api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

def generate_code(description: str, output_dir: str):
    """
    Ruft GPT-Modell auf, um komplette Projektstruktur zu generieren.
    Erstellt mehrere Dateien und Ordner basierend auf der Beschreibung.
    """
    prompt = f"""
    Create a complete project structure for: {description}

    Provide the response in the following JSON format:
    {{
        "project_name": "project-name",
        "files": [
            {{
                "path": "relative/path/to/file.ext",
                "content": "actual file content here"
            }},
            {{
                "path": "src/main.dart",
                "content": "flutter code here"
            }}
        ]
    }}

    Generate REAL, working code for each file. Include:
    - Main application files
    - Configuration files (pubspec.yaml, package.json, etc.)
    - Multiple source files if needed
    - Proper folder structure
    
    Make it a complete, runnable project.
    """
    
    # 🚀 PREMIUM MODEL SELECTION - Alle Top-Modelle verfügbar!
    # Priorität: Gpt-5 > O4-Mini > Gpt-5-mini > Gpt-4.1 > Fallbacks
    models_to_try = [
        "gpt-5",           # 🥇 BESTE Qualität für Code-Generation
        "o4-mini",         # 🥈 Schnelles Reasoning + Coding  
        "gpt-5-mini",      # 🥉 Ausgewogen: Qualität + Speed
        "gpt-4.1",         # 🏅 Verbesserte GPT-4 Version
        "o3",              # 🧠 Advanced Reasoning
        "gpt-5-nano",      # ⚡ Ultra-schnell
        "gpt-4o-mini",     # 🔄 Fallback 1
        "gpt-4",           # 🔄 Fallback 2
        "gpt-3.5-turbo-16k", # 🔄 Fallback 3
        "gpt-3.5-turbo"    # 🔄 Final Fallback
    ]
    response = None
    
    for model in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000
            )
            print(f"✅ Successfully using model: {model}")
            break
        except Exception as e:
            print(f"❌ Model {model} failed: {str(e)}")
            if model == models_to_try[-1]:  # Letzter Versuch
                raise e
            continue
    
    if not response:
        raise Exception("Alle Modelle fehlgeschlagen")
    
    import json
    import re
    
    try:
        # Extrahiere JSON aus der Antwort
        content = response.choices[0].message.content or ""
        
        # Finde JSON Block
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            project_data = json.loads(json_match.group())
        else:
            # Fallback: Erstelle einfache Struktur
            project_data = {
                "project_name": "generated-app",
                "files": [
                    {"path": "main.txt", "content": content}
                ]
            }
        
        # Erstelle Projektordner
        project_path = os.path.join(output_dir, project_data.get("project_name", "generated-app"))
        os.makedirs(project_path, exist_ok=True)
        
        created_files = []
        
        # Erstelle alle Dateien
        for file_info in project_data.get("files", []):
            file_path = os.path.join(project_path, file_info["path"])
            
            # Erstelle Ordner falls nötig
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Schreibe Datei
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(file_info["content"])
            
            created_files.append(file_path)
        
        return created_files
        
    except Exception as e:
        # Fallback bei Fehlern
        fallback_path = os.path.join(output_dir, "error_log.txt")
        with open(fallback_path, "w") as f:
            f.write(f"Fehler beim Parsen: {str(e)}\n\nOriginal Response:\n{response.choices[0].message.content}")
        return [fallback_path]


# ✔ Original generate_code() ist vollständig und funktioniert
# ✔ Multi-Model Fallback (gpt-5 → o4-mini → gpt-5-mini → etc.)
# ✔ JSON-basierte Projektstruktur-Generierung
# ✔ File/Folder Creation
# ✔ Error Handling mit Fallback
#
# ❗ ABER:
#     - Sync API (nicht async)
#     - Hardcoded OpenAI Client
#     - Keine Integration mit model_registry_v2
#     - Keine Integration mit model_router_v2
#     - Keine Billing/Token Tracking
#     - Keine Multi-Provider Support (Claude, Gemini, Ollama)
#     - Kein Composer Integration
#     - Keine Agent Integration
#     - max_tokens=2000 zu wenig für große Projekte
#
# 👉 Das Original ist ein guter OpenAI Code Generator
# 👉 Für dein 280-Modul-System brauchen wir Multi-Provider + Async


# -------------------------------------------------------------
# VIBEAI – CODE GENERATOR V2 (MULTI-PROVIDER + ASYNC)
# -------------------------------------------------------------
import json
import re
import asyncio
from pathlib import Path
from typing import Dict, List, Optional
from core.model_registry_v2 import resolve_model
from core.model_router_v2 import model_router_v2


class CodeGeneratorV2:
    """
    Production Code Generator mit:
    - Multi-Provider Support (GPT, Claude, Gemini, Ollama)
    - Async Interface
    - Smart Model Selection
    - Large Project Support
    - Billing Integration
    - Agent Integration
    """

    def __init__(self):
        self.default_model = "gpt-4o"
        self.max_tokens = 8000  # Größere Projekte

    async def generate_project(
        self,
        description: str,
        output_dir: str,
        model: Optional[str] = None,
        agent: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Generiert komplettes Projekt basierend auf Beschreibung.
        
        Args:
            description: Projekt-Beschreibung
            output_dir: Ausgabe-Verzeichnis
            model: Optional spezifisches Modell
            agent: Optional Agent-Name für Model-Selection
            
        Returns:
            {
                "success": bool,
                "project_path": str,
                "files_created": List[str],
                "model_used": str,
                "tokens": int
            }
        """
        
        # Model Selection
        if agent:
            # Agent-basiert (Cora für Coding)
            model_name = model_router_v2.pick_model(description, agent)
        else:
            model_name = model or self.default_model

        # Prompt für Projektstruktur
        prompt = self._build_project_prompt(description)

        # AI Request
        model_wrapper = resolve_model(model_name)
        
        try:
            result = await model_wrapper.run(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert code generator. Create complete, production-ready projects with proper structure."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                context={
                    "max_output_tokens": self.max_tokens,
                    "temperature": 0.3  # Deterministisch für Code
                }
            )

            # Parse Response
            project_data = self._parse_project_response(result.get("message", ""))

            # Create Files
            files_created = await self._create_project_files(
                project_data,
                output_dir
            )

            return {
                "success": True,
                "project_path": os.path.join(output_dir, project_data.get("project_name", "generated-project")),
                "files_created": files_created,
                "model_used": model_name,
                "provider": result.get("provider"),
                "input_tokens": result.get("input_tokens", 0),
                "output_tokens": result.get("output_tokens", 0)
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_attempted": model_name
            }

    def _build_project_prompt(self, description: str) -> str:
        """Erstellt optimierten Prompt für Projekt-Generierung."""
        return f"""
Create a complete, production-ready project for: {description}

Return ONLY valid JSON in this exact format:
{{
    "project_name": "project-name",
    "description": "Brief description",
    "framework": "flutter|react|nextjs|nodejs|python|swift",
    "files": [
        {{
            "path": "relative/path/file.ext",
            "content": "complete file content here"
        }}
    ]
}}

Requirements:
- Include ALL necessary files (main code, config, dependencies)
- Add proper folder structure
- Include package.json / pubspec.yaml / requirements.txt
- Add README.md with setup instructions
- Use modern best practices
- Make it immediately runnable
- Minimum 5 files for a complete project

CRITICAL: Return ONLY the JSON, no explanations before or after.
"""

    def _parse_project_response(self, response: str) -> Dict:
        """Extrahiert Projekt-Daten aus AI-Response."""
        try:
            # Find JSON block
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            
            if json_match:
                project_data = json.loads(json_match.group())
                return project_data
            else:
                # Fallback: Create simple structure
                return {
                    "project_name": "generated-project",
                    "framework": "unknown",
                    "files": [
                        {
                            "path": "output.txt",
                            "content": response
                        }
                    ]
                }
        except json.JSONDecodeError:
            # JSON Parse Error Fallback
            return {
                "project_name": "generated-project",
                "framework": "unknown",
                "files": [
                    {
                        "path": "raw_output.txt",
                        "content": response
                    }
                ]
            }

    async def _create_project_files(
        self,
        project_data: Dict,
        output_dir: str
    ) -> List[str]:
        """Erstellt alle Projekt-Dateien."""
        project_name = project_data.get("project_name", "generated-project")
        project_path = Path(output_dir) / project_name
        
        # Create project directory
        project_path.mkdir(parents=True, exist_ok=True)
        
        created_files = []
        
        # Create all files
        for file_info in project_data.get("files", []):
            file_path = project_path / file_info["path"]
            
            # Create parent directories
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write file
            file_path.write_text(file_info["content"], encoding="utf-8")
            
            created_files.append(str(file_path))
        
        return created_files

    async def generate_file(
        self,
        description: str,
        file_type: str = "python",
        model: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Generiert einzelne Datei (schneller für kleine Tasks).
        
        Args:
            description: Was soll die Datei machen?
            file_type: python|javascript|dart|swift|kotlin
            model: Optional spezifisches Modell
            
        Returns:
            {
                "success": bool,
                "content": str,
                "model_used": str,
                "tokens": int
            }
        """
        model_name = model or self.default_model
        model_wrapper = resolve_model(model_name)

        prompt = f"""
Create a single {file_type} file that: {description}

Requirements:
- Complete, working code
- Proper imports/dependencies
- Comments for complex parts
- Follow best practices
- Production-ready quality

Return ONLY the code, no explanations.
"""

        try:
            result = await model_wrapper.run(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                context={
                    "max_output_tokens": 4000,
                    "temperature": 0.2
                }
            )

            return {
                "success": True,
                "content": result.get("message", ""),
                "model_used": model_name,
                "provider": result.get("provider"),
                "input_tokens": result.get("input_tokens", 0),
                "output_tokens": result.get("output_tokens", 0)
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Globale Instanz
code_generator_v2 = CodeGeneratorV2()