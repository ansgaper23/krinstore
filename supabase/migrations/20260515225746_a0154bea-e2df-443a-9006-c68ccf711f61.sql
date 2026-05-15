
-- Fix set_updated_at search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Lock down SECURITY DEFINER functions (only system uses them via triggers/policies)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
-- has_role still needs to be callable by authenticated for RLS evaluation, keep it
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Replace overly permissive analytics insert policy
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.store_analytics;
CREATE POLICY "Insert analytics for active stores"
ON public.store_analytics FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.is_active = true AND s.status = 'active')
);
