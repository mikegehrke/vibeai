# -------------------------------------------------------------
# VIBEAI – FLUTTER CODE GENERATOR
# -------------------------------------------------------------
"""
Flutter/Dart Code Generator

Konvertiert UI Structure (JSON) → Flutter/Dart Code

Features:
- Material Design Components
- Cupertino (iOS) Support
- Responsive Layout
- State Management
- Navigation
"""

from typing import Dict

from ai.code_generator.shared_templates import templates


class FlutterGenerator:
    """
    Generiert Flutter/Dart Code aus UI Structure.
    """

    def __init__(self):
        self.indent_level = 0

    # ---------------------------------------------------------
    # COMPONENT RENDERING
    # ---------------------------------------------------------
    def render_component(self, component: Dict, indent: int = 0) -> str:
        """
        Rendert einzelnes Component zu Flutter Widget.

        Args:
            component: Component-Definition
            indent: Indentation level

        Returns:
            Flutter Widget Code
        """
        comp_type = component.get("type", "Container")
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
            return f"{indent_str}// Unknown component: {comp_type}"

    def _render_text(self, component: Dict, indent: str) -> str:
        """Text Widget."""
        value = component.get("text", "")
        props = component.get("props", {})
        size = props.get("size", "medium")
        color = props.get("color", "#333333").replace("#", "")

        size_map = {"small": 14.0, "medium": 16.0, "large": 20.0}
        font_size = size_map.get(size, 16.0)

        return templates.FLUTTER_TEXT.format(value=value, size=font_size, color=color)

    def _render_heading(self, component: Dict, indent: str) -> str:
        """Heading Widget (large Text)."""
        value = component.get("text", "Heading")
        props = component.get("props", {})
        color = props.get("color", "#222222").replace("#", "")

        return f"""{indent}Text(
{indent}  "{value}",
{indent}  style: TextStyle(
{indent}    fontSize: 24,
{indent}    fontWeight: FontWeight.bold,
{indent}    color: Color(0xFF{color}),
{indent}  ),
{indent})"""

    def _render_button(self, component: Dict, indent: str) -> str:
        """Button Widget."""
        label = component.get("text", "Button")
        props = component.get("props", {})
        color = props.get("color", "#2196f3").replace("#", "")

        return templates.FLUTTER_BUTTON.format(label=label, color=color)

    def _render_input(self, component: Dict, indent: str) -> str:
        """Input Field Widget."""
        props = component.get("props", {})
        placeholder = props.get("placeholder", "Enter text...")

        return templates.FLUTTER_INPUT.format(placeholder=placeholder)

    def _render_image(self, component: Dict, indent: str) -> str:
        """Image Widget."""
        props = component.get("props", {})
        url = props.get("url", props.get("src", "https://via.placeholder.com/300"))
        width = props.get("width", "300")
        height = props.get("height", "200")

        # Convert string dimensions to numbers
        width = float(str(width).replace("px", ""))
        height = float(str(height).replace("px", ""))

        return templates.FLUTTER_IMAGE.format(url=url, width=width, height=height)

    def _render_container(self, component: Dict, indent: int) -> str:
        """Container Widget mit Children."""
        props = component.get("props", {})
        children = component.get("children", [])
        bg_color = props.get("backgroundColor", "#ffffff").replace("#", "")
        border_radius = props.get("borderRadius", "8")

        # Render children
        children_code = []
        for child in children:
            children_code.append(self.render_component(child, indent + 1))

        children_str = ",\n".join(children_code)

        if children:
            child_widget = templates.FLUTTER_COLUMN.format(children=children_str)
        else:
            child_widget = "SizedBox()"

        return templates.FLUTTER_CONTAINER.format(
            backgroundColor=bg_color, borderRadius=border_radius, child=child_widget
        )

    # ---------------------------------------------------------
    # SCREEN RENDERING
    # ---------------------------------------------------------
    def render_screen(self, screen: Dict) -> str:
        """
        Rendert kompletten Flutter Screen.

        Args:
            screen: Screen-Definition mit components

        Returns:
            Complete Flutter Screen Code
        """
        screen_name = screen.get("name", "GeneratedScreen")
        title = screen.get("title", screen.get("metadata", {}).get("title", screen_name))
        components = screen.get("components", [])

        # Render all components
        component_widgets = []
        for comp in components:
            widget = self.render_component(comp, indent=3)
            component_widgets.append(widget)

        # Join with commas
        body_content = ",\n".join(component_widgets)

        # Wrap in Column
        body = templates.FLUTTER_COLUMN.format(children=body_content)

        # Wrap in Padding
        body_with_padding = f"""Padding(
        padding: EdgeInsets.all(16.0),
        child: {body},
      )"""

        # Complete screen
        return templates.FLUTTER_SCREEN.format(screenName=screen_name, title=title, body=body_with_padding)

    # ---------------------------------------------------------
    # FULL APP RENDERING
    # ---------------------------------------------------------
    def render_app(self, app_structure: Dict) -> Dict[str, str]:
        """
        Rendert komplette Flutter App mit mehreren Screens.

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

        # Render each screen
        for screen in app_structure.get("screens", []):
            screen_name = screen.get("name", "Screen")
            code = self.render_screen(screen)
            files[f"lib/screens/{screen_name.lower()}.dart"] = code

        # Main.dart
        app_name = app_structure.get("app_name", "MyApp")
        theme = app_structure.get("theme", {})
        primary_color = theme.get("primaryColor", "#2196f3").replace("#", "")

        main_code = f"""
import 'package:flutter/material.dart';

void main() {{
  runApp({app_name}());
}}

class {app_name} extends StatelessWidget {{
  @override
  Widget build(BuildContext context) {{
    return MaterialApp(
      title: '{app_name}',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: Color(0xFF{primary_color}),
      ),
      home: HomeScreen(),
    );
  }}
}}
"""
        files["lib/main.dart"] = main_code

        return files


# Global Instance
flutter_generator = FlutterGenerator()