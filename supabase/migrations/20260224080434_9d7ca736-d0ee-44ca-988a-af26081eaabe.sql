
-- Step 1: Add new roles and columns only
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'demo_admin';

-- Add client_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- Add is_demo to core tables
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_is_demo ON public.clients(is_demo);
CREATE INDEX IF NOT EXISTS idx_orders_is_demo ON public.orders(is_demo);
CREATE INDEX IF NOT EXISTS idx_invoices_is_demo ON public.invoices(is_demo);
CREATE INDEX IF NOT EXISTS idx_payments_is_demo ON public.payments(is_demo);
