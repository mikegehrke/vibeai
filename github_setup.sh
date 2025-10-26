#!/bin/bash

# VibeAI GitHub Setup Script
echo "🚀 VibeAI GitHub Setup"
echo "====================="
echo ""

# Schritt 1: Prüfe GitHub CLI Authentication
echo "📝 Schritt 1: GitHub Authentication prüfen..."
if ! gh auth status &>/dev/null; then
    echo "❌ Nicht bei GitHub angemeldet"
    echo ""
    echo "Bitte führe manuell aus:"
    echo "  gh auth login"
    echo ""
    echo "Wähle dann:"
    echo "  1. GitHub.com"
    echo "  2. HTTPS"
    echo "  3. Yes (Git credentials)"
    echo "  4. Login with a web browser"
    echo ""
    exit 1
fi

echo "✅ GitHub Authentication OK"
echo ""

# Schritt 2: Repository erstellen
echo "📝 Schritt 2: GitHub Repository erstellen..."
cd /Users/mikegehrke/Development/vibeai

# Repository Details
REPO_NAME="vibeai"
DESCRIPTION="🚀 Premium AI App Development Studio - Flutter/Dart with GPT-4o, Monaco Editor, Live Preview, Git Integration"

# Erstelle Repository
echo "Creating repository: $REPO_NAME"
gh repo create "$REPO_NAME" \
    --public \
    --description "$DESCRIPTION" \
    --source=. \
    --remote=origin \
    --push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Repository erfolgreich erstellt!"
    echo ""
    echo "🎉 Dein Repository:"
    GITHUB_USER=$(gh api user --jq .login)
    echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📊 Status:"
    echo "   - 112 Dateien"
    echo "   - 22.828 Zeilen Code"
    echo "   - Commit: 5115316"
    echo ""
else
    echo "❌ Fehler beim Erstellen des Repositories"
    exit 1
fi
