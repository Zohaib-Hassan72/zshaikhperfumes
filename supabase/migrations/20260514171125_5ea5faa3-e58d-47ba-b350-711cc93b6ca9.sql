
-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Lock down execute on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role is used inside RLS via auth.uid(); keep it callable by signed-in users for explicit checks but block anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Tighten guest-order insert: require non-empty fields & at least one item
DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
CREATE POLICY "orders_public_insert" ON public.orders
FOR INSERT
WITH CHECK (
  length(customer_name) BETWEEN 1 AND 200
  AND length(phone) BETWEEN 5 AND 30
  AND length(address) BETWEEN 1 AND 500
  AND length(city) BETWEEN 1 AND 100
  AND jsonb_array_length(items) > 0
  AND total >= 0
);
