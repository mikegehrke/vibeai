# ----------------------------------------------------------
# COMPLETED MAILER FOR ADMIN NOTIFICATIONS
# ----------------------------------------------------------
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from fastapi import HTTPException
import os

logger = logging.getLogger("mailer")


class Mailer:
    """
    E-Mail Versender für Admin Notifications
    Unterstützt:
        - HTML und Text
        - SMTP Login
        - Fehlerlogging
        - Wiederverwendbare API für andere Module
    """

    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASS", "")
        self.from_address = os.getenv("MAIL_FROM", self.smtp_user)

    def send_mail(self, to: str, subject: str, message: str, html: str = None):
        """
        Sendet eine E-Mail synchron über SMTP.
        Kann später in BackgroundTask ausgelagert werden.
        """

        try:
            email = MIMEMultipart("alternative")
            email["Subject"] = subject
            email["From"] = self.from_address
            email["To"] = to

            # Text-Part
            text_part = MIMEText(message, "plain")
            email.attach(text_part)

            # HTML-Part optional
            if html:
                html_part = MIMEText(html, "html")
                email.attach(html_part)

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as smtp:
                smtp.starttls()
                smtp.login(self.smtp_user, self.smtp_pass)
                smtp.sendmail(self.from_address, to, email.as_string())

            logger.info(f"Email sent successfully to {to}")
            return True

        except Exception as e:
            logger.error(f"Email failed: {e}")
            raise HTTPException(status_code=500, detail="Email sending failed")


# ✔ Original Mailer ist vollständig und funktioniert
# ✔ send_mail() mit HTML + Text Support
# ✔ SMTP Login mit TLS
# ✔ Error Logging
# ✔ ENV-basierte Konfiguration
#
# ❗ ABER:
#     - Sync API (nicht async)
#     - Keine Batch-Email Unterstützung
#     - Keine Email Queue
#     - Keine Retry-Logik
#     - Keine Template-Unterstützung
#     - Keine Admin Alert Shortcuts
#     - Keine Ticket Reply Shortcuts
#
# 👉 Das Original ist ein guter SMTP Mailer
# 👉 Für Production brauchen wir Async + Templates + Shortcuts


# -------------------------------------------------------------
# VIBEAI – MAILER SERVICE V2 (ASYNC + TEMPLATES + RETRY)
# -------------------------------------------------------------
import ssl
from typing import List, Optional, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor


class MailerServiceV2:
    """
    Production Mailer mit:
    - Async Support (FastAPI Background Tasks)
    - Email Templates
    - Batch Sending
    - Retry Logic
    - Admin/Ticket/System Shortcuts
    """

    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASS", "")
        self.from_address = os.getenv("MAIL_FROM", self.smtp_user)
        self.admin_email = os.getenv("ADMIN_EMAIL", "admin@vibeai.com")
        
        # Enabled wenn SMTP konfiguriert
        self.enabled = bool(self.smtp_user and self.smtp_pass)
        
        # Thread Pool für async execution
        self.executor = ThreadPoolExecutor(max_workers=3)

    # ---------------------------------------------------------
    # Async Email Sending
    # ---------------------------------------------------------
    async def send_email_async(
        self,
        to: str,
        subject: str,
        message: str,
        html: Optional[str] = None,
        retry: int = 3
    ) -> Dict[str, Any]:
        """
        Async Email mit Retry-Logik.
        
        Args:
            to: Empfänger Email
            subject: Email Subject
            message: Plain-Text Nachricht
            html: Optional HTML Version
            retry: Anzahl Wiederholungen bei Fehler
            
        Returns:
            {"success": bool, "error": str (optional)}
        """
        if not self.enabled:
            logger.warning("Mailer not configured - email not sent")
            return {
                "success": False,
                "error": "SMTP not configured"
            }

        # Run in thread pool (SMTP ist sync)
        loop = asyncio.get_event_loop()
        
        for attempt in range(retry):
            try:
                await loop.run_in_executor(
                    self.executor,
                    self._send_sync,
                    to,
                    subject,
                    message,
                    html
                )
                
                logger.info(f"Email sent to {to}: {subject}")
                return {"success": True}
                
            except Exception as e:
                logger.error(f"Email attempt {attempt + 1} failed: {e}")
                
                if attempt == retry - 1:
                    return {
                        "success": False,
                        "error": str(e)
                    }
                
                # Wait before retry
                await asyncio.sleep(2 ** attempt)

    def _send_sync(
        self,
        to: str,
        subject: str,
        message: str,
        html: Optional[str] = None
    ):
        """Synchroner SMTP Send (wird in Thread ausgeführt)."""
        email = MIMEMultipart("alternative")
        email["Subject"] = subject
        email["From"] = self.from_address
        email["To"] = to

        # Text Part
        text_part = MIMEText(message, "plain")
        email.attach(text_part)

        # HTML Part
        if html:
            html_part = MIMEText(html, "html")
            email.attach(html_part)

        # Send via SMTP
        context = ssl.create_default_context()
        
        with smtplib.SMTP(self.smtp_server, self.smtp_port) as smtp:
            smtp.starttls(context=context)
            smtp.login(self.smtp_user, self.smtp_pass)
            smtp.sendmail(self.from_address, to, email.as_string())

    # ---------------------------------------------------------
    # Batch Email Sending
    # ---------------------------------------------------------
    async def send_batch_emails(
        self,
        recipients: List[str],
        subject: str,
        message: str,
        html: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sendet Email an mehrere Empfänger (parallel).
        
        Returns:
            {
                "total": int,
                "sent": int,
                "failed": int,
                "results": [...]
            }
        """
        tasks = [
            self.send_email_async(to, subject, message, html)
            for to in recipients
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        sent = sum(1 for r in results if isinstance(r, dict) and r.get("success"))
        failed = len(results) - sent
        
        return {
            "total": len(recipients),
            "sent": sent,
            "failed": failed,
            "results": results
        }

    # ---------------------------------------------------------
    # Template Shortcuts
    # ---------------------------------------------------------
    async def send_admin_alert(
        self,
        message: str,
        details: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sendet Alert an Admin.
        
        Args:
            message: Kurze Alert-Message
            details: Optional detaillierte Info
        """
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #e74c3c;">⚠️ VibeAI Admin Alert</h2>
                <p><strong>{message}</strong></p>
                {f'<pre style="background: #f5f5f5; padding: 10px;">{details}</pre>' if details else ''}
                <hr>
                <p style="color: #888; font-size: 12px;">
                    Sent from VibeAI Backend
                </p>
            </body>
        </html>
        """
        
        return await self.send_email_async(
            to=self.admin_email,
            subject=f"🚨 Admin Alert: {message}",
            message=message,
            html=html
        )

    async def send_ticket_reply(
        self,
        user_email: str,
        ticket_id: str,
        reply_message: str
    ) -> Dict[str, Any]:
        """
        Sendet Ticket-Antwort an User.
        """
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #3498db;">💬 Support Ticket Update</h2>
                <p><strong>Ticket #{ticket_id}</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #3498db;">
                    {reply_message}
                </div>
                <hr>
                <p style="color: #888; font-size: 12px;">
                    Reply to this email or visit your dashboard
                </p>
            </body>
        </html>
        """
        
        return await self.send_email_async(
            to=user_email,
            subject=f"Support Ticket #{ticket_id} - New Reply",
            message=reply_message,
            html=html
        )

    async def send_project_ready_notification(
        self,
        user_email: str,
        project_name: str,
        download_url: str
    ) -> Dict[str, Any]:
        """
        Benachrichtigt User dass Projekt fertig ist.
        """
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #27ae60;">✅ Your Project is Ready!</h2>
                <p><strong>{project_name}</strong> has been generated successfully.</p>
                <p>
                    <a href="{download_url}" 
                       style="background: #3498db; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Download Project
                    </a>
                </p>
                <hr>
                <p style="color: #888; font-size: 12px;">
                    VibeAI - AI-Powered App Builder
                </p>
            </body>
        </html>
        """
        
        return await self.send_email_async(
            to=user_email,
            subject=f"✅ {project_name} is ready to download!",
            message=f"Your project {project_name} is ready. Download: {download_url}",
            html=html
        )

    async def send_account_suspended_notification(
        self,
        user_email: str,
        reason: str
    ) -> Dict[str, Any]:
        """
        Informiert User über Account-Sperrung.
        """
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #e74c3c;">⚠️ Account Suspended</h2>
                <p>Your VibeAI account has been temporarily suspended.</p>
                <p><strong>Reason:</strong> {reason}</p>
                <p>Please contact support if you believe this is a mistake.</p>
                <hr>
                <p style="color: #888; font-size: 12px;">
                    VibeAI Support Team
                </p>
            </body>
        </html>
        """
        
        return await self.send_email_async(
            to=user_email,
            subject="⚠️ VibeAI Account Suspended",
            message=f"Your account has been suspended. Reason: {reason}",
            html=html
        )


# Global Instances
mailer_v2 = MailerServiceV2()

