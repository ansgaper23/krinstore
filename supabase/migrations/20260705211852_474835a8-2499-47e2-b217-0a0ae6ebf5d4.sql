
DROP POLICY IF EXISTS "Public can view active stores" ON public.stores;
CREATE POLICY "Public can view non-inactive stores"
  ON public.stores FOR SELECT
  TO public
  USING (is_active = true AND status IN ('active','suspended'));
