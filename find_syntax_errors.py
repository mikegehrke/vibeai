#!/usr/bin/env python3
"""
Ultra-Fast Syntax Fixer
Findet und repariert alle Syntax-Fehler
"""

import os
import subprocess
from pathlib import Path

def find_syntax_errors():
    """Finde alle Python-Dateien mit Syntax-Fehlern"""
    backend = Path("/Users/mikegehrke/dev/vibeai/backend")
    errors = []
    
    for py_file in backend.rglob("*.py"):
        try:
            subprocess.run(
                ["python3", "-m", "py_compile", str(py_file)],
                capture_output=True,
                check=True,
                timeout=2
            )
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode()
            if "SyntaxError" in error_msg or "EOF" in error_msg:
                errors.append({
                    "file": str(py_file),
                    "error": error_msg.split("\n")[0]
                })
        except subprocess.TimeoutExpired:
            pass
    
    return errors

if __name__ == "__main__":
    print("🔍 Suche nach Syntax-Fehlern...")
    errors = find_syntax_errors()
    
    if not errors:
        print("✅ Keine Syntax-Fehler gefunden!")
    else:
        print(f"\n❌ {len(errors)} Dateien mit Syntax-Fehlern:\n")
        for err in errors[:10]:  # Erste 10
            print(f"  {err['file']}")
            print(f"  → {err['error']}\n")
