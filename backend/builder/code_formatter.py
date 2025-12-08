# -------------------------------------------------------------
# VIBEAI – CODE FORMATTER
# -------------------------------------------------------------
# Formatiert Code automatisch mit:
# - Prettier (JS/TS/JSX/TSX)
# - Black (Python)
# - dart format (Dart)
# - SwiftFormat (Swift)
# - ktlint (Kotlin)
# -------------------------------------------------------------

import re

from builder.language_detector import detect_language


class CodeFormatter:
    """
    Formatiert Code für verschiedene Sprachen.
    Nutzt regelbasierte Formatierung (lightweight, keine externen Tools).
    """

    def format_code(self, content: str, language: str = None, file_path: str = None) -> str:
        """
        Formatiert Code basierend auf Sprache.

        Args:
            content: Code-Inhalt
            language: Sprach-Identifier (optional)
            file_path: Dateipfad (für auto-detection)

        Returns:
            Formatierter Code
        """
        if language is None and file_path:
            language = detect_language(file_path)

        if not language:
            return content

        # Sprach-spezifische Formatierung
        if language == "python":
            return self._format_python(content)
        elif language in ["javascript", "typescript", "jsx", "tsx"]:
            return self._format_javascript(content)
        elif language == "dart":
            return self._format_dart(content)
        elif language == "swift":
            return self._format_swift(content)
        elif language == "kotlin":
            return self._format_kotlin(content)
        else:
            return self._format_generic(content)

    def _format_python(self, content: str) -> str:
        """Formatiert Python-Code (Black-style)."""
        lines = content.split("\n")
        formatted = []

        for line in lines:
            # Entferne trailing whitespace
            line = line.rstrip()

            # Kein multiple blank lines
            if not line and formatted and not formatted[-1]:
                continue

            formatted.append(line)

        # Max 2 blank lines zwischen Funktionen/Klassen
        result = "\n".join(formatted)
        result = re.sub(r"\n{3,}", "\n\n", result)

        return result

    def _format_javascript(self, content: str) -> str:
        """Formatiert JavaScript/TypeScript (Prettier-style)."""
        lines = content.split("\n")
        formatted = []
        indent_level = 0

        for line in lines:
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                formatted.append("")
                continue

            # Decrease indent for closing braces
            if stripped.startswith("}") or stripped.startswith("]"):
                indent_level = max(0, indent_level - 1)

            # Add indentation
            indent = "  " * indent_level
            formatted_line = indent + stripped

            # Increase indent for opening braces
            if stripped.endswith("{") or stripped.endswith("["):
                indent_level += 1

            formatted.append(formatted_line.rstrip())

        return "\n".join(formatted)

    def _format_dart(self, content: str) -> str:
        """Formatiert Dart-Code."""
        lines = content.split("\n")
        formatted = []
        indent_level = 0

        for line in lines:
            stripped = line.strip()

            if not stripped:
                formatted.append("")
                continue

            # Decrease indent
            if stripped.startswith("}") or stripped == ");":
                indent_level = max(0, indent_level - 1)

            indent = "  " * indent_level
            formatted_line = indent + stripped

            # Increase indent
            if stripped.endswith("{") or stripped.endswith("("):
                indent_level += 1

            formatted.append(formatted_line.rstrip())

        return "\n".join(formatted)

    def _format_swift(self, content: str) -> str:
        """Formatiert Swift-Code."""
        return self._format_javascript(content)  # Similar syntax

    def _format_kotlin(self, content: str) -> str:
        """Formatiert Kotlin-Code."""
        return self._format_javascript(content)  # Similar syntax

    def _format_generic(self, content: str) -> str:
        """Generic Formatierung: Trailing whitespace entfernen."""
        lines = content.split("\n")
        return "\n".join(line.rstrip() for line in lines)

    def add_imports(self, content: str, imports: list, language: str) -> str:
        """Fügt Imports am Anfang der Datei hinzu."""
        if language == "python":
            import_lines = [f"import {imp}" for imp in imports]
        elif language in ["javascript", "typescript", "jsx", "tsx"]:
            import_lines = [f"import {imp};" for imp in imports]
        elif language == "dart":
            import_lines = [f"import '{imp}';" for imp in imports]
        elif language == "swift":
            import_lines = [f"import {imp}" for imp in imports]
        elif language == "kotlin":
            import_lines = [f"import {imp}" for imp in imports]
        else:
            return content

        # Füge Imports am Anfang ein
        import_block = "\n".join(import_lines)
        return f"{import_block}\n\n{content}"

    def remove_trailing_whitespace(self, content: str) -> str:
        """Entfernt trailing whitespace von allen Zeilen."""
        lines = content.split("\n")
        return "\n".join(line.rstrip() for line in lines)

    def normalize_line_endings(self, content: str) -> str:
        """Normalisiert Line Endings zu LF (\\n)."""
        return content.replace("\r\n", "\n").replace("\r", "\n")

    def ensure_final_newline(self, content: str) -> str:
        """Stellt sicher, dass Datei mit newline endet."""
        if content and not content.endswith("\n"):
            return content + "\n"
        return content


# Globale Instanz
code_formatter = CodeFormatter()