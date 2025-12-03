# -------------------------------------------------------------
# VIBEAI – CODE STUDIO OUTPUT CLEANER
# -------------------------------------------------------------
import re


ANSI_ESCAPE = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')


def clean_output(text: str) -> str:
    """
    Reinigt die Ausgabe des Sandbox-Prozesses:
    - Entfernt ANSI-Farbcodes
    - Entfernt doppelte Leerzeilen
    - Kürzt zu lange Zeilen
    - Normalisiert Whitespace
    """

    if not text:
        return ""

    # -----------------------------
    # ANSI Colors entfernen
    # -----------------------------
    cleaned = ANSI_ESCAPE.sub('', text)

    # -----------------------------
    # Sehr lange Zeilen kürzen
    # -----------------------------
    max_len = 3000
    if len(cleaned) > max_len:
        cleaned = cleaned[:max_len] + "\n[output truncated…]"

    # -----------------------------
    # Doppelte Leerzeilen entfernen
    # -----------------------------
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

    # -----------------------------
    # Trailing Spaces entfernen
    # -----------------------------
    cleaned = "\n".join(line.rstrip() for line in cleaned.splitlines())

    cleaned = cleaned.strip()

    return cleaned
