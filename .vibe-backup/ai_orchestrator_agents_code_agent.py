# -------------------------------------------------------------
# VIBEAI – CODE AGENT
# -------------------------------------------------------------
"""
Code Agent - Generates code from UI structures.

Supports:
- Flutter/Dart
- React/JSX
- Vue
- HTML/CSS
"""

from typing import Dict


class CodeAgent:
    """Agent for code generation."""

    async def generate_code(self, screen: Dict, framework: str = "flutter") -> Dict:
        """
        Generate code from UI structure.

        Args:
            screen: UI structure from UIAgent
            framework: flutter | react | vue | html

        Returns:
            {
                "code": "...",
                "files": {...},
                "framework": "flutter"
            }
        """
        if framework == "flutter":
            return await self._generate_flutter(screen)
        elif framework == "react":
            return await self._generate_react(screen)
        elif framework == "vue":
            return await self._generate_vue(screen)
        elif framework == "html":
            return await self._generate_html(screen)
        else:
            # Default to Flutter
            return await self._generate_flutter(screen)

    async def generate_all_frameworks(self, screen: Dict) -> Dict:
        """
        Generate code for all frameworks at once.

        Returns:
            {
                "flutter": {...},
                "react": {...},
                "vue": {...},
                "html": {...}
            }
        """
        flutter = await self._generate_flutter(screen)
        react = await self._generate_react(screen)
        vue = await self._generate_vue(screen)
        html = await self._generate_html(screen)

        return {
            "success": True,
            "frameworks": {
                "flutter": flutter,
                "react": react,
                "vue": vue,
                "html": html,
            },
        }

    async def _generate_flutter(self, screen: Dict) -> Dict:
        """Generate Flutter/Dart code."""
        from ai.code_generator.flutter_generator import FlutterGenerator

        generator = FlutterGenerator()
        code = generator.render_screen(screen)

        return {
            "success": True,
            "code": code,
            "framework": "flutter",
            "language": "dart",
            "files": {"main.dart": code},
        }

    async def _generate_react(self, screen: Dict) -> Dict:
        """Generate React/JSX code."""
        from ai.code_generator.react_generator import ReactGenerator

        generator = ReactGenerator()
        code = generator.render_screen(screen)

        return {
            "success": True,
            "code": code,
            "framework": "react",
            "language": "javascript",
            "files": {"App.jsx": code, "index.jsx": self._react_index()},
        }

    async def _generate_vue(self, screen: Dict) -> Dict:
        """Generate Vue code."""
        components = screen.get("components", [])
        component_html = self._render_vue_components(components)

        code = f"""<template>
  <div class="screen">
    <h1>{{{{ title }}}}</h1>
    {component_html}
  </div>
</template>

<script>
export default {{
  name: '{screen.get("name", "Screen")}',
  data() {{
    return {{
      title: '{screen.get("title", "Screen")}'
    }}
  }}
}}
</script>

<style scoped>
.screen {{
  padding: 20px;
}}
</style>
"""

        return {
            "success": True,
            "code": code,
            "framework": "vue",
            "language": "vue",
            "files": {f"{screen.get('name', 'Screen')}.vue": code},
        }

    async def _generate_html(self, screen: Dict) -> Dict:
        """Generate HTML/CSS code."""
        components = screen.get("components", [])
        html = self._render_html_components(components)

        code = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{screen.get("title", "Screen")}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }}
        .container {{
            padding: 20px;
        }}
        input {{
            display: block;
            margin: 10px 0;
            padding: 10px;
            width: 100%;
            box-sizing: border-box;
        }}
        button {{
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{screen.get("title", "Screen")}</h1>
        {html}
    </div>
</body>
</html>
"""

        return {
            "success": True,
            "code": code,
            "framework": "html",
            "language": "html",
            "files": {"index.html": code},
        }

    def _render_vue_components(self, components) -> str:
        html = []
        for comp in components:
            comp_type = comp.get("type")
            if comp_type == "text":
                html.append(f"<p>{comp.get('value', '')}</p>")
            elif comp_type == "input":
                html.append(f"<input type='text' " f"placeholder='{comp.get('placeholder', '')}' />")
            elif comp_type == "button":
                html.append(f"<button>{comp.get('label', 'Button')}</button>")
        return "\n    ".join(html)

    def _render_html_components(self, components) -> str:
        html = []
        for comp in components:
            comp_type = comp.get("type")
            if comp_type == "text":
                html.append(f"<p>{comp.get('value', '')}</p>")
            elif comp_type == "input":
                html.append(f"<input type='text' " f"placeholder='{comp.get('placeholder', '')}' />")
            elif comp_type == "button":
                html.append(f"<button>{comp.get('label', 'Button')}</button>")
        return "\n        ".join(html)

    def _react_index(self) -> str:
        return """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
"""


# Global instance
code_agent = CodeAgent()
