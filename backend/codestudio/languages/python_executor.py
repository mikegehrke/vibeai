# -------------------------------------------------------------
# VIBEAI – PYTHON EXECUTOR
# -------------------------------------------------------------
import os


class PythonExecutor:
    """
    Führt Python-Code sicher aus.
    
    - Schreibt Code in temporäre .py Datei
    - Keine Shell-Injection (shell=False)
    - Rückgabe ist reines Kommando für Sandbox
    """
    
    def prepare_code_file(self, temp_dir: str, code: str) -> str:
        """
        Schreibt Python-Code in temporäre Datei.
        """
        code_file = os.path.join(temp_dir, "main.py")
        
        with open(code_file, 'w', encoding='utf-8') as f:
            f.write(code)
        
        return code_file
    
    def get_execution_command(self, code_file: str) -> list:
        """
        Gibt Python3-Ausführungs-Kommando zurück.
        
        Rückgabe: ["python3", "/tmp/main.py"]
        """
        return ["python3", code_file]
