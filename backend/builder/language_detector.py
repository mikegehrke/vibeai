# -------------------------------------------------------------
# VIBEAI – LANGUAGE DETECTOR
# -------------------------------------------------------------
# Erkennt Programmiersprache basierend auf Dateiendung
# -------------------------------------------------------------

import os
from typing import Optional


def detect_language(file_path: str) -> str:
    """
    Erkennt die Programmiersprache anhand der Dateiendung.
    
    Args:
        file_path: Dateipfad (z.B. "lib/main.dart")
    
    Returns:
        Sprach-Identifier (z.B. "dart", "python", "typescript")
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    language_map = {
        ".dart": "dart",
        ".ts": "typescript",
        ".tsx": "tsx",
        ".js": "javascript",
        ".jsx": "jsx",
        ".py": "python",
        ".swift": "swift",
        ".kt": "kotlin",
        ".java": "java",
        ".go": "go",
        ".rs": "rust",
        ".rb": "ruby",
        ".php": "php",
        ".c": "c",
        ".cpp": "cpp",
        ".cs": "csharp",
        ".html": "html",
        ".css": "css",
        ".scss": "scss",
        ".json": "json",
        ".yaml": "yaml",
        ".yml": "yaml",
        ".xml": "xml",
        ".md": "markdown",
        ".sh": "bash",
        ".sql": "sql",
    }
    
    return language_map.get(ext, "text")


def get_file_extension(language: str) -> str:
    """
    Umgekehrte Mapping: Sprache → Dateiendung.
    
    Args:
        language: Sprach-Identifier
    
    Returns:
        Dateiendung (z.B. ".dart")
    """
    extension_map = {
        "dart": ".dart",
        "typescript": ".ts",
        "tsx": ".tsx",
        "javascript": ".js",
        "jsx": ".jsx",
        "python": ".py",
        "swift": ".swift",
        "kotlin": ".kt",
        "java": ".java",
        "go": ".go",
        "rust": ".rs",
        "ruby": ".rb",
        "php": ".php",
        "c": ".c",
        "cpp": ".cpp",
        "csharp": ".cs",
        "html": ".html",
        "css": ".css",
        "scss": ".scss",
        "json": ".json",
        "yaml": ".yaml",
        "xml": ".xml",
        "markdown": ".md",
        "bash": ".sh",
        "sql": ".sql",
    }
    
    return extension_map.get(language, ".txt")


def is_code_file(file_path: str) -> bool:
    """Prüft ob Datei eine Code-Datei ist (keine Config/Asset)."""
    language = detect_language(file_path)
    code_languages = {
        "dart", "typescript", "tsx", "javascript", "jsx",
        "python", "swift", "kotlin", "java", "go", "rust",
        "ruby", "php", "c", "cpp", "csharp"
    }
    return language in code_languages


def get_comment_syntax(language: str) -> dict:
    """Gibt die Kommentar-Syntax für eine Sprache zurück."""
    syntax_map = {
        "dart": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "typescript": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "tsx": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "javascript": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "jsx": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "python": {"line": "#", "block_start": '"""', "block_end": '"""'},
        "swift": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "kotlin": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "java": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "go": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "rust": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "ruby": {"line": "#", "block_start": "=begin", "block_end": "=end"},
        "php": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "c": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "cpp": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "csharp": {"line": "//", "block_start": "/*", "block_end": "*/"},
        "html": {"line": None, "block_start": "<!--", "block_end": "-->"},
        "css": {"line": None, "block_start": "/*", "block_end": "*/"},
        "sql": {"line": "--", "block_start": "/*", "block_end": "*/"},
        "bash": {"line": "#", "block_start": None, "block_end": None},
    }
    
    return syntax_map.get(
        language,
        {"line": "//", "block_start": "/*", "block_end": "*/"}
    )
