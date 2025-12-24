#!/bin/bash

# VibeAI Backend Start Script mit Auto-Restart
# Startet Backend und überwacht es - startet automatisch neu bei Absturz

cd "$(dirname "$0")/backend"

echo "🚀 Starte VibeAI Backend auf Port 8005..."

# Funktion zum Starten des Backends
start_backend() {
    python3 main.py
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -ne 0 ]; then
        echo "⚠️  Backend abgestürzt (Exit Code: $EXIT_CODE)"
        echo "🔄 Starte in 3 Sekunden neu..."
        sleep 3
        return 1
    fi
    return 0
}

# Endlosschleife: Starte Backend, bei Absturz neu starten
while true; do
    start_backend
    if [ $? -eq 0 ]; then
        echo "✅ Backend beendet normal"
        break
    fi
done

