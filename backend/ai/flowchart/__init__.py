# -------------------------------------------------------------
# VIBEAI – AI SCREEN FLOW CHART MODULE
# -------------------------------------------------------------
"""
AI-Powered Screen Flow Chart Generator & Analyzer

Features:
- Visual flowchart generation
- Smart navigation detection
- Auth barrier recognition
- Missing screen detection
- Auto-fix suggestions
- Code generation from flowchart
- Export to PNG/SVG/Mermaid
"""
from .flowchart_analyzer import flowchart_analyzer
from .flowchart_routes import router

__all__ = ["flowchart_analyzer", "router"]