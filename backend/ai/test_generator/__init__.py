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
from .test_generator import TestGenerator
from .test_routes import Router

__all__ = ["TestGenerator", "Router"]