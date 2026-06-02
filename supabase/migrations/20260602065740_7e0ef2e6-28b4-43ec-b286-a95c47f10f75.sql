CREATE OR REPLACE FUNCTION public.handle_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.subscriptions
    SET status = 'suspended',
        updated_at = now()
    WHERE status = 'active'
      AND next_billing_date < now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_expired_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_expired_subscriptions() TO service_role;
