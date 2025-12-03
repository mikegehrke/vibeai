# -------------------------------------------------------------
# VIBEAI – CODE GENERATOR MODULE
# -------------------------------------------------------------
"""
AI Code Generator Package

Konvertiert UI Structure → Framework-spezifischen Code

Supported Frameworks:
- Flutter/Dart
- React/JSX
- Vue
- HTML/CSS

Features:
- Multi-framework code generation
- Component templates
- Code formatting
- Complete app generation
- REST API endpoints
"""

from ai.code_generator.flutter_generator import flutter_generator
from ai.code_generator.react_generator import react_generator
from ai.code_generator.code_formatter import formatter
from ai.code_generator.shared_templates import templates

__all__ = [
    "flutter_generator",
    "react_generator",
    "formatter",
    "templates",
]
