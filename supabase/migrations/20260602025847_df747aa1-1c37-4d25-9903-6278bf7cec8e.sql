-- Fix search path for the trigger function
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Refine order creation policy
DROP POLICY "Anyone can create an order" ON public.orders;
CREATE POLICY "Anyone can create an order"
ON public.orders FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE public.stores.id = store_id
    )
);
