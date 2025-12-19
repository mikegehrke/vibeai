# Frontend Payment Integration

Das Frontend ist bereits vorbereitet! Du musst nur noch Stripe Elements einbinden, wenn du willst.

## Aktueller Stand

Das Frontend sendet bereits:
- ✅ Payment Intent Request an `/api/checkout/create-payment-intent`
- ✅ Erhält `client_secret` für Stripe oder `redirect_url` für PayPal
- ✅ Zeigt Erfolgsmeldung

## Optional: Stripe Elements hinzufügen

Falls du Stripe Elements (Kreditkartenformular) direkt im Frontend haben möchtest:

1. **Stripe.js installieren:**
```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

2. **In `checkout/page.jsx` einbinden:**
```jsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key'); // Von Stripe Dashboard
```

3. **Payment Form aktualisieren:**
- Wenn `paymentMethod === 'stripe'` und `client_secret` vorhanden ist
- Zeige Stripe CardElement statt normalem Formular
- Verwende `stripe.confirmCardPayment()` für die Zahlung

## PayPal Integration

PayPal funktioniert bereits automatisch:
- Backend erstellt PayPal Order
- Gibt `redirect_url` zurück
- Frontend leitet User zu PayPal weiter
- Nach Zahlung: Redirect zurück zu `/payment/success`

## Aktueller Flow

1. User wählt Zahlungsmethode (Stripe/PayPal)
2. Frontend sendet Request an Backend
3. Backend erstellt Payment Intent/Order
4. **Stripe:** Gibt `client_secret` zurück (kann für Stripe Elements verwendet werden)
5. **PayPal:** Gibt `redirect_url` zurück → User wird zu PayPal weitergeleitet
6. Nach erfolgreicher Zahlung: Webhook wird getriggert

## Nächste Schritte

Die Integration funktioniert bereits! Du kannst:
- Stripe Elements optional hinzufügen (siehe oben)
- Erfolgs-/Fehler-Seiten erstellen (`/payment/success`, `/payment/cancel`)
- Webhook-Handler im Backend erweitern (Datenbank-Updates, E-Mails, etc.)

