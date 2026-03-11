# 🧵 TCL Customer Portal — Phase 1 Migration

> Took a legacy Bubble.io system and rebuilt it into a clean, production-ready microservice.
> **Next.js + Tailwind + Supabase — designed, built, and shipped end-to-end.**

---

## 🚀 Try It Live

| | |
|---|---|
| 🌐 **Live URL** | [navneet-tcl-portal.vercel.app](https://navneet-tcl-portal.vercel.app/login) |
| 📧 **Test Email** | `NavneetprasadTest17@gmail.com` |
| 🔑 **Test Password** | `123456` |

> Just open the link, hit **Sign In**, and explore — no setup needed.

---

## 🎯 What Is This?

TCL is a custom apparel company. Their customers (fraternities, sororities, sports teams) needed a portal to:

- Place orders for custom printed t-shirts, hoodies, hats
- Upload design files and describe what they want
- Review mockup proofs from the design team
- Approve proofs or request changes

This portal is **Phase 1** of migrating that system from Bubble.io to a modern stack.

---

## ✨ Features Built

### 🔐 Auth
- Sign up with name, email, organization, password
- Secure login with Supabase Auth (bcrypt hashed passwords)
- All routes protected — guests redirected to `/login`

### 📊 Dashboard
- Live order stats — Total, Active, Completed
- Full order table with colored status badges
- Loyalty points display per customer

### 📦 Order Creation *(3-step flow)*
- **Step 1** — Pick products (synced from Shopify mock API)
- **Step 2** — Describe front & back designs, upload files
- **Step 3** — Choose print type (Screen Print, Embroidery, Foil, etc.)

### 🖼️ Proof Review
- View design mockups per product
- See price tiers by quantity
- **Approve** proof with one click
- **Request Changes** with detailed notes → saved to DB instantly

### 🔌 Shopify Sync API
- `GET /api/sync-products` — syncs all products
- `POST /api/sync-products` — sync by category filter
- Idempotent upserts using SKU as conflict key

---

## 🛠 Tech Stack

```
Next.js 15 (App Router)   → Framework + API Routes
Tailwind CSS              → Styling (zero custom CSS files)
Supabase                  → PostgreSQL + Auth + RLS
@supabase/ssr             → Secure server-side sessions
Poppins (Google Fonts)    → Typography
Vercel                    → Deployment (auto from GitHub)
```

---

## 🗄 Database Schema

5 tables, all with Row Level Security enabled.

```
users              → Customer profiles (linked to Supabase Auth)
products           → Apparel catalog (synced via Shopify API)
orders             → Customer orders with status tracking
proofs             → Design mockups per order/product
revision_requests  → Customer feedback on proofs
```

### Order Lifecycle
```
new → proof_pending → proof_ready → approved → in_production → shipped → complete
```

### Security Model
- **Customers** — can only see and edit their own data (enforced via RLS)
- **Service role** — used only in server-side API routes, never exposed to browser
- **Anon key** — safe for client-side Supabase calls

---

## 🔌 API Reference

### `GET /api/sync-products`
Syncs all 10 products from mock Shopify store into Supabase.

```bash
curl https://navneet-tcl-portal.vercel.app/api/sync-products
```

```json
{
  "success": true,
  "message": "Synced 10 products from Shopify to Supabase",
  "products_synced": 10,
  "source": "mock_shopify",
  "synced_at": "2026-03-11T23:09:14.702Z"
}
```

### `POST /api/sync-products`
Sync a specific category only.

```bash
curl -X POST https://navneet-tcl-portal.vercel.app/api/sync-products \
  -H "Content-Type: application/json" \
  -d '{"category": "T-Shirts"}'
```

---

## 🤖 AI-Assisted Development

This project was built using **Claude (Anthropic)** as an AI pair programmer throughout the entire development process.

### How AI was used
- **Schema design** — prompted Claude to design the 5-table schema with proper enums, foreign keys, and RLS policies
- **Component generation** — described UI requirements and iterated on generated components
- **Debugging** — pasted errors directly and got precise fixes (RLS policy issues, broken JSX tags, env variable loading)
- **API route** — described the Shopify sync requirement and Claude generated the full idempotent upsert logic

### Sample prompts used
```
"Design a Supabase schema for a custom apparel order portal with
customers, products, orders, proofs, and revision requests"

"Build a 3-step order creation page with a left sidebar showing
selected products and right content area with product grid"

"The sync API is returning RLS violation — here's my route.js
and supabase.js, what's wrong?"
```

### Validation approach
Every AI output was reviewed before use:
- Schema checked against requirements doc manually
- Generated components tested in browser for functionality
- API responses verified in both browser and Supabase table editor
- RLS policies tested by attempting cross-user data access

---

## ⚙️ Run Locally

```bash
# 1. Clone
git clone https://github.com/NavneetPrasad1709/tcl-portal
cd tcl-portal

# 2. Install
npm install

# 3. Environment variables — create .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 4. Run
npm run dev
# → http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.js                     → Redirects to /login
│   ├── layout.js                   → Root layout + metadata
│   ├── login/page.js               → Login page
│   ├── signup/page.js              → Signup page
│   ├── dashboard/page.js           → Customer dashboard
│   ├── orders/
│   │   ├── new/page.js             → 3-step order creation
│   │   └── [id]/
│   │       ├── page.js             → Order detail + timeline
│   │       └── proofs/page.js      → Proof review + approve/revision
│   └── api/
│       └── sync-products/
│           └── route.js            → Shopify sync (GET + POST)
├── components/
│   └── StatusBadge.js              → Reusable status badge
└── lib/
    └── supabase.js                 → Supabase browser client
```

---

## 🧠 Design Decisions

**Poppins via inline `<style>` tag**
Keeps each page self-contained. No global font config needed, no flash on load.

**Upsert on SKU conflict**
Product sync is safe to run multiple times — existing records update, no duplicates ever created.

**Service role key server-side only**
The anon key is fine in the browser. The service role key bypasses RLS and lives only in API routes — never shipped to the client.

**Tailwind only, no CSS files**
100% utility classes. Co-located styles make components portable and easy to read at a glance.

---

## ✅ Assessment Checklist

| Task | Status |
|---|---|
| Supabase schema — all 5 tables + enums | ✅ |
| RLS policies per user type | ✅ |
| Seed data — users, products, orders, proofs | ✅ |
| Signup + login + logout + protected routes | ✅ |
| Dashboard with order list + stats | ✅ |
| 3-step order creation flow | ✅ |
| Proof review — approve + revision request | ✅ |
| Revision requests persisted to Supabase | ✅ |
| `/api/sync-products` GET + POST | ✅ |
| Deployed to Vercel with live URL | ✅ |
| README | ✅ You're reading it |
| Bonus 1 — AI-Assisted Development | ✅ |
| Bonus 5 — Live Deploy + test credentials | ✅ |

---

## ⚠️ Known Limitations

**File uploads** — The UI accepts file input but doesn't upload to Supabase Storage yet. In production: `supabase.storage.from('designs').upload()`.

**Pricing totals** — Shows `—` because quantity input is not yet implemented. Pricing logic is per proof (tiered) not per order.

**Email notifications** — Revision requests save to DB but no email fires. Production fix: Supabase Edge Function + Resend API on `revision_requests` insert.

**"Get a Link" order type** — Visible in proofs sidebar UI but link generation is out of Phase 1 scope.

---

## 👤 Built By

**Navneet Prasad**
Full-stack developer — comfortable across the entire product surface.
Schema design → RLS policies → pixel-precise UI → REST APIs → deployment.
This project was scoped, designed, and shipped solo.

🔗 [GitHub](https://github.com/NavneetPrasad1709) &nbsp;·&nbsp; 🌐 [Live Demo](https://navneet-tcl-portal.vercel.app/login)

---

*TCL Customer Portal — Phase 1 | Next.js · Tailwind · Supabase · Vercel*
