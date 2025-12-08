# -------------------------------------------------------------
# VIBEAI – AI UI GENERATOR
# -------------------------------------------------------------
"""
KI-gestützter UI Generator

Flow:
1. User Prompt → AI Model
2. AI → UI Structure (JSON)
3. UI Structure → preview_renderer
4. HTML Preview → IFRAME
5. Code Generation → Flutter/React Code
6. Build System → APK/App
7. Live Preview → Download

Features:
- Natural Language → UI Components
- Automatic Screen Generation
- Multi-Framework Support (Flutter, React, Vue, HTML)
- Live Preview
- Code Export
- Build Integration

Example:
    User: "Create a login screen with email and password"
    AI: Generates component structure
    System: Renders preview, generates code, builds app
"""

import json
import re
from typing import Dict, List, Optional

from codestudio.code_generator import CodeGenerator
from core.model_router_v2 import model_router
from preview.preview_renderer import PreviewRenderer


class AIUIGenerator:
    """
    KI UI Generator für automatische Screen-Generierung.

    Flow:
        prompt → AI → structure → preview → code → build
    """

    def __init__(self):
        self.preview_renderer = PreviewRenderer()
        self.code_generator = CodeGenerator()

    # ---------------------------------------------------------
    # GENERATE UI FROM PROMPT
    # ---------------------------------------------------------
    async def generate_ui_from_prompt(self, prompt: str, framework: str = "flutter", style: str = "material") -> Dict:
        """
        Generiert UI aus Natural Language Prompt.

        Args:
            prompt: User-Beschreibung ("Login screen with email and password")
            framework: flutter, react, vue, html
            style: material, cupertino, tailwind, bootstrap

        Returns:
            {
                "screen": { ... },
                "html_preview": "<html>...",
                "code": "class LoginScreen ...",
                "components": [...]
            }
        """

        # AI Prompt konstruieren
        ai_prompt = self._build_ai_prompt(prompt, framework, style)

        # AI Model aufrufen
        response = await model_router.generate(
            messages=[{"role": "user", "content": ai_prompt}],
            model="gpt-4",
            temperature=0.7,
            max_tokens=2000,
        )

        # UI Structure extrahieren
        ui_structure = self._parse_ai_response(response)

        # HTML Preview generieren
        html_preview = self.preview_renderer.render_screen_html(ui_structure, style)

        # Code generieren
        code = self.code_generator.generate_code(ui_structure, framework)

        return {
            "success": True,
            "screen": ui_structure,
            "html_preview": html_preview,
            "code": code,
            "framework": framework,
            "style": style,
        }

    # ---------------------------------------------------------
    # COMPONENT SUGGESTION
    # ---------------------------------------------------------
    async def suggest_components(self, description: str, existing_components: List[Dict] = None) -> List[Dict]:
        """
        Schlägt passende Components vor basierend auf Beschreibung.

        Args:
            description: "I need a form for user registration"
            existing_components: Bereits vorhandene Components

        Returns:
            [
                {"type": "heading", "text": "Sign Up"},
                {"type": "input", "props": {"placeholder": "Name"}},
                {"type": "input", "props": {"placeholder": "Email"}},
                ...
            ]
        """

        prompt = f"""
Suggest UI components for this screen:

Description: {description}

Existing components: {json.dumps(existing_components or [], indent=2)}

Return ONLY a JSON array of components. Each component must have:
- type: "button", "input", "text", "heading", "image", "container"
- text: string (for button, text, heading)
- props: object (color, size, placeholder, etc.)

Example:
[
  {{"type": "heading", "text": "Welcome", "props": {{"size": "large"}}}},
  {{"type": "input", "text": "", "props": {{"placeholder": "Email"}}}}
]
"""

        response = await model_router.generate(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4",
            temperature=0.5,
        )

        # Parse JSON response
        components = self._extract_json_from_response(response)

        return components

    # ---------------------------------------------------------
    # IMPROVE EXISTING UI
    # ---------------------------------------------------------
    async def improve_ui(self, screen: Dict, improvement_request: str) -> Dict:
        """
        Verbessert existierendes UI basierend auf User-Request.

        Args:
            screen: Aktuelles Screen-Objekt
            improvement_request: "Make it more modern" / "Add validation"

        Returns:
            Verbessertes Screen-Objekt
        """

        prompt = f"""
Improve this UI screen:

Current screen:
{json.dumps(screen, indent=2)}

Improvement request: {improvement_request}

Return the improved screen as JSON with the same structure.
Keep the existing components but enhance them based on the request.
"""

        response = await model_router.generate(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4",
            temperature=0.6,
        )

        improved_screen = self._extract_json_from_response(response)

        return improved_screen

    # ---------------------------------------------------------
    # GENERATE COMPLETE APP
    # ---------------------------------------------------------
    async def generate_complete_app(self, app_description: str, framework: str = "flutter") -> Dict:
        """
        Generiert komplette Multi-Screen App.

        Args:
            app_description: "E-commerce app with products and cart"
            framework: flutter, react, vue

        Returns:
            {
                "screens": [...],
                "navigation": {...},
                "theme": {...},
                "code_files": {...}
            }
        """

        prompt = f"""
Generate a complete {framework} app:

Description: {app_description}

Return JSON with:
{{
  "app_name": "MyApp",
  "screens": [
    {{
      "name": "HomeScreen",
      "components": [...]
    }}
  ],
  "navigation": {{
    "initial": "HomeScreen",
    "routes": {{"home": "HomeScreen"}}
  }},
  "theme": {{
    "primaryColor": "#2196f3",
    "backgroundColor": "#ffffff"
  }}
}}
"""

        response = await model_router.generate(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4",
            temperature=0.7,
            max_tokens=4000,
        )

        app_structure = self._extract_json_from_response(response)

        # Code für jede Screen generieren
        code_files = {}
        for screen in app_structure.get("screens", []):
            screen_code = self.code_generator.generate_code(screen, framework)
            code_files[f"{screen['name']}.dart"] = screen_code

        app_structure["code_files"] = code_files

        return app_structure

    # ---------------------------------------------------------
    # HELPER METHODS
    # ---------------------------------------------------------
    def _build_ai_prompt(self, user_prompt: str, framework: str, style: str) -> str:
        """Konstruiert optimierten AI Prompt."""

        return f"""
You are a UI/UX expert. Generate a {framework} screen based on this description:

"{user_prompt}"

Style: {style}

Return ONLY valid JSON with this structure:
{{
  "name": "ScreenName",
  "components": [
    {{
      "type": "heading|text|button|input|image|container",
      "text": "component text",
      "props": {{
        "color": "#hex",
        "size": "small|medium|large",
        "placeholder": "for inputs"
      }},
      "children": []
    }}
  ],
  "style": "{style}",
  "metadata": {{
    "title": "Screen Title",
    "theme": "light|dark"
  }}
}}

Component types available:
- heading: Large text (h1, h2, h3)
- text: Regular text/paragraph
- button: Action button
- input: Text input field
- image: Image display
- container: Group/layout container

Make it professional, modern, and user-friendly.
"""

    def _parse_ai_response(self, response: str) -> Dict:
        """Extrahiert UI Structure aus AI Response."""

        # Versuche JSON zu extrahieren
        json_data = self._extract_json_from_response(response)

        if json_data:
            return json_data

        # Fallback: Minimale Structure
        return {
            "name": "GeneratedScreen",
            "components": [],
            "style": "tailwind",
            "metadata": {"title": "Generated Screen"},
        }

    def _extract_json_from_response(self, text: str) -> Optional[Dict]:
        """Extrahiert JSON aus AI Response (auch mit Markdown)."""

        # Remove markdown code blocks
        text = re.sub(r"