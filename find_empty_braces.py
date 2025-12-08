#!/usr/bin/env python3
with open('/Users/mikegehrke/dev/vibeai/backend/ai/realtime_generator/realtime_generator.py', 'r') as f:
    lines = f.readlines()

import re
# Suche nach leeren {} in Zeilen 260-776 
for i in range(259, 777):
    line = lines[i]
    # Simple: suche {} das nicht {{ oder }} ist
    # Lösche erst alle {{ und }}
    test = line.replace('{{', '  ').replace('}}', '  ')
    if '{}' in test:
        print(f'{i+1}: {line.rstrip()}')
