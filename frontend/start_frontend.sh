#!/bin/bash
# ============================================================
# VIBEAI FRONTEND START-SKRIPT
# ============================================================
# Dieses Skript startet das VibeAI Frontend auf Port 3000
#
# Verwendung:
#   ./start_frontend.sh          # Startet Frontend im Hintergrund
#   ./start_frontend.sh --foreground  # Startet Frontend im Vordergrund
#   ./start_frontend.sh --stop   # Stoppt laufendes Frontend
# ============================================================

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Frontend-Verzeichnis
FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/vibeai_frontend.log"
PID_FILE="/tmp/vibeai_frontend.pid"

# Funktion: Frontend stoppen
stop_frontend() {
    echo -e "${YELLOW}🛑 Stoppe Frontend...${NC}"
    
    # Prüfe ob PID-Datei existiert
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            kill "$PID" 2>/dev/null
            echo -e "${GREEN}✅ Frontend-Prozess $PID beendet${NC}"
        fi
        rm -f "$PID_FILE"
    fi
    
    # Stoppe alle Next.js-Prozesse
    pkill -f "next dev" 2>/dev/null
    pkill -f "node.*next" 2>/dev/null
    sleep 1
    
    # Prüfe ob noch Prozesse laufen
    if pgrep -f "next dev" > /dev/null; then
        echo -e "${RED}⚠️  Einige Prozesse laufen noch. Versuche force kill...${NC}"
        pkill -9 -f "next dev" 2>/dev/null
    fi
    
    echo -e "${GREEN}✅ Frontend gestoppt${NC}"
}

# Funktion: Frontend-Status prüfen
check_frontend() {
    if curl -s http://localhost:3000 > /dev/null 2>&1 || curl -s http://127.0.0.1:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend läuft auf http://localhost:3000${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend läuft nicht${NC}"
        return 1
    fi
}

# Funktion: Dependencies installieren
install_dependencies() {
    echo -e "${YELLOW}📦 Prüfe Dependencies...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installiere Dependencies (das kann einige Minuten dauern)...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Fehler beim Installieren der Dependencies${NC}"
            return 1
        fi
        echo -e "${GREEN}✅ Dependencies installiert${NC}"
    else
        echo -e "${GREEN}✅ Dependencies bereits installiert${NC}"
    fi
}

# Funktion: Frontend starten
start_frontend() {
    local FOREGROUND=$1
    
    # Prüfe ob Frontend bereits läuft
    if check_frontend > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Frontend läuft bereits!${NC}"
        echo -e "   Verwende './start_frontend.sh --stop' um es zu stoppen"
        return 1
    fi
    
    # Stoppe alte Prozesse
    pkill -f "next dev" 2>/dev/null
    sleep 1
    
    echo -e "${GREEN}🚀 Starte VibeAI Frontend...${NC}"
    echo -e "   Verzeichnis: $FRONTEND_DIR"
    echo -e "   Port: 3000"
    echo -e "   Log: $LOG_FILE"
    
    cd "$FRONTEND_DIR" || exit 1
    
    # Installiere Dependencies falls nötig
    install_dependencies || return 1
    
    if [ "$FOREGROUND" = "true" ]; then
        # Im Vordergrund starten
        echo -e "${YELLOW}📋 Frontend läuft im Vordergrund (Ctrl+C zum Beenden)${NC}"
        npm run dev
    else
        # Im Hintergrund starten
        nohup npm run dev > "$LOG_FILE" 2>&1 &
        PID=$!
        echo "$PID" > "$PID_FILE"
        
        echo -e "${GREEN}✅ Frontend gestartet (PID: $PID)${NC}"
        echo -e "   Log-Datei: $LOG_FILE"
        echo -e "   PID-Datei: $PID_FILE"
        
        # Warte kurz und prüfe Status
        echo -e "${YELLOW}⏳ Warte auf Frontend-Start (kann 10-30 Sekunden dauern)...${NC}"
        sleep 5
        
        # Prüfe mehrmals (Next.js braucht Zeit zum Starten)
        for i in {1..6}; do
            sleep 5
            if check_frontend > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Frontend ist bereit!${NC}"
                echo -e "   URL: http://localhost:3000"
                echo -e "   Logs: tail -f $LOG_FILE"
                return 0
            fi
            echo -e "${YELLOW}   Warte noch... ($i/6)${NC}"
        done
        
        echo -e "${YELLOW}⚠️  Frontend startet noch... Prüfe Logs: tail -f $LOG_FILE${NC}"
        echo -e "   Oder öffne: http://localhost:3000"
    fi
}

# Hauptlogik
case "$1" in
    --stop)
        stop_frontend
        ;;
    --status)
        check_frontend
        ;;
    --foreground|-f)
        start_frontend true
        ;;
    --install)
        cd "$FRONTEND_DIR" || exit 1
        install_dependencies
        ;;
    --help|-h)
        echo "VibeAI Frontend Start-Skript"
        echo ""
        echo "Verwendung:"
        echo "  ./start_frontend.sh              # Startet Frontend im Hintergrund"
        echo "  ./start_frontend.sh --foreground # Startet Frontend im Vordergrund"
        echo "  ./start_frontend.sh --stop       # Stoppt laufendes Frontend"
        echo "  ./start_frontend.sh --status    # Prüft Frontend-Status"
        echo "  ./start_frontend.sh --install   # Installiert Dependencies"
        echo "  ./start_frontend.sh --help      # Zeigt diese Hilfe"
        ;;
    *)
        start_frontend false
        ;;
esac



