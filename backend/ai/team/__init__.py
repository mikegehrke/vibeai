# -------------------------------------------------------------
# VIBEAI – MULTI-AGENT TEAM MODULE
# -------------------------------------------------------------
"""
Multi-Agent Team Module - Collaborative AI teamwork

Features:
- Multi-model collaboration (GPT, Claude, Gemini, Ollama)
- Specialized agent roles (Frontend, Backend, Designer, Testing, Local)
- Parallel task execution
- Result aggregation and consensus
- Model fallback and error handling
"""

from .team_engine import team_engine
from .team_routes import router

__all__ = ["team_engine", "router"]
