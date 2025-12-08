#!/bin/bash

# 🔥 VIBE Agent Quick Launcher
# Öffnet alle drei Extensions in VS Code

echo "🔥 VIBE Agent Extensions Launcher"
echo "=================================="
echo ""

# Open all three extensions in VS Code
echo "🚀 Öffne v2.0 (Auto-Fix Agent)..."
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-agent

sleep 2

echo "🔥 Öffne v3.0 (Multi-Agent System)..."
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-v3

sleep 2

echo "🌊 Öffne v6.0 (SWARM)..."
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6

sleep 1

echo ""
echo "✅ Alle drei VS Code Fenster geöffnet!"
echo ""
echo "📋 Nächste Schritte:"
echo "  1. In jedem Fenster: Drücke F5"
echo "  2. Extension Development Host startet"
echo "  3. Setze OpenAI API Keys in Settings"
echo "  4. Führe Commands aus (Cmd+Shift+P)"
echo ""
echo "💡 Siehe VIBE_AGENTS_QUICKSTART.md für Details"
echo ""
echo "🎯 Empfehlung für VibeAI Backend:"
echo "   → Nutze v3.0 für Code-Repairs"
echo "   → Nutze v6.0 für neue Features"
echo ""
