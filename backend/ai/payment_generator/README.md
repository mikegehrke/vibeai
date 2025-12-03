# 💳 Payment Generator

**Automatische Stripe & PayPal Integration Code-Generierung**

Generiere produktionsfähigen Payment-Code in Sekunden! Unterstützt Stripe, PayPal, Subscriptions, One-Time Payments, Webhooks und Frontend-Komponenten.

## 🎯 Features

### Payment Providers
- ✅ **Stripe** - Global payment platform
  - Checkout Sessions (payment, subscription, setup)
  - Payment Intents (manual confirmation)
  - Subscriptions (monthly, yearly, trials)
  - Customer Portal
  - Webhooks (7+ events)
  - Test Cards
  
- ✅ **PayPal** - Widely adopted platform
  - Orders API (create, capture)
  - Smart Payment Buttons
  - Subscriptions
  - Webhooks (5+ events)
  - Sandbox testing

- ✅ **Both** - Maximum payment coverage

### Pricing Models
- 🛒 **One-Time Payment** - Single payment for products/services
- 🔁 **Subscription** - Recurring payments (monthly/yearly)
- 📊 **Usage-Based** - Pay for what you use
- 📈 **Tiered** - Different price tiers

### Backend Frameworks
- ✅ **FastAPI** (fully supported)
- 🚧 Django (coming soon)
- 🚧 Flask (coming soon)
- 🚧 Express.js (coming soon)

### Frontend Frameworks
- ✅ **React** - Stripe Elements, PayPal Smart Buttons
- ✅ **Flutter** - Stripe Payment Sheet
- 🚧 React Native (coming soon)
- 🚧 Next.js (coming soon)

## 🚀 Quick Start

### 1. Generate Payment Code

```bash
# Via UI
npm run dev
# Navigate to "💳 Payment Generator" tab
# Configure provider, pricing model, frameworks
# Click "Generate Payment System"

# Via API
curl -X POST http://localhost:8000/payment-gen/generate \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "stripe",
    "pricing_model": "subscription",
    "backend_framework": "fastapi",
    "frontend_framework": "react",
    "subscription_interval": "month",
    "trial_days": 7
  }'
```

### 2. Backend Setup (FastAPI)

```python
# backend/payments/stripe_payment.py
# (Auto-generated code)

import stripe
import os
from fastapi import APIRouter

router = APIRouter(prefix="/payments/stripe", tags=["Stripe Payments"])
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest):
    session = stripe.checkout.Session.create(
        mode="subscription",
        success_url="https://yourapp.com/success",
        cancel_url="https://yourapp.com/cancel",
        line_items=[{"price": request.price_id, "quantity": 1}],
        subscription_data={
            "trial_period_days": request.trial_days
        } if request.trial_days > 0 else None
    )
    return {"checkout_url": session.url}
```

### 3. Frontend Setup (React)

```jsx
// src/components/PaymentForm.jsx
// (Auto-generated code)

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { client_secret } = await fetch('/payments/stripe/create-payment-intent').then(r => r.json());
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
      payment_method: { card: elements.getElement(CardElement) }
    });
    
    if (paymentIntent.status === 'succeeded') {
      console.log('Payment successful!');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### 4. Environment Variables

```bash
# .env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=YOUR_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_CLIENT_SECRET
PAYPAL_MODE=sandbox  # or 'live'
PAYPAL_WEBHOOK_ID=YOUR_WEBHOOK_ID
```

## 📖 API Endpoints

### Payment Generation

```
POST /payment-gen/generate
  - Generiere komplettes Payment-System
  - Request: provider, pricing_model, frameworks
  - Response: backend_code, frontend_code, webhook_code

POST /payment-gen/generate-checkout
  - Generiere nur Checkout Code

POST /payment-gen/generate-webhook
  - Generiere nur Webhook Handler

POST /payment-gen/generate-subscription
  - Generiere Subscription Code

GET /payment-gen/providers
  - Liste alle Payment Provider

GET /payment-gen/pricing-models
  - Liste alle Pricing Models

GET /payment-gen/frameworks
  - Liste alle unterstützten Frameworks

GET /payment-gen/templates/{provider}
  - Get code template für Provider

POST /payment-gen/validate-config
  - Validiere Payment Config
```

## 🔧 Configuration Examples

### Example 1: SaaS Subscription (Stripe)

```json
{
  "provider": "stripe",
  "pricing_model": "subscription",
  "backend_framework": "fastapi",
  "frontend_framework": "react",
  "subscription_interval": "month",
  "trial_days": 7,
  "success_url": "https://yourapp.com/success",
  "cancel_url": "https://yourapp.com/cancel"
}
```

### Example 2: E-Commerce (PayPal)

```json
{
  "provider": "paypal",
  "pricing_model": "one_time",
  "backend_framework": "fastapi",
  "frontend_framework": "react",
  "currency": "usd",
  "amount": 49.99,
  "success_url": "https://yourapp.com/success",
  "cancel_url": "https://yourapp.com/cancel"
}
```

### Example 3: Mobile App (Flutter + Stripe)

```json
{
  "provider": "stripe",
  "pricing_model": "subscription",
  "backend_framework": "fastapi",
  "frontend_framework": "flutter",
  "subscription_interval": "month",
  "trial_days": 14
}
```

## 🔐 Webhook Events

### Stripe Events
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Invoice paid
- `invoice.payment_failed` - Invoice payment failed

### PayPal Events
- `PAYMENT.CAPTURE.COMPLETED` - Payment completed
- `PAYMENT.CAPTURE.DENIED` - Payment denied
- `CHECKOUT.ORDER.APPROVED` - Order approved
- `BILLING.SUBSCRIPTION.ACTIVATED` - Subscription activated
- `BILLING.SUBSCRIPTION.CANCELLED` - Subscription canceled

## 🧪 Testing

### Stripe Test Cards
```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Requires authentication: 4000 0025 0000 3155
```

### PayPal Sandbox
```
Create test accounts at:
https://developer.paypal.com/dashboard/accounts

Use sandbox.paypal.com for testing
```

## 📦 Installation

### Backend Dependencies

```bash
# FastAPI + Stripe
pip install stripe fastapi

# FastAPI + PayPal
pip install requests
```

### Frontend Dependencies

```bash
# React + Stripe
npm install @stripe/stripe-js @stripe/react-stripe-js

# Flutter + Stripe
flutter pub add flutter_stripe
flutter pub add http
```

## 🛡️ Security Features

- ✅ Webhook signature verification
- ✅ Environment variable configuration
- ✅ HTTPS enforcement
- ✅ Error handling
- ✅ PCI-DSS compliant (hosted by Stripe/PayPal)
- ✅ Test mode support

## 📝 Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set `PAYPAL_MODE=live`
- [ ] Verify webhook endpoints are accessible
- [ ] Test payment flow end-to-end
- [ ] Implement proper error handling
- [ ] Add logging and monitoring
- [ ] Review Stripe/PayPal compliance requirements
- [ ] Set up email notifications
- [ ] Configure customer portal (Stripe)
- [ ] Test subscription cancellation flow

## 💡 Use Cases

### SaaS Products
- Monthly/yearly subscriptions
- Free trials (7, 14, 30 days)
- Multiple pricing tiers
- Usage-based billing

### E-Commerce
- One-time product purchases
- Digital downloads
- Physical goods
- Gift cards

### Mobile Apps
- In-app purchases
- Premium features
- Subscription services
- One-time unlocks

### Membership Sites
- Monthly memberships
- Annual memberships
- Tiered access levels
- Content paywalls

## 🤝 Provider Comparison

| Feature | Stripe | PayPal |
|---------|--------|--------|
| Transaction Fee | 2.9% + $0.30 | 2.9% + $0.30 |
| Supported Countries | 46+ | 200+ |
| Cryptocurrencies | Yes | Limited |
| Payment Methods | Cards, Wallets, ACH | Cards, PayPal balance |
| Developer Tools | Excellent | Good |
| Recurring Billing | Yes | Yes |
| Test Mode | Yes | Yes (Sandbox) |

## 📚 Resources

### Stripe
- [Stripe Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Dashboard](https://dashboard.stripe.com)

### PayPal
- [PayPal Developer](https://developer.paypal.com)
- [PayPal API Reference](https://developer.paypal.com/api/rest/)
- [PayPal Sandbox](https://sandbox.paypal.com)

## 🎨 Generated Code Stats

- **Backend Code**: 150-250 lines
- **Webhook Handler**: 100-150 lines
- **Frontend Components**: 100-200 lines
- **Total Package**: 350-600 lines
- **Setup Time**: < 30 minutes

## 🚀 Next Steps

1. **Generate Code** - Use UI or API to generate payment integration
2. **Setup Accounts** - Create Stripe/PayPal accounts
3. **Get API Keys** - Copy credentials to .env
4. **Configure Webhooks** - Set up webhook endpoints
5. **Test** - Use test mode to verify flow
6. **Deploy** - Move to production

## 📄 License

MIT License - See LICENSE file for details

---

**Generated by VibeAI Payment Generator** 💳✨
