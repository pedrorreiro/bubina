-- Migration: Adicionar coluna de expiração do Stripe na tabela lojas
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE lojas
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Comentário para documentação
COMMENT ON COLUMN lojas.current_period_end IS 'Data exata de expiração do período pago no Stripe';
