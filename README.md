# TCL Customer Portal — Phase 1 Migration

> **Rebuilding TCL's customer-facing order management system from Bubble.io into a production-ready microservice stack.**

---

## 🚀 Live Demo

| | |
|---|---|
| **Live URL** | `https://tcl-portal.vercel.app` *(deploy pending)* |
| **Test Email** | `madison.clarke@alphaphi.org` |
| **Test Password** | `password123` |

---

## 📌 What Was Built

A fully functional **Customer Portal** that replaces TCL's legacy Bubble.io system — allowing customers to sign up, manage orders, review design proofs, and request revisions. Built in under 48 hours as part of a full-stack hiring assessment.

### Pages & Features

| Route | Description |
|---|---|
| `/signup` | Customer registration with Supabase Auth |
| `/login` | Secure sign-in with session management |
| `/dashboard` | Order overview with stats, status badges, loyalty points |
| `/orders/new` | 3-step order creation (products → design → print type) |
| `/orders/[id]` | Order detail with production timeline tracker |
| `/orders/[id]/proofs` | Proof review — approve or request revisions |
| `/api/sync-products` | Shopify mock sync API (GET + POST) |

---

## 🛠 Tech Stack

```
Next.js 15 (App Router)     → Framework
Tailwind CSS                → Styling
Supabase                    → Auth + PostgreSQL + RLS
@supabase/ssr               → Server-side session handling
Poppins (Google Fonts)      → Typography
Vercel                      → Deployment
```

---

## 🗄 Database Schema

### Tables

**`users`** — Extended profile linked to Supabase Auth
```sql
id uuid (FK → auth.users)
name, email, organization, school
user_type: customer | account_manager | campus_rep
loyalty_points integer
```

**`products`** — Synced from Shopify mock API
```sql
id uuid, sku (unique), name, category
turnaround_days, starting_price
is_featured boolean
print_types_available text[]
```

**`orders`** — Customer orders
```sql
id uuid, customer_id (FK → users)
event_name, due_date, order_type, status
products_selected uuid[]
print_type, front/back_design_description
front/back_design_file (URLs)
```

**`proofs`** — Design mockups per order
```sql
id uuid, order_id (FK → orders), product_id (FK → products)
proof_number, color, print_type
mockup_image_url, est_ship_date
price_tiers jsonb
status: pending | approved | revision_requested
```

**`revision_requests`** — Customer revision feedback
```sql
id uuid, proof_id (FK → proofs), customer_id (FK → users)
notes text, created_at
```

### Order Status Flow
```
new → proof_pending → proof_ready → approved → in_production → shipped → complete
```

### Row Level Security
- Customers can only read/write their own data
- Service role used for admin operations (product sync)
- All tables protected with RLS policies

---

## 🔌 Shopify Sync API

### `GET /api/sync-products`
Fetches all products from mock Shopify store and upserts into Supabase.

```bash
curl https://your-domain.com/api/sync-products
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
Sync by category filter.

```bash
curl -X POST https://your-domain.com/api/sync-products \
  -H "Content-Type: application/json" \
  -d '{"category": "T-Shirts"}'
```

---

## ⚙️ Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/your-username/tcl-portal
cd tcl-portal
npm install
```

### 2. Environment Variables
Create `.env.local` in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup
Run the following in Supabase SQL Editor in order:

```
1. schema.sql       → Creates all tables + enums + RLS policies
2. seed.sql         → Inserts mock users, products, orders, proofs
```

### 4. Run Dev Server
```bash
npm run dev
```
Visit `http://localhost:3000`

### 5. Sync Products (optional)
```bash
curl http://localhost:3000/api/sync-products
```

---

## 🔐 Auth Flow

1. User signs up → Supabase creates `auth.users` entry
2. A `users` profile row is inserted with `user_type: customer`
3. All routes protected — unauthenticated users redirected to `/login`
4. Sessions handled server-side via `@supabase/ssr`

---

## 🎨 Design Decisions

**Why inline Poppins via `<style>` tag?**
Avoids font flash on load without needing to configure `next/font` globally — keeps each page self-contained and portable.

**Why no separate CSS files?**
Tailwind utility classes cover 100% of styling needs. Keeping styles co-located with components makes the codebase easier to navigate and modify.

**Why `upsert` on SKU for product sync?**
Products synced from Shopify should update existing records rather than duplicate them. `onConflict: 'sku'` ensures idempotent syncs — safe to run multiple times.

**Why service role key only in API routes?**
The anon key is safe to expose in the browser. The service role key bypasses RLS and must never reach the client — it's only used in server-side API routes.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── login/page.js           → Login page
│   ├── signup/page.js          → Signup page
│   ├── dashboard/page.js       → Customer dashboard
│   ├── orders/
│   │   ├── new/page.js         → 3-step order creation
│   │   └── [id]/
│   │       ├── page.js         → Order detail
│   │       └── proofs/page.js  → Proof review
│   └── api/
│       └── sync-products/
│           └── route.js        → Shopify sync endpoint
├── components/
│   └── StatusBadge.js          → Reusable status badge
└── lib/
    └── supabase.js             → Supabase browser client
```

---

## ✅ Assessment Checklist

| Task | Status |
|---|---|
| Supabase schema with all 5 tables | ✅ Done |
| RLS policies per user type | ✅ Done |
| Seed data (users, products, orders, proofs) | ✅ Done |
| Auth — signup, login, logout, protected routes | ✅ Done |
| Dashboard with order list + stats | ✅ Done |
| 3-step order creation flow | ✅ Done |
| Proof review — approve + revision request | ✅ Done |
| Revision requests saved to Supabase | ✅ Done |
| `/api/sync-products` GET + POST | ✅ Done |
| README | ✅ This document |

---

## ⚠️ Known Limitations

- **File uploads** — Design files (front/back) accept file input in the UI but do not upload to Supabase Storage. URLs are stored as null. In production this would use `supabase.storage.from('designs').upload()`.
- **Pricing** — Order totals show `—` as pricing logic requires quantity input not yet implemented.
- **Email notifications** — Revision requests save to DB but no email is sent to the designer. Production version would use Supabase Edge Functions + Resend.
- **"Get a Link" order type** — UI renders the option on the proofs page but the shareable link generation is not implemented in Phase 1 scope.

---

## 👤 About

Built by a full-stack developer comfortable across the entire product surface — from Supabase schema design and RLS policies, to pixel-precise UI in Next.js + Tailwind, to RESTful API routes and deployment. This project was scoped, designed, and shipped end-to-end as a single-person effort.

---

*TCL Customer Portal — Phase 1 | Built with Next.js, Tailwind, Supabase*
