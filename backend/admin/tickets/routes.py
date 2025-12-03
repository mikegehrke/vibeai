# -------------------------------------------------------------
# ADMIN TICKET SYSTEM ROUTES – PRODUCTION READY
# -------------------------------------------------------------
from fastapi import APIRouter, Depends, HTTPException, status
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from db import get_db
from auth import require_admin
from models import Ticket, User
from schemas import TicketCreateRequest, TicketReplyRequest
from admin.notifications.ws_manager import ws_manager

router = APIRouter(
    prefix="/admin/tickets",
    tags=["Admin Tickets"]
)


# -------------------------------------------------------------
# GET ALL TICKETS
# -------------------------------------------------------------
@router.get("/")
async def get_all_tickets(db=Depends(get_db), _=Depends(require_admin)):
    tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).all()

    return {
        "count": len(tickets),
        "tickets": tickets
    }


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
    _=Depends(require_admin)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Antwort hinzufügen
    ticket.admin_reply = payload.message
    ticket.status = "answered"
    db.commit()

    # Live Notification an den User (WebSocket)
    await ws_manager.broadcast({
        "type": "ticket_reply",
        "ticket_id": ticket_id,
        "message": payload.message
    })

    return {
        "status": "replied",
        "ticket_id": ticket_id,
        "reply": payload.message
    }


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

    return {
        "status": "closed",
        "ticket_id": ticket_id
    }


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


# -------------------------------------------------------------
# VIBEAI – TICKET SYSTEM V2 (AI ASSISTANT + SMART FEATURES)
# -------------------------------------------------------------
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import json

# Import AI & Notification Services
try:
    from admin.notifications.mailer import mailer_v2
    from core.model_router_v2 import model_router
    from chat.ai_agents.cora_agent import cora_agent
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
    priority: Optional[str] = "medium"   # low, medium, high, critical
    auto_ai_response: bool = True        # AI soll antworten?


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
                """
            },
            "billing": {
                "category": "billing",
                "response": """
                For billing questions:
                - View your invoices in Account Settings > Billing
                - Update payment method in Billing Portal
                - Contact support@vibeai.com for refund requests
                
                Our billing team typically responds within 24 hours.
                """
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
                """
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
                """
            }
        }
    
    async def analyze_ticket(
        self,
        subject: str,
        message: str
    ) -> TicketAIAnalysis:
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
                confidence=0.95
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
                confidence=0.0
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
                user_id="system"
            )
            
            # Parse JSON response
            result_text = response.get("content", "{}")
            
            # Extract JSON from response
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            result = json.loads(result_text.strip())
            
            return TicketAIAnalysis(**result)
            
        except Exception as e:
            # Fallback
            return TicketAIAnalysis(
                category="general",
                priority="medium",
                sentiment="neutral",
                suggested_response=None,
                requires_human=True,
                confidence=0.0
            )
    
    def _check_faq(self, message: str) -> Optional[Dict]:
        """Prüft ob Ticket durch FAQ beantwortet werden kann."""
        for keyword, faq in self.faq_database.items():
            if keyword in message:
                return faq
        return None
    
    async def generate_response(
        self,
        ticket_subject: str,
        ticket_message: str,
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """
        Generiert AI Response für Ticket.
        
        Args:
            ticket_subject: Ticket Subject
            ticket_message: User Message
            conversation_history: Previous messages
        
        Returns:
            AI-generated response
        """
        if not model_router:
            return "Thank you for contacting VibeAI support. A team member will respond soon."
        
        # Build context
        messages = []
        
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current ticket
        messages.append({
            "role": "user",
            "content": f"""
            Support Ticket:
            Subject: {ticket_subject}
            Message: {ticket_message}
            
            Please provide a helpful, professional response.
            """
        })
        
        try:
            response = await model_router.route_request(
                messages=messages,
                agent_name="cora",  # Technical support
                user_id="system"
            )
            
            return response.get("content", "I'll need to escalate this to our team.")
            
        except Exception as e:
            return f"Thank you for your message. Our team will respond shortly."


# Global AI Assistant
ai_ticket_assistant = AITicketAssistant()


# ---------------------------------------------------------
# Create Ticket with AI Analysis
# ---------------------------------------------------------
@router.post("/create/v2")
async def create_ticket_v2(
    payload: TicketCreateV2,
    db=Depends(get_db)
):
    """
    Erstellt Ticket mit AI Analysis & Auto-Response.
    
    Features:
    - Automatische Kategorisierung
    - Priorität-Erkennung
    - FAQ Auto-Response
    - AI-generated Reply (optional)
    """
    # AI Analysis
    analysis = await ai_ticket_assistant.analyze_ticket(
        subject=payload.subject,
        message=payload.message
    )
    
    # Create Ticket
    ticket = Ticket(
        user_email=payload.user_email,
        subject=payload.subject,
        message=payload.message,
        category=analysis.category,
        priority=analysis.priority,
        sentiment=analysis.sentiment,
        status="open",
        created_at=datetime.utcnow()
    )
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Auto AI Response (wenn FAQ match oder hohe Confidence)
    ai_response = None
    
    if payload.auto_ai_response and analysis.suggested_response:
        if analysis.confidence > 0.8 and not analysis.requires_human:
            # AI kann direkt antworten
            ai_response = analysis.suggested_response
            
            ticket.admin_reply = f"[AI Assistant]\n\n{ai_response}"
            ticket.status = "answered"
            db.commit()
            
            # Email an User
            if mailer_v2:
                await mailer_v2.send_email_async(
                    to=payload.user_email,
                    subject=f"Re: {payload.subject}",
                    message=ai_response,
                    html=f"""
                    <html>
                        <body style="font-family: Arial;">
                            <h2>Re: {payload.subject}</h2>
                            <p>{ai_response.replace(chr(10), '<br>')}</p>
                            <hr>
                            <p style="color: #888; font-size: 12px;">
                                This is an automated response from VibeAI Support Assistant.
                                If you need further help, please reply to this ticket.
                            </p>
                        </body>
                    </html>
                    """
                )
    
    # Notify Admins (wenn human review nötig)
    if analysis.requires_human:
        if mailer_v2:
            await mailer_v2.send_admin_alert(
                message=f"New {analysis.priority} priority ticket #{ticket.id}",
                details=f"""
                From: {payload.user_email}
                Subject: {payload.subject}
                Category: {analysis.category}
                Sentiment: {analysis.sentiment}
                
                Message:
                {payload.message[:200]}...
                """
            )
        
        # WebSocket
        await ws_manager.broadcast({
            "type": "new_ticket",
            "ticket_id": ticket.id,
            "user": payload.user_email,
            "priority": analysis.priority,
            "category": analysis.category,
            "requires_human": True
        })
    
    return {
        "ticket_id": ticket.id,
        "status": ticket.status,
        "analysis": {
            "category": analysis.category,
            "priority": analysis.priority,
            "sentiment": analysis.sentiment,
            "auto_responded": ai_response is not None,
            "requires_human": analysis.requires_human
        }
    }


# ---------------------------------------------------------
# AI Suggest Response
# ---------------------------------------------------------
@router.post("/{ticket_id}/ai-suggest")
async def ai_suggest_response(
    ticket_id: str,
    db=Depends(get_db),
    _=Depends(require_admin)
):
    """
    AI generiert Response-Vorschlag für Admin.
    
    Admin kann dann:
    - Vorschlag übernehmen
    - Vorschlag bearbeiten
    - Eigene Antwort schreiben
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Build conversation history
    history = [
        {"role": "user", "content": f"Subject: {ticket.subject}\n\n{ticket.message}"}
    ]
    
    if ticket.admin_reply:
        history.append({"role": "assistant", "content": ticket.admin_reply})
    
    # Generate suggestion
    suggestion = await ai_ticket_assistant.generate_response(
        ticket_subject=ticket.subject,
        ticket_message=ticket.message,
        conversation_history=history
    )
    
    return {
        "ticket_id": ticket_id,
        "suggested_response": suggestion,
        "note": "This is an AI suggestion. Review before sending."
    }


# ---------------------------------------------------------
# Bulk Ticket Analysis
# ---------------------------------------------------------
@router.post("/analyze/bulk")
async def bulk_analyze_tickets(
    ticket_ids: List[str],
    db=Depends(get_db),
    _=Depends(require_admin)
):
    """
    Analysiert mehrere Tickets gleichzeitig mit AI.
    
    Returns:
        - Kategorieverteilung
        - Priorität-Stats
        - Sentiment-Analyse
        - Tickets die sofort geschlossen werden können
    """
    results = []
    
    for ticket_id in ticket_ids:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        
        if not ticket:
            continue
        
        analysis = await ai_ticket_assistant.analyze_ticket(
            subject=ticket.subject,
            message=ticket.message
        )
        
        results.append({
            "ticket_id": ticket_id,
            "category": analysis.category,
            "priority": analysis.priority,
            "sentiment": analysis.sentiment,
            "can_auto_respond": not analysis.requires_human
        })
    
    # Stats
    categories = {}
    priorities = {}
    sentiments = {}
    auto_respondable = 0
    
    for r in results:
        categories[r["category"]] = categories.get(r["category"], 0) + 1
        priorities[r["priority"]] = priorities.get(r["priority"], 0) + 1
        sentiments[r["sentiment"]] = sentiments.get(r["sentiment"], 0) + 1
        
        if r["can_auto_respond"]:
            auto_respondable += 1
    
    return {
        "total_analyzed": len(results),
        "categories": categories,
        "priorities": priorities,
        "sentiments": sentiments,
        "auto_respondable_count": auto_respondable,
        "results": results
    }
