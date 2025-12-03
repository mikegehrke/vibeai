# -------------------------------------------------------------
# VIBEAI – TYPESCRIPT EXECUTOR
# -------------------------------------------------------------
import os


class TypeScriptExecutor:
    """
    Führt TypeScript-Code mit ts-node aus.
    
    - Schreibt Code in temporäre .ts Datei
    - ts-node Runtime erforderlich
    - Keine Kompilierung zu .js nötig
    """
    
    def prepare_code_file(self, temp_dir: str, code: str) -> str:
        """
        Schreibt TypeScript-Code in temporäre Datei.
        """
        code_file = os.path.join(temp_dir, "main.ts")
        
        with open(code_file, 'w', encoding='utf-8') as f:
            f.write(code)
        
        return code_file
    
    def get_execution_command(self, code_file: str) -> list:
        """
        Gibt ts-node-Ausführungs-Kommando zurück.
        
        Rückgabe: ["ts-node", "/tmp/main.ts"]
        """
        return ["ts-node", code_file]
