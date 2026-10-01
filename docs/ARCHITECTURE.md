# AutoPayX — Architecture Document

> **Version:** 0.1.0 (Phase 1 draft)
> **Last updated:** 2026-09-30
> **Status:** Awaiting confirmation before implementation

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture Diagram](#2-high-level-architecture-diagram)
3. [Monorepo Layout](#3-monorepo-layout)
4. [Module Boundaries](#4-module-boundaries)
5. [Domain Model & ERD](#5-domain-model--erd)
6. [Order State Machine](#6-order-state-machine)
7. [Sequence Diagrams](#7-sequence-diagrams)
8. [API Surface Design](#8-api-surface-design)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Multi-Tenancy Strategy](#10-multi-tenancy-strategy)
11. [Payment Provider Abstraction](#11-payment-provider-abstraction)
12. [Webhook Architecture](#12-webhook-architecture)
13. [Deployment Topology](#13-deployment-topology)
14. [Security Boundaries](#14-security-boundaries)
15. [Scalability Considerations](#15-scalability-considerations)
16. [Key Trade-offs & Decisions](#16-key-trade-offs--decisions)

---

## 1. System Overview

AutoPayX is a **multi-tenant, self-serve SaaS UPI payment gateway** for Indian merchants. The platform lets merchants sign up, connect their own payment provider account (Razorpay, later Cashfree), generate API keys, and accept UPI payments via hosted checkout pages. The platform **never holds merchant funds** — settlement flows directly from the payment provider to the merchant.

### Core Flow (Happy Path)

1. Merchant creates an order via `POST /api/public/v1/create-order`
2. Platform creates an order record, calls the payment provider to generate a UPI collect/QR
3. Customer opens the hosted checkout URL (`pay.autopayx.in/{slug}`)
4. Customer scans QR or taps "Pay with UPI app" → pays in their UPI app
5. Payment provider sends a signed webhook to AutoPayX
6. AutoPayX verifies the signature, marks order `paid` in a DB transaction, inserts an outbox row
7. Worker picks up the outbox row and sends a signed webhook to the merchant's server
8. Reconciliation job catches any missed webhooks by polling the provider API

### Brand

- **Name:** AutoPayX (capital A, P, X)
- **Tagline:** Accept UPI Payments Instantly.
- **Primary color:** `#6C3FE2` (deep violet)
- **Font:** Inter (Google Fonts)
- **Domain:** `autopayx.in`

---

## 2. High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Cloudflare (Free)                              │
│                     DNS + CDN + DDoS protection                          │
└──────────────┬───────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         Caddy (Reverse Proxy)                            │
│              Auto TLS · Routes by subdomain · IP restrict admin          │
│                                                                          │
│  autopayx.in ──────────┐                                                 │
│  app.autopayx.in ──────┤──► Next.js container (:3000)                    │
│  pay.autopayx.in ──────┘                                                 │
│  api.autopayx.in ──────────► Laravel API container (:8000)               │
│  admin.autopayx.in ────────► Laravel API container (:8000) [IP-gated]    │
└──────────────────────────────────────────────────────────────────────────┘
               │                          │
               ▼                          ▼
┌─────────────────────┐    ┌─────────────────────────────────┐
│   PostgreSQL 16     │    │   Laravel Worker container       │
│   (Primary DB)      │◄───│   (queue:work via Supervisor)    │
│                     │    │   + Scheduler (cron)              │
│   · Orders          │    │   · Outbound webhook delivery    │
│   · Transactions    │    │   · Reconciliation job           │
│   · Merchants       │    │   · Expiry job                   │
│   · Provider events │    │   · Email notifications          │
│   · Outbox          │    └─────────────────────────────────┘
└─────────────────────┘
               ▲
               │
    ┌──────────┴──────────┐
    │  Payment Providers   │
    │  (Razorpay, Mock)    │
    │                      │
    │  Webhooks IN ────►   │
    │  Status API  ◄────   │
    └─────────────────────┘
```

---

## 3. Monorepo Layout

```
AutoPayX/
├── apps/
│   ├── api/                          # Laravel 12 (API-only + Filament admin)
│   │   ├── app/
│   │   │   ├── Modules/
│   │   │   │   ├── Auth/             # Login, register, 2FA, email verification
│   │   │   │   ├── Merchants/        # Merchant CRUD, onboarding, settings
│   │   │   │   ├── ProviderAccounts/ # Connect/manage payment provider accounts
│   │   │   │   ├── Orders/           # Order creation, state machine, checkout data
│   │   │   │   ├── Payments/         # Transaction ledger, payment processing
│   │   │   │   ├── Webhooks/         # Inbound (provider) + outbound (merchant)
│   │   │   │   ├── Billing/          # Plans, subscriptions, quotas (Phase 2-3)
│   │   │   │   ├── Referrals/        # Referral codes, credit tracking (Phase 3)
│   │   │   │   ├── Notifications/    # Email + Telegram (Phase 3)
│   │   │   │   ├── Reports/          # Analytics, CSV/Excel export (Phase 2)
│   │   │   │   └── Admin/            # Filament resources (Phase 2)
│   │   │   ├── Contracts/            # Interfaces (PaymentProviderAdapter, etc.)
│   │   │   ├── Support/              # Shared helpers, Money value object, etc.
│   │   │   └── Providers/
│   │   ├── config/
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   ├── seeders/
│   │   │   └── factories/
│   │   ├── routes/
│   │   │   ├── api_public.php        # /api/public/v1/*
│   │   │   ├── api_console.php       # /api/console/v1/*
│   │   │   ├── api_checkout.php      # /api/checkout/*
│   │   │   └── api_webhooks.php      # /api/webhooks/*
│   │   ├── tests/
│   │   │   ├── Unit/
│   │   │   ├── Feature/
│   │   │   └── Integration/
│   │   ├── Dockerfile
│   │   └── composer.json
│   │
│   └── web/                          # Next.js (App Router, TypeScript)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (marketing)/      # Public pages (route group)
│       │   │   ├── (dashboard)/      # Merchant dashboard (route group)
│       │   │   │   └── dashboard/
│       │   │   ├── (checkout)/       # Hosted checkout (route group)
│       │   │   │   └── pay/[slug]/
│       │   │   └── (auth)/           # Auth pages (route group)
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui components
│       │   │   ├── dashboard/
│       │   │   ├── checkout/
│       │   │   └── marketing/
│       │   ├── lib/
│       │   │   ├── api/              # Generated TypeScript types + fetch helpers
│       │   │   ├── hooks/            # TanStack Query hooks
│       │   │   └── utils/
│       │   ├── styles/
│       │   │   └── globals.css
│       │   └── middleware.ts          # Auth guards, CSP nonce injection
│       ├── public/
│       ├── Dockerfile
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/
│   ├── sdk-php/                      # PHP SDK (Phase 4)
│   └── sdk-node/                     # Node SDK (Phase 4)
│
├── docs/
│   ├── ARCHITECTURE.md               # ← This file
│   ├── SECURITY.md
│   └── runbooks/
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Caddyfile
│   └── supervisor/
│       └── worker.conf
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .env.example
├── Makefile                          # Common commands (make dev, make test, etc.)
└── README.md
```

---

## 4. Module Boundaries

Each module under `app/Modules/{Module}` follows a consistent structure:

```
Modules/{Module}/
├── Models/           # Eloquent models
├── Actions/          # Single-purpose action classes (CreateOrderAction, etc.)
├── DTOs/             # Data transfer objects (immutable, typed)
├── Enums/            # PHP 8.1+ backed enums (OrderStatus, etc.)
├── Events/           # Domain events (OrderPaid, etc.)
├── Listeners/        # Event handlers
├── Jobs/             # Queued jobs
├── Policies/         # Authorization policies
├── Requests/         # Form requests (validation)
├── Resources/        # API resources (JSON serialization)
├── Routes/           # Route registration (if module-scoped)
├── Services/         # Business logic services
├── Exceptions/       # Module-specific exceptions
└── Tests/            # Module-specific tests (optional, or in top-level tests/)
```

### Module Dependencies (Phase 1)

```
Auth ◄──── Merchants ◄──── ProviderAccounts
                │                  │
                ▼                  ▼
             Orders ──────► Payments (Ledger)
                │
                ▼
           Webhooks (Inbound + Outbound)
```

**Rules:**
- Modules communicate through well-defined **Actions** and **Events**, not by reaching into each other's internals.
- Models may define relationships across modules (e.g., `Order` belongs to `Merchant`), but business logic stays in the owning module.
- Shared contracts live in `app/Contracts/`.
- Shared support code (Money value object, encryption helpers) lives in `app/Support/`.

---

## 5. Domain Model & ERD

### Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│    users     │       │    merchants      │       │  provider_accounts   │
├─────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id (PK)     │──1:N─►│ id (PK)          │──1:N─►│ id (PK)              │
│ name        │       │ user_id (FK)     │       │ merchant_id (FK)     │
│ email (UQ)  │       │ business_name    │       │ provider (enum)      │
│ password    │       │ mobile           │       │ encrypted_credentials│
│ two_factor_ │       │ status (enum)    │       │ label                │
│   secret    │       │ environment      │       │ is_active            │
│ email_      │       │ onboarding_      │       │ daily_limit_paise    │
│   verified  │       │   completed_at   │       │   (bigint)           │
│ created_at  │       │ trial_ends_at    │       │ daily_used_paise     │
│ updated_at  │       │ created_at       │       │   (bigint)           │
└─────────────┘       │ updated_at       │       │ last_used_at         │
                      └──────────────────┘       │ created_at           │
                             │                   │ updated_at           │
                             │                   └──────────────────────┘
                             │                            │
                    ┌────────┴────────┐                   │
                    │                 │                    │
                    ▼                 ▼                    │
          ┌──────────────┐  ┌──────────────────┐          │
          │   api_keys   │  │webhook_endpoints │          │
          ├──────────────┤  ├──────────────────┤          │
          │ id (PK)      │  │ id (PK)          │          │
          │ merchant_id  │  │ merchant_id (FK) │          │
          │   (FK)       │  │ url              │          │
          │ prefix       │  │ encrypted_secret │          │
          │ hash         │  │ is_active        │          │
          │ label        │  │ created_at       │          │
          │ last_used_at │  │ updated_at       │          │
          │ revoked_at   │  └──────────────────┘          │
          │ created_at   │           │                    │
          └──────────────┘           │                    │
                                     │                    │
                                     ▼                    │
┌────────────────────────────────────────────────────────────────────────┐
│                              orders                                    │
├────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                          │
│ merchant_id (FK)                                                       │
│ provider_account_id (FK) ◄─────────────────────────────────────────────┘
│ external_order_id (merchant's ref, unique per merchant)                │
│ amount_paise (bigint, NOT NULL)                                        │
│ currency (default 'INR')                                               │
│ status (enum: created → active → paid | expired | failed)              │
│ link_type (enum: one_time | reusable)                                  │
│ slug (unique, URL-safe, short)                                         │
│ customer_name                                                          │
│ customer_email                                                         │
│ customer_phone                                                         │
│ metadata (jsonb)                                                       │
│ expires_at                                                             │
│ paid_at                                                                │
│ provider_ref (provider's payment/transaction ID)                       │
│ provider_payment_id (ID returned when creating payment at provider)     │
│ idempotency_key (unique per merchant)                                  │
│ webhook_url_override                                                   │
│ success_redirect_url                                                   │
│ failed_redirect_url                                                    │
│ created_at                                                             │
│ updated_at                                                             │
└────────────────────────────────────────────────────────────────────────┘
          │                          │
          │                          │
          ▼                          ▼
┌──────────────────┐     ┌───────────────────────┐
│  transactions    │     │   provider_events      │
│  (append-only    │     ├───────────────────────┤
│   ledger)        │     │ id (PK)               │
├──────────────────┤     │ provider (enum)        │
│ id (PK)          │     │ provider_event_id (UQ) │ ◄── idempotency guard
│ order_id (FK)    │     │ order_id (FK, nullable)│
│ merchant_id (FK) │     │ event_type             │
│ type (enum)      │     │ raw_payload (jsonb)    │
│ amount_paise     │     │ processed_at           │
│   (bigint)       │     │ created_at             │
│ balance_after    │     └───────────────────────┘
│   (bigint)       │
│ provider_ref     │
│ metadata (jsonb) │
│ created_at       │     ┌───────────────────────┐
│ (NO updated_at)  │     │       outbox           │
└──────────────────┘     ├───────────────────────┤
                         │ id (PK)               │
                         │ order_id (FK)          │
                         │ event_type             │
                         │ payload (jsonb)        │
                         │ processed_at (nullable)│
                         │ created_at             │
                         └───────────────────────┘
                                    │
                                    ▼
                         ┌───────────────────────┐
                         │  webhook_deliveries    │
                         ├───────────────────────┤
                         │ id (PK)               │
                         │ webhook_endpoint_id    │
                         │ outbox_id (FK)         │
                         │ order_id (FK)          │
                         │ merchant_id (FK)       │
                         │ event_type             │
                         │ status (enum)          │
                         │ attempts (int)         │
                         │ last_response_code     │
                         │ last_response_body     │
                         │   (text, truncated)    │
                         │ next_retry_at          │
                         │ completed_at           │
                         │ created_at             │
                         │ updated_at             │
                         └───────────────────────┘

Additional tables (Phase 2+):
┌──────────────┐  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐
│    plans      │  │ subscriptions │  │usage_counters │  │ checkout_themes│
├──────────────┤  ├───────────────┤  ├───────────────┤  ├────────────────┤
│ id            │  │ merchant_id   │  │ merchant_id   │  │ id             │
│ name          │  │ plan_id       │  │ counter_type  │  │ merchant_id    │
│ slug          │  │ status        │  │ period_start  │  │ theme_key      │
│ order_limit   │  │ trial_ends    │  │ period_end    │  │ logo_path      │
│ provider_     │  │ current_      │  │ count         │  │ settings       │
│  account_limit│  │   period_end  │  │ limit         │  │   (jsonb)      │
│ webhook_limit │  │ ...           │  │ ...           │  │ ...            │
│ price_paise   │  └───────────────┘  └───────────────┘  └────────────────┘
│ ...           │
└──────────────┘

┌──────────────┐  ┌───────────────┐  ┌───────────────┐
│  referrals   │  │ audit_logs    │  │telegram_links │
├──────────────┤  ├───────────────┤  ├───────────────┤
│ referrer_id  │  │ user_id       │  │ merchant_id   │
│ referred_id  │  │ merchant_id   │  │ chat_id       │
│ code         │  │ action        │  │ is_active      │
│ status       │  │ target_type   │  │ ...           │
│ credited_at  │  │ target_id     │  └───────────────┘
│ ...          │  │ old_values    │
└──────────────┘  │ new_values    │
                  │ ip_address    │
                  │ user_agent    │
                  │ created_at    │
                  └───────────────┘
```

### Key Data Rules

| Rule | Implementation |
|---|---|
| Money is integer paise (bigint) | `amount_paise`, `daily_limit_paise`, `price_paise` — all bigint, never float |
| Transactions are append-only | No `updated_at`, no `UPDATE`/`DELETE` policies, soft-delete disabled |
| Provider event idempotency | `provider_event_id` has a unique constraint; duplicate inserts are caught |
| Order idempotency | `idempotency_key` unique per merchant; duplicate create-order requests return the existing order |
| Tenant isolation | Every tenant-owned table has `merchant_id`; global scopes + policies + RLS |
| Slug uniqueness | `slug` column on orders is globally unique; URL-safe, 12-char nanoid |

---

## 6. Order State Machine

```
                    ┌──────────┐
                    │ created  │   Order record inserted, awaiting provider payment creation
                    └────┬─────┘
                         │
                         │ Provider payment created successfully (QR/intent generated)
                         ▼
                    ┌──────────┐
            ┌──────│  active   │──────┐
            │      └────┬─────┘      │
            │           │             │
            │  Provider webhook      │  expires_at reached
            │  confirms payment      │  (expiry job)
            │           │             │
            ▼           │             ▼
      ┌──────────┐      │       ┌──────────┐
      │   paid   │      │       │ expired  │
      └──────────┘      │       └──────────┘
                        │
                        │ Provider reports failure
                        ▼
                  ┌──────────┐
                  │  failed  │
                  └──────────┘

      (Phase 3)
      ┌──────────┐
      │ refunded │ ◄── Only from `paid` state
      └──────────┘
```

### Transition Rules

| From | To | Trigger | Guard |
|---|---|---|---|
| `created` | `active` | Provider payment created | Provider returns valid payment ID |
| `active` | `paid` | Verified provider webhook OR reconciliation | `lockForUpdate()`, single DB transaction, idempotent |
| `active` | `expired` | Expiry job (`expires_at` passed) | Only if still `active` |
| `active` | `failed` | Provider reports failure | Verified webhook or reconciliation |
| `paid` | `refunded` | Admin/merchant action (Phase 3) | Provider refund API succeeds |

**Backward or skipped transitions are rejected** (e.g., `paid` → `active`, `created` → `paid`). The state machine is enforced in `OrderStateMachine` service class with explicit allowed-transition map.

---

## 7. Sequence Diagrams

### 7.1 Payment Flow (Happy Path)

```
Merchant Server          AutoPayX API          PostgreSQL         Razorpay           Customer
      │                       │                     │                 │                   │
      │  POST /create-order   │                     │                 │                   │
      │──────────────────────►│                     │                 │                   │
      │                       │  Validate + check   │                 │                   │
      │                       │  quota + idempotency │                │                   │
      │                       │─────────────────────►│                │                   │
      │                       │                     │                 │                   │
      │                       │  INSERT order       │                 │                   │
      │                       │  (status: created)  │                 │                   │
      │                       │─────────────────────►│                │                   │
      │                       │                     │                 │                   │
      │                       │  Create Razorpay    │                 │                   │
      │                       │  Payment Link / QR  │                 │                   │
      │                       │────────────────────────────────────►  │                   │
      │                       │                     │                 │                   │
      │                       │  ◄── Payment ID,    │                 │                   │
      │                       │      QR payload     │                 │                   │
      │                       │                     │                 │                   │
      │                       │  UPDATE order       │                 │                   │
      │                       │  (status: active,   │                 │                   │
      │                       │   provider_payment  │                 │                   │
      │                       │   _id)              │                 │                   │
      │                       │─────────────────────►│                │                   │
      │                       │                     │                 │                   │
      │  ◄── 201 Created     │                     │                 │                   │
      │  {payment_url, slug,  │                     │                 │                   │
      │   status, expires_at} │                     │                 │                   │
      │                       │                     │                 │                   │
      │                       │                     │                 │   Opens checkout  │
      │                       │                     │                 │ ◄─────────────────│
      │                       │                     │                 │                   │
      │                       │  GET /checkout/slug │                 │    Scans QR /     │
      │                       │ ◄──────────────────────────────────────── taps UPI intent │
      │                       │                     │                 │                   │
      │                       │  Return: biz name,  │                 │                   │
      │                       │  amount, QR, expiry │                 │    Pays in UPI    │
      │                       │ ──────────────────────────────────────►    app            │
      │                       │                     │                 │                   │
      │                       │                     │                 │  ── Payment ──►   │
      │                       │                     │                 │  ◄── Success ──   │
      │                       │                     │                 │                   │
      │                       │  Razorpay webhook   │                 │                   │
      │                       │ ◄────────────────────────────────────│                   │
      │                       │                     │                 │                   │
      │                       │  (See webhook flow  │                 │                   │
      │                       │   diagram below)    │                 │                   │
```

### 7.2 Inbound Webhook Processing + Outbound Merchant Webhook

```
Razorpay               AutoPayX API          PostgreSQL              Worker              Merchant Server
   │                       │                     │                      │                      │
   │  POST /webhooks/      │                     │                      │                      │
   │  razorpay             │                     │                      │                      │
   │──────────────────────►│                     │                      │                      │
   │                       │                     │                      │                      │
   │                       │  1. Verify signature │                     │                      │
   │                       │     (HMAC, constant  │                     │                      │
   │                       │      time compare,   │                     │                      │
   │                       │      timestamp check,│                     │                      │
   │                       │      replay guard)   │                     │                      │
   │                       │                     │                      │                      │
   │                       │  2. Check provider_  │                     │                      │
   │                       │     event_id unique  │                     │                      │
   │                       │─────────────────────►│                     │                      │
   │                       │                     │                      │                      │
   │                       │  (if duplicate,      │                     │                      │
   │                       │   return 200 OK,     │                     │                      │
   │                       │   do nothing)        │                     │                      │
   │                       │                     │                      │                      │
   │                       │  3. BEGIN TRANSACTION│                     │                      │
   │                       │─────────────────────►│                     │                      │
   │                       │                     │                      │                      │
   │                       │  3a. SELECT order    │                     │                      │
   │                       │      FOR UPDATE      │                     │                      │
   │                       │─────────────────────►│                     │                      │
   │                       │                     │                      │                      │
   │                       │  3b. Validate state  │                     │                      │
   │                       │      transition      │                     │                      │
   │                       │      (active → paid) │                     │                      │
   │                       │                     │                      │                      │
   │                       │  3c. UPDATE order    │                     │                      │
   │                       │      status = paid   │                     │                      │
   │                       │─────────────────────►│                     │                      │
   │                       │                     │                      │                      │
   │                       │  3d. INSERT          │                     │                      │
   │                       │      transaction     │                     │                      │
   │                       │      (ledger entry)  │                     │                      │
   │                       │─────────────────────►│                     │                      │
   │                       │                     │                      │                      │
   │                       │  3e. INSERT          │                     │                      │
   │                       │      provider_event  │                     │                      │
   │                       │─────────────────────►│                     │                      │
   │                       │                     │                      │                      │
   │                       │  3f. INSERT outbox   │                     │                      │
   │                       │      row             │                     │                      │
   │                       │─────────────────────►│                     │                      │
   │                       │                     │                      │                      │
   │                       │  COMMIT              │                     │                      │
   │                       │─────────────────────►│                     │                      │
   │                       │                     │                      │                      │
   │  ◄── 200 OK          │                     │                      │                      │
   │                       │                     │                      │                      │
   │                       │                     │  Outbox poller /     │                      │
   │                       │                     │  event dispatched    │                      │
   │                       │                     │─────────────────────►│                      │
   │                       │                     │                      │                      │
   │                       │                     │                      │  Build payload       │
   │                       │                     │                      │  Sign with HMAC      │
   │                       │                     │                      │  (X-AutoPayX-        │
   │                       │                     │                      │   Signature)         │
   │                       │                     │                      │                      │
   │                       │                     │                      │  SSRF check          │
   │                       │                     │                      │  (block private IPs, │
   │                       │                     │                      │   re-resolve DNS)    │
   │                       │                     │                      │                      │
   │                       │                     │                      │  POST to merchant    │
   │                       │                     │                      │─────────────────────►│
   │                       │                     │                      │                      │
   │                       │                     │                      │  ◄── 200 OK         │
   │                       │                     │                      │                      │
   │                       │                     │  UPDATE delivery     │                      │
   │                       │                     │  status = delivered  │                      │
   │                       │                     │◄─────────────────────│                      │
```

### 7.3 Reconciliation Flow (Missed Webhook Recovery)

```
Scheduler              Worker                 PostgreSQL           Razorpay
   │                      │                       │                    │
   │  Every 1 min:        │                       │                    │
   │  ReconcileOrders     │                       │                    │
   │─────────────────────►│                       │                    │
   │                      │                       │                    │
   │                      │  SELECT active orders │                    │
   │                      │  WHERE created_at <   │                    │
   │                      │  now() - 30s          │                    │
   │                      │  AND no recent check  │                    │
   │                      │───────────────────────►│                    │
   │                      │                       │                    │
   │                      │  For each order:      │                    │
   │                      │  fetchStatus() via    │                    │
   │                      │  adapter              │                    │
   │                      │──────────────────────────────────────────►│
   │                      │                       │                    │
   │                      │  ◄── status: paid     │                    │
   │                      │                       │                    │
   │                      │  Process same as      │                    │
   │                      │  webhook (txn +       │                    │
   │                      │  outbox, idempotent)  │                    │
   │                      │───────────────────────►│                    │
```

---

## 8. API Surface Design

### Route Groups

| Prefix | Auth | Purpose | Rate Limit |
|---|---|---|---|
| `/api/public/v1/*` | `X-API-Key` header | Merchant server-to-server | 100/min per key |
| `/api/console/v1/*` | Sanctum cookie + CSRF | Dashboard SPA | 120/min per session |
| `/api/checkout/{slug}` | None (public) | Checkout page data | 30/min per IP |
| `/api/checkout/{slug}/status` | None (public) | Checkout polling | 60/min per IP |
| `/api/webhooks/{provider}` | Provider signature | Inbound webhooks | 1000/min per IP |
| `/admin/*` | Sanctum + Filament guard | Admin panel | IP-restricted |

### Public API v1 Endpoints (Phase 1)

| Method | Path | Description |
|---|---|---|
| `POST` | `/create-order` | Create a payment order |
| `GET` | `/order-status` | Check order status by `order_id` |
| `GET` | `/orders` | List orders (paginated) |
| `POST` | `/orders/{id}/cancel` | Cancel an active order |

### Console API v1 Endpoints (Phase 1)

| Method | Path | Description |
|---|---|---|
| Auth | | |
| `GET` | `/auth/user` | Current user + merchant |
| `POST` | `/auth/logout` | Logout |
| `POST` | `/auth/two-factor/enable` | Enable TOTP 2FA |
| Merchants | | |
| `GET` | `/merchant` | Get current merchant profile |
| `PUT` | `/merchant` | Update merchant profile |
| Provider Accounts | | |
| `GET` | `/provider-accounts` | List connected accounts |
| `POST` | `/provider-accounts` | Connect a new account |
| `DELETE` | `/provider-accounts/{id}` | Disconnect |
| API Keys | | |
| `GET` | `/api-keys` | List keys (prefix + last used, no hash) |
| `POST` | `/api-keys` | Create key (returns full key once) |
| `DELETE` | `/api-keys/{id}` | Revoke key |
| Orders | | |
| `GET` | `/orders` | List orders (paginated, filtered) |
| `GET` | `/orders/{id}` | Order detail with timeline |
| `POST` | `/orders` | Create order from dashboard |
| Webhooks | | |
| `GET` | `/webhook-endpoints` | List endpoints |
| `POST` | `/webhook-endpoints` | Add endpoint |
| `PUT` | `/webhook-endpoints/{id}` | Update endpoint |
| `DELETE` | `/webhook-endpoints/{id}` | Remove endpoint |

### Response Format

```json
{
  "data": { ... },
  "request_id": "req_abc123"
}
```

Error response:
```json
{
  "error": {
    "code": "invalid_amount",
    "message": "Amount must be between ₹1 and ₹1,00,000."
  },
  "request_id": "req_abc123"
}
```

---

## 9. Authentication & Authorization

### Cookie-Based SPA Auth (Sanctum)

```
Browser (app.autopayx.in)           API (api.autopayx.in)
        │                                    │
        │  GET /sanctum/csrf-cookie          │
        │───────────────────────────────────►│
        │  ◄── Set-Cookie: XSRF-TOKEN       │
        │                                    │
        │  POST /login                       │
        │  Cookie: XSRF-TOKEN               │
        │  X-XSRF-TOKEN: <token>            │
        │───────────────────────────────────►│
        │  ◄── Set-Cookie: session           │
        │      (HttpOnly, Secure,            │
        │       SameSite=Lax,                │
        │       Domain=.autopayx.in)         │
        │                                    │
        │  GET /api/console/v1/orders        │
        │  Cookie: session + XSRF-TOKEN      │
        │  X-XSRF-TOKEN: <token>            │
        │───────────────────────────────────►│
        │  ◄── 200 + JSON                   │
```

**Key points:**
- Session cookie is set on `.autopayx.in` so it works across `app.`, `pay.`, `api.` subdomains
- `HttpOnly` prevents JavaScript access
- `Secure` ensures HTTPS-only
- `SameSite=Lax` prevents CSRF from external sites while allowing same-site navigation
- CSRF token is validated on every state-changing request via `X-XSRF-TOKEN` header
- No tokens in `localStorage` — ever

### API Key Auth (Public API)

- Keys are prefixed: `apx_live_` (production) or `apx_test_` (sandbox)
- Full key shown once at creation, then only the prefix is visible
- Stored as `SHA-256(full_key)` — lookup by prefix, verify by hash
- Revocation is instant (sets `revoked_at`)
- Key rotation: creating a new key doesn't revoke the old one (merchant controls this)

### RBAC (Phase 2)

Roles per merchant: `owner`, `admin`, `developer`, `finance`, `support`.
Enforced via Laravel Policies tied to the user's role within the merchant tenant.

---

## 10. Multi-Tenancy Strategy

### Layer 1: Eloquent Global Scope

```php
// Applied to all tenant-owned models
class MerchantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if ($merchantId = app(TenantContext::class)->getMerchantId()) {
            $builder->where($model->getTable() . '.merchant_id', $merchantId);
        }
    }
}
```

`TenantContext` is set in middleware for console API requests (from the authenticated user's merchant) and in API key middleware for public API requests.

### Layer 2: Laravel Policies

Every controller action checks `$this->authorize('view', $order)` — the policy verifies the resource belongs to the current merchant.

### Layer 3: PostgreSQL Row Level Security (Phase 2)

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY merchant_isolation ON orders
    USING (merchant_id = current_setting('app.current_merchant_id')::bigint);
```

Set via `SET LOCAL app.current_merchant_id = ?` at the start of each request/job transaction. This is a defense-in-depth layer — even if code has a bug bypassing the scope, Postgres itself blocks cross-tenant access.

### Isolation Tests

Automated tests that:
1. Create Merchant A and Merchant B with orders
2. Authenticate as Merchant A
3. Attempt to access Merchant B's orders by ID → assert 404
4. List orders → assert only Merchant A's orders appear
5. Repeat for every tenant-owned model

---

## 11. Payment Provider Abstraction

```php
namespace App\Contracts;

interface PaymentProviderAdapter
{
    /**
     * Create a payment at the provider.
     * Returns QR payload, UPI intent URI, and provider's payment reference.
     */
    public function createPayment(Order $order, ProviderAccount $account): ProviderPayment;

    /**
     * Verify an inbound webhook's authenticity.
     * Checks signature, timestamp tolerance, and replay protection.
     * Throws InvalidWebhookException on failure.
     */
    public function verifyWebhook(Request $request, ProviderAccount $account): ProviderEvent;

    /**
     * Fetch the current status of a payment from the provider API.
     * Used by the reconciliation job.
     */
    public function fetchStatus(Order $order, ProviderAccount $account): ProviderStatus;

    /**
     * Validate that provider credentials are correct.
     * Called when a merchant connects a new provider account.
     */
    public function validateCredentials(array $credentials): bool;
}
```

### Implementations

| Adapter | Phase | Purpose |
|---|---|---|
| `MockAdapter` | 1 | Local dev & tests. Simulates success, failure, delayed, duplicate webhooks. Returns static QR data. |
| `RazorpayAdapter` | 1 | Production. Uses Razorpay's official Payment Links / QR Codes API. |
| `CashfreeAdapter` | 3 | Alternative provider. Uses Cashfree's official Payment Links API. |

### Provider Account Selection (Multi-Account Routing)

When a merchant has multiple active provider accounts:
1. Filter accounts where `is_active = true` AND `daily_used_paise + order_amount <= daily_limit_paise`
2. Select the least recently used account (`last_used_at` ASC)
3. Update `last_used_at` and `daily_used_paise` atomically
4. If no account has capacity, return `provider_not_configured` error

The `daily_used_paise` counter resets daily via a scheduled job.

---

## 12. Webhook Architecture

### Outbound Webhook Delivery

**Outbox pattern** ensures reliability:

1. In the same DB transaction that marks an order `paid`:
   - Insert a row in `outbox` table with event type and payload
2. After commit, dispatch `ProcessOutboxJob` (or a poller picks it up)
3. The job:
   - Resolves the merchant's webhook endpoints
   - For each endpoint:
     - Performs SSRF check (block private/loopback/link-local, re-resolve DNS)
     - Builds the payload
     - Signs it: `v1 = HMAC-SHA256(endpoint_secret, "{timestamp}.{raw_body}")`
     - Sends POST with 10-second timeout, no redirects
     - Records the delivery attempt in `webhook_deliveries`
   - On failure: exponential backoff (attempts at: 0s, 30s, 2m, 10m, 30m, 1h, 4h, 12h — ~8 attempts over ~17 hours)

### Webhook Payload

```json
{
  "event": "payment.paid",
  "data": {
    "order_id": "merchant_order_123",
    "amount": 50000,
    "currency": "INR",
    "status": "paid",
    "paid_at": "2026-09-30T10:00:00+05:30",
    "provider_ref": "pay_abc123",
    "customer_name": "Ravi Kumar",
    "customer_email": "ravi@example.com",
    "metadata": { "plan": "premium" }
  },
  "created_at": "2026-09-30T10:00:01+05:30"
}
```

### Webhook Headers

```
Content-Type: application/json
X-AutoPayX-Signature: t=1696060801,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8f9
X-Event-Id: evt_abc123
User-Agent: AutoPayX-Webhook/1.0
```

---

## 13. Deployment Topology

### Docker Compose Services

| Service | Image | Ports | Purpose |
|---|---|---|---|
| `api` | `apps/api` (FrankenPHP/Octane or php-fpm + Caddy) | 8000 | Laravel API + Filament |
| `worker` | `apps/api` (same image, different entrypoint) | — | Queue worker (Supervisor) |
| `scheduler` | `apps/api` (same image, cron entrypoint) | — | Laravel scheduler |
| `web` | `apps/web` (Next.js standalone) | 3000 | Marketing + dashboard + checkout |
| `postgres` | `postgres:16-alpine` | 5432 | Database |
| `caddy` | `caddy:2-alpine` | 80, 443 | Reverse proxy, auto TLS |

### Caddyfile (simplified)

```
autopayx.in, app.autopayx.in, pay.autopayx.in {
    reverse_proxy web:3000
}

api.autopayx.in {
    reverse_proxy api:8000
}

admin.autopayx.in {
    @blocked not remote_ip <ADMIN_IPS>
    respond @blocked 403
    reverse_proxy api:8000
}
```

### Environment Configuration

All secrets via `.env` (local) or SOPS-encrypted files (CI/production). Key env vars:

```
# Laravel
APP_KEY=
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_DATABASE=autopayx
SESSION_DOMAIN=.autopayx.in
SANCTUM_STATEFUL_DOMAINS=autopayx.in,app.autopayx.in,pay.autopayx.in

# Provider encryption
PROVIDER_ENCRYPTION_KEY=  # libsodium key for encrypting provider credentials

# Next.js
NEXT_PUBLIC_API_URL=https://api.autopayx.in
NEXT_PUBLIC_APP_URL=https://app.autopayx.in
NEXT_PUBLIC_CHECKOUT_URL=https://pay.autopayx.in
```

---

## 14. Security Boundaries

### Trust Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                    UNTRUSTED                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Customer  │  │  Merchant    │  │ Payment Provider  │  │
│  │ Browser   │  │  Server      │  │ Webhooks          │  │
│  └────┬──────┘  └──────┬───────┘  └────────┬──────────┘  │
│       │                │                    │             │
└───────┼────────────────┼────────────────────┼─────────────┘
        │                │                    │
  ┌─────▼────────────────▼────────────────────▼─────────┐
  │              TRUST BOUNDARY (Caddy)                  │
  │         Rate limiting · TLS · IP restrictions         │
  └─────┬────────────────┬────────────────────┬─────────┘
        │                │                    │
  ┌─────▼────────────────▼────────────────────▼─────────┐
  │              APPLICATION LAYER                       │
  │  ┌─────────────────────────────────────────────┐     │
  │  │              Validation Layer                │     │
  │  │  Input validation · CSRF · Auth · RBAC      │     │
  │  │  Rate limiting · Webhook signature verify    │     │
  │  └─────────────────────────────────────────────┘     │
  │  ┌─────────────────────────────────────────────┐     │
  │  │           Business Logic Layer               │     │
  │  │  State machine · Tenant scope · Policies    │     │
  │  └─────────────────────────────────────────────┘     │
  │  ┌─────────────────────────────────────────────┐     │
  │  │              Data Layer                      │     │
  │  │  Encrypted at rest · Row Level Security     │     │
  │  │  Parameterized queries only                 │     │
  │  └─────────────────────────────────────────────┘     │
  └─────────────────────────────────────────────────────┘
```

### Key Security Controls

| Threat | Control |
|---|---|
| Replay attack (provider webhook) | Timestamp tolerance (5 min) + `provider_event_id` uniqueness |
| Double-spend | `SELECT ... FOR UPDATE` + idempotent processing |
| SSRF (outbound webhooks) | Block private/loopback/link-local, re-resolve DNS, no redirects |
| IDOR | Every query scoped by `merchant_id`, policies, RLS |
| Credential theft | AES-256-GCM encryption at rest, key in env |
| API key compromise | SHA-256 hashed, prefix lookup, instant revoke |
| Enumeration | Sequential IDs for internal use, UUIDs/slugs for external |
| XSS | Strict CSP with nonces, sanitize merchant-provided text |
| CSRF | Sanctum CSRF tokens, `SameSite=Lax` cookies |

---

## 15. Scalability Considerations

### Phase 1 (Single Server)

- Single PostgreSQL instance, no read replicas
- Database queue driver (migrate to Valkey/Redis when needed)
- File cache (migrate to Valkey when needed)
- Adequate for ~1000 orders/day

### Future Scaling Path

| Bottleneck | Solution |
|---|---|
| DB writes | Connection pooling (PgBouncer), monthly partitioning on `transactions` and `provider_events` |
| DB reads | Read replica for reports and analytics queries |
| Queue throughput | Valkey queue driver, multiple worker containers |
| API throughput | Horizontal scaling of stateless `api` containers behind Caddy |
| Checkout latency | Edge caching of static assets, optimized Next.js bundle |

### Health Endpoints

- `GET /healthz` — returns 200 if the application is running (liveness)
- `GET /readyz` — returns 200 if DB connection is healthy and queue is processing (readiness)

---

## 16. Key Trade-offs & Decisions

| Decision | Rationale | Trade-off |
|---|---|---|
| **Database queue driver** (Phase 1) | Zero additional infrastructure, simpler ops | Lower throughput than Valkey; acceptable at Phase 1 volume |
| **Monorepo** | Shared types, atomic commits, single CI pipeline | Larger repo, more complex Docker builds |
| **Cookie auth (not JWT)** | More secure (HttpOnly, no client-side storage), simpler CSRF | Requires same registrable domain for all subdomains |
| **Outbox pattern** (not events) | Guarantees webhook delivery even if the app crashes after commit | Extra table, poller/listener complexity |
| **UUID for order IDs** | Prevents enumeration, safe to expose in URLs | Larger index size vs sequential integers |
| **Nanoid slugs** | Short, URL-safe, no information leakage | Small collision risk (mitigated by unique constraint + retry) |
| **Single DB, shared schema** (not DB-per-tenant) | Simpler ops, easier migrations, lower cost | Requires disciplined scoping; RLS as safety net |
| **Server-rendered checkout** (Next.js dynamic) | SEO irrelevant but ensures fresh order state, no stale cache | Slightly higher TTFB than static; mitigated by edge proximity |
| **Polling for checkout status** (not WebSocket) | Simpler infrastructure, works behind any proxy | More requests; mitigated by exponential backoff |
| **HMAC webhook signatures** (not JWT/JWS) | Industry standard for webhooks (Stripe, Razorpay use it), simpler | Requires shared secret management |

---

## Next Steps

Upon confirmation of this architecture:

1. **Phase 1 implementation** begins with:
   - Monorepo scaffolding + Docker Compose
   - Laravel 12 project + PostgreSQL migrations
   - Next.js project with design system
   - Auth module (Sanctum + Fortify)
   - Core payment flow (MockAdapter first, then RazorpayAdapter)

2. Each module will be implemented with tests and documented trade-offs.

**Please review and confirm this architecture before I proceed with Phase 1.**
