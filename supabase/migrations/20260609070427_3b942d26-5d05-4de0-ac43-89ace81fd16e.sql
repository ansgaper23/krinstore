REVOKE EXECUTE ON FUNCTION public.is_superadmin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

DROP POLICY IF EXISTS "Superadmins manage all custom products" ON public.custom_products;
CREATE POLICY "Superadmins manage all custom products" ON public.custom_products
FOR ALL TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins view all custom products" ON public.custom_products;
CREATE POLICY "Superadmins view all custom products" ON public.custom_products
FOR SELECT TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage tickets" ON public.free_plan_tickets;
CREATE POLICY "Superadmins manage tickets" ON public.free_plan_tickets
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'::public.app_role));

DROP POLICY IF EXISTS "Superadmins manage cache" ON public.krincesa_products_cache;
CREATE POLICY "Superadmins manage cache" ON public.krincesa_products_cache
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'::public.app_role));

DROP POLICY IF EXISTS "Superadmins manage purchases" ON public.mayorista_purchases;
CREATE POLICY "Superadmins manage purchases" ON public.mayorista_purchases
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'::public.app_role));

DROP POLICY IF EXISTS "Superadmins update all profiles" ON public.profiles;
CREATE POLICY "Superadmins update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins view all profiles" ON public.profiles;
CREATE POLICY "Superadmins view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins view all analytics" ON public.store_analytics;
CREATE POLICY "Superadmins view all analytics" ON public.store_analytics
FOR SELECT TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage all store products" ON public.store_products;
CREATE POLICY "Superadmins manage all store products" ON public.store_products
FOR ALL TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins view all store products" ON public.store_products;
CREATE POLICY "Superadmins view all store products" ON public.store_products
FOR SELECT TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage all stores" ON public.stores;
CREATE POLICY "Superadmins manage all stores" ON public.stores
FOR ALL TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins view all stores" ON public.stores;
CREATE POLICY "Superadmins view all stores" ON public.stores
FOR SELECT TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmins manage subscriptions" ON public.subscriptions
FOR ALL TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins update all subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmins update all subscriptions" ON public.subscriptions
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'::public.app_role));

DROP POLICY IF EXISTS "Superadmins view all subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmins view all subscriptions" ON public.subscriptions
FOR SELECT TO authenticated
USING (public.is_superadmin());

DROP POLICY IF EXISTS "Superadmins manage roles" ON public.user_roles;
CREATE POLICY "Superadmins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.is_superadmin());