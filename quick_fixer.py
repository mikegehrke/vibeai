#!/usr/bin/env python3
"""Schneller Fehler-Fixer für vibeai Backend"""

import os
import json
import re
import subprocess
from pathlib import Path

def read_error_report(report_path="error_report.json"):
    """Lese Fehler-Report"""
    with open(report_path) as f:
        return json.load(f)

def get_full_path(rel_path, base_dir="backend"):
    """Konvertiere relativen Pfad zu absolutem"""
    full = os.path.join(base_dir, rel_path)
    if os.path.exists(full):
        return full
    return None

def fix_unused_imports(file_path):
    """Entferne ungenutzte Imports mit autoflake"""
    try:
        subprocess.run([
            "autoflake",
            "--in-place",
            "--remove-all-unused-imports",
            file_path
        ], check=False, capture_output=True)
        return True
    except:
        return False

def fix_style_warnings(file_path):
    """Formatiere Code mit black und isort"""
    try:
        # isort für imports
        subprocess.run(["isort", file_path], check=False, capture_output=True)
        # black für formatting
        subprocess.run(["black", "-l", "120", file_path], check=False, capture_output=True)
        return True
    except:
        return False

def fix_realtime_generator():
    """Fixe realtime_generator.py f-string Problem"""
    disabled = "backend/ai/realtime_generator/realtime_generator.py.disabled"
    enabled = "backend/ai/realtime_generator/realtime_generator.py"
    
    # Wenn disabled existiert, reaktiviere
    if os.path.exists(disabled):
        try:
            with open(disabled, 'r') as f:
                content = f.read()
            
            # Finde problematische f-strings und escapiere sie
            # Ersetze f""" mit regular """ für template strings
            lines = content.split('\n')
            fixed_lines = []
            in_template = False
            
            for i, line in enumerate(lines):
                # Zeile 489 ist das Problem
                if i == 488:  # 0-indexed
                    # Escapiere geschweifte Klammern in f-strings
                    fixed_line = line
                    # Wenn es ein f-string ist mit unescaped braces
                    if 'f"""' in line or "f'''" in line:
                        # Entferne das f prefix
                        fixed_line = line.replace('f"""', '"""').replace("f'''", "'''")
                    fixed_lines.append(fixed_line)
                else:
                    fixed_lines.append(line)
            
            # Speichere korrigierte Version
            with open(enabled, 'w') as f:
                f.write('\n'.join(fixed_lines))
            
            print(f"✅ {enabled} reaktiviert und gefixt")
            return True
        except Exception as e:
            print(f"❌ Fehler beim Fixen von realtime_generator: {e}")
            return False
    return False

def main():
    """Hauptfunktion"""
    print("🚀 Quick Fixer")
    print("=" * 70)
    
    # Lade Report
    report = read_error_report()
    
    # Statistiken
    total_fixed = 0
    files_processed = set()
    
    # 1. Fixe realtime_generator zuerst
    print("\n📝 Fixe realtime_generator.py...")
    if fix_realtime_generator():
        total_fixed += 1
    
    # 2. Sammle alle betroffenen Dateien
    all_files = set()
    
    for error in report.get("import_errors", []):
        path = get_full_path(error["file"])
        if path:
            all_files.add(path)
    
    for error in report.get("style_warnings", []):
        path = get_full_path(error["file"])
        if path:
            all_files.add(path)
    
    # 3. Fixe jede Datei einmal
    print(f"\n📁 Bearbeite {len(all_files)} Dateien...")
    
    for file_path in sorted(all_files):
        try:
            # Unused imports entfernen
            if fix_unused_imports(file_path):
                files_processed.add(file_path)
            
            # Code formatieren
            if fix_style_warnings(file_path):
                total_fixed += 1
                print(f"✅ {os.path.relpath(file_path)}")
        except Exception as e:
            print(f"⚠️  Fehler bei {file_path}: {e}")
    
    # Zusammenfassung
    print("\n" + "=" * 70)
    print(f"✨ {total_fixed} Dateien bearbeitet!")
    print(f"📂 {len(files_processed)} Dateien mit Import-Fixes")
    print("=" * 70)
    
    print("\n💡 Führe jetzt aus: python3 error_analyzer.py backend --save")

if __name__ == "__main__":
    main()
