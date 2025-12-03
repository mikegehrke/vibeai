# -------------------------------------------------------------
# VIBEAI – TEST GENERATOR API ROUTES
# -------------------------------------------------------------
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .test_generator import (
    test_generator,
    Framework,
    TestType,
    TestCase
)

router = APIRouter(prefix="/test-gen", tags=["AI Test Generator"])


# ========== PYDANTIC MODELS ==========

class GenerateTestsRequest(BaseModel):
    """Generate tests request"""
    code: str = Field(..., description="Source code to test")
    framework: str = Field(..., description="Framework (python, react, flutter, etc)")
    test_types: List[str] = Field(
        default=["unit"],
        description="Test types (unit, integration, widget, component)"
    )
    target_coverage: int = Field(default=80, description="Target coverage %")
    write_files: bool = Field(default=True, description="Write files to disk")
    base_path: str = Field(default="/tmp/generated_tests", description="Base path for tests")


class AnalyzeCodeRequest(BaseModel):
    """Analyze code request"""
    code: str
    framework: str


class GenerateMocksRequest(BaseModel):
    """Generate mocks request"""
    dependencies: List[str]
    framework: str


# ========== ENDPOINTS ==========

@router.post("/generate")
async def generate_tests(request: GenerateTestsRequest):
    """
    🔹 GENERATE TESTS
    
    Generates comprehensive tests:
    - Unit tests for functions/methods
    - Widget tests for Flutter
    - Component tests for React
    - Integration tests for APIs
    - Mock services
    """
    try:
        # Convert framework string to enum
        framework_map = {
            "python": Framework.PYTHON,
            "react": Framework.REACT,
            "react_native": Framework.REACT_NATIVE,
            "flutter": Framework.FLUTTER,
            "vue": Framework.VUE,
            "nextjs": Framework.NEXTJS,
            "nodejs": Framework.NODEJS,
            "django": Framework.DJANGO,
            "fastapi": Framework.FASTAPI
        }
        
        framework = framework_map.get(request.framework.lower())
        if not framework:
            raise ValueError(f"Unsupported framework: {request.framework}")
        
        # Convert test types
        test_type_map = {
            "unit": TestType.UNIT,
            "integration": TestType.INTEGRATION,
            "widget": TestType.WIDGET,
            "component": TestType.COMPONENT,
            "api": TestType.API,
            "e2e": TestType.E2E
        }
        
        test_types = [
            test_type_map[t] for t in request.test_types
            if t in test_type_map
        ]
        
        # Generate tests
        tests = test_generator.generate_tests(
            code=request.code,
            framework=framework,
            test_types=test_types,
            target_coverage=request.target_coverage
        )
        
        # Write files if requested
        write_result = None
        if request.write_files:
            write_result = test_generator.write_test_files(
                tests,
                request.base_path
            )
        
        return {
            "success": True,
            "framework": request.framework,
            "test_count": len(tests),
            "tests": [
                {
                    "test_name": t.test_name,
                    "test_type": t.test_type.value,
                    "file_path": t.file_path,
                    "code": t.code,
                    "imports": t.imports
                }
                for t in tests
            ],
            "write_result": write_result
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Test generation failed: {str(e)}"
        )


@router.post("/analyze")
async def analyze_code(request: AnalyzeCodeRequest):
    """
    🔹 ANALYZE CODE
    
    Analyzes code for testability:
    - Functions/methods
    - Components/widgets
    - Complexity
    - Testability score
    """
    try:
        framework_map = {
            "python": Framework.PYTHON,
            "react": Framework.REACT,
            "flutter": Framework.FLUTTER,
            "vue": Framework.VUE
        }
        
        framework = framework_map.get(request.framework.lower())
        if not framework:
            raise ValueError(f"Unsupported framework: {request.framework}")
        
        analysis = test_generator.analyze_code(request.code, framework)
        
        return {
            "success": True,
            "framework": request.framework,
            "analysis": analysis
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Code analysis failed: {str(e)}"
        )


@router.post("/generate-mocks")
async def generate_mocks(request: GenerateMocksRequest):
    """
    🔹 GENERATE MOCKS
    
    Generates mock services for testing
    """
    try:
        framework_map = {
            "python": Framework.PYTHON,
            "react": Framework.REACT,
            "nodejs": Framework.NODEJS
        }
        
        framework = framework_map.get(request.framework.lower())
        if not framework:
            raise ValueError(f"Unsupported framework: {request.framework}")
        
        mocks = test_generator.generate_mocks(
            request.dependencies,
            framework
        )
        
        return {
            "success": True,
            "framework": request.framework,
            "mocks": mocks
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Mock generation failed: {str(e)}"
        )


@router.get("/frameworks")
async def get_supported_frameworks():
    """
    🔹 SUPPORTED FRAMEWORKS
    
    List all supported frameworks
    """
    return {
        "success": True,
        "frameworks": [
            {
                "id": "python",
                "name": "Python",
                "test_framework": "pytest",
                "supports": ["unit", "integration", "api"]
            },
            {
                "id": "react",
                "name": "React",
                "test_framework": "jest",
                "supports": ["unit", "component", "integration"]
            },
            {
                "id": "flutter",
                "name": "Flutter",
                "test_framework": "flutter_test",
                "supports": ["unit", "widget", "integration"]
            },
            {
                "id": "react_native",
                "name": "React Native",
                "test_framework": "jest",
                "supports": ["unit", "component"]
            },
            {
                "id": "vue",
                "name": "Vue",
                "test_framework": "vitest",
                "supports": ["unit", "component"]
            }
        ]
    }


@router.get("/test-types")
async def get_test_types():
    """
    🔹 TEST TYPES
    
    List all test types
    """
    return {
        "success": True,
        "test_types": [
            {
                "id": "unit",
                "name": "Unit Tests",
                "description": "Test individual functions and methods"
            },
            {
                "id": "integration",
                "name": "Integration Tests",
                "description": "Test API endpoints and service integration"
            },
            {
                "id": "widget",
                "name": "Widget Tests",
                "description": "Test Flutter widgets"
            },
            {
                "id": "component",
                "name": "Component Tests",
                "description": "Test React/Vue components"
            },
            {
                "id": "api",
                "name": "API Tests",
                "description": "Test REST/GraphQL APIs"
            },
            {
                "id": "e2e",
                "name": "E2E Tests",
                "description": "End-to-end testing"
            }
        ]
    }


@router.get("/templates/{framework}")
async def get_test_templates(framework: str):
    """
    🔹 TEST TEMPLATES
    
    Get test templates for framework
    """
    templates = {
        "python": {
            "unit": """
import pytest

def test_function_name():
    # Arrange
    input_value = "test"
    
    # Act
    result = function_name(input_value)
    
    # Assert
    assert result is not None
""",
            "integration": """
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_api_endpoint():
    response = client.get("/api/resource")
    assert response.status_code == 200
"""
        },
        "react": {
            "component": """
import { render, screen } from '@testing-library/react';
import Component from './Component';

test('renders component', () => {
  render(<Component />);
  const element = screen.getByText(/Component/i);
  expect(element).toBeInTheDocument();
});
"""
        },
        "flutter": {
            "widget": """
import 'package:flutter_test/flutter_test.dart';
import 'package:your_app/widget.dart';

void main() {
  testWidgets('Widget test', (WidgetTester tester) async {
    await tester.pumpWidget(MyWidget());
    expect(find.byType(MyWidget), findsOneWidget);
  });
}
"""
        }
    }
    
    return {
        "success": True,
        "framework": framework,
        "templates": templates.get(framework, {})
    }


@router.get("/health")
async def health_check():
    """
    🔹 HEALTH CHECK
    """
    return {
        "status": "healthy",
        "service": "AI Test Generator",
        "version": "1.0.0"
    }
