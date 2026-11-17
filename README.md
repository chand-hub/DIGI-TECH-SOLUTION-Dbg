# DIGI TECH SOLUTION — Official Agency Website & Full-Stack Platform

**Tagline:** Your Digital Growth Partner.  
**Location:** Darbhanga, Bihar, India  
**Business Email:** `educationrevolution90@gmail.com`  
**Official WhatsApp Enquiry:** `+91 73197 85754`

A full-stack digital agency platform built with **React, TypeScript, Vite, Tailwind CSS**, **Cloudflare Pages Functions**, and **Cloudflare D1**—featuring multi-service enquiry capture, Resend email notifications, click-to-chat WhatsApp integration, server-verified Razorpay checkout with 7-state lifecycle tracking, and low-network PWA support.

---

## Architecture Overview

- **Frontend (`/src`)**: React 19, TypeScript, Tailwind CSS v4, route-level code splitting (`React.lazy`), bilingual English / Hindi (`EN` / `हिन्दी`) toggle, offline detection, and PWA manifest + service worker.
  - Pages: `/`, `/about`, `/services`, `/portfolio`, `/portfolio/:slug`, `/pricing`, `/contact`, `/faq`, `/privacy-policy`, `/terms-and-conditions`, `/refund-and-cancellation-policy`, `/payment-success`, `/payment-failure`, `/admin`.
- **Backend (`/functions`)**: Cloudflare Pages Functions (`onRequestGet`, `onRequestPost`, `onRequestPatch`) using Web Crypto API (`HMAC-SHA256`, `SHA-256`) and parameterized Cloudflare D1 queries.
- **Database (`/migrations/0001_initial_schema.sql`)**: Cloudflare D1 tables for `enquiries`, `payments`, `webhook_events`, and `rate_limits`.

### API Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/config` | `GET` | Public non-secret runtime config (`whatsappNumber`, `razorpayKeyId` when configured, feature flags) |
| `/api/enquiries` | `POST` | Validates multi-service enquiries (no minimum char limits on optional notes), checks duplicates, stores in D1, sends Resend emails |
| `/api/contact` | `POST` | Quick contact form backed by D1 and Resend |
| `/api/email/test` | `POST` | Protected Resend diagnostic endpoint (`Bearer ADMIN_ACCESS_TOKEN`) |
| `/api/payment/create-order` | `POST` | Creates Razorpay order using server-authoritative package prices (`CREATED`) |
| `/api/payment/verify` | `POST` | Verifies Razorpay HMAC-SHA256 signature and confirms `CAPTURED` status via Razorpay REST API |
| `/api/payment/webhook` | `POST` | Verifies raw-body `x-razorpay-signature` and handles idempotent webhook events (`captured`, `authorized`, `failed`, `refunded`) |
| `/api/payment/status` | `GET` | Queries and reconciles order status by `order_id` for network disconnect recovery |
| `/api/admin/enquiries` | `GET` / `PATCH` | Protected lead management console (`Bearer ADMIN_ACCESS_TOKEN`) |
| `/api/admin/payments` | `GET` | Protected payment verification console (`Bearer ADMIN_ACCESS_TOKEN`) |

---

## Environment Variables & Secrets

Configure secrets and environment variables in **Cloudflare Dashboard → Workers & Pages → Settings → Environment Variables** (for Production & Preview) and locally in `.dev.vars` (never commit `.dev.vars`).

| Variable Name | Purpose | Where to Obtain | Where to Configure | Secret or Public |
| :--- | :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | Authenticates Resend email delivery | Resend Dashboard → API Keys | Cloudflare Pages Secrets / `.dev.vars` | **Secret** |
| `CONTACT_EMAIL` | Destination inbox (`educationrevolution90@gmail.com`) | Agency Gmail address | Cloudflare Pages Vars / `wrangler.toml` | Public |
| `SENDER_EMAIL` | Verified sender identity (e.g., `DIGI TECH SOLUTION <noreply@yourdomain.com>`) | Resend Dashboard → Domains | Cloudflare Pages Vars / `wrangler.toml` | Public |
| `RAZORPAY_KEY_ID` | Razorpay Checkout Key ID (`rzp_test_...` / `rzp_live_...`) | Razorpay Dashboard → API Keys | Cloudflare Pages Vars / `.dev.vars` | Public Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay server secret for order creation & HMAC verification | Razorpay Dashboard → API Keys | Cloudflare Pages Secrets / `.dev.vars` | **Secret** |
| `RAZORPAY_WEBHOOK_SECRET` | Verifies incoming Razorpay webhook signatures | Razorpay Dashboard → Webhooks | Cloudflare Pages Secrets / `.dev.vars` | **Secret** |
| `WHATSAPP_NUMBER` | Agency WhatsApp number (`917319785754`) | Business WhatsApp (`+91 73197 85754`) | Cloudflare Pages Vars / `wrangler.toml` | Public |
| `APP_BASE_URL` | Canonical production URL for CORS & metadata | Cloudflare Pages project URL | Cloudflare Pages Vars / `wrangler.toml` | Public |
| `ADMIN_ACCESS_TOKEN` | Bearer token protecting `/admin`, `/api/admin/*`, and `/api/email/test` | Generate 32+ char random string | Cloudflare Pages Secrets / `.dev.vars` | **Secret** |
| `DB` | Cloudflare D1 database binding | Cloudflare D1 creation step | `wrangler.toml` + Cloudflare Dashboard Bindings | Binding |

*(Note: Backend email helpers also accept legacy aliases `BUSINESS_EMAIL` and `EMAIL_FROM` if present. Optional Supabase environment placeholders in `.dev.vars.example` are reserved for future external PostgreSQL mirroring; Cloudflare D1 is the primary server database.)*

---

## Step-by-Step Deployment & API Setup Guide

### Step 1: Export Source Code to GitHub
1. Download or push the complete repository (`src/`, `functions/`, `migrations/`, `public/`, `package.json`, `wrangler.toml`, `.dev.vars.example`) to a GitHub repository.
2. Verify `.gitignore` excludes `.dev.vars`, `.env`, `node_modules/`, and `dist/` so no secrets are ever pushed to GitHub.

### Step 2: Obtain API Keys (Resend & Razorpay)
- **Resend Email API**:
  1. Create an account at [resend.com](https://resend.com) and verify your agency domain (or use Resend's onboarding domain during initial testing).
  2. Generate an API Key (`re_...`) and set it as `RESEND_API_KEY`.
  3. Set `CONTACT_EMAIL=educationrevolution90@gmail.com` and `SENDER_EMAIL=DIGI TECH SOLUTION <noreply@yourdomain.com>`.
- **Razorpay Payment Gateway**:
  1. Sign in to [dashboard.razorpay.com](https://dashboard.razorpay.com) and start in **Test Mode**.
  2. Navigate to **Account & Settings → API Keys**, generate keys, and copy `Key ID` (`RAZORPAY_KEY_ID`) and `Key Secret` (`RAZORPAY_KEY_SECRET`).
  3. Navigate to **Account & Settings → Webhooks**, add `https://<your-domain>/api/payment/webhook`, subscribe to `payment.authorized`, `payment.captured`, `payment.failed`, and `refund.created`, and copy the secret into `RAZORPAY_WEBHOOK_SECRET`.

### Step 3: Create Cloudflare D1 Database & Deploy on Cloudflare Pages
1. Install dependencies locally if using CLI:
   ```bash
   npm install
   ```
2. Create the Cloudflare D1 database:
   ```bash
   npx wrangler d1 create digi_tech_solution_db
   ```
3. Paste the generated `database_id` into `wrangler.toml`, commit, and push to GitHub.
4. Apply the SQL schema migration to your remote D1 database:
   ```bash
   npx wrangler d1 migrations apply digi_tech_solution_db --remote
   ```
5. In **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**:
   - Select your GitHub repository.
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. In **Settings → Functions → D1 database bindings**, add binding `DB` → `digi_tech_solution_db`.
7. In **Settings → Environment Variables**, add all required variables and secrets listed above, then trigger a deployment.

---

## Local Development

```bash
# Run frontend + Vite dev bridge for /functions/api/*
npm install
npm run dev

# Or emulate full Cloudflare Pages + local D1 using Wrangler
cp .dev.vars.example .dev.vars
npm run build
npx wrangler d1 migrations apply digi_tech_solution_db --local
npx wrangler pages dev dist
```

---

## Production Testing Checklist

1. Verify `https://<your-domain>/` loads cleanly on desktop and Android mobile without console errors or broken images.
2. Verify `GET https://<your-domain>/api/config` returns JSON with `whatsappNumber: "917319785754"` and `d1Configured: true`.
3. Submit an enquiry on `/contact` with multiple selected services and blank optional fields → confirm Reference ID (`DTS-...`) is returned, row is persisted in D1, and notification email arrives at `educationrevolution90@gmail.com`.
4. Resubmit the identical enquiry within 120 seconds → confirm `409 Conflict` duplicate protection triggers.
5. Test Razorpay Test Mode flow on `/pricing` (`rzp_test_...` keys) → verify `POST /api/payment/create-order` returns a server-created order and `/payment-success` confirms `CAPTURED` status after HMAC + API verification.
6. Test `/api/payment/status?order_id=<id>` and the `"Check Payment Status"` recovery flow on `/payment-failure`.
7. Confirm `/api/admin/enquiries` and `/api/admin/payments` return `401 Unauthorized` without a valid `Authorization: Bearer` token and display records on `/admin` when authenticated.
8. Verify `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml`, and offline banner behavior in browser DevTools.
