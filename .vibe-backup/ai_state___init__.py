"""
VIBEAI - State Management Module

Automatische State Management Code-Generierung für:
- Flutter (Riverpod, Provider, Bloc)
- React (Zustand, Redux, Context)
- Vue (Pinia, Vuex)
"""

from .state_manager import state_manager
from .state_routes import router

__all__ = ["state_manager", "router"]
