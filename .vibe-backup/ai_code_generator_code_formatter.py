# -------------------------------------------------------------
# VIBEAI – CODE FORMATTER
# -------------------------------------------------------------
"""
Code Formatter für verschiedene Sprachen

Formatiert generierten Code für bessere Lesbarkeit.

Supported:
- Python (black, autopep8)
- JavaScript/React (prettier-equivalent)
- Dart/Flutter (dartfmt)
- HTML/CSS
"""

import re


class CodeFormatter:
    """
    Formatiert Code für verschiedene Programmiersprachen.
    """

    # ---------------------------------------------------------
    # FLUTTER/DART FORMATTING
    # ---------------------------------------------------------
    def format_flutter(self, code: str) -> str:
        """
        Formatiert Flutter/Dart Code.

        Note: Für production sollte dartfmt verwendet werden.
        Diese Implementation macht basic formatting.

        Args:
            code: Unformatierter Dart Code

        Returns:
            Formatierter Dart Code
        """
        # Basic indentation fix
        lines = code.split("\n")
        formatted_lines = []
        indent_level = 0

        for line in lines:
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                formatted_lines.append("")
                continue

            # Decrease indent for closing braces
            if stripped.startswith("}"):
                indent_level = max(0, indent_level - 1)

            # Add indented line
            formatted_lines.append("  " * indent_level + stripped)

            # Increase indent for opening braces
            if stripped.endswith("{"):
                indent_level += 1

        return "\n".join(formatted_lines)

    # ---------------------------------------------------------
    # JAVASCRIPT/REACT FORMATTING
    # ---------------------------------------------------------
    def format_js(self, code: str) -> str:
        """
        Formatiert JavaScript/React Code.

        Args:
            code: Unformatierter JS Code

        Returns:
            Formatierter JS Code
        """
        # Basic indentation fix
        lines = code.split("\n")
        formatted_lines = []
        indent_level = 0

        for line in lines:
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                formatted_lines.append("")
                continue

            # Decrease indent for closing braces/tags
            if stripped.startswith("}") or stripped.startswith("</") or stripped == ");":
                indent_level = max(0, indent_level - 1)

            # Add indented line
            formatted_lines.append("  " * indent_level + stripped)

            # Increase indent for opening braces/tags
            if stripped.endswith("{") or (
                stripped.startswith("<") and not stripped.startswith("</") and not stripped.endswith("/>")
            ):
                if not stripped.endswith("/>"):
                    indent_level += 1

        return "\n".join(formatted_lines)

    # ---------------------------------------------------------
    # PYTHON FORMATTING
    # ---------------------------------------------------------
    def format_python(self, code: str) -> str:
        """
        Formatiert Python Code.

        Uses black if available, otherwise basic formatting.

        Args:
            code: Unformatierter Python Code

        Returns:
            Formatierter Python Code
        """
        try:
            import black

            mode = black.FileMode()
            return black.format_file_contents(code, fast=True, mode=mode)
        except ImportError:
            # Fallback to basic formatting
            return self._basic_python_format(code)

    def _basic_python_format(self, code: str) -> str:
        """Basic Python formatting without black."""
        lines = code.split("\n")
        formatted_lines = []

        for line in lines:
            # Remove trailing whitespace
            line = line.rstrip()
            formatted_lines.append(line)

        return "\n".join(formatted_lines)

    # ---------------------------------------------------------
    # HTML FORMATTING
    # ---------------------------------------------------------
    def format_html(self, code: str) -> str:
        """
        Formatiert HTML Code.

        Args:
            code: Unformatierter HTML Code

        Returns:
            Formatierter HTML Code
        """
        # Basic indentation fix
        lines = code.split("\n")
        formatted_lines = []
        indent_level = 0

        for line in lines:
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                formatted_lines.append("")
                continue

            # Decrease indent for closing tags
            if stripped.startswith("</"):
                indent_level = max(0, indent_level - 1)

            # Add indented line
            formatted_lines.append("  " * indent_level + stripped)

            # Increase indent for opening tags (not self-closing)
            if stripped.startswith("<") and not stripped.startswith("</") and not stripped.endswith("/>"):
                # Check if tag is closed on same line
                if not re.search(r"<(\w+)[^>]*>.*</\1>", stripped):
                    indent_level += 1

        return "\n".join(formatted_lines)

    # ---------------------------------------------------------
    # CSS FORMATTING
    # ---------------------------------------------------------
    def format_css(self, code: str) -> str:
        """
        Formatiert CSS Code.

        Args:
            code: Unformatierter CSS Code

        Returns:
            Formatierter CSS Code
        """
        # Basic indentation fix
        lines = code.split("\n")
        formatted_lines = []
        indent_level = 0

        for line in lines:
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                formatted_lines.append("")
                continue

            # Decrease indent for closing braces
            if stripped == "}":
                indent_level = max(0, indent_level - 1)

            # Add indented line
            formatted_lines.append("  " * indent_level + stripped)

            # Increase indent for opening braces
            if stripped.endswith("{"):
                indent_level += 1

        return "\n".join(formatted_lines)

    # ---------------------------------------------------------
    # UNIVERSAL FORMATTER
    # ---------------------------------------------------------
    def format_code(self, code: str, language: str) -> str:
        """
        Formatiert Code basierend auf Sprache.

        Args:
            code: Unformatierter Code
            language: Programmiersprache (flutter, react, python, html, css)

        Returns:
            Formatierter Code
        """
        language = language.lower()

        if language in ["flutter", "dart"]:
            return self.format_flutter(code)
        elif language in ["react", "javascript", "js", "jsx"]:
            return self.format_js(code)
        elif language == "python":
            return self.format_python(code)
        elif language == "html":
            return self.format_html(code)
        elif language == "css":
            return self.format_css(code)
        else:
            # No formatting for unknown languages
            return code

    # ---------------------------------------------------------
    # HELPER FUNCTIONS
    # ---------------------------------------------------------
    def remove_extra_blank_lines(self, code: str) -> str:
        """
        Entfernt mehrfache Leerzeilen.

        Args:
            code: Code mit möglicherweise mehrfachen Leerzeilen

        Returns:
            Code mit max 1 Leerzeile zwischen Blöcken
        """
        # Replace 3+ newlines with 2 newlines
        return re.sub(r"\n{3,}", "\n\n", code)

    def ensure_trailing_newline(self, code: str) -> str:
        """
        Stellt sicher, dass Code mit Newline endet.

        Args:
            code: Code string

        Returns:
            Code mit trailing newline
        """
        if not code.endswith("\n"):
            return code + "\n"
        return code


# Global Instance
formatter = CodeFormatter()
