#!/bin/bash
# ============================================================
# VIBEAI BACKEND START-SKRIPT
# ============================================================
# Dieses Skript startet das VibeAI Backend auf Port 8005
#
# Verwendung:
#   ./start_backend.sh          # Startet Backend im Hintergrund
#   ./start_backend.sh --foreground  # Startet Backend im Vordergrund
#   ./start_backend.sh --stop   # Stoppt laufendes Backend
# ============================================================

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backend-Verzeichnis
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/vibeai_backend.log"
PID_FILE="/tmp/vibeai_backend.pid"

# Funktion: Backend stoppen
stop_backend() {
    echo -e "${YELLOW}🛑 Stoppe Backend...${NC}"
    
    # Prüfe ob PID-Datei existiert
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            kill "$PID" 2>/dev/null
            echo -e "${GREEN}✅ Backend-Prozess $PID beendet${NC}"
        fi
        rm -f "$PID_FILE"
    fi
    
    # Stoppe alle uvicorn-Prozesse
    pkill -f "uvicorn main:app" 2>/dev/null
    sleep 1
    
    # Prüfe ob noch Prozesse laufen
    if pgrep -f "uvicorn main:app" > /dev/null; then
        echo -e "${RED}⚠️  Einige Prozesse laufen noch. Versuche force kill...${NC}"
        pkill -9 -f "uvicorn main:app" 2>/dev/null
    fi
    
    echo -e "${GREEN}✅ Backend gestoppt${NC}"
}

# Funktion: Backend-Status prüfen
check_backend() {
    if curl -s http://127.0.0.1:8005/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend läuft auf http://127.0.0.1:8005${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend läuft nicht${NC}"
        return 1
    fi
}

# Funktion: Backend starten
start_backend() {
    local FOREGROUND=$1
    
    # Prüfe ob Backend bereits läuft
    if check_backend > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Backend läuft bereits!${NC}"
        echo -e "   Verwende './start_backend.sh --stop' um es zu stoppen"
        return 1
    fi
    
    # Stoppe alte Prozesse
    pkill -f "uvicorn main:app" 2>/dev/null
    sleep 1
    
    echo -e "${GREEN}🚀 Starte VibeAI Backend...${NC}"
    echo -e "   Verzeichnis: $BACKEND_DIR"
    echo -e "   Port: 8005"
    echo -e "   Log: $LOG_FILE"
    
    cd "$BACKEND_DIR" || exit 1
    
    if [ "$FOREGROUND" = "true" ]; then
        # Im Vordergrund starten
        echo -e "${YELLOW}📋 Backend läuft im Vordergrund (Ctrl+C zum Beenden)${NC}"
        # ⚡ WICHTIG: KEIN --reload, da Projekt-Erstellung viele Dateien erstellt und Reloads blockieren!
        python3 -m uvicorn main:app --host 0.0.0.0 --port 8005 --log-level info
    else
        # Im Hintergrund starten
        # ⚡ WICHTIG: KEIN --reload, da Projekt-Erstellung viele Dateien erstellt und Reloads blockieren!
        nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8005 --log-level info > "$LOG_FILE" 2>&1 &
        PID=$!
        echo "$PID" > "$PID_FILE"
        
        echo -e "${GREEN}✅ Backend gestartet (PID: $PID)${NC}"
        echo -e "   Log-Datei: $LOG_FILE"
        echo -e "   PID-Datei: $PID_FILE"
        
        # Warte kurz und prüfe Status
        sleep 3
        if check_backend; then
            echo -e "${GREEN}✅ Backend ist bereit!${NC}"
            echo -e "   Health-Check: http://127.0.0.1:8005/health"
            echo -e "   API Docs: http://127.0.0.1:8005/docs"
        else
            echo -e "${RED}⚠️  Backend startet noch... Prüfe Logs: tail -f $LOG_FILE${NC}"
        fi
    fi
}

# Hauptlogik
case "$1" in
    --stop)
        stop_backend
        ;;
    --status)
        check_backend
        ;;
    --foreground|-f)
        start_backend true
        ;;
    --help|-h)
        echo "VibeAI Backend Start-Skript"
        echo ""
        echo "Verwendung:"
        echo "  ./start_backend.sh              # Startet Backend im Hintergrund"
        echo "  ./start_backend.sh --foreground # Startet Backend im Vordergrund"
        echo "  ./start_backend.sh --stop       # Stoppt laufendes Backend"
        echo "  ./start_backend.sh --status     # Prüft Backend-Status"
        echo "  ./start_backend.sh --help       # Zeigt diese Hilfe"
        ;;
    *)
        start_backend false
        ;;
esac

