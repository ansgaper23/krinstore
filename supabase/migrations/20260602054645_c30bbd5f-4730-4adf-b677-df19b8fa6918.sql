-- Note: The function has_role(uid, role) is assumed to exist based on existing policies.

-- Superadmin policy for subscriptions (if not already fully covered by ALL)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Superadmins view all subscriptions') THEN
        CREATE POLICY "Superadmins view all subscriptions" ON public.subscriptions FOR SELECT USING (has_role(auth.uid(), 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Superadmins update all subscriptions') THEN
        CREATE POLICY "Superadmins update all subscriptions" ON public.subscriptions FOR UPDATE USING (has_role(auth.uid(), 'superadmin'));
    END IF;
END $$;

-- Superadmin policy for stores
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Superadmins view all stores') THEN
        CREATE POLICY "Superadmins view all stores" ON public.stores FOR SELECT USING (has_role(auth.uid(), 'superadmin'));
    END IF;
END $$;

-- Superadmin policy for custom_products
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Superadmins view all custom products') THEN
        CREATE POLICY "Superadmins view all custom products" ON public.custom_products FOR SELECT USING (has_role(auth.uid(), 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Superadmins manage all custom products') THEN
        CREATE POLICY "Superadmins manage all custom products" ON public.custom_products FOR ALL USING (has_role(auth.uid(), 'superadmin'));
    END IF;
END $$;

-- Superadmin policy for store_products
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Superadmins view all store products') THEN
        CREATE POLICY "Superadmins view all store products" ON public.store_products FOR SELECT USING (has_role(auth.uid(), 'superadmin'));
    END IF;
END $$;
