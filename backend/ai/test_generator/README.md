# 🧪 AI Test Generator - Block 33

**Automatische Test-Generierung für alle Frameworks**

## 🎯 Features

### ✅ Test Types
- **Unit Tests** - Funktionen, Methoden, Klassen
- **Integration Tests** - API Endpoints, Service Integration  
- **Widget Tests** - Flutter UI Components
- **Component Tests** - React/Vue Components
- **API Tests** - REST/GraphQL Endpoints
- **E2E Tests** - End-to-End Flows

### 🚀 Supported Frameworks

| Framework | Test Framework | Test Types |
|-----------|---------------|------------|
| Python | pytest | Unit, Integration, API |
| React | jest + @testing-library/react | Unit, Component, Integration |
| React Native | jest | Unit, Component |
| Flutter | flutter_test | Unit, Widget, Integration |
| Vue | vitest | Unit, Component |
| Next.js | jest | Unit, Component |
| Node.js | jest | Unit, Integration |
| Django | pytest | Unit, Integration |
| FastAPI | pytest + TestClient | Unit, Integration, API |

## 📊 Code Analysis

### Testability Scoring (0-100)
```python
score = 100
- Penalize: >200 lines (-20), global state (-15), >10 imports (-10)
+ Reward: pure functions (+10)
= Result: 0-100
```

### Framework Detection
- **Python**: Async/sync functions, classes, parameters
- **React**: Components (capitalized), functions (lowercase)
- **Flutter**: Widgets extending Stateless/StatefulWidget
- **Vue**: Components, methods from methods section

## 🧪 Generated Test Examples

### Python Unit Test
```python
@pytest.mark.asyncio
async def test_fetch_data_success():
    # Arrange
    url = 'https://api.example.com/data'
    
    # Act
    result = await fetch_data(url)
    
    # Assert
    assert result is not None
    assert 'data' in result


def test_calculate_error_handling():
    with pytest.raises(ValueError):
        calculate("invalid_input")
```

### React Component Test
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../components/LoginForm';

describe('LoginForm', () => {
  test('renders without crashing', () => {
    render(<LoginForm />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
  
  test('handles user interactions', () => {
    render(<LoginForm />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
  });
  
  test('handles form input', () => {
    render(<LoginForm />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input.value).toBe('test@example.com');
  });
});
```

### Flutter Widget Test
```dart
void main() {
  testWidgets('LoginWidget renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(home: LoginWidget()));
    expect(find.byType(LoginWidget), findsOneWidget);
  });
  
  testWidgets('handles form input', (tester) async {
    await tester.pumpWidget(MaterialApp(home: LoginWidget()));
    
    final textField = find.byType(TextField).first;
    await tester.enterText(textField, 'test@example.com');
    await tester.pump();
    
    expect(find.text('test@example.com'), findsOneWidget);
    
    await tester.tap(find.text('Login'));
    await tester.pump();
    
    expect(find.text('Welcome'), findsOneWidget);
  });
}
```

### FastAPI Integration Test
```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_api_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_user():
    payload = {
        "email": "test@example.com",
        "password": "secure123"
    }
    response = client.post("/api/users", json=payload)
    assert response.status_code == 201
    assert "id" in response.json()
```

## 🎯 API Endpoints

### POST /test-gen/generate
Generate comprehensive tests
```json
{
  "code": "def calculate(x, y): return x + y",
  "framework": "python",
  "test_types": ["unit"],
  "target_coverage": 80,
  "write_files": true,
  "base_path": "/tmp/tests"
}
```

**Response:**
```json
{
  "success": true,
  "test_count": 3,
  "tests": [...],
  "write_result": {
    "success": true,
    "written_files": ["/tmp/tests/test_calculate.py"],
    "total_tests": 3
  }
}
```

### POST /test-gen/analyze
Analyze code testability
```json
{
  "code": "class LoginForm extends React.Component {...}",
  "framework": "react"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "components": ["LoginForm"],
    "functions": [],
    "complexity": 5,
    "testability_score": 85
  }
}
```

### POST /test-gen/generate-mocks
Generate mock services
```json
{
  "dependencies": ["ApiService", "DatabaseService"],
  "framework": "python"
}
```

**Response:**
```json
{
  "success": true,
  "mocks": "# pytest fixtures\n@pytest.fixture\ndef mock_api_service():\n    mock = MagicMock()\n    return mock"
}
```

### GET /test-gen/frameworks
List supported frameworks
```json
{
  "success": true,
  "frameworks": [
    {
      "id": "python",
      "name": "Python",
      "test_framework": "pytest",
      "supports": ["unit", "integration", "api"]
    }
  ]
}
```

### GET /test-gen/test-types
List available test types
```json
{
  "success": true,
  "test_types": [
    {
      "id": "unit",
      "name": "Unit Tests",
      "description": "Test individual functions and methods"
    }
  ]
}
```

### GET /test-gen/templates/{framework}
Get test templates
```json
{
  "success": true,
  "framework": "python",
  "templates": {
    "unit": "def test_function():\n    # Arrange\n    # Act\n    # Assert",
    "integration": "def test_api():\n    response = client.get('/api')\n    assert response.status_code == 200"
  }
}
```

## 🎨 UI Features (TestPanel)

### Framework Selection
- 5 framework buttons (Python, React, Flutter, React Native, Vue)
- Visual active state
- Framework-specific icons

### Test Type Selection
- 6 test type checkboxes
- Multi-select support
- Framework-specific filtering (Widget tests only for Flutter)

### Code Editor
- Syntax highlighting
- "Load Example" button for quick start
- Framework-specific examples

### Coverage Target
- Slider: 50% - 100%
- Live percentage display

### Analysis Display
- Complexity score
- Testability score (color-coded)
- Detected functions/components/widgets count

### Generated Tests
- Syntax-highlighted code display
- Test type badges
- File path display
- "Download All Tests" button

## 🚀 Usage Examples

### 1. Generate Tests for Python Function
```python
# POST /test-gen/generate
{
  "code": """
async def fetch_user(user_id: int, db):
    user = await db.fetch_one("SELECT * FROM users WHERE id = ?", user_id)
    if not user:
        raise ValueError("User not found")
    return user
  """,
  "framework": "python",
  "test_types": ["unit"],
  "target_coverage": 80
}
```

### 2. Analyze React Component
```python
# POST /test-gen/analyze
{
  "code": """
function LoginForm() {
  const [email, setEmail] = useState('');
  return <form><input value={email} /></form>;
}
  """,
  "framework": "react"
}
```

### 3. Generate Flutter Widget Tests
```python
# POST /test-gen/generate
{
  "code": """
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}
  """,
  "framework": "flutter",
  "test_types": ["widget"]
}
```

## 📦 Installation

### Backend Requirements
```bash
# Already included in backend/requirements.txt
# No additional dependencies needed
```

### Frontend Dependencies
```bash
cd studio
npm install react-syntax-highlighter
```

## 🧪 Testing the Test Generator

```bash
cd backend
python3 -c "from ai.test_generator import test_generator; print('✅ Import successful')"
```

## 🎯 Integration Status

✅ **Backend:**
- test_generator.py (880 lines)
- test_routes.py (340 lines)
- Registered in main.py

✅ **Frontend:**
- TestPanel.jsx (440+ lines)
- TestPanel.css (500+ lines)
- Integrated in App.jsx

✅ **API Endpoints:** 6 endpoints active

## 🔥 Key Innovations

1. **Multi-Framework Support** - 9 frameworks, 1 API
2. **Intelligent Analysis** - Testability scoring, complexity detection
3. **Real Test Generation** - Not templates, real analyzed tests
4. **Mock Auto-Generation** - Framework-specific mocks
5. **File Writing** - Tests written to disk automatically
6. **Interactive UI** - Live code analysis, syntax highlighting

## 📊 System Stats

- **Lines of Code:** 1,820+ (test_generator.py: 880, test_routes.py: 340, TestPanel: 940)
- **API Endpoints:** 6
- **Frameworks Supported:** 9
- **Test Types:** 6
- **Test Frameworks:** 5 (pytest, jest, flutter_test, vitest, TestClient)

## 🎨 Color Scheme

- Primary: #10b981 (Emerald Green)
- Secondary: #059669 (Darker Green)
- Accent: #34d399 (Light Green)
- Background: #ecfdf5 → #d1fae5 (Green Gradient)

**Unterschied zu anderen Panels:**
- Auth: Orange (#f97316)
- Database: Purple (#9333ea)
- Deploy: Blue (#3b82f6)
- Flow: Cyan (#06b6d4)
- Flowchart: Pink (#ec4899)
- **Test: Green (#10b981)** ✅ UNIQUE

---

**Block 33 Status: ✅ COMPLETE**

**Total System:** 16 AI Modules | 164+ API Endpoints | 72,000+ Lines of Code
