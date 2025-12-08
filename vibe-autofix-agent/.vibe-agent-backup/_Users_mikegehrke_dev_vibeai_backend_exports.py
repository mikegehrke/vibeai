# -------------------------------------------------------------
# VIBEAI – DATA EXPORT SYSTEM
# -------------------------------------------------------------
# ❗ ORIGINAL: Datei war vollständig leer
#
# 🧠 ANALYSE – Was wird benötigt:
# - Export von User-Daten (GDPR-compliant)
# - Export von Chat-Sessions
# - Export von generierten Projects
# - Export von Billing-Daten
# - Mehrere Formate (JSON, CSV, ZIP)
# - Admin-Export (alle User-Daten)
# - User-Export (eigene Daten)
#
# Kompatibel mit:
# - admin/export.py (Admin-Funktionen)
# - GDPR Anforderungen
# - Billing System
# - Session Management
# -------------------------------------------------------------

import csv
import io
import json
import zipfile
from datetime import datetime
from typing import Any, Dict, List, Optional

from db import get_db_context


class DataExporter:
    """
    Zentrales Export-System für VibeAI.
    Unterstützt verschiedene Export-Formate und Datentypen.
    """

    def export_user_data(
        self,
        user_id: int,
        format: str = "json",
        include_sessions: bool = True,
        include_billing: bool = True,
    ) -> Any:
        """
        Exportiert alle Daten eines Users (GDPR-compliant).

        Args:
            user_id: User ID
            format: "json", "csv", "zip"
            include_sessions: Chat Sessions exportieren
            include_billing: Billing-Daten exportieren

        Returns:
            Export-Daten als Dictionary oder String/Bytes für CSV/ZIP
        """
        export_data = {
            "export_date": datetime.now().isoformat(),
            "user_id": user_id,
            "user_info": self._get_user_info(user_id),
        }

        if include_sessions:
            export_data["sessions"] = self._get_user_sessions(user_id)

        if include_billing:
            export_data["billing"] = self._get_user_billing(user_id)

        if format == "json":
            return export_data
        elif format == "csv":
            return self._convert_to_csv(export_data)
        elif format == "zip":
            return self._create_zip_export(export_data)
        else:
            raise ValueError("Unsupported format: {}".format(format))

    def export_all_users(self, admin_id: int) -> List[Dict]:
        """
        Admin-Export: Alle User-Daten.
        Nur für Admins!
        """
        with get_db_context() as db:
            from models import User

            users = db.query(User).all()

            return [
                {
                    "id": u.id,
                    "email": u.email,
                    "username": u.username,
                    "tier": getattr(u, "tier", "free"),
                    "created_at": getattr(u, "created_at", None),
                    "last_login": getattr(u, "last_login", None),
                }
                for u in users
            ]

    def export_sessions(
        self,
        user_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict]:
        """
        Exportiert Chat-Sessions mit Filtern.
        """
        with get_db_context() as db:
            from sessions import SessionDB

            query = db.query(SessionDB)

            if user_id:
                query = query.filter(SessionDB.user_id == user_id)

            if start_date:
                query = query.filter(SessionDB.created_at >= start_date)

            if end_date:
                query = query.filter(SessionDB.created_at <= end_date)

            sessions = query.all()

            return [
                {
                    "session_id": s.id,
                    "user_id": s.user_id,
                    "agent": getattr(s, "agent", "unknown"),
                    "created_at": s.created_at.isoformat(),
                    "message_count": getattr(s, "message_count", 0),
                }
                for s in sessions
            ]

    def export_billing_data(
        self,
        user_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict]:
        """
        Exportiert Billing-Daten.
        """
        with get_db_context() as db:
            from billing.models import BillingRecordDB

            query = db.query(BillingRecordDB)

            if user_id:
                query = query.filter(BillingRecordDB.user_id == user_id)

            if start_date:
                query = query.filter(BillingRecordDB.timestamp >= start_date)

            if end_date:
                query = query.filter(BillingRecordDB.timestamp <= end_date)

            records = query.all()

            return [
                {
                    "id": r.id,
                    "user_id": r.user_id,
                    "model": r.model,
                    "input_tokens": r.input_tokens,
                    "output_tokens": r.output_tokens,
                    "cost_usd": r.cost_usd,
                    "timestamp": r.timestamp.isoformat(),
                }
                for r in records
            ]

    def _get_user_info(self, user_id: int) -> Dict:
        """Holt User-Informationen."""
        with get_db_context() as db:
            from models import User

            user = db.query(User).filter(User.id == user_id).first()

            if not user:
                return {}

            return {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "tier": getattr(user, "tier", "free"),
                "created_at": getattr(user, "created_at", None),
            }

    def _get_user_sessions(self, user_id: int) -> List[Dict]:
        """Holt alle Sessions eines Users."""
        return self.export_sessions(user_id=user_id)

    def _get_user_billing(self, user_id: int) -> List[Dict]:
        """Holt alle Billing-Records eines Users."""
        return self.export_billing_data(user_id=user_id)

    def _convert_to_csv(self, data: Dict) -> str:
        """Konvertiert Dictionary zu CSV."""
        output = io.StringIO()

        # Flatten nested data for CSV
        if "sessions" in data:
            writer = csv.DictWriter(
                output,
                fieldnames=["session_id", "agent", "created_at", "message_count"],
            )
            writer.writeheader()
            for session in data["sessions"]:
                writer.writerow(session)

        return output.getvalue()

    def _create_zip_export(self, data: Dict) -> bytes:
        """Erstellt ZIP-Archive mit allen Daten."""
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
            # User Info
            zipf.writestr("user_info.json", json.dumps(data.get("user_info", {}), indent=2))

            # Sessions
            if "sessions" in data:
                zipf.writestr("sessions.json", json.dumps(data["sessions"], indent=2))

            # Billing
            if "billing" in data:
                zipf.writestr("billing.json", json.dumps(data["billing"], indent=2))

        return zip_buffer.getvalue()


# Globale Instanz
data_exporter = DataExporter()