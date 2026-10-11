-- AutoPayX Database Schema for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/ggoioszarjpxnboaufos/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users / Profiles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'merchant', -- 'merchant' or 'superadmin'
  business_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  txn_id TEXT UNIQUE NOT NULL,
  order_id TEXT,
  merchant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  fee NUMERIC(12, 2) DEFAULT 0,
  net_amount NUMERIC(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'expired'
  utr TEXT,
  sender_upi TEXT,
  payment_method TEXT DEFAULT 'UPI',
  upi_intent_url TEXT,
  qr_code_data TEXT,
  simulated BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payment Links
CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  merchant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  is_reusable BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active',
  max_uses INT DEFAULT 0,
  current_uses INT DEFAULT 0,
  redirect_url TEXT,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Payment Settings (Merchant UPI & Verification Settings)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  upi_id TEXT,
  payee_name TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  imap_email TEXT,
  imap_app_password TEXT,
  imap_host TEXT DEFAULT 'imap.gmail.com',
  imap_port INT DEFAULT 993,
  verification_mode TEXT DEFAULT 'auto',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Plans & Pricing
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly',
  features JSONB DEFAULT '[]'::jsonb,
  transaction_limit INT DEFAULT 1000,
  fee_percentage NUMERIC(5, 2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Plans
INSERT INTO public.plans (name, description, price, billing_cycle, features, transaction_limit, fee_percentage, status)
VALUES 
  ('Starter', 'For small merchants beginning with UPI automation', 0, 'monthly', '["Up to 500 transactions/mo", "Direct UPI QR Code", "Standard Email Support"]'::jsonb, 500, 0, 'active'),
  ('Pro Merchant', 'For growing businesses needing higher volume & webhooks', 499, 'monthly', '["Unlimited transactions", "Automatic UTR Verification", "Instant Webhook Notifications", "Priority 24/7 Support"]'::jsonb, 999999, 0, 'active')
ON CONFLICT DO NOTHING;

-- 6. Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id),
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  amount_paid NUMERIC(12, 2) DEFAULT 0,
  utr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  mode TEXT DEFAULT 'test', -- 'test' or 'live'
  permissions JSONB DEFAULT '["read", "write"]'::jsonb,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Webhook Endpoints
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events JSONB DEFAULT '["payment.completed", "payment.failed"]'::jsonb,
  status TEXT DEFAULT 'active',
  failure_count INT DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Checkout Themes
CREATE TABLE IF NOT EXISTS public.checkout_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  primary_color TEXT DEFAULT '#6C3FE2',
  background_color TEXT DEFAULT '#FFFFFF',
  logo_url TEXT,
  display_name TEXT,
  dark_mode BOOLEAN DEFAULT FALSE,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. System Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID,
  type TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Supabase Realtime for Transactions (Replaces Socket.IO)
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
