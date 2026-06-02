-- Fix function security
ALTER FUNCTION public.is_superadmin() SET search_path = public;

-- Restrict execution permissions
REVOKE ALL ON FUNCTION public.is_superadmin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_superadmin() FROM anon;
REVOKE ALL ON FUNCTION public.is_superadmin() FROM authenticated;

GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO service_role;
