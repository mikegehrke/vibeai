# VIBE AUTO-FIX AGENT (VS Code Extension)

This extension scans your entire workspace, sends files through GPT-4 for analysis and repair, 
creates fixes, and auto-applies them safely.

## Command in VS Code:
→ `Vibe: Auto Fix Entire Project`

Before applying fixes, it generates backups under `.vibe-backup/`.

## Requires:
→ OPENAI_API_KEY as environment variable.

## Installation:
1. `cd vibe-autofix`
2. `npm install`
3. Open in VS Code and press F5 to debug

## Usage:
1. Open your project in VS Code
2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
3. Type: "Vibe: Auto Fix Entire Project"
4. Wait for AI to fix all files
5. Check `.vibe-backup/` for originals
