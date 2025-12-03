from typing import Any
# -------------------------------------------------------------
# VIBEAI – BUILD SYSTEM MODULE
# -------------------------------------------------------------
"""
Build System for VibeAI - Multi-Platform Build Pipeline

Supports:
- Flutter (Android APK, iOS, Web)
- React Web
- Next.js Web
- Node.js Backend
- Electron Desktop

Features:
- Async build execution
- Live log streaming
- Artifact management
- Build queue system
"""

from .build_manager import build_manager, BuildStatus, BuildType
from .build_executor import start_build
from .build_routes import router

__all__ = [
    "build_manager",
    "BuildStatus",
    "BuildType",
    "start_build",
    "router"
]
