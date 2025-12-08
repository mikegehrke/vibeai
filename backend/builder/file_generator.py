# -------------------------------------------------------------
# VIBEAI – FILE GENERATOR (KI-POWERED)
# -------------------------------------------------------------
# Generiert Datei-Inhalte mit KI für:
# - Source Code (Dart, TypeScript, Python, Swift, Kotlin, etc.)
# - Config Files (package.json, pubspec.yaml, etc.)
# - UI Components
# - API Routes
# - Tests
# - Documentation
# -------------------------------------------------------------

from typing import Dict, List

from builder.language_detector import detect_language
from core.model_router_v2 import model_router_v2


class FileGenerator:
    """
    Generiert Datei-Inhalte mit KI-Unterstützung.
    Nutzt GPT-4o, Claude, oder andere Modelle für Code-Generierung.
    """

    async def generate_file_content(self, file_path: str, file_type: str, context: Dict, model: str = "gpt-4o") -> str:
        """
        Generiert Inhalt für eine einzelne Datei.

        Args:
            file_path: Pfad der Datei (z.B. "lib/main.dart")
            file_type: Dateityp (z.B. "dart", "tsx", "py")
            context: Kontext-Informationen (project_name, description, etc.)
            model: KI-Modell für Generierung

        Returns:
            Generierter Datei-Inhalt als String
        """
        # Sprache detektieren
        language = detect_language(file_path)

        # Prompt für KI erstellen
        prompt = self._build_generation_prompt(file_path, file_type, language, context)

        # KI-Generierung mit Fallback
        try:
            response = await model_router_v2.route_with_fallback(
                requested_model=model,
                messages=[{"role": "user", "content": prompt}],
                context={"temperature": 0.3, "max_output_tokens": 2000},
            )

            content = response.get("message", "")

            # Code-Blöcke extrahieren (falls KI Markdown zurückgibt)
            content = self._extract_code(content, language)

            return content

        except Exception as e:
            print(f"[FileGenerator] Error generating {file_path}: {e}")
            return self._get_fallback_content(file_path, file_type, context)

    async def generate_multiple_files(self, files: List[Dict], context: Dict, model: str = "gpt-4o") -> Dict[str, str]:
        """
        Generiert Inhalte für mehrere Dateien gleichzeitig.

        Args:
            files: Liste von {"path": str, "type": str}
            context: Projekt-Kontext
            model: KI-Modell

        Returns:
            Dictionary {file_path: content}
        """
        results = {}

        for file_info in files:
            file_path = file_info["path"]
            file_type = file_info.get("type", "")

            content = await self.generate_file_content(file_path, file_type, context, model)

            results[file_path] = content

        return results

    def _build_generation_prompt(self, file_path: str, file_type: str, language: str, context: Dict) -> str:
        """Erstellt den Prompt für die KI-Generierung."""
        project_name = context.get("project_name", "MyApp")
        description = context.get("description", "")
        framework = context.get("framework", "")

        # Template-basierte Prompts
        templates = {
            "main": f"""Generate a main entry file for a {framework} app.
Project: {project_name}
Description: {description}
File: {file_path}
Language: {language}

Requirements:
- Clean, production-ready code
- Proper imports
- Error handling
- Comments for key sections
- Follow {framework} best practices

Return ONLY the code, no explanations.""",
            "screen": f"""Generate a screen/view component for {framework}.
Project: {project_name}
File: {file_path}
Language: {language}

Requirements:
- Responsive layout
- Proper state management
- Navigation support
- Clean UI code
- Accessibility features

Return ONLY the code.""",
            "model": f"""Generate a data model/class.
Project: {project_name}
File: {file_path}
Language: {language}

Requirements:
- Proper typing
- JSON serialization
- Validation
- Clean structure

Return ONLY the code.""",
            "service": f"""Generate an API service/client.
Project: {project_name}
File: {file_path}
Language: {language}

Requirements:
- HTTP client setup
- Error handling
- Type-safe responses
- Async/await patterns

Return ONLY the code.""",
            "test": f"""Generate unit tests.
Project: {project_name}
File: {file_path}
Language: {language}

Requirements:
- Comprehensive test cases
- Mock data
- Assertions
- Proper test structure

Return ONLY the code.""",
        }

        # Datei-Typ bestimmen
        if "main" in file_path.lower():
            return templates["main"]
        elif any(x in file_path.lower() for x in ["screen", "view", "page"]):
            return templates["screen"]
        elif any(x in file_path.lower() for x in ["model", "entity", "schema"]):
            return templates["model"]
        elif any(x in file_path.lower() for x in ["service", "api", "client"]):
            return templates["service"]
        elif "test" in file_path.lower():
            return templates["test"]
        else:
            # Generic prompt
            return f"""Generate {language} code for: {file_path}
Project: {project_name} ({framework})
Description: {description}

Create production-ready, clean code with proper structure.
Return ONLY the code, no explanations."""

    def _extract_code(self, content: str, language: str) -> str:
        """Extrahiert Code aus Markdown-Blöcken."""
        # Prüfe ob Content Markdown Code-Block ist
        if "```" in content:
            # Extract code from markdown blocks
            parts = content.split("```")
            for i, part in enumerate(parts):
                if i % 2 == 1:  # Odd indices are code blocks
                    # Remove language identifier
                    lines = part.strip().split("\n")
                    if lines[0].strip() in [language, "python", "javascript", "typescript", "jsx", "tsx"]:
                        return "\n".join(lines[1:])
                    return part.strip()
        return content.strip()

# Globale Instanz
file_generator = FileGenerator()
