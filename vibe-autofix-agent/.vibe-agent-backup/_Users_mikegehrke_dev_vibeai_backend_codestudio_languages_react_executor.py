# -------------------------------------------------------------
# VIBEAI – REACT/JSX EXECUTOR
# -------------------------------------------------------------
import os
import subprocess


class ReactExecutor:
    """
    Führt React/JSX-Code aus.

    - Transpiliert JSX zu JavaScript mit Babel
    - Führt mit Node.js aus
    - Unterstützt React Hooks, Components, etc.
    """

    def prepare_code_file(self, temp_dir: str, code: str) -> str:
        """
        Schreibt React/JSX-Code in temporäre Datei.
        Fügt React-Imports hinzu falls fehlend.
        """
        code_file = os.path.join(temp_dir, "App.jsx")

        # Add React imports if missing
        if "import React" not in code and "from 'react'" not in code:
            code = f"""
import React from 'react';
import ReactDOM from 'react-dom/client';

{code}
"""

        with open(code_file, "w", encoding="utf-8") as f:
            f.write(code)

        return code_file

    def get_execution_command(self, code_file: str) -> list:
        """
        Transpiliert JSX und gibt Ausführungs-Kommando zurück.

        Schritt 1: babel transpiliert .jsx zu .js
        Schritt 2: Rückgabe = ["node", "/tmp/App.js"]
        """
        # Get output JS path
        js_file = code_file.replace(".jsx", ".js")

        # Transpile JSX to JS with Babel
        transpile_result = subprocess.run(
            [
                "npx",
                "babel",
                code_file,
                "--out-file",
                js_file,
                "--presets=@babel/preset-react",
            ],
            capture_output=True,
            text=True,
            check=False,
        )

        if transpile_result.returncode != 0:
            error_msg = f"JSX transpilation failed: {transpile_result.stderr}"
            raise RuntimeError(error_msg)

        # Run transpiled JS with Node
        return ["node", js_file]
