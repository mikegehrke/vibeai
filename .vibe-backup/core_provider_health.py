# -------------------------------------------------------------
# VIBEAI – INTELLIGENT PROVIDER HEALTH & PERFORMANCE MONITOR
# -------------------------------------------------------------
# Überwacht automatisch:
# ✔ Provider-Latenz (Response Time)
# ✔ Provider-Fehler (Error Rate)
# ✔ Rate-Limits (429 Errors)
# ✔ Token-Limits (Exceeded)
# ✔ Kosten pro Anfrage
# ✔ Verfügbarkeit (Uptime)
#
# Entscheidet intelligent:
# → Welcher Provider ist am schnellsten?
# → Welcher Provider ist am günstigsten?
# → Welcher Provider ist am zuverlässigsten?
# -------------------------------------------------------------

from collections import defaultdict
from datetime import datetime, timedelta


class ProviderHealthMonitor:
    """
    Intelligentes Provider Monitoring System.
    Trackt Performance, Fehler, Kosten und entscheidet automatisch.
    """

    def __init__(self):
        # Metriken pro Provider
        self.metrics = defaultdict(
            lambda: {
                "total_requests": 0,
                "successful_requests": 0,
                "failed_requests": 0,
                "rate_limit_errors": 0,
                "token_limit_errors": 0,
                "total_latency": 0.0,
                "total_cost": 0.0,
                "last_error": None,
                "last_success": None,
                "downtime_start": None,
            }
        )

        # Provider Status
        self.provider_status = {
            "openai": True,
            "anthropic": True,
            "google": True,
            "copilot": True,
            "ollama": True,
        }

    def record_request(
        self,
        provider: str,
        success: bool,
        latency: float,
        cost: float = 0.0,
        error_type: str = None,
    ):
        """
        Zeichnet eine Anfrage auf.

        Args:
            provider: Provider-Name (openai, anthropic, etc.)
            success: War die Anfrage erfolgreich?
            latency: Response-Zeit in Sekunden
            cost: Kosten in USD
            error_type: "rate_limit", "token_limit", "network", etc.
        """
        m = self.metrics[provider]
        m["total_requests"] += 1

        if success:
            m["successful_requests"] += 1
            m["total_latency"] += latency
            m["total_cost"] += cost
            m["last_success"] = datetime.now()
            self.provider_status[provider] = True

            # Downtime beendet
            if m["downtime_start"]:
                m["downtime_start"] = None
        else:
            m["failed_requests"] += 1
            m["last_error"] = datetime.now()

            # Error-Typen tracken
            if error_type == "rate_limit":
                m["rate_limit_errors"] += 1
            elif error_type == "token_limit":
                m["token_limit_errors"] += 1

            # Provider als down markieren (temporär)
            if error_type in ["rate_limit", "network", "timeout"]:
                self.provider_status[provider] = False
                if not m["downtime_start"]:
                    m["downtime_start"] = datetime.now()

    def get_average_latency(self, provider: str) -> float:
        """Durchschnittliche Response-Zeit in Sekunden."""
        m = self.metrics[provider]
        if m["successful_requests"] == 0:
            return 999.0  # Sehr hoch wenn keine erfolgreichen Requests
        return m["total_latency"] / m["successful_requests"]

    def get_error_rate(self, provider: str) -> float:
        """Fehlerrate in Prozent (0.0 - 1.0)."""
        m = self.metrics[provider]
        if m["total_requests"] == 0:
            return 0.0
        return m["failed_requests"] / m["total_requests"]

    def get_average_cost(self, provider: str) -> float:
        """Durchschnittliche Kosten pro Anfrage in USD."""
        m = self.metrics[provider]
        if m["successful_requests"] == 0:
            return 0.0
        return m["total_cost"] / m["successful_requests"]

    def is_available(self, provider: str) -> bool:
        """Ist der Provider verfügbar?"""
        # Prüfe Status
        if not self.provider_status.get(provider, True):
            # Prüfe ob Downtime > 5 Minuten → dann retry
            m = self.metrics[provider]
            if m["downtime_start"]:
                downtime = datetime.now() - m["downtime_start"]
                if downtime > timedelta(minutes=5):
                    # Reset nach 5 Minuten Downtime
                    self.provider_status[provider] = True
                    m["downtime_start"] = None
                    return True
            return False
        return True

    def get_best_provider(self, priority: str = "balanced", available_providers: list = None) -> str:
        """
        Wählt den besten Provider basierend auf Priorität.

        Args:
            priority: "fastest", "cheapest", "reliable", "balanced"
            available_providers: Liste verfügbarer Provider (optional)

        Returns:
            Bester Provider-Name
        """
        if available_providers is None:
            available_providers = ["openai", "anthropic", "google", "copilot", "ollama"]

        # Nur verfügbare Provider
        candidates = [p for p in available_providers if self.is_available(p)]

        if not candidates:
            # Notfall: Ollama (läuft immer lokal)
            return "ollama"

        if priority == "fastest":
            # Niedrigste Latenz
            return min(candidates, key=self.get_average_latency)

        elif priority == "cheapest":
            # Niedrigste Kosten
            return min(candidates, key=self.get_average_cost)

        elif priority == "reliable":
            # Niedrigste Fehlerrate
            return min(candidates, key=self.get_error_rate)

        elif priority == "balanced":
            # Score: Latenz + Kosten + Fehlerrate
            def score(p):
                latency = self.get_average_latency(p)
                error_rate = self.get_error_rate(p)
                cost = self.get_average_cost(p)

                # Normalisierung (grobe Gewichtung)
                return (latency * 100) + (error_rate * 1000) + (cost * 10000)

            return min(candidates, key=score)

        return candidates[0]

    def get_health_report(self) -> dict:
        """Vollständiger Health Report für alle Provider."""
        report = {}

        for provider in ["openai", "anthropic", "google", "copilot", "ollama"]:
            m = self.metrics[provider]
            report[provider] = {
                "available": self.is_available(provider),
                "total_requests": m["total_requests"],
                "success_rate": (m["successful_requests"] / m["total_requests"] if m["total_requests"] > 0 else 0.0),
                "error_rate": self.get_error_rate(provider),
                "avg_latency_ms": self.get_average_latency(provider) * 1000,
                "avg_cost_usd": self.get_average_cost(provider),
                "rate_limit_errors": m["rate_limit_errors"],
                "token_limit_errors": m["token_limit_errors"],
                "last_success": (m["last_success"].isoformat() if m["last_success"] else None),
                "last_error": (m["last_error"].isoformat() if m["last_error"] else None),
            }

        return report


# Globale Instanz
provider_health_monitor = ProviderHealthMonitor()
