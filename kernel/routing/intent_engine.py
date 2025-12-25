# kernel/intent_engine.py
# ------------------------
# Intent Detection & Routing (Kernel v1.0)
#
# PHILOSOPHIE:
# - Keine Rückfragen
# - Keine Bestätigung nötig
# - Automatische Entscheidung basierend auf Keywords
# - Bei Unsicherheit: continue-Modus

from typing import Dict, Optional


class IntentEngine:
    """
    Intent Engine - entscheidet automatisch Modus basierend auf User-Input.
    
    REGELN:
    - Keine Rückfragen an User
    - Deterministische Entscheidung
    - Keywords-basiert (später: ML-Modell möglich)
    
    Modi:
    - flutter: Flutter-Projekt
    - react: React-Projekt
    - python: Python-Projekt
    - fix: Fehleranalyse & Reparatur
    - continue: Mach weiter mit aktivem Flow
    - dialog: Einfache Konversation
    - observe: Nur zuschauen
    """
    
    def __init__(self):
        # Keywords für verschiedene Modi
        self.mode_keywords = {
            "flutter": ["flutter", "dart", "widget", "pubspec"],
            "react": ["react", "jsx", "tsx", "component", "hook"],
            "python": ["python", "pip", "django", "flask", "fastapi"],
            "fix": ["fix", "fehler", "error", "bug", "repair", "debug"],
            "git": ["git", "commit", "push", "pull", "clone", "branch"],
            "terminal": ["terminal", "command", "run", "execute"],
        }
    
    def decide(self, text: str, flow_active: bool = False) -> Dict[str, Optional[str]]:
        """
        Entscheidet Modus basierend auf Input.
        
        Args:
            text: User-Input
            flow_active: Ist Flow bereits aktiv?
            
        Returns:
            Dict mit: mode, project (optional)
        """
        text_lower = text.lower()
        
        # Wenn Flow aktiv → immer "continue"
        if flow_active:
            return {"mode": "continue", "project": None}
        
        # Flutter-Projekt
        if any(kw in text_lower for kw in self.mode_keywords["flutter"]):
            project_name = self._extract_project_name(text, "flutter")
            return {"mode": "flutter", "project": project_name or "flutter_app"}
        
        # React-Projekt
        if any(kw in text_lower for kw in self.mode_keywords["react"]):
            project_name = self._extract_project_name(text, "react")
            return {"mode": "react", "project": project_name or "react_app"}
        
        # Python-Projekt
        if any(kw in text_lower for kw in self.mode_keywords["python"]):
            project_name = self._extract_project_name(text, "python")
            return {"mode": "python", "project": project_name or "python_app"}
        
        # Fix-Modus
        if any(kw in text_lower for kw in self.mode_keywords["fix"]):
            return {"mode": "fix", "project": None}
        
        # Git-Operationen
        if any(kw in text_lower for kw in self.mode_keywords["git"]):
            return {"mode": "git", "project": None}
        
        # Terminal
        if any(kw in text_lower for kw in self.mode_keywords["terminal"]):
            return {"mode": "terminal", "project": None}
        
        # Kurze Nachrichten → Dialog
        if len(text.split()) < 5:
            return {"mode": "dialog", "project": None}
        
        # Default: Dialog
        return {"mode": "dialog", "project": None}
    
    def _extract_project_name(self, text: str, project_type: str) -> Optional[str]:
        """
        Versucht Projekt-Namen aus Text zu extrahieren.
        
        Beispiele:
        - "erstelle flutter todo app" → "flutter_todo_app"
        - "baue react dashboard" → "react_dashboard"
        """
        text_lower = text.lower()
        
        # Entferne Stopwords
        stopwords = ["erstelle", "baue", "mach", "eine", "ein", "app", "projekt"]
        words = [w for w in text_lower.split() if w not in stopwords and len(w) > 2]
        
        # Filter project_type keyword
        words = [w for w in words if w != project_type]
        
        # Wenn Wörter übrig → nutze sie als Projekt-Name
        if words:
            return f"{project_type}_{'_'.join(words[:3])}"
        
        return None


# Singleton Instance
_intent_engine = IntentEngine()


def get_intent_engine() -> IntentEngine:
    """Gibt die globale IntentEngine-Instanz zurück."""
    return _intent_engine
