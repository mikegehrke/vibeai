#!/bin/bash

# VibeAI Projekt auf interne Festplatte verschieben
# SICHER: Kopiert erst, dann kannst du die alte Version löschen

SOURCE="/Volumes/Crucial X9 Pro For Mac/Development/Projects/development/vibeai"
DEST="$HOME/Development/vibeai"

echo "📁 Zielordner: $DEST"
echo "   (NICHT auf dem Schreibtisch, sondern im Development-Ordner)"

echo "📦 Verschiebe VibeAI Projekt auf interne Festplatte..."
echo "Quelle: $SOURCE"
echo "Ziel: $DEST"
echo ""
echo "⚠️  WICHTIG: Dies kann einige Minuten dauern (882MB)"
echo ""

# Prüfe ob Ziel existiert
if [ -d "$DEST" ]; then
    echo "⚠️  Zielordner existiert bereits!"
    read -p "Löschen und neu kopieren? (j/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[JjYy]$ ]]; then
        rm -rf "$DEST"
    else
        echo "❌ Abgebrochen"
        exit 1
    fi
fi

# Kopiere Projekt
echo "🔄 Kopiere Projekt..."
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.vibe-backup' \
    --exclude 'backend/user_projects' \
    "$SOURCE/" "$DEST/"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Projekt erfolgreich kopiert!"
    echo ""
    echo "📝 Nächste Schritte:"
    echo "1. Prüfe ob alles funktioniert: cd $DEST"
    echo "2. Starte Backend: cd backend && python3 main.py"
    echo "3. Starte Frontend: cd frontend && npm run dev"
    echo "4. Wenn alles funktioniert, kannst du die alte Version löschen"
    echo ""
    echo "⚠️  WICHTIG: Prüfe zuerst ob alles funktioniert!"
else
    echo "❌ Fehler beim Kopieren!"
    exit 1
fi

