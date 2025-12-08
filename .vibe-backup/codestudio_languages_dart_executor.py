# -------------------------------------------------------------
# VIBEAI – DART EXECUTOR
# -------------------------------------------------------------
import os


class DartExecutor:
    """
    Führt Dart-Code aus.

    - Schreibt Code in temporäre .dart Datei
    - Dart SDK erforderlich
    - Perfekt für Flutter-Backend-Logic
    """

    def prepare_code_file(self, temp_dir: str, code: str) -> str:
        """
        Schreibt Dart-Code in temporäre Datei.
        """
        code_file = os.path.join(temp_dir, "main.dart")

        with open(code_file, "w", encoding="utf-8") as f:
            f.write(code)

        return code_file

    def get_execution_command(self, code_file: str) -> list:
        """
        Gibt Dart-Ausführungs-Kommando zurück.

        Rückgabe: ["dart", "run", "/tmp/main.dart"]
        """
        return ["dart", "run", code_file]
