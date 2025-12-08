# -------------------------------------------------------------
# VIBEAI – PROJECT GENERATOR PACKAGE
# -------------------------------------------------------------
"""
Modular Project Generator

Separate generators for each framework:
- Flutter
- React
- Next.js
- Node.js/Express
"""

from .flutter_generator import flutter_project
from .next_generator import nextjs_project
from .node_generator import node_project
from .project_router import router
from .react_generator import react_project

__all__ = [
    "flutter_project",
    "react_project",
    "nextjs_project",
    "node_project",
    "router",
]
