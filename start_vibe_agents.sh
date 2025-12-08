#!/bin/bash

# 🔥 VIBE Agent Extensions Launcher
# Startet alle drei Extensions gleichzeitig in VS Code

echo "🔥 VIBE Agent Extensions Launcher"
echo "=================================="
echo ""
echo "📦 Verfügbare Versionen:"
echo "  v2.0 - vibe-autofix-agent     (Original Auto-Fix Agent)"
echo "  v3.0 - vibe-autofix-v3        (Multi-Agent mit Analyzer, Fix, Refactor, Security)"
echo "  v6.0 - vibe-swarm-agent-v6    (Complete SWARM mit 10 Agenten + GUI Builder)"
echo ""

WORKSPACE_ROOT="/Users/mikegehrke/dev/vibeai"

# Function to open VS Code workspace
open_vscode_workspace() {
    local version=$1
    local path=$2
    local name=$3
    
    echo "🚀 Starting $name..."
    
    # Open in VS Code
    code "$path"
    
    sleep 2
}

# Menu selection
echo "Wähle eine Option:"
echo "1) Starte v2.0 (Original Auto-Fix Agent)"
echo "2) Starte v3.0 (Multi-Agent System)"
echo "3) Starte v6.0 (SWARM)"
echo "4) Starte ALLE drei gleichzeitig"
echo "5) Zeige Info über alle Versionen"
echo ""
read -p "Deine Wahl (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starte v2.0 Agent..."
        cd "$WORKSPACE_ROOT/vibe-autofix-agent"
        echo "✅ Dependencies: $(jq -r '.dependencies | keys | length' package.json) packages"
        code .
        echo ""
        echo "💡 Drücke F5 in VS Code um die Extension zu starten"
        echo "💡 Setze OpenAI API Key in .env"
        ;;
    2)
        echo ""
        echo "🚀 Starte v3.0 Multi-Agent..."
        cd "$WORKSPACE_ROOT/vibe-autofix-v3"
        echo "✅ Dependencies: $(jq -r '.dependencies | keys | length' package.json) packages"
        code .
        echo ""
        echo "💡 Drücke F5 in VS Code um die Extension zu starten"
        echo "💡 Setze API Key: vibe.openaiApiKey in VS Code Settings"
        ;;
    3)
        echo ""
        echo "🚀 Starte v6.0 SWARM..."
        cd "$WORKSPACE_ROOT/vibe-swarm-agent-v6"
        echo "✅ Dependencies: $(jq -r '.dependencies | keys | length' package.json) packages"
        echo "✅ Agents: 10 (Architect, PM, FeatureDev, Bugfix, Refactor, Tester, DevOps, Security, Docs, Reviewer)"
        code .
        echo ""
        echo "💡 Drücke F5 in VS Code um die Extension zu starten"
        echo "💡 Setze API Key: vibe.swarm.openaiApiKey in VS Code Settings"
        ;;
    4)
        echo ""
        echo "🚀 Starte ALLE drei Extensions..."
        echo ""
        
        # Open all three in VS Code
        code "$WORKSPACE_ROOT/vibe-autofix-agent"
        sleep 1
        code "$WORKSPACE_ROOT/vibe-autofix-v3"
        sleep 1
        code "$WORKSPACE_ROOT/vibe-swarm-agent-v6"
        
        echo "✅ Alle drei VS Code Fenster geöffnet!"
        echo ""
        echo "📋 Nächste Schritte:"
        echo "  1. In jedem Fenster: F5 drücken"
        echo "  2. Extension Development Host startet"
        echo "  3. API Keys konfigurieren"
        echo "  4. Commands ausführen"
        ;;
    5)
        echo ""
        echo "📊 VIBE Agent Extensions Übersicht"
        echo "===================================="
        echo ""
        
        echo "🤖 v2.0 - vibe-autofix-agent"
        echo "   Pfad: $WORKSPACE_ROOT/vibe-autofix-agent"
        echo "   Features:"
        echo "     - Autonomous file scanning"
        echo "     - GPT-4o AI repair"
        echo "     - Automatic backups"
        echo "     - CLI + VS Code Extension"
        echo "   Commands:"
        echo "     - node cli-agent.js (Terminal)"
        echo "     - Vibe Auto-Fix (VS Code Command)"
        echo ""
        
        echo "🔥 v3.0 - vibe-autofix-v3"
        echo "   Pfad: $WORKSPACE_ROOT/vibe-autofix-v3"
        echo "   Features:"
        echo "     - 4 AI Agents (Analyzer, Fix, Refactor, Security)"
        echo "     - Sidebar Panel mit Live-Status"
        echo "     - Diff Preview vor Apply"
        echo "     - Autopilot Mode"
        echo "     - Version Snapshots"
        echo "   Commands:"
        echo "     - Vibe Auto-Fix Full Project"
        echo "     - Vibe Autopilot Mode"
        echo "     - Create Vibe Snapshot"
        echo ""
        
        echo "🌊 v6.0 - vibe-swarm-agent-v6"
        echo "   Pfad: $WORKSPACE_ROOT/vibe-swarm-agent-v6"
        echo "   Features:"
        echo "     - 10 Specialized Agents (komplettes Dev-Team)"
        echo "     - Parallel Execution (bis zu 5 gleichzeitig)"
        echo "     - Agent-to-Agent Communication"
        echo "     - GUI Builder (React/Flutter/SwiftUI/Compose/Vue)"
        echo "     - Full Project Generator"
        echo "     - Project Memory System"
        echo "     - Autopilot Continuous Mode"
        echo "   Agents:"
        echo "     - Chief Architect, PM, FeatureDev, Bugfix, Refactor,"
        echo "     - Tester, DevOps, Security, Documentation, Reviewer"
        echo "   Commands:"
        echo "     - VIBE Swarm: Auto Dev"
        echo "     - VIBE Swarm: Autopilot Mode"
        echo "     - VIBE GUI Builder"
        echo "     - VIBE Full Project Generator"
        echo "     - VIBE Dev Console"
        echo ""
        
        echo "📈 Vergleich:"
        echo "   v2.0: Simple, fast, single-agent"
        echo "   v3.0: Multi-agent pipeline, preview mode"
        echo "   v6.0: Complete autonomous dev team, full SWARM"
        ;;
    *)
        echo ""
        echo "❌ Ungültige Auswahl"
        exit 1
        ;;
esac

echo ""
echo "✅ Fertig!"
