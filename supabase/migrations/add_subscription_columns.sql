-- Migration: Adicionar colunas de assinatura Stripe na tabela lojas
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE lojas
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '3 days'),
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing';

-- Índice para buscar lojas pelo customer_id do Stripe (usado pelo webhook)
CREATE INDEX IF NOT EXISTS idx_lojas_stripe_customer_id ON lojas (stripe_customer_id);
