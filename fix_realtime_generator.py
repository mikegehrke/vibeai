#!/usr/bin/env python3
"""
Ultimate Fixer für realtime_generator.py
Behebt alle f-string Template Probleme
"""

import re
from pathlib import Path


def fix_realtime_generator():
    """Behebt alle Probleme in realtime_generator.py"""
    
    file_path = Path('/Users/mikegehrke/dev/vibeai/backend/ai/realtime_generator/realtime_generator.py')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    fixes = 0
    
    # Problem 1: Der große f-string von Zeile 260-776 hat Template-Syntax-Probleme
    # Lösung: Teile den f-string in kleinere Teile oder entferne f-string wo nicht nötig
    
    # Finde den problematischen f-string
    # Zwischen 'return f\'\'\'"""' und dem schließenden '\'\'\''
    
    # Strategie: Ersetze das f''' am Anfang mit ''' und verwende .format() für Variablen
    content = re.sub(
        r"return f'''\"\"\"",
        r"return '''\"\"\"",
        content
    )
    
    # Ersetze {protocol.value} mit Platzhalter
    content = re.sub(
        r'Protocol: \{protocol\.value\}',
        r'Protocol: {PROTOCOL_VALUE}',
        content
    )
    
    # Ersetze {str(...).lower()} Ausdrücke mit Platzhaltern
    content = re.sub(
        r'\{str\(has_ai\)\.lower\(\)\}',
        r'{HAS_AI}',
        content
    )
    content = re.sub(
        r'\{str\(has_translation\)\.lower\(\)\}',
        r'{HAS_TRANSLATION}',
        content
    )
    content = re.sub(
        r'\{str\(has_files\)\.lower\(\)\}',
        r'{HAS_FILES}',
        content
    )
    content = re.sub(
        r'\{str\(ChatFeature\.TYPING_INDICATOR in config\.chat_features\)\.lower\(\)\}',
        r'{TYPING_INDICATOR}',
        content
    )
    content = re.sub(
        r'\{str\(ChatFeature\.READ_RECEIPTS in config\.chat_features\)\.lower\(\)\}',
        r'{READ_RECEIPTS}',
        content
    )
    content = re.sub(
        r'\{str\(ChatFeature\.MESSAGE_REACTIONS in config\.chat_features\)\.lower\(\)\}',
        r'{MESSAGE_REACTIONS}',
        content
    )
    
    # Jetzt füge am Ende der Funktion .format() hinzu
    # Finde die Stelle nach dem schließenden '''
    
    # Zähle Änderungen
    if content != original_content:
        fixes += 1
        print("✅ f-string zu template string konvertiert")
    
    # Schreibe die Datei zurück
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Jetzt müssen wir noch die .format() Aufrufe hinzufügen
    # Das machen wir mit einem zweiten Durchgang
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    in_template = False
    template_start = 0
    
    for i, line in enumerate(lines):
        line_num = i + 1
        
        # Finde den Start des Templates (nach "return '''")
        if line_num == 261 and "return '''" in line:
            in_template = True
            template_start = line_num
        
        # Finde das Ende (die schließenden ''')
        if in_template and line.strip() == "'''" and line_num > 270:
            # Füge .format() Aufruf hinzu
            new_lines.append(line.rstrip() + '.format(\n')
            new_lines.append('            PROTOCOL_VALUE=protocol.value,\n')
            new_lines.append('            HAS_AI=str(has_ai).lower(),\n')
            new_lines.append('            HAS_TRANSLATION=str(has_translation).lower(),\n')
            new_lines.append('            HAS_FILES=str(has_files).lower(),\n')
            new_lines.append('            TYPING_INDICATOR=str(ChatFeature.TYPING_INDICATOR in config.chat_features).lower(),\n')
            new_lines.append('            READ_RECEIPTS=str(ChatFeature.READ_RECEIPTS in config.chat_features).lower(),\n')
            new_lines.append('            MESSAGE_REACTIONS=str(ChatFeature.MESSAGE_REACTIONS in config.chat_features).lower()\n')
            new_lines.append('        )\n')
            in_template = False
            fixes += 1
            print(f"✅ .format() Call hinzugefügt nach Zeile {line_num}")
            continue
        
        new_lines.append(line)
    
    # Schreibe zurück
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"\n✅ {fixes} Korrekturen in realtime_generator.py durchgeführt")
    return fixes


def main():
    """Hauptfunktion"""
    print("🔧 Starte Ultimate Fix für realtime_generator.py...\n")
    
    fixes = fix_realtime_generator()
    
    # Teste ob es kompiliert
    print("\n🧪 Teste Kompilierung...")
    file_path = Path('/Users/mikegehrke/dev/vibeai/backend/ai/realtime_generator/realtime_generator.py')
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            compile(f.read(), str(file_path), 'exec')
        print("✅ Datei kompiliert erfolgreich!")
        print("\n🎉 Alle Probleme in realtime_generator.py behoben!")
    except SyntaxError as e:
        print(f"❌ Noch Syntax-Fehler in Zeile {e.lineno}: {e.msg}")
        return False
    
    return True


if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
