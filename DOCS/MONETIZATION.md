# Monetization System Design (Phase 2)

## 💰 Business Model: Freemium
Kairo AI uses a simple Freemium model to ensure a wide user base while covering LLM costs through a Pro tier.

### 1. FREE TIER (Default)
- **Daily Limit**: 20 requests/day.
- **Enabled Actions**: `summarize`, `explain`, `translate` only.
- **Features**: Basic response speed, community support.
- **Constraint**: No custom prompts allowed.

### 2. PRO TIER ($4.99/month)
- **Daily Limit**: Unlimited requests.
- **Enabled Actions**: All 7 actions (Summarize, Explain, Rewrite, Reply, Translate, Fix Grammar, Custom).
- **Features**: Priority server processing, direct email support, no ads.

---

## 🛠️ Implementation Checklist

### Phase 1: Authentication & Storage
- [ ] Connect **Supabase** (PostgreSQL) for user and usage tracking.
- [ ] Implement email-based identification in the extension.
- [ ] Create `usage_logs` table to track requests.

### Phase 2: Stripe Integration
- [ ] Create a Stripe account and define a "Kairo Pro" Monthly Subscription product.
- [ ] Implement `/api/billing/subscribe` endpoint (creates a Checkout Session).
- [ ] Implement Stripe Webhook to handle `checkout.session.completed` and `customer.subscription.deleted`.

### Phase 3: Enforcement
- [ ] Update `ai.controller.js` to check usage before calling LLMs.
- [ ] Return `429 Too Many Requests` when the free limit is hit.
- [ ] Add a "Remaining Requests" counter in the extension UI.

---

## 💾 Database Schema (Supabase)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'pro'
  subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Logs Table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 💳 Stripe Integration Snippets (Node.js)

### 1. Create Subscription Session
```javascript
// backend/src/controllers/billing.controller.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createSubscription = async (req, res) => {
  const { email } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{
      price: 'price_H5ggY9...', // Your Stripe Price ID
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
  });

  res.json({ sessionId: session.id, url: session.url });
};
```

### 2. Webhook Handler
```javascript
// backend/src/server.js (Add this route)
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Update user to 'pro' in Supabase here
    updateUserTier(session.customer_email, 'pro', session.subscription);
  }

  res.json({received: true});
});
```

---

## 🛑 Enforcement Logic

### Request Guard (Pseudo-code)
```javascript
async function checkUsage(userId, tier) {
  if (tier === 'pro') return true;

  const today = new Date().toISOString().split('T')[0];
  const count = await supabase
    .from('usage_logs')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', today);

  return count < 20; // Allow if under free limit
}
```

---

## 🧪 Testing Guide

1. **Test Free Limit**:
   - Manually insert 20 logs for a test user in Supabase.
   - Verify the extension receives a `429` error and shows the "Limit Reached" UI.
2. **Test Stripe Webhook**:
   - Use the `stripe-cli`: `stripe listen --forward-to localhost:3001/webhook`.
   - Trigger a mock event: `stripe trigger checkout.session.completed`.
   - Verify user status in DB changes from `free` to `pro`.
3. **Test Action Restriction**:
   - Attempt a `custom` prompt on a `free` account.
   - Verify the backend rejects it with a "Pro Feature" message.
