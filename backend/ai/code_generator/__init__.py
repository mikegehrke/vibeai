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

from .code_formatter import formatter
from .flutter_generator import flutter_generator
from .react_generator import react_generator
from .shared_templates import templates

__all__ = [
    "flutter_generator",
    "react_generator",
    "formatter",
    "templates",
]