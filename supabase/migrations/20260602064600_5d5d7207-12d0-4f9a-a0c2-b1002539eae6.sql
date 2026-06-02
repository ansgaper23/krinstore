-- Add last_notified_at to track when the user was last warned about expiration
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP WITH TIME ZONE;

-- Function to renew a subscription for a specific number of months
CREATE OR REPLACE FUNCTION public.renew_subscription(sub_id UUID, months_count INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.subscriptions
    SET 
        status = 'active',
        next_billing_date = COALESCE(next_billing_date, now()) + (months_count || ' months')::interval,
        updated_at = now()
    WHERE id = sub_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.renew_subscription(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.renew_subscription(UUID, INTEGER) TO service_role;
