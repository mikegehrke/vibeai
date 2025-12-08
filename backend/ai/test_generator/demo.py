#!/usr/bin/env python3
"""
AI Test Generator - Demo Script
Zeigt alle Funktionen des Test Generators
"""

from ai.test_generator.test_generator import Framework, TestGenerator, TestType


def demo_python_tests():
    """Demo: Python Unit Tests generieren"""
    print("=" * 60)
    print("🐍 DEMO 1: Python Unit Tests")
    print("=" * 60)

    code = """
async def fetch_user(user_id: int):
    '''Fetch user from database'''
    if not user_id:
        raise ValueError("Invalid user_id")
    return {"id": user_id, "name": "John"}

def calculate_total(items, tax_rate=0.1):
    '''Calculate total with tax'''
    subtotal = sum(item['price'] for item in items)
    return subtotal * (1 + tax_rate)
"""

    generator = TestGenerator()
    tests = generator.generate_tests(
        code=code,
        framework=Framework.PYTHON,
        test_types=[TestType.UNIT],
        target_coverage=80,
    )

    print(f"\n✅ Generiert: {len(tests)} Tests\n")
    for test in tests:
        print(f"📝 {test.test_name}")
        print("-" * 60)
        print(test.code[:300], "...\n")


def demo_react_component_tests():
    """Demo: React Component Tests generieren"""
    print("=" * 60)
    print("⚛️ DEMO 2: React Component Tests")
    print("=" * 60)

    code = """
import React, { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
"""

    generator = TestGenerator()
    tests = generator.generate_tests(
        code=code,
        framework=Framework.REACT,
        test_types=[TestType.COMPONENT],
        target_coverage=80,
    )

    print(f"\n✅ Generiert: {len(tests)} Tests\n")
    for test in tests:
        print(f"📝 {test.test_name}")
        print("-" * 60)
        print(test.code[:400], "...\n")


def demo_flutter_widget_tests():
    """Demo: Flutter Widget Tests generieren"""
    print("=" * 60)
    print("📱 DEMO 3: Flutter Widget Tests")
    print("=" * 60)

    code = """
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  Future<void> _handleLogin() async {
    final email = _emailController.text;
    final password = _passwordController.text;

    final response = await http.post(
      Uri.parse('/api/login'),
      body: {'email': email, 'password': password}
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Column(
        children: [
          TextField(controller: _emailController),
          TextField(controller: _passwordController, obscureText: true),
          ElevatedButton(onPressed: _handleLogin, child: Text('Login'))
        ]
      )
    );
  }
}
"""

    generator = TestGenerator()
    tests = generator.generate_tests(
        code=code,
        framework=Framework.FLUTTER,
        test_types=[TestType.WIDGET],
        target_coverage=80,
    )

    print(f"\n✅ Generiert: {len(tests)} Tests\n")
    for test in tests:
        print(f"📝 {test.test_name}")
        print("-" * 60)
        print(test.code[:400], "...\n")


def demo_code_analysis():
    """Demo: Code Analysis"""
    print("=" * 60)
    print("🔍 DEMO 4: Code Analysis")
    print("=" * 60)

    code = """
class UserService:
    def __init__(self, db):
        self.db = db

    async def get_user(self, user_id):
        return await self.db.fetch_one("SELECT * FROM users WHERE id = ?", user_id)

    async def create_user(self, email, password):
        return await self.db.execute("INSERT INTO users VALUES (?, ?)", email, password)
"""

    generator = TestGenerator()
    analysis = generator.analyze_code(code, Framework.PYTHON)

    print(f"\n📊 Analyse Ergebnisse:")
    print(f"   Funktionen: {len(analysis['functions'])}")
    print(f"   Klassen: {len(analysis['classes'])}")
    print(f"   Komplexität: {analysis['complexity']}")
    print(f"   Testability Score: {analysis['testability_score']:.0f}/100")

    print(f"\n🔍 Gefundene Funktionen:")
    for func in analysis["functions"]:
        async_marker = "async " if func.is_async else ""
        print(f"   - {async_marker}{func.name}({', '.join(func.params)})")


def demo_mock_generation():
    """Demo: Mock Services generieren"""
    print("=" * 60)
    print("🎭 DEMO 5: Mock Service Generation")
    print("=" * 60)

    dependencies = ["ApiService", "DatabaseService", "CacheService"]

    generator = TestGenerator()
    mocks = generator.generate_mocks(dependencies, Framework.PYTHON)

    print(f"\n✅ Generiert Mocks für: {', '.join(dependencies)}\n")
    print(mocks[:500], "...\n")


def main():
    """Run all demos"""
    print("\n")
    print("🧪" * 30)
    print(" AI TEST GENERATOR - DEMO SCRIPT")
    print("🧪" * 30)
    print("\n")

    demos = [
        demo_python_tests,
        demo_react_component_tests,
        demo_flutter_widget_tests,
        demo_code_analysis,
        demo_mock_generation,
    ]

    for demo in demos:
        try:
            demo()
            print("\n")
        except Exception as e:
            print(f"❌ Error in {demo.__name__}: {e}\n")

    print("=" * 60)
    print("✅ ALLE DEMOS ABGESCHLOSSEN")
    print("=" * 60)
    print("\n📊 System Stats:")
    print("   - 9 Frameworks unterstützt")
    print("   - 6 Test Types")
    print("   - 5 Test Frameworks (pytest, jest, flutter_test, vitest)")
    print("   - Automatische Code-Analyse")
    print("   - Mock-Generierung")
    print("   - File Writing")
    print("\n🚀 Bereit für Production!\n")


if __name__ == "__main__":
    main()