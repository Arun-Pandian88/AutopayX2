# AutoPayX — Security Document

> **Version:** 0.1.0
> **Last updated:** 2026-09-30
> **Status:** Living document — updated each phase

---

## 1. Threat Model

### 1.1 Assets

| Asset | Sensitivity | Location |
|---|---|---|
| Merchant payment provider credentials | Critical | `provider_accounts.encrypted_credentials` (AES-256-GCM) |
| API keys | High | `api_keys.hash` (SHA-256, prefix for lookup) |
| Webhook signing secrets | High | `webhook_endpoints.encrypted_secret` (AES-256-GCM) |
| Order data (PII) | Medium | `orders` table (customer name, email, phone) |
| Session tokens | High | Server-side session store, cookie is `HttpOnly` |
| Payment provider webhook payloads | Medium | `provider_events.raw_payload` (jsonb) |

### 1.2 Threat Actors

| Actor | Motivation | Capability |
|---|---|---|
| External attacker | Financial gain, data theft | Web attacks, credential stuffing |
| Malicious merchant | Double-credit, data exfiltration | Authenticated API access |
| Insider (compromised admin) | Data access, sabotage | Full system access |

### 1.3 Key Threats & Mitigations

#### Replay Attack (Provider Webhooks)

**Threat:** Attacker captures a valid provider webhook and replays it to trigger duplicate payments.

**Mitigations:**
- Timestamp tolerance check (5 minutes)
- `provider_event_id` unique constraint — duplicate events are silently ignored
- Signature verification with constant-time comparison

#### Double-Spend

**Threat:** Race condition causes an order to be marked `paid` twice, crediting the merchant twice.

**Mitigations:**
- `SELECT ... FOR UPDATE` lock on the order row
- State machine rejects `paid → paid` transition
- Single DB transaction for state change + ledger entry + outbox insert
- `provider_event_id` uniqueness as an additional guard

#### SSRF (Outbound Webhooks)

**Threat:** Merchant sets webhook URL to an internal service (e.g., `http://169.254.169.254/` or `http://localhost:5432`).

**Mitigations:**
- DNS resolution at send time, block private/loopback/link-local IPs
- No HTTP redirects followed
- Timeout enforcement (10 seconds)
- URL validation on input (HTTPS required in production)

#### IDOR (Insecure Direct Object Reference)

**Threat:** Merchant A accesses Merchant B's orders/keys/webhooks by guessing IDs.

**Mitigations:**
- Every query scoped by `merchant_id` via Eloquent global scope
- Laravel policies verify ownership on every action
- PostgreSQL Row Level Security (Phase 2) as defense-in-depth
- UUIDs for external-facing IDs (non-sequential)
- Automated isolation test suite

#### Credential Theft

**Threat:** Database breach exposes payment provider credentials.

**Mitigations:**
- AES-256-GCM encryption at rest (libsodium)
- Encryption key stored in environment variable, not in database
- SOPS + age for committed secrets in production
- Key rotation procedure documented

#### API Key Compromise

**Threat:** Leaked API key allows unauthorized order creation.

**Mitigations:**
- SHA-256 hashing (key never stored in plain text after creation)
- Prefix-based lookup (`apx_live_` / `apx_test_`)
- Instant revocation
- `last_used_at` tracking for anomaly detection
- Rate limiting per key

#### Enumeration

**Threat:** Sequential IDs allow enumerating orders, merchants, etc.

**Mitigations:**
- UUIDs for order IDs (external)
- Nanoid slugs for checkout URLs
- No sequential information in any external-facing identifier

#### XSS (Cross-Site Scripting)

**Threat:** Merchant-provided text (business name, metadata) renders malicious scripts.

**Mitigations:**
- Strict Content Security Policy with per-request nonces
- React auto-escapes rendered text
- Server-side sanitization of all merchant-provided fields
- `frame-ancestors 'none'` on dashboard

#### CSRF (Cross-Site Request Forgery)

**Threat:** External site tricks authenticated user into performing actions.

**Mitigations:**
- Sanctum CSRF token verification on all state-changing requests
- `SameSite=Lax` cookies
- CORS allows only exact app origins

---

## 2. Authentication Security

### Session Cookies

- `HttpOnly`: JavaScript cannot read the session cookie
- `Secure`: Cookie only sent over HTTPS
- `SameSite=Lax`: Prevents CSRF from external sites
- `Domain=.autopayx.in`: Shared across subdomains

### Password Security

- Argon2id hashing (Laravel default)
- Minimum 8 characters enforced
- Rate limiting on login attempts (5 per minute per IP)
- Account lockout after 5 failed attempts (15 minutes)

### Two-Factor Authentication

- TOTP (RFC 6238) via Laravel Fortify
- Recovery codes provided at setup
- Encrypted 2FA secrets at rest

---

## 3. Data Protection

### Encryption at Rest

| Data | Method | Key Location |
|---|---|---|
| Provider credentials | AES-256-GCM (libsodium) | `PROVIDER_ENCRYPTION_KEY` env var |
| Webhook secrets | AES-256-GCM (libsodium) | `PROVIDER_ENCRYPTION_KEY` env var |
| 2FA secrets | Laravel `Crypt` (AES-256-CBC) | `APP_KEY` env var |
| Database backups | Encrypted at filesystem level | Production infrastructure |

### PII Handling

- Minimal PII collected (name, email, phone per order)
- Data retention configurable per merchant
- Account deletion flow removes PII
- India DPDP Act awareness: consent notice, deletion request flow planned

---

## 4. Logging & Audit

### What We Log

- Authentication events (login, logout, failed attempts, 2FA)
- API key lifecycle (create, revoke, use)
- Provider account changes (connect, disconnect, credential update)
- Order state transitions
- Webhook delivery attempts
- Admin actions (impersonation, plan changes, suspensions)

### What We Never Log

- Full API keys or passwords
- Provider credentials (encrypted or plain)
- Full webhook signing secrets
- Raw session tokens
- Credit card or bank account numbers (not applicable, but stated for clarity)

---

## 5. Infrastructure Security

### Network

- Caddy with auto TLS (Let's Encrypt)
- Cloudflare Free tier for DDoS protection
- Admin panel IP-restricted
- Database not exposed to public internet
- Internal services communicate over Docker network

### Dependencies

- `composer audit` in CI
- `npm audit` in CI
- Larastan level 8 static analysis
- Dependabot / Renovate for automated updates

---

## 6. Incident Response

*To be expanded before production launch.*

- Rotate `PROVIDER_ENCRYPTION_KEY` if compromised (re-encrypt all credentials)
- Rotate `APP_KEY` if compromised (invalidates all sessions)
- Revoke all API keys for a merchant if compromise suspected
- Notification to affected merchants within 72 hours of confirmed breach

---

## 7. Compliance Notes

- **No compliance claims in UI.** We do not claim RBI compliance, PCI DSS compliance, or any certification.
- Consult a CA before launch for GST registration requirements (SAC code for payment gateway services).
- Consult a lawyer for Terms of Service and Privacy Policy.
- DPDP Act: data processing consent notice, right to deletion, data portability — planned for Phase 4.
