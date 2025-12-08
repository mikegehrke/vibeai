# -------------------------------------------------------------
# ADMIN TICKET SYSTEM ROUTES – PRODUCTION READY
# -------------------------------------------------------------
import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from admin.notifications.ws_manager import ws_manager
from auth import require_admin
from db import get_db
from models import Ticket
from schemas import TicketReplyRequest

router = APIRouter(prefix="/admin/tickets", tags=["Admin Tickets"])


# -------------------------------------------------------------
# GET ALL TICKETS
# -------------------------------------------------------------
@router.get("/")
async def get_all_tickets(db=Depends(get_db), _=Depends(require_admin)):
    tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).all()

    return {"count": len(tickets), "tickets": tickets}


# -------------------------------------------------------------
# GET SINGLE TICKET BY ID
# -------------------------------------------------------------
@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str, db=Depends(get_db), _=Depends(require_admin)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket


# -------------------------------------------------------------
# ADMIN REPLY TO TICKET
# -------------------------------------------------------------
@router.post("/{ticket_id}/reply")
async def reply_ticket(
    ticket_id: str,
    payload: TicketReplyRequest,
    db=Depends(get_db),
    _=Depends(require_admin),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Antwort hinzufügen
    ticket.admin_reply = payload.message
    ticket.status = "answered"
    db.commit()

    # Live Notification an den User (WebSocket)
    await ws_manager.broadcast({"type": "ticket_reply", "ticket_id": ticket_id, "message": payload.message})

    return {"status": "replied", "ticket_id": ticket_id, "reply": payload.message}


# -------------------------------------------------------------
# CLOSE TICKET
# -------------------------------------------------------------
@router.post("/{ticket_id}/close")
async def close_ticket(ticket_id: str, db=Depends(get_db), _=Depends(require_admin)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = "closed"
    db.commit()

    return {"status": "closed", "ticket_id": ticket_id}


# ✔ Original Ticket Routes sind komplett und funktionieren:
#   - GET /admin/tickets/ → Liste aller Tickets
#   - GET /admin/tickets/{id} → Einzelnes Ticket
#   - POST /admin/tickets/{id}/reply → Admin Antwort
#   - POST /admin/tickets/{id}/close → Ticket schließen
#
# ✔ Database Integration (Ticket model)
# ✔ Admin Authentication
# ✔ WebSocket Notifications
#
# ❗ ABER:
#     - Keine Email-Benachrichtigungen
#     - Kein AI Assistant für automatische Antworten
#     - Keine Ticket-Kategorisierung
#     - Keine Priorität-Verwaltung
#     - Keine Auto-Assign to Admin
#     - Keine Ticket-History/Logs
#     - Keine Smart Suggestions
#     - Keine FAQ Auto-Response
#
# 👉 Das Original ist ein solides Basic Ticket System
# 👉 Für Production brauchen wir AI Assistant + Smart Features

import json
from datetime import datetime

# -------------------------------------------------------------
# VIBEAI – TICKET SYSTEM V2 (AI ASSISTANT + SMART FEATURES)
# -------------------------------------------------------------
from typing import Dict, List, Optional

from pydantic import BaseModel

# Import AI & Notification Services
try:
    from admin.notifications.mailer import mailer_v2
    from chat.ai_agents.cora_agent import cora_agent
    from core.model_router_v2 import model_router
except ImportError:
    mailer_v2 = None
    model_router = None
    cora_agent = None


# ---------------------------------------------------------
# Extended Schemas
# ---------------------------------------------------------
class TicketCreateV2(BaseModel):
    """Enhanced Ticket Creation."""

    user_email: str
    subject: str
    message: str
    category: Optional[str] = "general"  # general, billing, technical, feature
    priority: Optional[str] = "medium"  # low, medium, high, critical
    auto_ai_response: bool = True  # AI soll antworten?


class TicketAIAnalysis(BaseModel):
    """AI Ticket Analysis Result."""

    category: str
    priority: str
    sentiment: str  # positive, neutral, negative
    suggested_response: Optional[str]
    requires_human: bool
    confidence: float


# ---------------------------------------------------------
# AI Ticket Assistant
# ---------------------------------------------------------
class AITicketAssistant:
    """
    AI-gestützter Ticket Assistant.

    Features:
    - Automatische Kategorisierung
    - Priorität-Erkennung
    - Sentiment-Analyse
    - FAQ Auto-Response
    - Smart Reply Suggestions
    - Escalation Detection
    """

    def __init__(self):
        self.faq_database = {
            "password reset": {
                "category": "technical",
                "response": """
                To reset your password:
                1. Go to Login page
                2. Click "Forgot Password"
                3. Enter your email
                4. Check your inbox for reset link
                5. Follow the link and set new password

                If you don't receive the email, check your spam folder.
                """,
            },
            "billing": {
                "category": "billing",
                "response": """
                For billing questions:
                - View your invoices in Account Settings > Billing
                - Update payment method in Billing Portal
                - Contact support@vibeai.com for refund requests

                Our billing team typically responds within 24 hours.
                """,
            },
            "api key": {
                "category": "technical",
                "response": """
                To get your API key:
                1. Go to Account Settings
                2. Navigate to API Keys section
                3. Click "Generate New Key"
                4. Copy and save your key securely

                Keep your API key private and never share it publicly.
                """,
            },
            "project export": {
                "category": "technical",
                "response": """
                To export your project:
                1. Open your project in VibeAI Studio
                2. Click "Export" in the top menu
                3. Choose format (ZIP, GitHub, etc.)
                4. Download will start automatically

                Large projects may take a few minutes to prepare.
                """,
            },
        }

    async def analyze_ticket(self, subject: str, message: str) -> TicketAIAnalysis:
        """
        Analysiert Ticket mit AI.

        Returns:
            - Kategorie
            - Priorität
            - Sentiment
            - Suggested Response
            - Requires Human Review?
        """
        # Check FAQ first
        faq_response = self._check_faq(message.lower())

        if faq_response:
            return TicketAIAnalysis(
                category=faq_response["category"],
                priority="low",
                sentiment="neutral",
                suggested_response=faq_response["response"],
                requires_human=False,
                confidence=0.95,
            )

        # Use AI for analysis
        if not model_router:
            # Fallback ohne AI
            return TicketAIAnalysis(
                category="general",
                priority="medium",
                sentiment="neutral",
                suggested_response=None,
                requires_human=True,
                confidence=0.0,
            )

        # AI Analysis Prompt
        analysis_prompt = f"""
        Analyze this support ticket and provide structured JSON response:

        Subject: {subject}
        Message: {message}

        Provide:
        1. category: one of [general, billing, technical, feature, bug_report]
        2. priority: one of [low, medium, high, critical]
        3. sentiment: one of [positive, neutral, negative]
        4. suggested_response: A helpful response (or null if complex)
        5. requires_human: true if needs human review, false if AI can handle
        6. confidence: 0.0-1.0

        Format as JSON only.
        """

        try:
            response = await model_router.route_request(
                messages=[{"role": "user", "content": analysis_prompt}],
                agent_name="cora",  # Technical support agent
                user_id="system",
            )

            # Parse JSON response
            result_text = response.get("content", "{}")

            # Extract JSON from response
            if "