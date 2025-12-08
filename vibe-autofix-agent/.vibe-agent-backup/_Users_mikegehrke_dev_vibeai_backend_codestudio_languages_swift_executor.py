# -------------------------------------------------------------
# VIBEAI – SWIFT EXECUTOR
# -------------------------------------------------------------
import os


class SwiftExecutor:
    """
    Führt Swift-Code aus.

    - Schreibt Code in temporäre .swift Datei
    - Swift Compiler erforderlich
    - Perfekt für iOS/macOS Backend-Logic
    """

    def prepare_code_file(self, temp_dir: str, code: str) -> str:
        """
        Schreibt Swift-Code in temporäre Datei.
        """
        code_file = os.path.join(temp_dir, "main.swift")

        with open(code_file, "w", encoding="utf-8") as f:
            f.write(code)

        return code_file

    def get_execution_command(self, code_file: str) -> list:
        """
        Gibt Swift-Ausführungs-Kommando zurück.

        Rückgabe: ["swift", "/tmp/main.swift"]
        """
        return ["swift", code_file]
