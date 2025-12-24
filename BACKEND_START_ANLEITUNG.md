# 🚀 VibeAI Backend Start-Anleitung

## Schnellstart

### Option 1: Automatisches Start-Skript (Empfohlen)

```bash
# Backend starten (im Hintergrund)
cd backend
./start_backend.sh

# Backend im Vordergrund starten (für Debugging)
./start_backend.sh --foreground

# Backend stoppen
./start_backend.sh --stop

# Backend-Status prüfen
./start_backend.sh --status
```

### Option 2: Manueller Start

```bash
# 1. Ins Backend-Verzeichnis wechseln
cd backend

# 2. Backend starten
# ⚡ WICHTIG: KEIN --reload, da Projekt-Erstellung viele Dateien erstellt und Reloads blockieren!
python3 -m uvicorn main:app --host 0.0.0.0 --port 8005 --log-level info
```

### Option 3: Im Hintergrund mit Log-Datei

```bash
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8005 --log-level info > /tmp/vibeai_backend.log 2>&1 &
```

## Backend-Status prüfen

```bash
# Health-Check
curl http://127.0.0.1:8005/health

# API-Dokumentation öffnen
open http://127.0.0.1:8005/docs
```

## Logs ansehen

```bash
# Live-Logs ansehen
tail -f /tmp/vibeai_backend.log

# Letzte 50 Zeilen
tail -50 /tmp/vibeai_backend.log

# Fehler suchen
grep -i error /tmp/vibeai_backend.log
```

## Backend stoppen

### Mit Start-Skript
```bash
./start_backend.sh --stop
```

### Manuell
```bash
# Prozess finden
ps aux | grep uvicorn

# Prozess beenden (PID aus obiger Ausgabe)
kill <PID>

# Oder alle uvicorn-Prozesse beenden
pkill -f "uvicorn main:app"
```

## Troubleshooting

### Port 8005 bereits belegt
```bash
# Prüfe welcher Prozess Port 8005 verwendet
lsof -ti:8005

# Beende den Prozess
kill $(lsof -ti:8005)
```

### Backend startet nicht
```bash
# Prüfe Python-Version (sollte 3.9+ sein)
python3 --version

# Prüfe ob alle Dependencies installiert sind
cd backend
pip3 install -r requirements.txt

# Prüfe Logs auf Fehler
tail -100 /tmp/vibeai_backend.log
```

### Backend antwortet nicht
```bash
# Prüfe ob Backend läuft
curl http://127.0.0.1:8005/health

# Prüfe Logs
tail -f /tmp/vibeai_backend.log

# Prüfe ob Port offen ist
netstat -an | grep 8005
```

## Wichtige URLs

- **Backend API**: http://127.0.0.1:8005
- **Health-Check**: http://127.0.0.1:8005/health
- **API-Dokumentation**: http://127.0.0.1:8005/docs
- **ReDoc**: http://127.0.0.1:8005/redoc

## Log-Dateien

- **Backend-Logs**: `/tmp/vibeai_backend.log`
- **Fehler-Logs**: `/tmp/vibeai_backend_errors.log`
- **PID-Datei**: `/tmp/vibeai_backend.pid`

## Entwicklung

Für die Entwicklung mit Auto-Reload (empfohlen):
```bash
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8005
```

Das `--reload` Flag sorgt dafür, dass das Backend automatisch neu startet, wenn sich Code ändert.

