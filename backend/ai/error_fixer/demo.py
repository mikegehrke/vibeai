#!/usr/bin/env python3
"""
AI Error Fixer - Demo Script
Zeigt alle Funktionen des Error Fixers
"""

from ai.error_fixer.error_fixer import ErrorFixer, Framework


def demo_react_errors():
    """Demo: React Build-Fehler analysieren"""
    print("=" * 60)
    print("⚛️ DEMO 1: React Build-Log Analysis")
    print("=" * 60)

    build_log = """
Module not found: Error: Can't resolve './components/Header' in '/src/pages'
  > 1 | import Header from './components/Header';
    |                        ^^^^^^^^^^^^^^^^^^^^

'userName' is not defined  no-undef
  Line 23:5:  'userName' is not defined  no-undef

Failed to compile.

./src/App.js
  Line 45:18:  'handleClick' is not a function  TypeError

Cannot read property 'email' of undefined
  at UserProfile (src/components/UserProfile.js:12:5)
"""

    fixer = ErrorFixer()
    errors = fixer.parse_build_log(build_log, Framework.REACT)

    print(f"\n🔍 Gefundene Fehler: {len(errors)}\n")
    for i, error in enumerate(errors, 1):
        print(f"{i}. {error.error_type.value}")
        print(f"   📁 {error.file_path or 'unknown'}")
        print(f"   💬 {error.message[:80]}...")
        print(f"   💡 {error.suggestion}\n")


def demo_python_errors():
    """Demo: Python Fehler analysieren"""
    print("=" * 60)
    print("🐍 DEMO 2: Python Error Analysis")
    print("=" * 60)

    build_log = """
Traceback (most recent call last):
  File "app.py", line 5, in <module>
    from models import User
ModuleNotFoundError: No module named 'models'

  File "main.py", line 12, in get_user
    user_data = user_id.split('@')
NameError: name 'user_id' is not defined

TypeError: unsupported operand type(s) for +: 'int' and 'str'
  File "utils.py", line 45, in calculate_total
"""

    fixer = ErrorFixer()
    errors = fixer.parse_build_log(build_log, Framework.PYTHON)

    print(f"\n🔍 Gefundene Fehler: {len(errors)}\n")
    for error in errors:
        print(f"🐛 {error.error_type.value}")
        print(f"   Severity: {error.severity.value}")
        print(f"   Message: {error.message[:100]}")

        # Generiere Fix
        fix = fixer.generate_fix(error)
        if fix:
            print(f"\n   ✅ Generated Fix:")
            print(f"      {fix.explanation}")
            print(f"      Code: {fix.fixed_code[:80]}")
            print(f"      Confidence: {fix.confidence * 100:.0f}%\n")


def demo_flutter_errors():
    """Demo: Flutter Widget-Fehler"""
    print("=" * 60)
    print("📱 DEMO 3: Flutter Error Analysis")
    print("=" * 60)

    build_log = """
[ERROR:flutter/lib/ui/ui_dart_state.cc] Unhandled Exception: NoSuchMethodError: The getter 'email' isn't defined for the class 'User'.

lib/screens/login_screen.dart:45:12: Error: The argument type 'String' can't be assigned to the parameter type 'int'.
    _handleLogin(email);
               ^

lib/widgets/user_card.dart:23:5: Error: Undefined name 'userName'.
    Text(userName),
         ^^^^^^^^

lib/models/user.dart:18:3: Error: Missing required argument 'id'.
"""

    fixer = ErrorFixer()
    errors = fixer.parse_build_log(build_log, Framework.FLUTTER)

    print(f"\n🔍 Gefundene Fehler: {len(errors)}\n")
    for error in errors:
        print(f"📱 {error.error_type.value} - {error.severity.value}")
        print(f"   File: {error.file_path}")
        print(f"   Line: {error.line_number}")
        print(f"   {error.message[:120]}")
        print()


def demo_auto_fix():
    """Demo: Automatisches Fixen"""
    print("=" * 60)
    print("⚡ DEMO 4: Auto-Fix Workflow")
    print("=" * 60)

    build_log = """
Module not found: Error: Can't resolve 'react-router-dom'
'useState' is not defined
TypeError: Cannot read property 'map' of undefined
"""

    fixer = ErrorFixer()
    result = fixer.analyze_and_fix(build_log=build_log, framework=Framework.REACT, base_path="/tmp/demo")

    print(f"\n📊 Analysis Results:")
    print(f"   Total Errors: {result['total_errors']}")
    print(f"   Fixable: {result['fixable_errors']}")
    print(f"   Applied: {result['applied_fixes']}")
    print(f"   Success Rate: {result['success_rate'] * 100:.0f}%")

    print(f"\n✅ Generated Fixes:")
    for i, fix in enumerate(result["fixes"], 1):
        print(f"\n{i}. {fix['explanation']}")
        print(f"   File: {fix['file']}:{fix['line']}")
        print(f"   Code: {fix['fixed'][:100]}")
        print(f"   Confidence: {fix['confidence'] * 100:.0f}%")


def demo_typescript_errors():
    """Demo: TypeScript Fehler"""
    print("=" * 60)
    print("📘 DEMO 5: TypeScript Error Analysis")
    print("=" * 60)

    build_log = """
src/components/Header.tsx(12,5): error TS2304: Cannot find name 'userName'.
src/utils/api.ts(45,3): error TS2339: Property 'email' does not exist on type 'User'.
src/types/index.ts(8,14): error TS2322: Type 'string' is not assignable to type 'number'.
src/App.tsx(23,10): error TS2307: Cannot find module './components/Sidebar' or its corresponding type declarations.
"""

    fixer = ErrorFixer()
    errors = fixer.parse_build_log(build_log, Framework.TYPESCRIPT)

    print(f"\n🔍 Gefundene Fehler: {len(errors)}\n")
    for error in errors:
        print(f"📘 {error.error_type.value}")
        print(f"   {error.file_path}:{error.line_number}:{error.column}")
        print(f"   {error.message}")

        fix = fixer.generate_fix(error)
        if fix:
            print(f"   → Fix: {fix.explanation}\n")


def main():
    """Run all demos"""
    print("\n")
    print("🔧" * 30)
    print(" AI ERROR FIXER - DEMO SCRIPT")
    print("🔧" * 30)
    print("\n")

    demos = [
        demo_react_errors,
        demo_python_errors,
        demo_flutter_errors,
        demo_auto_fix,
        demo_typescript_errors,
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
    print("\n📊 Supported Features:")
    print("   - 8 Frameworks (Flutter, React, Python, TypeScript, etc.)")
    print("   - 12 Error Types (Import, Syntax, Type, etc.)")
    print("   - Intelligent Error Parsing mit Regex")
    print("   - Automatic Fix Generation")
    print("   - File Patching")
    print("   - Confidence Scoring")
    print("\n🚀 Bereit für Production!\n")


if __name__ == "__main__":
    main()