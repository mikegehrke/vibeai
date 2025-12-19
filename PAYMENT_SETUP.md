# Payment Integration Setup Guide

Die Zahlungsintegration ist vollständig vorbereitet! Du musst nur noch die API-Keys eintragen.

## 📦 Installation

1. **SDKs installieren:**
```bash
cd backend
pip install -r requirements.txt
```

Dies installiert automatisch:
- `stripe` - Stripe Payment SDK
- `paypalrestsdk` - PayPal Payment SDK

## 🔑 API-Keys konfigurieren

### 1. Environment-Variablen einrichten

Kopiere die `.env.example` Datei:
```bash
cp backend/.env.example backend/.env
```

### 2. Stripe API-Keys

1. Gehe zu [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Erstelle einen Account oder logge dich ein
3. Kopiere deinen **Secret Key** (beginnt mit `sk_test_` für Test, `sk_live_` für Produktion)
4. Trage ihn in `.env` ein:
   ```
   STRIPE_SECRET_KEY=sk_test_dein_key_hier
   ```

5. **Webhook Secret einrichten:**
   - Gehe zu [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - Klicke auf "Add endpoint"
   - URL: `https://deine-domain.com/api/checkout/webhook/stripe`
   - Wähle Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Kopiere den **Signing secret** (beginnt mit `whsec_`)
   - Trage ihn in `.env` ein:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_dein_webhook_secret_hier
     ```

### 3. PayPal API-Keys

1. Gehe zu [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Erstelle einen Account oder logge dich ein
3. Erstelle eine neue App oder verwende eine existierende
4. Kopiere **Client ID** und **Client Secret**
5. Trage sie in `.env` ein:
   ```
   PAYPAL_CLIENT_ID=deine_client_id_hier
   PAYPAL_CLIENT_SECRET=dein_client_secret_hier
   PAYPAL_MODE=sandbox  # Für Tests, später auf "live" ändern
   ```

6. **Webhook einrichten:**
   - Gehe zu deiner App in PayPal Dashboard
   - Füge Webhook URL hinzu: `https://deine-domain.com/api/checkout/webhook/paypal`
   - Wähle Events: `PAYMENT.SALE.COMPLETED`, `PAYMENT.SALE.DENIED`

### 4. Frontend URL

Trage deine Frontend-URL ein (für PayPal Redirects):
```
FRONTEND_URL=http://localhost:3000  # Für Entwicklung
# Oder für Produktion:
# FRONTEND_URL=https://deine-domain.com
```

## ✅ Testen

Nach dem Eintragen der API-Keys:

1. **Backend neu starten:**
```bash
cd backend
python main.py
```

2. **Test-Zahlung durchführen:**
   - Gehe zu einer Checkout-Seite (z.B. `/pricing/core/checkout`)
   - Wähle Stripe oder PayPal
   - Führe eine Test-Zahlung durch

## 🔒 Produktion

Für Produktion:

1. **Stripe:**
   - Verwende `sk_live_...` statt `sk_test_...`
   - Aktualisiere Webhook URL auf deine Produktions-Domain

2. **PayPal:**
   - Setze `PAYPAL_MODE=live` in `.env`
   - Verwende Live-Credentials aus PayPal Dashboard

3. **Sicherheit:**
   - Stelle sicher, dass `.env` nicht in Git committed wird
   - Verwende sichere Environment-Variablen auf deinem Server

## 📝 Was funktioniert automatisch

✅ Alle Pläne (Core, Pro+, Ultra, Ultra+, Teams, On Demand)
✅ Variable Beträge für On Demand (min. 10€)
✅ MwSt. Berechnung (19%)
✅ Promo-Codes
✅ Stripe Payment Intents
✅ PayPal Orders
✅ Webhook-Handler für Zahlungsbestätigungen

## 🐛 Troubleshooting

**"Stripe SDK not installed":**
```bash
pip install stripe
```

**"PayPal SDK not installed":**
```bash
pip install paypalrestsdk
```

**"API key not configured":**
- Prüfe, ob `.env` Datei existiert
- Prüfe, ob die Variablen korrekt gesetzt sind
- Starte Backend neu

**Webhook funktioniert nicht:**
- Prüfe, ob die Webhook-URL öffentlich erreichbar ist
- Prüfe, ob der Webhook Secret korrekt ist
- Prüfe Stripe/PayPal Dashboard für Fehler-Logs

## 📚 Weitere Informationen

- [Stripe Dokumentation](https://stripe.com/docs)
- [PayPal REST API](https://developer.paypal.com/docs/api/overview/)

