"""
AI Error Fixer - Intelligente Fehleranalyse und automatische Korrektur
Parst Build-Logs und generiert Code-Fixes
"""

import os
import re
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional


class ErrorType(str, Enum):
    """Typen von Fehlern"""

    IMPORT_ERROR = "import_error"
    SYNTAX_ERROR = "syntax_error"
    TYPE_ERROR = "type_error"
    UNDEFINED_VARIABLE = "undefined_variable"
    UNDEFINED_FUNCTION = "undefined_function"
    MISSING_DEPENDENCY = "missing_dependency"
    WIDGET_ERROR = "widget_error"
    API_ERROR = "api_error"
    DATABASE_ERROR = "database_error"
    BUILD_ERROR = "build_error"
    RUNTIME_ERROR = "runtime_error"
    GRADLE_ERROR = "gradle_error"
    UNKNOWN = "unknown"


class ErrorSeverity(str, Enum):
    """Schweregrad von Fehlern"""

    CRITICAL = "critical"  # Build bricht ab
    ERROR = "error"  # Funktionalität defekt
    WARNING = "warning"  # Potenzielle Probleme
    INFO = "info"  # Hinweise


class Framework(str, Enum):
    """Unterstützte Frameworks"""

    FLUTTER = "flutter"
    REACT = "react"
    REACT_NATIVE = "react_native"
    VUE = "vue"
    NEXTJS = "nextjs"
    PYTHON = "python"
    FASTAPI = "fastapi"
    DJANGO = "django"
    NODEJS = "nodejs"
    TYPESCRIPT = "typescript"
    JAVASCRIPT = "javascript"


@dataclass
class ParsedError:
    """Geparster Fehler aus Build-Log"""

    error_type: ErrorType
    severity: ErrorSeverity
    message: str
    file_path: Optional[str]
    line_number: Optional[int]
    column: Optional[int]
    framework: Framework
    stack_trace: List[str]
    context: str  # Umgebender Code
    suggestion: str  # AI Vorschlag


@dataclass
class CodeFix:
    """Generierter Code-Fix"""

    file_path: str
    line_number: int
    original_code: str
    fixed_code: str
    explanation: str
    confidence: float  # 0.0 - 1.0


class ErrorFixer:
    """
    Haupt-Engine für Error Detection & Auto-Fix
    """

    def __init__(self):
        self.error_patterns = self._init_error_patterns()

    def _init_error_patterns(self) -> Dict[str, List[Dict[str, Any]]]:
        """Initialisiere Fehler-Patterns für verschiedene Frameworks"""
        return {
            "flutter": [
                {
                    "pattern": r"Error: (.*?) is not defined",
                    "type": ErrorType.UNDEFINED_VARIABLE,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"The getter '(\w+)' isn't defined for the (?:class|type) '(\w+)'",
                    "type": ErrorType.UNDEFINED_FUNCTION,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"(?:lib|packages?)/(.+?):(\d+):(\d+): Error: (.+)",
                    "type": ErrorType.SYNTAX_ERROR,
                    "severity": ErrorSeverity.CRITICAL,
                },
                {
                    "pattern": r"The argument type '(\w+)' can't be assigned to the parameter type '(\w+)'",
                    "type": ErrorType.TYPE_ERROR,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"Missing required argument '(\w+)'",
                    "type": ErrorType.SYNTAX_ERROR,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"Undefined name '(\w+)'",
                    "type": ErrorType.UNDEFINED_VARIABLE,
                    "severity": ErrorSeverity.ERROR,
                },
            ],
            "react": [
                {
                    "pattern": r"Module not found: (?:Error: )?Can't resolve '(.+?)' in '(.+?)'",
                    "type": ErrorType.IMPORT_ERROR,
                    "severity": ErrorSeverity.CRITICAL,
                },
                {
                    "pattern": r"'(\w+)' is not defined",
                    "type": ErrorType.UNDEFINED_VARIABLE,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"Cannot read propert(?:y|ies) '(\w+)' of undefined",
                    "type": ErrorType.RUNTIME_ERROR,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"(\w+) is not a function",
                    "type": ErrorType.UNDEFINED_FUNCTION,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"Failed to compile.*?(?:\.\/)?(.+?):(\d+):(\d+)",
                    "type": ErrorType.SYNTAX_ERROR,
                    "severity": ErrorSeverity.CRITICAL,
                },
            ],
            "python": [
                {
                    "pattern": r"ModuleNotFoundError: No module named '(.+?)'",
                    "type": ErrorType.MISSING_DEPENDENCY,
                    "severity": ErrorSeverity.CRITICAL,
                },
                {
                    "pattern": r"ImportError: cannot import name '(\w+)' from '(.+?)'",
                    "type": ErrorType.IMPORT_ERROR,
                    "severity": ErrorSeverity.CRITICAL,
                },
                {
                    "pattern": r"NameError: name '(\w+)' is not defined",
                    "type": ErrorType.UNDEFINED_VARIABLE,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"SyntaxError: (.+)",
                    "type": ErrorType.SYNTAX_ERROR,
                    "severity": ErrorSeverity.CRITICAL,
                },
                {
                    "pattern": r"File \"(.+?)\", line (\d+)",
                    "type": ErrorType.RUNTIME_ERROR,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"TypeError: (.+)",
                    "type": ErrorType.TYPE_ERROR,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"AttributeError: '(\w+)' object has no attribute '(\w+)'",
                    "type": ErrorType.UNDEFINED_FUNCTION,
                    "severity": ErrorSeverity.ERROR,
                },
            ],
            "typescript": [
                {
                    "pattern": r"Cannot find module '(.+?)' or its corresponding type declarations",
                    "type": ErrorType.IMPORT_ERROR,
                    "severity": ErrorSeverity.CRITICAL,
                },
                {
                    "pattern": r"Property '(\w+)' does not exist on type '(\w+)'",
                    "type": ErrorType.TYPE_ERROR,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"Type '(\w+)' is not assignable to type '(\w+)'",
                    "type": ErrorType.TYPE_ERROR,
                    "severity": ErrorSeverity.ERROR,
                },
                {
                    "pattern": r"(.+?)\((\d+),(\d+)\): error TS(\d+): (.+)",
                    "type": ErrorType.SYNTAX_ERROR,
                    "severity": ErrorSeverity.ERROR,
                },
            ],
            "gradle": [
                {
                    "pattern": r"Could not find (.+?)\.jar",
                    "type": ErrorType.MISSING_DEPENDENCY,
                    "severity": ErrorSeverity.CRITICAL,
                },
                {
                    "pattern": r"Could not resolve all files for configuration",
                    "type": ErrorType.BUILD_ERROR,
                    "severity": ErrorSeverity.CRITICAL,
                },
                {
                    "pattern": r"Execution failed for task '(.+?)'",
                    "type": ErrorType.BUILD_ERROR,
                    "severity": ErrorSeverity.CRITICAL,
                },
            ],
        }

    def parse_build_log(self, log: str, framework: Framework) -> List[ParsedError]:
        """
        Parse Build-Log und extrahiere alle Fehler

        Args:
            log: Build-Log als String
            framework: Framework-Typ

        Returns:
            Liste von ParsedError Objekten
        """
        errors = []
        lines = log.split("\n")

        framework_key = framework.value
        if framework_key not in self.error_patterns:
            # Fallback auf generic patterns
            framework_key = "python"

        patterns = self.error_patterns.get(framework_key, [])

        for i, line in enumerate(lines):
            for pattern_info in patterns:
                pattern = pattern_info["pattern"]
                match = re.search(pattern, line, re.IGNORECASE)

                if match:
                    # Extrahiere Fehler-Details
                    file_path = None
                    line_number = None
                    column = None

                    # Versuche Datei-Info zu extrahieren
                    if "file" in line.lower() or "/" in line or "\\" in line:
                        file_match = re.search(
                            r"(?:File |at |in )?([^\s:]+\.(?:dart|js|jsx|ts|tsx|py|vue)):(\d+)(?::(\d+))?",
                            line,
                        )
                        if file_match:
                            file_path = file_match.group(1)
                            line_number = int(file_match.group(2))
                            if file_match.group(3):
                                column = int(file_match.group(3))

                    # Stack-Trace sammeln
                    stack_trace = []
                    for j in range(i + 1, min(i + 10, len(lines))):
                        if lines[j].strip().startswith(("at ", "File ", "#")):
                            stack_trace.append(lines[j].strip())
                        elif not lines[j].strip():
                            break

                    error = ParsedError(
                        error_type=pattern_info["type"],
                        severity=pattern_info["severity"],
                        message=line.strip(),
                        file_path=file_path,
                        line_number=line_number,
                        column=column,
                        framework=framework,
                        stack_trace=stack_trace,
                        context="\n".join(lines[max(0, i - 2) : min(len(lines), i + 3)]),
                        suggestion=self._generate_suggestion(pattern_info["type"], match),
                    )
                    errors.append(error)

        return errors

    def _generate_suggestion(self, error_type: ErrorType, match: re.Match) -> str:
        """Generiere intelligente Vorschläge basierend auf Fehlertyp"""
        suggestions = {
            ErrorType.IMPORT_ERROR: f"Add import statement or install missing package: {match.group(1) if match.groups() else 'package'}",
            ErrorType.MISSING_DEPENDENCY: f"Install dependency: {match.group(1) if match.groups() else 'package'}",
            ErrorType.UNDEFINED_VARIABLE: f"Define variable '{match.group(1)}' or check spelling",
            ErrorType.UNDEFINED_FUNCTION: f"Define function '{match.group(1)}' or import it",
            ErrorType.TYPE_ERROR: "Check type compatibility and fix type annotations",
            ErrorType.SYNTAX_ERROR: "Fix syntax error in the code",
            ErrorType.WIDGET_ERROR: "Add required Widget properties or fix Widget tree",
        }
        return suggestions.get(error_type, "Review and fix the error")

    def generate_fix(self, error: ParsedError, file_content: Optional[str] = None) -> Optional[CodeFix]:
        """
        Generiere automatischen Fix für einen Fehler

        Args:
            error: Geparster Fehler
            file_content: Inhalt der fehlerhaften Datei

        Returns:
            CodeFix Objekt oder None
        """
        if error.error_type == ErrorType.IMPORT_ERROR:
            return self._fix_import_error(error, file_content)
        elif error.error_type == ErrorType.MISSING_DEPENDENCY:
            return self._fix_missing_dependency(error)
        elif error.error_type == ErrorType.UNDEFINED_VARIABLE:
            return self._fix_undefined_variable(error, file_content)
        elif error.error_type == ErrorType.SYNTAX_ERROR:
            return self._fix_syntax_error(error, file_content)
        elif error.error_type == ErrorType.TYPE_ERROR:
            return self._fix_type_error(error, file_content)

        return None

    def _fix_import_error(self, error: ParsedError, file_content: Optional[str]) -> Optional[CodeFix]:
        """Fix für Import-Fehler"""
        # Extrahiere fehlenden Import
        match = re.search(r"(?:Can't resolve|cannot import name) '(.+?)'", error.message)
        if not match:
            return None

        missing_import = match.group(1)

        # Generiere Import-Statement basierend auf Framework
        if error.framework == Framework.REACT or error.framework == Framework.NEXTJS:
            import_statement = f"import {{ {missing_import} }} from './{missing_import}';"
            if "react" in missing_import.lower():
                import_statement = f"import {missing_import} from 'react';"
        elif error.framework == Framework.PYTHON:
            import_statement = f"from {missing_import.rsplit('.', 1)[0]} import {missing_import.rsplit('.', 1)[-1]}"
        elif error.framework == Framework.FLUTTER:
            import_statement = f"import 'package:flutter/material.dart';"
        else:
            import_statement = f"import {missing_import};"

        return CodeFix(
            file_path=error.file_path or "unknown",
            line_number=1,
            original_code="",
            fixed_code=import_statement,
            explanation=f"Added missing import: {missing_import}",
            confidence=0.85,
        )

    def _fix_missing_dependency(self, error: ParsedError) -> Optional[CodeFix]:
        """Fix für fehlende Dependencies"""
        match = re.search(r"(?:No module named|Could not find) '?(.+?)'?(?:\.|$)", error.message)
        if not match:
            return None

        package = match.group(1)

        if error.framework == Framework.PYTHON:
            install_cmd = f"pip install {package}"
        elif error.framework == Framework.NODEJS or error.framework == Framework.REACT:
            install_cmd = f"npm install {package}"
        elif error.framework == Framework.FLUTTER:
            install_cmd = f"flutter pub add {package}"
        else:
            install_cmd = f"Install package: {package}"

        return CodeFix(
            file_path=(
                "package.json" if error.framework in [Framework.NODEJS, Framework.REACT] else "requirements.txt"
            ),
            line_number=1,
            original_code="",
            fixed_code=f"# Run: {install_cmd}",
            explanation=f"Install missing dependency: {package}",
            confidence=0.95,
        )

    def _fix_undefined_variable(self, error: ParsedError, file_content: Optional[str]) -> Optional[CodeFix]:
        """Fix für undefined Variables"""
        match = re.search(r"'?(\w+)'? is not defined", error.message)
        if not match:
            return None

        var_name = match.group(1)

        # Generiere Variable-Definition basierend auf Framework
        if error.framework == Framework.PYTHON:
            fixed_code = f"{var_name} = None  # TODO: Initialize {var_name}"
        elif error.framework in [Framework.REACT, Framework.JAVASCRIPT]:
            fixed_code = f"const {var_name} = null;  // TODO: Initialize {var_name}"
        elif error.framework == Framework.FLUTTER:
            fixed_code = f"var {var_name};  // TODO: Initialize {var_name}"
        else:
            fixed_code = f"{var_name} = undefined;"

        return CodeFix(
            file_path=error.file_path or "unknown",
            line_number=error.line_number or 1,
            original_code="",
            fixed_code=fixed_code,
            explanation=f"Added variable declaration: {var_name}",
            confidence=0.70,
        )

    def _fix_syntax_error(self, error: ParsedError, file_content: Optional[str]) -> Optional[CodeFix]:
        """Fix für Syntax-Fehler"""
        # Häufige Syntax-Fixes
        if "missing ';'" in error.message.lower():
            return CodeFix(
                file_path=error.file_path or "unknown",
                line_number=error.line_number or 1,
                original_code="",
                fixed_code=";",
                explanation="Added missing semicolon",
                confidence=0.90,
            )
        elif "missing ')'" in error.message.lower():
            return CodeFix(
                file_path=error.file_path or "unknown",
                line_number=error.line_number or 1,
                original_code="",
                fixed_code=")",
                explanation="Added missing closing parenthesis",
                confidence=0.85,
            )
        elif "missing '}'" in error.message.lower():
            return CodeFix(
                file_path=error.file_path or "unknown",
                line_number=error.line_number or 1,
                original_code="",
                fixed_code="}",
                explanation="Added missing closing brace",
                confidence=0.85,
            )

        return None

    def _fix_type_error(self, error: ParsedError, file_content: Optional[str]) -> Optional[CodeFix]:
        """Fix für Type-Fehler"""
        # Extrahiere Type-Info
        match = re.search(
            r"Type '(\w+)' (?:is not assignable to|can't be assigned to) (?:type |parameter type )?'(\w+)'",
            error.message,
        )
        if not match:
            return None

        actual_type = match.group(1)
        expected_type = match.group(2)

        # Generiere Type-Conversion
        if error.framework == Framework.TYPESCRIPT:
            fixed_code = f"as {expected_type}  // Type assertion"
        elif error.framework == Framework.FLUTTER:
            fixed_code = f"as {expected_type}  // Type cast"
        else:
            fixed_code = f"// TODO: Convert {actual_type} to {expected_type}"

        return CodeFix(
            file_path=error.file_path or "unknown",
            line_number=error.line_number or 1,
            original_code="",
            fixed_code=fixed_code,
            explanation=f"Added type conversion from {actual_type} to {expected_type}",
            confidence=0.60,
        )

    def apply_fix(self, fix: CodeFix, file_path: str) -> bool:
        """
        Wende Code-Fix auf Datei an

        Args:
            fix: CodeFix Objekt
            file_path: Pfad zur Datei

        Returns:
            True wenn erfolgreich
        """
        try:
            if not os.path.exists(file_path):
                print(f"⚠️ File not found: {file_path}")
                return False

            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            # Insert fix at line_number
            if fix.line_number <= len(lines):
                if fix.original_code:
                    # Replace line
                    lines[fix.line_number - 1] = fix.fixed_code + "\n"
                else:
                    # Insert new line
                    lines.insert(fix.line_number - 1, fix.fixed_code + "\n")
            else:
                # Append at end
                lines.append(fix.fixed_code + "\n")

            # Write back
            with open(file_path, "w", encoding="utf-8") as f:
                f.writelines(lines)

            return True
        except Exception as e:
            print(f"❌ Error applying fix: {e}")
            return False

    def analyze_and_fix(self, build_log: str, framework: Framework, base_path: str = ".") -> Dict[str, Any]:
        """
        Kompletter Workflow: Parse → Analyze → Fix

        Args:
            build_log: Build-Log
            framework: Framework
            base_path: Basis-Pfad für Dateien

        Returns:
            Ergebnis mit Statistiken
        """
        # Parse errors
        errors = self.parse_build_log(build_log, framework)

        # Generate fixes
        fixes = []
        for error in errors:
            fix = self.generate_fix(error)
            if fix:
                fixes.append(fix)

        # Apply fixes
        applied_fixes = []
        failed_fixes = []

        for fix in fixes:
            file_path = os.path.join(base_path, fix.file_path)
            if self.apply_fix(fix, file_path):
                applied_fixes.append(fix)
            else:
                failed_fixes.append(fix)

        return {
            "total_errors": len(errors),
            "fixable_errors": len(fixes),
            "applied_fixes": len(applied_fixes),
            "failed_fixes": len(failed_fixes),
            "errors": [self._error_to_dict(e) for e in errors],
            "fixes": [self._fix_to_dict(f) for f in fixes],
            "success_rate": len(applied_fixes) / len(fixes) if fixes else 0,
        }

    def _error_to_dict(self, error: ParsedError) -> Dict[str, Any]:
        """Convert ParsedError to dict"""
        return {
            "type": error.error_type.value,
            "severity": error.severity.value,
            "message": error.message,
            "file": error.file_path,
            "line": error.line_number,
            "column": error.column,
            "framework": error.framework.value,
            "suggestion": error.suggestion,
            "stack_trace": error.stack_trace,
        }

    def _fix_to_dict(self, fix: CodeFix) -> Dict[str, Any]:
        """Convert CodeFix to dict"""
        return {
            "file": fix.file_path,
            "line": fix.line_number,
            "original": fix.original_code,
            "fixed": fix.fixed_code,
            "explanation": fix.explanation,
            "confidence": fix.confidence,
        }
