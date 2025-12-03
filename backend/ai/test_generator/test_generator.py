# -------------------------------------------------------------
# VIBEAI – AI TEST GENERATOR
# -------------------------------------------------------------
"""
Intelligent Test Generator

Features:
1. Unit Test Generation (Functions, Classes, Methods)
2. Integration Test Generation (API, Database, Services)
3. Widget/Component Test Generation (Flutter, React)
4. Mock Service Generation
5. Test Fixture Creation
6. Coverage Analysis
7. Framework Detection
8. Code Analysis for Testability
"""
import os
import re
import json
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Set
from enum import Enum


class TestType(Enum):
    """Test Type Classification"""
    UNIT = "unit"
    INTEGRATION = "integration"
    WIDGET = "widget"
    COMPONENT = "component"
    API = "api"
    E2E = "e2e"


class Framework(Enum):
    """Framework Detection"""
    FLUTTER = "flutter"
    REACT = "react"
    REACT_NATIVE = "react_native"
    VUE = "vue"
    NEXTJS = "nextjs"
    PYTHON = "python"
    NODEJS = "nodejs"
    DJANGO = "django"
    FASTAPI = "fastapi"


@dataclass
class Function:
    """Function/Method to test"""
    name: str
    params: List[str] = field(default_factory=list)
    return_type: Optional[str] = None
    is_async: bool = False
    is_class_method: bool = False
    class_name: Optional[str] = None
    docstring: Optional[str] = None


@dataclass
class TestCase:
    """Generated Test Case"""
    test_name: str
    test_type: TestType
    framework: Framework
    code: str
    file_path: str
    imports: List[str] = field(default_factory=list)
    mocks: List[str] = field(default_factory=list)
    fixtures: List[str] = field(default_factory=list)


class TestGenerator:
    """AI-Powered Test Generator"""
    
    def __init__(self):
        self.test_frameworks = {
            Framework.FLUTTER: "flutter_test",
            Framework.REACT: "jest",
            Framework.REACT_NATIVE: "jest",
            Framework.VUE: "vitest",
            Framework.PYTHON: "pytest",
            Framework.NODEJS: "jest",
            Framework.DJANGO: "pytest",
            Framework.FASTAPI: "pytest"
        }
    
    # ========== CODE ANALYSIS ==========
    
    def analyze_code(self, code: str, framework: Framework) -> Dict[str, Any]:
        """Analyze code for testability"""
        analysis = {
            "functions": [],
            "classes": [],
            "components": [],
            "api_endpoints": [],
            "complexity": 0,
            "testability_score": 0
        }
        
        if framework == Framework.PYTHON:
            analysis = self._analyze_python_code(code)
        elif framework in [Framework.REACT, Framework.REACT_NATIVE]:
            analysis = self._analyze_react_code(code)
        elif framework == Framework.FLUTTER:
            analysis = self._analyze_flutter_code(code)
        elif framework == Framework.VUE:
            analysis = self._analyze_vue_code(code)
        
        return analysis
    
    def _analyze_python_code(self, code: str) -> Dict[str, Any]:
        """Analyze Python code"""
        functions = []
        classes = []
        
        # Find functions
        func_pattern = r'(?:async\s+)?def\s+(\w+)\s*\((.*?)\)'
        for match in re.finditer(func_pattern, code):
            is_async = 'async' in code[:match.start()].split('\n')[-1]
            params = [p.strip().split(':')[0].strip() 
                     for p in match.group(2).split(',') if p.strip()]
            
            functions.append(Function(
                name=match.group(1),
                params=params,
                is_async=is_async,
                is_class_method=False
            ))
        
        # Find classes
        class_pattern = r'class\s+(\w+)'
        for match in re.finditer(class_pattern, code):
            classes.append(match.group(1))
        
        return {
            "functions": functions,
            "classes": classes,
            "complexity": len(functions) + len(classes),
            "testability_score": self._calculate_testability(code)
        }
    
    def _analyze_react_code(self, code: str) -> Dict[str, Any]:
        """Analyze React code"""
        components = []
        functions = []
        
        # Find components
        component_patterns = [
            r'function\s+(\w+)\s*\(',
            r'const\s+(\w+)\s*=\s*\(',
            r'export\s+default\s+function\s+(\w+)'
        ]
        
        for pattern in component_patterns:
            for match in re.finditer(pattern, code):
                name = match.group(1)
                if name[0].isupper():  # Component names are capitalized
                    components.append(name)
                else:
                    functions.append(Function(name=name))
        
        return {
            "components": components,
            "functions": [f.name for f in functions],
            "complexity": len(components) + len(functions),
            "testability_score": self._calculate_testability(code)
        }
    
    def _analyze_flutter_code(self, code: str) -> Dict[str, Any]:
        """Analyze Flutter code"""
        widgets = []
        methods = []
        
        # Find widgets
        widget_pattern = r'class\s+(\w+)\s+extends\s+(?:Stateless|Stateful)Widget'
        for match in re.finditer(widget_pattern, code):
            widgets.append(match.group(1))
        
        # Find methods
        method_pattern = r'(?:Future<\w+>|void|\w+)\s+(\w+)\s*\('
        for match in re.finditer(method_pattern, code):
            methods.append(match.group(1))
        
        return {
            "widgets": widgets,
            "methods": methods,
            "complexity": len(widgets) + len(methods),
            "testability_score": self._calculate_testability(code)
        }
    
    def _analyze_vue_code(self, code: str) -> Dict[str, Any]:
        """Analyze Vue code"""
        components = []
        methods = []
        
        # Find component name
        name_pattern = r'name:\s*[\'"](\w+)[\'"]'
        match = re.search(name_pattern, code)
        if match:
            components.append(match.group(1))
        
        # Find methods
        methods_section = re.search(r'methods:\s*{([^}]+)}', code, re.DOTALL)
        if methods_section:
            method_pattern = r'(\w+)\s*\('
            for match in re.finditer(method_pattern, methods_section.group(1)):
                methods.append(match.group(1))
        
        return {
            "components": components,
            "methods": methods,
            "complexity": len(components) + len(methods),
            "testability_score": self._calculate_testability(code)
        }
    
    def _calculate_testability(self, code: str) -> float:
        """Calculate testability score (0-100)"""
        score = 100
        
        # Penalize complexity
        lines = code.split('\n')
        if len(lines) > 200:
            score -= 20
        
        # Penalize global state
        if 'global ' in code or 'window.' in code:
            score -= 15
        
        # Reward pure functions
        if 'return ' in code and 'self.' not in code:
            score += 10
        
        # Penalize tight coupling
        if code.count('import ') > 10:
            score -= 10
        
        return max(0, min(100, score))
    
    # ========== TEST GENERATION ==========
    
    def generate_tests(
        self,
        code: str,
        framework: Framework,
        test_types: List[TestType],
        target_coverage: int = 80
    ) -> List[TestCase]:
        """Generate comprehensive tests"""
        tests = []
        
        # Analyze code
        analysis = self.analyze_code(code, framework)
        
        # Generate unit tests
        if TestType.UNIT in test_types:
            if framework == Framework.PYTHON:
                tests.extend(self._generate_python_unit_tests(analysis, code))
            elif framework in [Framework.REACT, Framework.REACT_NATIVE]:
                tests.extend(self._generate_react_unit_tests(analysis, code))
            elif framework == Framework.FLUTTER:
                tests.extend(self._generate_flutter_unit_tests(analysis, code))
        
        # Generate component/widget tests
        if TestType.WIDGET in test_types and framework == Framework.FLUTTER:
            tests.extend(self._generate_flutter_widget_tests(analysis, code))
        
        if TestType.COMPONENT in test_types and framework in [Framework.REACT, Framework.REACT_NATIVE]:
            tests.extend(self._generate_react_component_tests(analysis, code))
        
        # Generate integration tests
        if TestType.INTEGRATION in test_types:
            tests.extend(self._generate_integration_tests(analysis, framework))
        
        return tests
    
    # ========== PYTHON TESTS ==========
    
    def _generate_python_unit_tests(self, analysis: Dict, code: str) -> List[TestCase]:
        """Generate Python unit tests"""
        tests = []
        
        for func in analysis.get("functions", []):
            test_code = self._create_python_function_test(func)
            
            tests.append(TestCase(
                test_name=f"test_{func.name}",
                test_type=TestType.UNIT,
                framework=Framework.PYTHON,
                code=test_code,
                file_path=f"tests/test_{func.name}.py",
                imports=[
                    "import pytest",
                    f"from your_module import {func.name}"
                ]
            ))
        
        return tests
    
    def _create_python_function_test(self, func: Function) -> str:
        """Create Python function test"""
        if func.is_async:
            return f"""
@pytest.mark.asyncio
async def test_{func.name}_success():
    \"\"\"Test {func.name} with valid input\"\"\"
    # Arrange
    {self._generate_test_params(func.params)}
    
    # Act
    result = await {func.name}({', '.join(func.params)})
    
    # Assert
    assert result is not None
    # Add specific assertions based on function behavior


@pytest.mark.asyncio
async def test_{func.name}_error_handling():
    \"\"\"Test {func.name} error handling\"\"\"
    # Arrange
    invalid_params = None
    
    # Act & Assert
    with pytest.raises(Exception):
        await {func.name}(invalid_params)
"""
        else:
            return f"""
def test_{func.name}_success():
    \"\"\"Test {func.name} with valid input\"\"\"
    # Arrange
    {self._generate_test_params(func.params)}
    
    # Act
    result = {func.name}({', '.join(func.params)})
    
    # Assert
    assert result is not None
    # Add specific assertions based on function behavior


def test_{func.name}_edge_cases():
    \"\"\"Test {func.name} edge cases\"\"\"
    # Test with None
    result = {func.name}(None)
    assert result is not None
    
    # Test with empty values
    # Add edge case tests


def test_{func.name}_error_handling():
    \"\"\"Test {func.name} error handling\"\"\"
    with pytest.raises(Exception):
        {func.name}("invalid_input")
"""
    
    def _generate_test_params(self, params: List[str]) -> str:
        """Generate test parameters"""
        if not params:
            return "# No parameters needed"
        
        param_lines = []
        for param in params:
            if param in ['self', 'cls']:
                continue
            param_lines.append(f"{param} = 'test_value'  # Replace with appropriate test value")
        
        return '\n    '.join(param_lines) if param_lines else "# No parameters needed"
    
    # ========== REACT TESTS ==========
    
    def _generate_react_unit_tests(self, analysis: Dict, code: str) -> List[TestCase]:
        """Generate React unit tests"""
        tests = []
        
        for func_name in analysis.get("functions", []):
            test_code = f"""
describe('{func_name}', () => {{
  test('should execute successfully', () => {{
    // Arrange
    const input = 'test_value';
    
    // Act
    const result = {func_name}(input);
    
    // Assert
    expect(result).toBeDefined();
  }});
  
  test('should handle edge cases', () => {{
    expect({func_name}(null)).toBeDefined();
    expect({func_name}('')).toBeDefined();
  }});
}});
"""
            
            tests.append(TestCase(
                test_name=f"{func_name}.test.js",
                test_type=TestType.UNIT,
                framework=Framework.REACT,
                code=test_code,
                file_path=f"tests/{func_name}.test.js",
                imports=[f"import {{ {func_name} }} from '../{func_name}';"]
            ))
        
        return tests
    
    def _generate_react_component_tests(self, analysis: Dict, code: str) -> List[TestCase]:
        """Generate React component tests"""
        tests = []
        
        for component in analysis.get("components", []):
            test_code = f"""
import {{ render, screen, fireEvent }} from '@testing-library/react';
import {component} from '../components/{component}';

describe('{component}', () => {{
  test('renders without crashing', () => {{
    render(<{component} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  }});
  
  test('displays correct content', () => {{
    render(<{component} />);
    // Add specific content checks
    const element = screen.getByText(/{component}/i);
    expect(element).toBeInTheDocument();
  }});
  
  test('handles user interactions', () => {{
    render(<{component} />);
    
    // Find interactive elements
    const button = screen.getByRole('button');
    
    // Simulate click
    fireEvent.click(button);
    
    // Assert state change or action
    // expect(...).toBe(...);
  }});
  
  test('handles props correctly', () => {{
    const testProp = 'test value';
    render(<{component} propName={{testProp}} />);
    
    expect(screen.getByText(testProp)).toBeInTheDocument();
  }});
}});
"""
            
            tests.append(TestCase(
                test_name=f"{component}.test.jsx",
                test_type=TestType.COMPONENT,
                framework=Framework.REACT,
                code=test_code,
                file_path=f"tests/components/{component}.test.jsx",
                imports=[
                    "import { render, screen, fireEvent } from '@testing-library/react';",
                    f"import {component} from '../components/{component}';"
                ]
            ))
        
        return tests
    
    # ========== FLUTTER TESTS ==========
    
    def _generate_flutter_unit_tests(self, analysis: Dict, code: str) -> List[TestCase]:
        """Generate Flutter unit tests"""
        tests = []
        
        for method in analysis.get("methods", [])[:3]:  # Limit to 3
            test_code = f"""
import 'package:flutter_test/flutter_test.dart';
import 'package:your_app/your_file.dart';

void main() {{
  group('{method}', () {{
    test('should execute successfully', () {{
      // Arrange
      final input = 'test_value';
      
      // Act
      final result = {method}(input);
      
      // Assert
      expect(result, isNotNull);
    }});
    
    test('should handle null values', () {{
      expect(() => {method}(null), throwsException);
    }});
    
    test('should handle edge cases', () {{
      final result = {method}('');
      expect(result, isNotNull);
    }});
  }});
}}
"""
            
            tests.append(TestCase(
                test_name=f"{method}_test.dart",
                test_type=TestType.UNIT,
                framework=Framework.FLUTTER,
                code=test_code,
                file_path=f"test/{method}_test.dart",
                imports=["import 'package:flutter_test/flutter_test.dart';"]
            ))
        
        return tests
    
    def _generate_flutter_widget_tests(self, analysis: Dict, code: str) -> List[TestCase]:
        """Generate Flutter widget tests"""
        tests = []
        
        for widget in analysis.get("widgets", []):
            test_code = f"""
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:your_app/widgets/{widget.lower()}.dart';

void main() {{
  testWidgets('{widget} renders correctly', (WidgetTester tester) async {{
    // Build the widget
    await tester.pumpWidget(
      MaterialApp(
        home: {widget}(),
      ),
    );
    
    // Verify widget is present
    expect(find.byType({widget}), findsOneWidget);
  }});
  
  testWidgets('{widget} handles user interaction', (WidgetTester tester) async {{
    // Build the widget
    await tester.pumpWidget(
      MaterialApp(
        home: {widget}(),
      ),
    );
    
    // Find interactive elements
    final button = find.byType(ElevatedButton);
    
    // Tap the button
    await tester.tap(button);
    await tester.pump();
    
    // Verify state change
    // expect(find.text('Expected Text'), findsOneWidget);
  }});
  
  testWidgets('{widget} displays correct text', (WidgetTester tester) async {{
    await tester.pumpWidget(
      MaterialApp(
        home: {widget}(),
      ),
    );
    
    // Verify text is displayed
    expect(find.text('{widget}'), findsOneWidget);
  }});
  
  testWidgets('{widget} handles form input', (WidgetTester tester) async {{
    await tester.pumpWidget(
      MaterialApp(
        home: {widget}(),
      ),
    );
    
    // Find text fields
    final textField = find.byType(TextField).first;
    
    // Enter text
    await tester.enterText(textField, 'test@example.com');
    await tester.pump();
    
    // Verify input
    expect(find.text('test@example.com'), findsOneWidget);
  }});
}}
"""
            
            tests.append(TestCase(
                test_name=f"{widget.lower()}_test.dart",
                test_type=TestType.WIDGET,
                framework=Framework.FLUTTER,
                code=test_code,
                file_path=f"test/widgets/{widget.lower()}_test.dart",
                imports=[
                    "import 'package:flutter/material.dart';",
                    "import 'package:flutter_test/flutter_test.dart';"
                ]
            ))
        
        return tests
    
    # ========== INTEGRATION TESTS ==========
    
    def _generate_integration_tests(self, analysis: Dict, framework: Framework) -> List[TestCase]:
        """Generate integration tests"""
        tests = []
        
        if framework == Framework.PYTHON:
            test_code = """
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_api_health():
    \"\"\"Test API health endpoint\"\"\"
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_resource():
    \"\"\"Test resource creation\"\"\"
    payload = {
        "name": "Test Resource",
        "description": "Test Description"
    }
    response = client.post("/api/resources", json=payload)
    assert response.status_code == 201
    assert response.json()["name"] == payload["name"]


def test_get_resource():
    \"\"\"Test resource retrieval\"\"\"
    response = client.get("/api/resources/1")
    assert response.status_code == 200
    assert "id" in response.json()


def test_update_resource():
    \"\"\"Test resource update\"\"\"
    payload = {"name": "Updated Name"}
    response = client.put("/api/resources/1", json=payload)
    assert response.status_code == 200


def test_delete_resource():
    \"\"\"Test resource deletion\"\"\"
    response = client.delete("/api/resources/1")
    assert response.status_code == 204
"""
            
            tests.append(TestCase(
                test_name="test_integration_api",
                test_type=TestType.INTEGRATION,
                framework=framework,
                code=test_code,
                file_path="tests/test_integration_api.py",
                imports=["import pytest", "from fastapi.testclient import TestClient"]
            ))
        
        return tests
    
    # ========== MOCK GENERATION ==========
    
    def generate_mocks(self, dependencies: List[str], framework: Framework) -> str:
        """Generate mock services"""
        if framework == Framework.PYTHON:
            return self._generate_python_mocks(dependencies)
        elif framework in [Framework.REACT, Framework.REACT_NATIVE]:
            return self._generate_react_mocks(dependencies)
        else:
            return ""
    
    def _generate_python_mocks(self, dependencies: List[str]) -> str:
        """Generate Python mocks"""
        mocks = []
        
        for dep in dependencies:
            mock = f"""
@pytest.fixture
def mock_{dep.lower()}():
    \"\"\"Mock {dep} service\"\"\"
    mock = MagicMock()
    mock.get.return_value = {{"status": "success"}}
    mock.post.return_value = {{"id": 1}}
    return mock
"""
            mocks.append(mock)
        
        return "\n".join(mocks)
    
    def _generate_react_mocks(self, dependencies: List[str]) -> str:
        """Generate React mocks"""
        mocks = []
        
        for dep in dependencies:
            mock = f"""
jest.mock('../services/{dep}', () => ({{
  get: jest.fn(() => Promise.resolve({{ data: 'mock data' }})),
  post: jest.fn(() => Promise.resolve({{ success: true }})),
  put: jest.fn(() => Promise.resolve({{ success: true }})),
  delete: jest.fn(() => Promise.resolve({{ success: true }}))
}}));
"""
            mocks.append(mock)
        
        return "\n".join(mocks)
    
    # ========== FILE WRITING ==========
    
    def write_test_files(self, tests: List[TestCase], base_path: str) -> Dict[str, Any]:
        """Write test files to disk"""
        written_files = []
        errors = []
        
        for test in tests:
            try:
                file_path = os.path.join(base_path, test.file_path)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                # Combine imports and code
                full_code = "\n".join(test.imports) + "\n\n" + test.code
                
                with open(file_path, 'w') as f:
                    f.write(full_code)
                
                written_files.append(file_path)
            except Exception as e:
                errors.append({"file": test.file_path, "error": str(e)})
        
        return {
            "success": len(errors) == 0,
            "written_files": written_files,
            "errors": errors,
            "total_tests": len(tests)
        }


# Global instance
test_generator = TestGenerator()
