# -------------------------------------------------------------
# VIBEAI – ERROR DETECTOR
# -------------------------------------------------------------
# Erkennt Fehler in generiertem Code:
# - Syntax-Fehler
# - Lint-Fehler  
# - Import-Fehler
# - Type-Fehler
# - Runtime-Warnungen
# -------------------------------------------------------------

import re
import subprocess
from typing import Dict, List, Optional
from builder.language_detector import detect_language


class ErrorDetector:
    """
    Analysiert Code auf Fehler und gibt strukturierte Fehlerberichte.
    """

    def detect_errors(
        self,
        file_path: str,
        content: str,
        check_types: List[str] = None
    ) -> List[Dict]:
        """
        Erkennt Fehler in Code-Datei.
        
        Args:
            file_path: Dateipfad
            content: Datei-Inhalt
            check_types: ["syntax", "lint", "imports"] (default: alle)
        
        Returns:
            Liste von Fehler-Dictionaries
        """
        if check_types is None:
            check_types = ["syntax", "lint", "imports"]

        language = detect_language(file_path)
        errors = []

        # Syntax-Check
        if "syntax" in check_types:
            syntax_errors = self._check_syntax(content, language)
            errors.extend(syntax_errors)

        # Lint-Check
        if "lint" in check_types:
            lint_errors = self._check_lint(content, language)
            errors.extend(lint_errors)

        # Import-Check
        if "imports" in check_types:
            import_errors = self._check_imports(content, language)
            errors.extend(import_errors)

        return errors

    def _check_syntax(self, content: str, language: str) -> List[Dict]:
        """Prüft auf Syntax-Fehler."""
        errors = []

        if language == "python":
            # Python Syntax Check
            try:
                compile(content, '<string>', 'exec')
            except SyntaxError as e:
                errors.append({
                    "type": "syntax",
                    "severity": "error",
                    "line": e.lineno,
                    "message": str(e.msg),
                    "language": language
                })

        elif language in ["javascript", "typescript", "jsx", "tsx"]:
            # Einfache Pattern-basierte Checks
            # Unbalanced brackets
            if content.count("{") != content.count("}"):
                errors.append({
                    "type": "syntax",
                    "severity": "error",
                    "line": None,
                    "message": "Unbalanced curly braces",
                    "language": language
                })
            
            if content.count("(") != content.count(")"):
                errors.append({
                    "type": "syntax",
                    "severity": "error",
                    "line": None,
                    "message": "Unbalanced parentheses",
                    "language": language
                })

            if content.count("[") != content.count("]"):
                errors.append({
                    "type": "syntax",
                    "severity": "error",
                    "line": None,
                    "message": "Unbalanced square brackets",
                    "language": language
                })

        elif language == "dart":
            # Dart bracket checks
            if content.count("{") != content.count("}"):
                errors.append({
                    "type": "syntax",
                    "severity": "error",
                    "line": None,
                    "message": "Unbalanced curly braces",
                    "language": language
                })

        return errors

    def _check_lint(self, content: str, language: str) -> List[Dict]:
        """Prüft auf Lint-Probleme."""
        warnings = []

        # Allgemeine Checks
        lines = content.split("\n")
        
        for i, line in enumerate(lines, 1):
            # Trailing whitespace
            if line.endswith(" ") or line.endswith("\t"):
                warnings.append({
                    "type": "lint",
                    "severity": "warning",
                    "line": i,
                    "message": "Trailing whitespace",
                    "language": language
                })

            # Line too long
            if len(line) > 120:
                warnings.append({
                    "type": "lint",
                    "severity": "warning",
                    "line": i,
                    "message": f"Line too long ({len(line)} > 120 chars)",
                    "language": language
                })

            # TODO/FIXME comments
            if "TODO" in line or "FIXME" in line:
                warnings.append({
                    "type": "lint",
                    "severity": "info",
                    "line": i,
                    "message": "TODO/FIXME comment found",
                    "language": language
                })

        # Language-spezifische Checks
        if language == "python":
            # Check for unused imports (simplified)
            imports = re.findall(r'^import (\w+)', content, re.MULTILINE)
            for imp in imports:
                if content.count(imp) == 1:  # Only appears in import
                    warnings.append({
                        "type": "lint",
                        "severity": "warning",
                        "line": None,
                        "message": f"Possibly unused import: {imp}",
                        "language": language
                    })

        elif language in ["javascript", "typescript", "jsx", "tsx"]:
            # Console.log detection
            if "console.log" in content:
                warnings.append({
                    "type": "lint",
                    "severity": "info",
                    "line": None,
                    "message": "console.log() found (remove in production)",
                    "language": language
                })

        return warnings

    def _check_imports(self, content: str, language: str) -> List[Dict]:
        """Prüft auf Import-Fehler."""
        errors = []

        if language == "python":
            # Extrahiere Imports
            imports = re.findall(
                r'^(?:from\s+(\S+)\s+)?import\s+(.+?)(?:\s+as\s+\S+)?$',
                content,
                re.MULTILINE
            )

            # Prüfe auf relative Imports ohne "from"
            bad_imports = re.findall(r'^import\s+\.', content, re.MULTILINE)
            if bad_imports:
                errors.append({
                    "type": "import",
                    "severity": "error",
                    "line": None,
                    "message": "Invalid relative import syntax",
                    "language": language
                })

        elif language in ["javascript", "typescript", "jsx", "tsx"]:
            # Check für fehlende Dateiendungen bei relativen Imports
            imports = re.findall(
                r'import\s+.*?\s+from\s+["\'](\.[^"\']+)["\']',
                content
            )

            for imp in imports:
                if not any(imp.endswith(ext) for ext in ['.js', '.ts', '.tsx', '.jsx']):
                    errors.append({
                        "type": "import",
                        "severity": "warning",
                        "line": None,
                        "message": f"Import missing file extension: {imp}",
                        "language": language
                    })

        return errors

    def get_error_summary(self, errors: List[Dict]) -> Dict:
        """Erstellt eine Zusammenfassung der Fehler."""
        error_count = len([e for e in errors if e["severity"] == "error"])
        warning_count = len([e for e in errors if e["severity"] == "warning"])
        info_count = len([e for e in errors if e["severity"] == "info"])

        return {
            "total": len(errors),
            "errors": error_count,
            "warnings": warning_count,
            "info": info_count,
            "has_critical_errors": error_count > 0,
            "details": errors
        }

    def format_error_message(self, error: Dict) -> str:
        """Formatiert einen Fehler für Konsolen-Ausgabe."""
        severity_icons = {
            "error": "❌",
            "warning": "⚠️",
            "info": "ℹ️"
        }
        
        icon = severity_icons.get(error["severity"], "•")
        line_info = f"Line {error['line']}: " if error.get("line") else ""
        
        return f"{icon} [{error['type'].upper()}] {line_info}{error['message']}"


# Globale Instanz
error_detector = ErrorDetector()
