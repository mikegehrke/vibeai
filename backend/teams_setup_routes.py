"""
Teams Setup Form Routes
Handles team/organization setup form submissions and email notifications
"""
import os
import smtplib
import httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Tuple
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/teams", tags=["Teams Setup"])


# -------------------------------------------------------------
# Pydantic Models
# -------------------------------------------------------------
class TeamsSetupRequest(BaseModel):
    org_name: str
    use_case: str
    description: Optional[str] = None
    billing_email: EmailStr
    team_members: Optional[str] = None  # Comma-separated emails


# -------------------------------------------------------------
# Email Configuration
# -------------------------------------------------------------
# Option 1: Resend API (recommended - easier setup)
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")

# Option 2: SMTP (traditional)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USERNAME)
EMAIL_TO = os.getenv("TEAMS_SETUP_EMAIL_TO", SMTP_USERNAME)  # Where to send notifications

# Use Resend if API key is available, otherwise fall back to SMTP
USE_RESEND = bool(RESEND_API_KEY)


# -------------------------------------------------------------
# Email Helper Functions
# -------------------------------------------------------------
async def send_email_resend(subject: str, body: str, to_email: str, is_html: bool = False) -> bool:
    """
    Send email using Resend API (easier setup)
    
    Args:
        subject: Email subject
        body: Email body
        to_email: Recipient email address
        is_html: Whether body is HTML format
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": RESEND_FROM_EMAIL,
                    "to": [to_email],
                    "subject": subject,
                    "html" if is_html else "text": body,
                },
                timeout=10.0,
            )
            
            if response.status_code == 200:
                print(f"✅ Email sent successfully via Resend to {to_email}")
                return True
            else:
                print(f"❌ Resend API error: {response.status_code} - {response.text}")
                return False
    
    except Exception as e:
        print(f"❌ Error sending email via Resend: {str(e)}")
        return False


def send_email_smtp(subject: str, body: str, to_email: str, is_html: bool = False) -> bool:
    """
    Send email using SMTP
    
    Args:
        subject: Email subject
        body: Email body
        to_email: Recipient email address
        is_html: Whether body is HTML format
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print("⚠️  SMTP credentials not configured. Email not sent.")
            print(f"   Would send to: {to_email}")
            print(f"   Subject: {subject}")
            return False
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = EMAIL_FROM
        msg['To'] = to_email
        
        if is_html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Email sent successfully via SMTP to {to_email}")
        return True
    
    except Exception as e:
        print(f"❌ Error sending email via SMTP: {str(e)}")
        return False


async def send_email(subject: str, body: str, to_email: str, is_html: bool = False) -> bool:
    """
    Send email using the configured method (Resend or SMTP)
    
    Args:
        subject: Email subject
        body: Email body
        to_email: Recipient email address
        is_html: Whether body is HTML format
    
    Returns:
        True if email sent successfully, False otherwise
    """
    if USE_RESEND:
        return await send_email_resend(subject, body, to_email, is_html)
    else:
        return send_email_smtp(subject, body, to_email, is_html)


def format_teams_setup_email(data: TeamsSetupRequest) -> Tuple[str, str]:
    """
    Format teams setup form data into email
    
    Returns:
        Tuple of (subject, body)
    """
    subject = f"New Team Setup Request: {data.org_name}"
    
    # Parse team members
    team_members_list = []
    if data.team_members:
        team_members_list = [email.strip() for email in data.team_members.split(',') if email.strip()]
    
    # HTML Email Body
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #3b82f6; color: white; padding: 20px; border-radius: 5px 5px 0 0; }}
            .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
            .field {{ margin-bottom: 15px; }}
            .label {{ font-weight: bold; color: #555; }}
            .value {{ margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }}
            .footer {{ margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🚀 New Team Setup Request</h2>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">Organization Name:</div>
                    <div class="value">{data.org_name}</div>
                </div>
                
                <div class="field">
                    <div class="label">Use Case:</div>
                    <div class="value">{data.use_case}</div>
                </div>
                
                <div class="field">
                    <div class="label">Description:</div>
                    <div class="value">{data.description or 'Not provided'}</div>
                </div>
                
                <div class="field">
                    <div class="label">Billing Email:</div>
                    <div class="value">{data.billing_email}</div>
                </div>
                
                <div class="field">
                    <div class="label">Team Members to Invite:</div>
                    <div class="value">
                        {', '.join(team_members_list) if team_members_list else 'None'}
                    </div>
                </div>
                
                <div class="footer">
                    <p>Submitted on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    <p>This is an automated notification from Vibe AI Teams Setup.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    text_body = f"""
New Team Setup Request
======================

Organization Name: {data.org_name}
Use Case: {data.use_case}
Description: {data.description or 'Not provided'}
Billing Email: {data.billing_email}
Team Members: {', '.join(team_members_list) if team_members_list else 'None'}

Submitted on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    """
    
    return subject, html_body


# -------------------------------------------------------------
# API Routes
# -------------------------------------------------------------
@router.post("/setup")
async def submit_teams_setup(request: TeamsSetupRequest):
    """
    Submit teams setup form and send email notification
    
    Args:
        request: TeamsSetupRequest with form data
    
    Returns:
        Success message
    """
    try:
        # Validate required fields
        if not request.org_name or not request.use_case or not request.billing_email:
            raise HTTPException(
                status_code=400,
                detail="Missing required fields: org_name, use_case, and billing_email are required"
            )
        
        # Format and send email
        subject, email_body = format_teams_setup_email(request)
        
        # Send to configured recipient
        email_sent = await send_email(
            subject=subject,
            body=email_body,
            to_email=EMAIL_TO,
            is_html=True
        )
        
        # Also send confirmation to billing email
        confirmation_subject = f"Thank you for setting up {request.org_name} on Vibe AI"
        confirmation_body = f"""
        <html>
        <body>
            <h2>Thank you for your interest in Vibe AI!</h2>
            <p>We have received your team setup request for <strong>{request.org_name}</strong>.</p>
            <p>Our team will review your request and get back to you shortly.</p>
            <p>Best regards,<br>The Vibe AI Team</p>
        </body>
        </html>
        """
        
        await send_email(
            subject=confirmation_subject,
            body=confirmation_body,
            to_email=request.billing_email,
            is_html=True
        )
        
        return {
            "status": "success",
            "message": "Team setup request submitted successfully",
            "email_sent": email_sent,
            "org_name": request.org_name
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error processing teams setup: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )


@router.get("/setup/test")
async def test_teams_setup():
    """
    Test endpoint to check if teams setup routes are working
    """
    return {
        "status": "ok",
        "message": "Teams setup routes are working",
        "email_method": "Resend" if USE_RESEND else "SMTP",
        "resend_configured": bool(RESEND_API_KEY),
        "smtp_configured": bool(SMTP_USERNAME and SMTP_PASSWORD),
        "email_to": EMAIL_TO
    }

