# -------------------------------------------------------------
# VIBEAI – PREVIEW RENDERER
# -------------------------------------------------------------
"""
Preview Renderer für UI Components

Features:
- HTML/CSS/JS Rendering für Web Preview
- Flutter Web Rendering
- Component-basiertes Rendering
- Step-by-Step UI Builder Preview
- Live UI Updates
- Error Boundary Rendering

Verwendung:
    # HTML Component rendern
    html = render_component(component_data, "web")

    # Flutter Widget rendern
    dart = render_component(component_data, "flutter")

    # Vollständige Seite rendern
    html = render_full_page(components, metadata)
"""

from typing import Dict, List, Optional


class PreviewRenderer:
    """
    Renderer für Live Preview Components.

    Generiert HTML/CSS/JS oder Flutter Code
    aus Component-Definitionen.
    """

    # ---------------------------------------------------------
    # WEB COMPONENT RENDERING
    # ---------------------------------------------------------
    def render_component_html(self, component: Dict, style: str = "tailwind") -> str:
        """
        Rendert Web Component zu HTML.

        Args:
            component: Component-Definition
                {
                    "type": "button",
                    "text": "Click Me",
                    "label": "Click Me",
                    "value": "Text content",
                    "props": {"onClick": "..."}
                }
            style: CSS Framework ("tailwind", "bootstrap", "plain")

        Returns:
            str: HTML String
        """
        comp_type = component.get("type", "div")
        text = component.get("text", component.get("value", ""))
        props = component.get("props", {})
        children = component.get("children", [])

        # HTML Tag basierend auf Type
        if comp_type == "button":
            label = component.get("label", text)
            color = component.get("color", "#222")
            html = f"""<button style="padding:10px;margin:5px;background:{color};color:white;border:none;border-radius:5px">
                {label}
            </button>"""

        elif comp_type == "text":
            size = component.get("size", 16)
            html = f'<p style="font-size:{size}px">{text}</p>'

        elif comp_type == "heading":
            level = props.get("level", 1)
            html = f"<h{level}>{text}</h{level}>"

        elif comp_type == "image":
            url = component.get("url", "")
            width = component.get("width", "auto")
            height = component.get("height", "auto")
            html = f'<img src="{url}" style="width:{width};height:{height}"/>'

        elif comp_type == "input":
            placeholder = props.get("placeholder", "")
            html = f'<input type="text" placeholder="{placeholder}" />'

        elif comp_type == "container":
            children_html = "".join(self.render_component_html(child, style) for child in children)
            html = f'<div class="container">{children_html}</div>'

        else:
            html = f"<div>Unknown component: {comp_type}</div>"

        return html

    # ---------------------------------------------------------
    # FLUTTER COMPONENT RENDERING
    # ---------------------------------------------------------
    def render_flutter_component(self, component: Dict) -> str:
        """
        Rendert Flutter Widget Code.

        Args:
            component: Component-Definition

        Returns:
            str: Dart/Flutter Code
        """
        comp_type = component.get("type", "Container")
        text = component.get("text", "")
        props = component.get("props", {})
        children = component.get("children", [])

        if comp_type == "button":
            return f"""ElevatedButton(
  onPressed: () {{}},
  child: Text("{text}"),
)"""

        elif comp_type == "text":
            return f'Text("{text}")'

        elif comp_type == "heading":
            return f"""Text(
  "{text}",
  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
)"""

        elif comp_type == "input":
            placeholder = props.get("placeholder", "")
            return f'TextField(decoration: InputDecoration(hintText: "{placeholder}"))'

        elif comp_type == "container":
            children_code = ",\n    ".join(self.render_flutter_component(child) for child in children)
            return f"""Container(
  child: Column(
    children: [
      {children_code}
    ],
  ),
)"""

        else:
            return "Container()"

    # ---------------------------------------------------------
    # SCREEN RENDERING
    # ---------------------------------------------------------
    def render_screen_html(self, screen_definition: Dict, style: str = "tailwind") -> str:
        """
        Rendert kompletten UI-Screen zu HTML.

        Args:
            screen_definition: Screen-Definition
                {
                    "title": "Login Screen",
                    "components": [...]
                }
            style: CSS Framework

        Returns:
            str: HTML String
        """
        html_parts = []

        components = screen_definition.get("components", [])

        for comp in components:
            html_parts.append(self.render_component_html(comp, style))

        return "<div>" + "".join(html_parts) + "</div>"

    # ---------------------------------------------------------
    # FULL PAGE RENDERING
    # ---------------------------------------------------------
    def render_full_page(self, components: List[Dict], metadata: Dict = None, framework: str = "react") -> str:
        """
        Rendert komplette Seite mit allen Components.

        Args:
            components: Liste von Component-Definitionen
            metadata: Page Metadata (title, description, etc.)
            framework: "react", "vue", "html"

        Returns:
            str: Vollständiger Page Code
        """
        if framework == "react":
            return self._render_react_page(components, metadata)
        elif framework == "vue":
            return self._render_vue_page(components, metadata)
        elif framework == "html":
            return self._render_html_page(components, metadata)
        else:
            return "<!-- Unknown framework -->"

    def _render_react_page(self, components: List[Dict], metadata: Dict = None) -> str:
        """Rendert React Seite."""
        title = metadata.get("title", "Preview") if metadata else "Preview"

        components_jsx = "\n      ".join(self.render_component_html(comp) for comp in components)

        return f"""import React from 'react';

export default function PreviewPage() {{
  return (
    <div className="preview-container">
      <h1>{title}</h1>
      {components_jsx}
    </div>
  );
}}
"""

    def _render_vue_page(self, components: List[Dict], metadata: Dict = None) -> str:
        """Rendert Vue Seite."""
        title = metadata.get("title", "Preview") if metadata else "Preview"

        components_html = "\n    ".join(self.render_component_html(comp) for comp in components)

        return f"""<template>
  <div class="preview-container">
    <h1>{title}</h1>
    {components_html}
  </div>
</template>

<script>
export default {{
  name: 'PreviewPage'
}}
</script>
"""

    def _render_html_page(self, components: List[Dict], metadata: Dict = None) -> str:
        """Rendert Plain HTML Seite."""
        title = metadata.get("title", "Preview") if metadata else "Preview"

        components_html = "\n    ".join(self.render_component_html(comp) for comp in components)

        return f"""<!DOCTYPE html>
<html>
<head>
  <title>{title}</title>
  <style>
    .preview-container {{
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }}
  </style>
</head>
<body>
  <div class="preview-container">
    <h1>{title}</h1>
    {components_html}
  </div>
</body>
</html>
"""

    # ---------------------------------------------------------
    # ERROR RENDERING
    # ---------------------------------------------------------
    def render_error_page(self, error_message: str, stack_trace: Optional[str] = None) -> str:
        """
        Rendert Error Page für Preview.

        Args:
            error_message: Fehlermeldung
            stack_trace: Optional Stack Trace

        Returns:
            str: HTML Error Page
        """
        stack_html = ""
        if stack_trace:
            stack_html = f"""
      <pre style="background: #1e1e1e; color: #d4d4d4; padding: 20px;">
{stack_trace}
      </pre>
"""

        return f"""<!DOCTYPE html>
<html>
<head>
  <title>Preview Error</title>
  <style>
    body {{
      font-family: system-ui, -apple-system, sans-serif;
      background: #fee;
      padding: 40px;
    }}
    .error-container {{
      background: white;
      border-left: 4px solid #e53e3e;
      padding: 20px;
      border-radius: 4px;
    }}
    h1 {{
      color: #e53e3e;
      margin: 0 0 10px 0;
    }}
  </style>
</head>
<body>
  <div class="error-container">
    <h1>⚠️ Preview Error</h1>
    <p><strong>{error_message}</strong></p>
    {stack_html}
  </div>
</body>
</html>
"""

    # ---------------------------------------------------------
    # LOADING PAGE
    # ---------------------------------------------------------
    def render_loading_page(self, message: str = "Loading Preview...") -> str:
        """
        Rendert Loading Page während Preview startet.

        Args:
            message: Loading-Nachricht

        Returns:
            str: HTML Loading Page
        """
        return f"""<!DOCTYPE html>
<html>
<head>
  <title>Loading Preview</title>
  <style>
    body {{
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f7fafc;
    }}
    .loader {{
      text-align: center;
    }}
    .spinner {{
      border: 4px solid #e2e8f0;
      border-top: 4px solid #4299e1;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }}
    @keyframes spin {{
      0% {{ transform: rotate(0deg); }}
      100% {{ transform: rotate(360deg); }}
    }}
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>{message}</p>
  </div>
</body>
</html>
"""


# Singleton Instance
preview_renderer = PreviewRenderer()
