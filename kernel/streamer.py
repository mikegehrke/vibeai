# kernel/streamer.py
# ------------------
# Dieses Modul ist verantwortlich für LIVE-Streaming
# von Agent-Events zum Frontend (Chat / Editor).
#
# Wir nutzen Server-Sent Events (SSE):
# - einfache Implementierung
# - stabil
# - ideal für schrittweise Agent-Ausgaben
#
# Jede Aktion des Agents wird sofort
# als Event an den Client gesendet.

import json
from typing import Optional
from kernel.events import AgentEvent


class SSEStreamer:
    """
    Streamer für Server-Sent Events (SSE).

    Diese Klasse kapselt das Schreiben von Events
    in eine HTTP-Response, die vom Frontend
    live gelesen wird.
    """

    def __init__(self, response):
        """
        :param response:
            Ein HTTP-Response-Objekt (z. B. von FastAPI / Starlette),
            das 'write' oder 'send' unterstützt.
        """
        self.response = response

    async def send_event(self, event: AgentEvent):
        """
        Sendet ein einzelnes AgentEvent an den Client.

        Das Event wird als JSON serialisiert
        und im SSE-Format übertragen.
        """

        payload = {
            "type": event.type,
            "message": event.message,
            "data": event.data,
        }

        sse_message = f"data: {json.dumps(payload)}\n\n"

        # Wichtig:
        # - sofort schreiben
        # - NICHT puffern
        # - sonst kommt alles erst am Ende an
        await self.response.write(sse_message)

        # Falls das Framework flush unterstützt, nutzen wir es
        flush = getattr(self.response, "flush", None)
        if callable(flush):
            await flush()
