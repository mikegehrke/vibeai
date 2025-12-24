# 🚀 VibeAI Frontend Start-Anleitung

## Schnellstart

### Option 1: Automatisches Start-Skript (Empfohlen)

```bash
# Frontend starten (im Hintergrund)
cd frontend
./start_frontend.sh

# Frontend im Vordergrund starten (für Debugging)
./start_frontend.sh --foreground

# Frontend stoppen
./start_frontend.sh --stop

# Frontend-Status prüfen
./start_frontend.sh --status

# Dependencies installieren
./start_frontend.sh --install
```

### Option 2: Manueller Start

```bash
# 1. Ins Frontend-Verzeichnis wechseln
cd frontend

# 2. Dependencies installieren (nur beim ersten Mal oder nach Änderungen)
npm install

# 3. Frontend starten
npm run dev
```

### Option 3: Im Hintergrund mit Log-Datei

```bash
cd frontend
npm run dev > /tmp/vibeai_frontend.log 2>&1 &
```

## Frontend-Status prüfen

```bash
# Im Browser öffnen
open http://localhost:3000

# Oder mit curl testen
curl http://localhost:3000
```

## Logs ansehen

```bash
# Live-Logs ansehen
tail -f /tmp/vibeai_frontend.log

# Letzte 50 Zeilen
tail -50 /tmp/vibeai_frontend.log

# Fehler suchen
grep -i error /tmp/vibeai_frontend.log
```

## Frontend stoppen

### Mit Start-Skript
```bash
./start_frontend.sh --stop
```

### Manuell
```bash
# Prozess finden
ps aux | grep "next dev"

# Prozess beenden (PID aus obiger Ausgabe)
kill <PID>

# Oder alle Next.js-Prozesse beenden
pkill -f "next dev"
```

## Troubleshooting

### Port 3000 bereits belegt
```bash
# Prüfe welcher Prozess Port 3000 verwendet
lsof -ti:3000

# Beende den Prozess
kill $(lsof -ti:3000)
```

### Frontend startet nicht
```bash
# Prüfe Node.js-Version (sollte 18+ sein)
node --version
npm --version

# Lösche node_modules und installiere neu
cd frontend
rm -rf node_modules package-lock.json
npm install

# Lösche .next Cache
rm -rf .next
npm run dev
```

### Frontend antwortet nicht
```bash
# Prüfe ob Frontend läuft
curl http://localhost:3000

# Prüfe Logs
tail -f /tmp/vibeai_frontend.log

# Prüfe ob Port offen ist
netstat -an | grep 3000
```

### Dependencies-Fehler
```bash
# Lösche alles und installiere neu
cd frontend
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

## Wichtige URLs

- **Frontend**: http://localhost:3000
- **Builder**: http://localhost:3000/builder/[projectId]

## Log-Dateien

- **Frontend-Logs**: `/tmp/vibeai_frontend.log`
- **PID-Datei**: `/tmp/vibeai_frontend.pid`

## Entwicklung

Für die Entwicklung mit Hot-Reload (empfohlen):
```bash
cd frontend
npm run dev
```

Next.js startet automatisch mit Hot-Reload, d.h. Änderungen werden sofort im Browser sichtbar.

## Build für Produktion

```bash
cd frontend
npm run build
npm start
```

## Wichtige npm-Befehle

- `npm install` - Installiert alle Dependencies
- `npm run dev` - Startet Development-Server
- `npm run build` - Erstellt Production-Build
- `npm start` - Startet Production-Server
- `npm run lint` - Führt Linter aus

## Backend-Verbindung

Das Frontend verbindet sich automatisch mit dem Backend auf:
- **Backend URL**: http://127.0.0.1:8005
- **WebSocket URL**: ws://127.0.0.1:8005

Stelle sicher, dass das Backend läuft, bevor du das Frontend startest!



