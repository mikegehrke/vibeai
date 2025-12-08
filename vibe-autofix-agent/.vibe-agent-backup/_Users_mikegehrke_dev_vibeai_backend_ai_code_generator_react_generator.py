# -------------------------------------------------------------
# VIBEAI – REACT CODE GENERATOR
# -------------------------------------------------------------
"""
React/JSX Code Generator

Konvertiert UI Structure (JSON) → React/JSX Code

Features:
- Functional Components
- Hooks (useState, useEffect)
- Event Handlers
- Styled Components
- Responsive Design
"""

from typing import Dict

from ai.code_generator.shared_templates import templates


class ReactGenerator:
    """
    Generiert React/JSX Code aus UI Structure.
    """

    def __init__(self):
        self.indent_level = 0

    # ---------------------------------------------------------
    # COMPONENT RENDERING
    # ---------------------------------------------------------
    def render_component(self, component: Dict, indent: int = 0) -> str:
        """
        Rendert einzelnes Component zu React JSX.

        Args:
            component: Component-Definition
            indent: Indentation level

        Returns:
            React JSX Code
        """
        comp_type = component.get("type", "div")
        indent_str = "  " * indent

        if comp_type == "text":
            return self._render_text(component, indent_str)
        elif comp_type == "heading":
            return self._render_heading(component, indent_str)
        elif comp_type == "button":
            return self._render_button(component, indent_str)
        elif comp_type == "input":
            return self._render_input(component, indent_str)
        elif comp_type == "image":
            return self._render_image(component, indent_str)
        elif comp_type == "container":
            return self._render_container(component, indent)
        else:
            return f"{indent_str}<!-- Unknown component: {comp_type} -->"

    def _render_text(self, component: Dict, indent: str) -> str:
        """Text Component."""
        value = component.get("text", "")
        props = component.get("props", {})
        size = props.get("size", "medium")
        color = props.get("color", "#333333")

        size_map = {"small": 14, "medium": 16, "large": 20}
        font_size = size_map.get(size, 16)

        return templates.REACT_TEXT.format(value=value, size=font_size, color=color.replace("#", ""))

    def _render_heading(self, component: Dict, indent: str) -> str:
        """Heading Component (h1)."""
        value = component.get("text", "Heading")
        props = component.get("props", {})
        color = props.get("color", "#222222")

        return f"""<h1 style={{{{ color: '{color}', marginBottom: '16px' }}}}>
  {value}
</h1>"""

    def _render_button(self, component: Dict, indent: str) -> str:
        """Button Component."""
        label = component.get("text", "Button")
        props = component.get("props", {})
        color = props.get("color", "#2196f3")

        return templates.REACT_BUTTON.format(label=label, color=color.replace("#", ""))

    def _render_input(self, component: Dict, indent: str) -> str:
        """Input Field Component."""
        props = component.get("props", {})
        placeholder = props.get("placeholder", "Enter text...")

        return templates.REACT_INPUT.format(placeholder=placeholder)

    def _render_image(self, component: Dict, indent: str) -> str:
        """Image Component."""
        props = component.get("props", {})
        url = props.get("url", props.get("src", "https://via.placeholder.com/300"))
        alt = props.get("alt", "Image")
        width = props.get("width", "300")
        height = props.get("height", "200")

        # Convert string dimensions to numbers
        width = int(str(width).replace("px", ""))
        height = int(str(height).replace("px", ""))

        return templates.REACT_IMAGE.format(url=url, alt=alt, width=width, height=height)

    def _render_container(self, component: Dict, indent: int) -> str:
        """Container Component mit Children."""
        props = component.get("props", {})
        children = component.get("children", [])
        bg_color = props.get("backgroundColor", "#ffffff")
        border_radius = props.get("borderRadius", "8")

        # Render children
        children_code = []
        for child in children:
            children_code.append(self.render_component(child, indent + 1))

        children_str = "\n".join(children_code)

        return templates.REACT_CONTAINER.format(
            backgroundColor=bg_color.replace("#", ""),
            borderRadius=border_radius,
            children=children_str,
        )

    # ---------------------------------------------------------
    # SCREEN RENDERING
    # ---------------------------------------------------------
    def render_screen(self, screen: Dict) -> str:
        """
        Rendert kompletten React Component.

        Args:
            screen: Screen-Definition mit components

        Returns:
            Complete React Component Code
        """
        screen_name = screen.get("name", "GeneratedScreen")
        title = screen.get("title", screen.get("metadata", {}).get("title", screen_name))
        components = screen.get("components", [])
        bg_color = screen.get("metadata", {}).get("backgroundColor", "#ffffff")

        # Render all components
        component_jsx = []
        for comp in components:
            jsx = self.render_component(comp, indent=2)
            component_jsx.append(jsx)

        # Join components
        body = "\n".join(component_jsx)

        # Complete screen
        return templates.REACT_SCREEN.format(
            screenName=screen_name,
            title=title,
            backgroundColor=bg_color.replace("#", ""),
            body=body,
        )

    # ---------------------------------------------------------
    # FULL APP RENDERING
    # ---------------------------------------------------------
    def render_app(self, app_structure: Dict) -> Dict[str, str]:
        """
        Rendert komplette React App mit mehreren Components.

        Args:
            app_structure: {
                "app_name": "MyApp",
                "screens": [...],
                "navigation": {...},
                "theme": {...}
            }

        Returns:
            Dict[filename, code]
        """
        files = {}

        # Render each screen as component
        for screen in app_structure.get("screens", []):
            screen_name = screen.get("name", "Screen")
            code = self.render_screen(screen)
            files[f"src/components/{screen_name}.jsx"] = code

        # App.jsx
        app_name = app_structure.get("app_name", "MyApp")
        theme = app_structure.get("theme", {})
        primary_color = theme.get("primaryColor", "#2196f3")

        app_code = f"""
import React from 'react';
import HomeScreen from './components/HomeScreen';

export default function {app_name}() {{
  return (
    <div style={{{{
      backgroundColor: '{primary_color}',
      minHeight: '100vh',
    }}}}>
      <HomeScreen />
    </div>
  );
}}
"""
        files["src/App.jsx"] = app_code

        # index.jsx
        index_code = f"""
import React from 'react';
import ReactDOM from 'react-dom/client';
import {app_name} from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <{app_name} />
  </React.StrictMode>,
);
"""
        files["src/index.jsx"] = index_code

        return files


# Global Instance
react_generator = ReactGenerator()
