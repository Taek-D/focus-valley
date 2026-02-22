# Focus Valley — Pro Tier Proposal

## Pricing

| | Free | Pro |
|---|---|---|
| **Price** | $0 | ₩19,900 one-time (lifetime) |
| **Target** | Casual users, students | Power users, remote workers |

---

## Feature Comparison

| Feature | Free | Pro |
|---------|:----:|:---:|
| Pomodoro timer | ✅ | ✅ |
| Plant growing & garden | ✅ | ✅ |
| 4 base plant types | ✅ | ✅ |
| Ambient sounds (5 types) | ✅ | ✅ |
| Session categories (6 presets) | ✅ | ✅ |
| Basic stats (weekly) | ✅ | ✅ |
| Todo list | ✅ | ✅ |
| Dark mode | ✅ | ✅ |
| Cloud sync (1 device) | ✅ | ✅ |
| **Cloud sync (unlimited devices)** | ❌ | ✅ |
| **Advanced stats (monthly, yearly, heatmap)** | ❌ | ✅ |
| **Custom categories (unlimited)** | 1 custom | ✅ |
| **Rare plants (8+ extra types)** | ❌ | ✅ |
| **Custom timer presets** | ❌ | ✅ |
| **Focus sessions export (CSV)** | Last 7 days | All time |
| **Share card customization** | Basic | Themes, colors |
| **White noise library (15+ sounds)** | 5 sounds | 15+ sounds |
| **Focus insights (AI summary)** | ❌ | ✅ |
| **Priority support** | ❌ | ✅ |
| **No waitlist banner** | ❌ | ✅ |

---

## Pro-Only Plant Types (Content Expansion)

| Plant | Unlock | Type |
|-------|--------|------|
| Bonsai | Pro | 🌳 |
| Cherry Blossom | Pro | 🌸 |
| Bamboo | Pro | 🎋 |
| Lotus | Pro | 🪷 |
| Lavender | Pro + 14-day streak | 💜 |
| Crystal Flower | Pro + 30-day streak | 💎 |
| Golden Tree | Pro + 50 sessions | 🌟 |
| Aurora Plant | Pro + 100 sessions | ✨ |

---

## Payment Integration

### Recommended: Lemon Squeezy
- No merchant account needed
- Handles global tax/VAT automatically
- Supports subscriptions + one-time payments
- Built-in license key system
- React SDK available (`@lemonsqueezy/lemonsqueezy.js`)

### Alternative: Stripe
- More control but more setup
- Need to handle tax compliance manually
- Better for future B2B expansion

---

## Implementation Plan

### Phase 1: Paywall Foundation
1. Create `useSubscription` Zustand store
   - `plan: "free" | "pro"`, `expiresAt`, `licenseKey`
   - Persist to localStorage + Supabase `user_sync`
2. Add `<ProGate>` wrapper component
   - Checks plan status, shows upgrade prompt if free
3. Add Supabase `user_subscriptions` table

### Phase 2: Payment Flow
1. Lemon Squeezy product + variant setup
2. Checkout overlay (redirect to Lemon Squeezy hosted page)
3. Webhook endpoint (Supabase Edge Function) to update subscription status
4. License validation on app load

### Phase 3: Pro Features
1. Unlock rare plants in garden store
2. Extended stats views (monthly/yearly heatmap)
3. Additional ambient sounds
4. Custom share card themes
5. Unlimited custom categories

### Phase 4: Retention
1. 7-day free trial for new signups
2. Annual discount push (in-app)
3. "Pro since" badge in profile
4. Monthly focus report email (SendGrid/Resend)

---

## Revenue Projections (Conservative)

| Metric | Month 1 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| MAU | 500 | 3,000 | 10,000 |
| Free → Pro conversion | 2% | 3% | 4% |
| Pro subscribers | 10 | 90 | 400 |
| MRR | $50 | $450 | $2,000 |
| ARR | $600 | $5,400 | $24,000 |

*Assumptions: Organic growth via Product Hunt + SEO, 3% average conversion, 5% monthly churn*

---

## Key Decisions Needed

1. **Lemon Squeezy vs Stripe?** — LS recommended for simplicity
2. **Free trial duration?** — 7 days recommended
3. ~~**Lifetime deal?**~~ — **Decided**: ₩19,900 one-time purchase (lifetime)
4. **Ko-fi integration?** — Keep as tip jar alongside Pro?
