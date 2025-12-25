# kernel/events.py
# ----------------
# Zentrale Definition aller Agent-Events.
# Diese Events sind die EINZIGE Art, wie der Agent
# mit Chat, Editor und anderen UI-Komponenten spricht.
#
# Kein Event = keine Sichtbarkeit.
# Kein Sonderweg. Kein stilles Arbeiten.

from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class AgentEvent:
    """
    Basisklasse für alle Agent-Events (Kernel v1.2+).

    Attribute:
    - type:    Art des Events (siehe EVENT_* Konstanten)
    - message: Menschlich lesbare Erklärung (für den Chat)
    - data:    Optionale Zusatzdaten (z.B. Datei, Zeile, Code)
    - scope:   Event-Sichtbarkeit (public, internal, debug)
    
    REGELN:
    - Kein Event → existiert nicht
    - Alles Sichtbare ist ein Event
    - Keine Freitexte ohne Event
    
    THOUGHT-SCOPES (Phase 1C):
    - public:   User sieht Denken (Default für alle Events)
    - internal: Nur für Debug/Learning Mode
    - debug:    Nur für System-Diagnostik
    """
    type: str
    message: str
    data: Optional[Dict[str, Any]] = None
    scope: str = "public"  # public | internal | debug


# Alias für Kernel-Kompatibilität
KernelEvent = AgentEvent


# --------------------------------------------------
# Event-Typen (Kernel v1.0 Spec - FINAL, ERWEITERBAR)
# --------------------------------------------------

# Denken & Planung
EVENT_THOUGHT = "thought"           # Denkprozess (kurz, menschlich)
EVENT_THOUGHT_INTERNAL = "thought_internal"  # Internes Denken (Debug/Learning)
EVENT_THOUGHT_PUBLIC = "thought_public"      # Öffentliches Denken (User sichtbar)
EVENT_ANALYSIS = "analysis"         # Agent analysiert die Aufgabe
EVENT_PLAN = "plan"                 # Nächster Schritt
EVENT_TODO = "todo"                 # To-Do-Liste
EVENT_DECISION = "decision"         # Agent-Entscheidung (mit Begründung)

# Dateisystem
EVENT_FILE_CREATE = "file_create"   # Datei angelegt
EVENT_FILE_UPDATE = "file_update"   # Datei wächst
EVENT_OPEN_FILE = "open_file"       # Datei wird geöffnet (deprecated)
EVENT_WRITE = "write"               # Code wird geschrieben (deprecated)

# System & Tools
EVENT_TERMINAL = "terminal"         # Terminal-Befehl
EVENT_GIT = "git"                   # clone / commit / push
EVENT_PREVIEW = "preview"           # Preview gestartet

# Fehler & Fixes
EVENT_ERROR = "error"               # Fehler erkannt
EVENT_FIX = "fix"                   # Fehler behoben

# Medien
EVENT_IMAGE_GENERATE = "image_generate"   # Bild erstellt
EVENT_IMAGE_ANALYZE = "image_analyze"     # Bild analysiert
EVENT_VIDEO_GENERATE = "video_generate"   # Video erstellt
EVENT_VIDEO_ANALYZE = "video_analyze"     # Video analysiert

# Export & Download
EVENT_ZIP_CREATE = "zip_create"           # ZIP erzeugt
EVENT_DOWNLOAD_READY = "download_ready"   # Download bereit

# Legacy (Dialog-Support)
EVENT_MESSAGE = "message"           # Dialog-Antwort des Assistenten
EVENT_STEP = "step"                 # Konkreter Arbeitsschritt (wird zu file_update)

# Workflow
EVENT_DONE = "done"                 # Schritt abgeschlossen
