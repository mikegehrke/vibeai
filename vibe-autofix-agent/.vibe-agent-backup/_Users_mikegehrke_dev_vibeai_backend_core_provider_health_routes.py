# -------------------------------------------------------------
# VIBEAI – PROVIDER HEALTH API ROUTES
# -------------------------------------------------------------
# Ermöglicht Admin-Zugriff auf Provider Health Metriken
# -------------------------------------------------------------

from fastapi import APIRouter, Depends

from core.auth import require_admin  # Corrected import path
from core.provider_health import provider_health_monitor, ProviderHealthMonitor  # Ensure correct imports

router = APIRouter(prefix="/api/providers", tags=["Provider Health"])


@router.get("/health")
async def get_provider_health(admin=Depends(require_admin)):
    """
    Vollständiger Provider Health Report.
    Zeigt:
    - Verfügbarkeit
    - Erfolgsrate
    - Fehlerrate
    - Durchschnittliche Latenz
    - Durchschnittliche Kosten
    - Rate-Limit Fehler
    - Token-Limit Fehler
    """
    return provider_health_monitor.get_health_report()


@router.get("/best")
async def get_best_provider(priority: str = "balanced", admin=Depends(require_admin)):
    """
    Empfiehlt den besten Provider basierend auf Priorität.

    Priority-Optionen:
    - fastest: Niedrigste Latenz
    - cheapest: Niedrigste Kosten
    - reliable: Niedrigste Fehlerrate
    - balanced: Beste Gesamtbewertung
    """
    best = provider_health_monitor.get_best_provider(priority=priority)

    return {
        "recommended_provider": best,
        "priority": priority,
        "health_metrics": provider_health_monitor.get_health_report().get(best, {}),
    }


@router.post("/reset-metrics")
async def reset_provider_metrics(admin=Depends(require_admin)):
    """
    Setzt alle Provider-Metriken zurück.
    Nützlich nach System-Updates oder manuellen Fixes.
    """
    global provider_health_monitor
    provider_health_monitor = ProviderHealthMonitor()

    return {"status": "metrics_reset", "message": "All metrics cleared"}