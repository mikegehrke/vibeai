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
        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```\s*", "", text)

        # Finde JSON
        try:
            # Versuche direktes Parsing
            return json.loads(text.strip())
        except json.JSONDecodeError:
            # Suche nach JSON-ähnlichen Strukturen
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass

        # Versuche Array
        try:
            match = re.search(r"\[[\s\S]*\]", text)
            if match:
                return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

        return None


# ---------------------------------------------------------
# CODE GENERATOR
# ---------------------------------------------------------
class CodeGenerator:
    """
    Generiert Framework-spezifischen Code aus UI Structure.
    """

    def generate_code(self, ui_structure: Dict, framework: str) -> str:
        """
        Generiert Code für gegebenes Framework.

        Args:
            ui_structure: Screen mit Components
            framework: flutter, react, vue, html

        Returns:
            Framework-spezifischer Code
        """

        if framework == "flutter":
            return self._generate_flutter_code(ui_structure)
        elif framework == "react":
            return self._generate_react_code(ui_structure)
        elif framework == "vue":
            return self._generate_vue_code(ui_structure)
        else:
            return self._generate_html_code(ui_structure)

    def _generate_flutter_code(self, ui_structure: Dict) -> str:
        """Generiert Flutter/Dart Code."""

        screen_name = ui_structure.get("name", "GeneratedScreen")
        components = ui_structure.get("components", [])

        widgets = []
        for comp in components:
            comp_type = comp.get("type")
            text = comp.get("text", "")
            props = comp.get("props", {})

            if comp_type == "heading":
                widgets.append(f'Text("{text}", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold))')
            elif comp_type == "text":
                widgets.append(f'Text("{text}")')
            elif comp_type == "button":
                color = props.get("color", "#2196f3")
                widgets.append(f'ElevatedButton(onPressed: () {{}}, child: Text("{text}"))')
            elif comp_type == "input":
                placeholder = props.get("placeholder", "")
                widgets.append(f'TextField(decoration: InputDecoration(hintText: "{placeholder}"))')

        widgets_code = ",\n        ".join(widgets)

        return f"""
import 'package:flutter/material.dart';

class {screen_name} extends StatelessWidget {{
  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(title: Text('{screen_name}')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            {widgets_code}
          ],
        ),
      ),
    );
  }}
}}
"""

    def _generate_react_code(self, ui_structure: Dict) -> str:
        """Generiert React JSX Code."""

        screen_name = ui_structure.get("name", "GeneratedScreen")
        components = ui_structure.get("components", [])

        jsx_elements = []
        for comp in components:
            comp_type = comp.get("type")
            text = comp.get("text", "")
            props = comp.get("props", {})

            if comp_type == "heading":
                jsx_elements.append(f"<h1>{text}</h1>")
            elif comp_type == "text":
                jsx_elements.append(f"<p>{text}</p>")
            elif comp_type == "button":
                jsx_elements.append(f"<button onClick={{() => {{}}}}>{text}</button>")
            elif comp_type == "input":
                placeholder = props.get("placeholder", "")
                jsx_elements.append(f'<input type="text" placeholder="{placeholder}" />')

        jsx_code = "\n      ".join(jsx_elements)

        return f"""
import React from 'react';

export default function {screen_name}() {{
  return (
    <div className="screen-container">
      {jsx_code}
    </div>
  );
}}
"""

    def _generate_vue_code(self, ui_structure: Dict) -> str:
        """Generiert Vue Template Code."""

        screen_name = ui_structure.get("name", "GeneratedScreen")
        components = ui_structure.get("components", [])

        template_elements = []
        for comp in components:
            comp_type = comp.get("type")
            text = comp.get("text", "")
            props = comp.get("props", {})

            if comp_type == "heading":
                template_elements.append(f"<h1>{text}</h1>")
            elif comp_type == "text":
                template_elements.append(f"<p>{text}</p>")
            elif comp_type == "button":
                template_elements.append(f'<button @click="handleClick">{text}</button>')
            elif comp_type == "input":
                placeholder = props.get("placeholder", "")
                template_elements.append(f'<input v-model="inputValue" placeholder="{placeholder}" />')

        template_code = "\n    ".join(template_elements)

        return f"""
<template>
  <div class="screen">
    {template_code}
  </div>
</template>

<script>
export default {{
  name: '{screen_name}',
  data() {{
    return {{
      inputValue: ''
    }};
  }},
  methods: {{
    handleClick() {{
      console.log('Button clicked');
    }}
  }}
}};
</script>
"""

    def _generate_html_code(self, ui_structure: Dict) -> str:
        """Generiert HTML Code."""

        # Nutze PreviewRenderer
        renderer = PreviewRenderer()
        return renderer.render_screen_html(ui_structure, "tailwind")


# Global Instance
ai_ui_generator = AIUIGenerator()
