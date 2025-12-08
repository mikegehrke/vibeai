# -------------------------------------------------------------
# VIBEAI – AUTO FIX MODULE
# -------------------------------------------------------------
"""
Auto-Fix Module - AI-powered code repair and improvement

Features:
- Automatic error detection
- Code repair and refactoring
- Import fixing
- UI optimization
- Navigation repair
- Warning resolution
"""

from .autofix_agent import autofix_agent
from .autofix_routes import router

__all__ = ["autofix_agent", "router"]