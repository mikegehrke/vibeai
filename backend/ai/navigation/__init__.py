"""
VIBEAI - Navigation Manager Module

Automatische Navigation-Generierung für Flutter, React und Next.js
"""

from .navigation_manager import NavigationManager
from .navigation_routes import Router

navigation_manager = NavigationManager()
router = Router()

__all__ = ["navigation_manager", "router"]