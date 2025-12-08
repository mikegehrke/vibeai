#!/usr/bin/env python3
"""
Behebt die spezifischen Syntax-Fehler in team_engine Dateien
"""

import re
from pathlib import Path


def fix_team_engine(file_path):
    """Behebt Docstring-Probleme in team_engine.py"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Problem 1: Extra """ nach self._ensure_clients()
    content = re.sub(
        r'(self\._ensure_clients\(\))\n        """\n        \n        # Default',
        r'\1\n        \n        # Default',
        content
    )
    
    # Problem 2: Fehlerhafter Docstring-Inhalt in collaborate
    content = re.sub(
        r'(self\._ensure_clients\(\))\n            Collaboration result from specialist team\n        """\n        \n        if task_type',
        r'\1\n        \n        if task_type',
        content
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {file_path} behoben")


def fix_realtime_generator(file_path):
    """Behebt f-string Probleme in realtime_generator.py"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    skip_until = -1
    
    for i, line in enumerate(lines):
        if i < skip_until:
            continue
            
        # Entferne Template-Syntax-Probleme
        if '{"" if' in line or "{'''" in line:
            # Überspringe diese Zeilen
            continue
        if "''' if has_" in line and '"}' in line:
            continue
            
        new_lines.append(line)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"✅ {file_path} behoben")


def main():
    base = Path('/Users/mikegehrke/dev/vibeai/backend/ai')
    
    # Fix team_engine files
    team_files = [
        base / 'team' / 'team_engine.py',
        base / 'team' / 'team_engine_backup.py'
    ]
    
    for file_path in team_files:
        if file_path.exists():
            fix_team_engine(file_path)
    
    # Fix realtime_generator
    realtime_file = base / 'realtime_generator' / 'realtime_generator.py'
    if realtime_file.exists():
        fix_realtime_generator(realtime_file)
    
    print("\n✨ Alle Syntax-Fehler behoben!")


if __name__ == '__main__':
    main()
