-- Already applied to the existing Cosmic Beans Supabase project.
CREATE TABLE IF NOT EXISTS public.cosmic_checkout_accounts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cosmic_checkout_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cosmic_checkout_accounts FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.cosmic_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  stripe_checkout_session_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cosmic_orders_user_created_idx
  ON public.cosmic_orders (user_id, created_at DESC);
ALTER TABLE public.cosmic_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cosmic_orders FROM anon, authenticated;
DROP POLICY IF EXISTS cosmic_orders_read_own ON public.cosmic_orders;
CREATE POLICY cosmic_orders_read_own ON public.cosmic_orders
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
GRANT SELECT ON public.cosmic_orders TO authenticated;
