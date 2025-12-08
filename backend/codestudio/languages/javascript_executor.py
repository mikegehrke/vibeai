# -------------------------------------------------------------
# VIBEAI – JAVASCRIPT EXECUTOR
# -------------------------------------------------------------
import os


class JavaScriptExecutor:
    """
    Führt JavaScript-Code mit Node.js aus.

    - Schreibt Code in temporäre .js Datei
    - Keine Shell-Injection
    - Node.js Runtime erforderlich
    """

    def prepare_code_file(self, temp_dir: str, code: str) -> str:
        """
        Schreibt JavaScript-Code in temporäre Datei.
        """
        code_file = os.path.join(temp_dir, "main.js")

        with open(code_file, "w", encoding="utf-8") as f:
            f.write(code)

        return code_file

    def get_execution_command(self, code_file: str) -> list:
        """
        Gibt Node.js-Ausführungs-Kommando zurück.

        Rückgabe: ["node", "/tmp/main.js"]
        """
        return ["node", code_file]