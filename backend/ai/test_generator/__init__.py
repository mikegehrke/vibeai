# -------------------------------------------------------------
# VIBEAI – AI TEST GENERATOR MODULE
# -------------------------------------------------------------
"""
AI-Powered Test Generator

Generates:
- Unit Tests
- Integration Tests
- Widget Tests (Flutter)
- Component Tests (React)
- API Tests
- Mock Services
- Test Fixtures
- Coverage Reports
"""
from .test_generator import test_generator
from .test_routes import router

__all__ = ["test_generator", "router"]
