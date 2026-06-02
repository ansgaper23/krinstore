-- Re-define the has_role function to be more robust if needed, or just update policies to use a direct check.
-- Assuming has_role exists, let's update it to handle the enum cast properly if it's the issue, 
-- or just use a direct query in policies for maximum reliability.

-- Profiles
DROP POLICY IF EXISTS "Superadmins view all profiles" ON public.profiles;
CREATE POLICY "Superadmins view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

DROP POLICY IF EXISTS "Superadmins update all profiles" ON public.profiles;
CREATE POLICY "Superadmins update all profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

-- User Roles
DROP POLICY IF EXISTS "Superadmins manage roles" ON public.user_roles;
CREATE POLICY "Superadmins manage roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

-- Stores
DROP POLICY IF EXISTS "Superadmins manage all stores" ON public.stores;
CREATE POLICY "Superadmins manage all stores" ON public.stores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

DROP POLICY IF EXISTS "Superadmins view all stores" ON public.stores;
CREATE POLICY "Superadmins view all stores" ON public.stores FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

-- Subscriptions
DROP POLICY IF EXISTS "Superadmins manage subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmins manage subscriptions" ON public.subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

DROP POLICY IF EXISTS "Superadmins view all subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmins view all subscriptions" ON public.subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

-- Store Analytics
DROP POLICY IF EXISTS "Superadmins view all analytics" ON public.store_analytics;
CREATE POLICY "Superadmins view all analytics" ON public.store_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

-- Custom Products
DROP POLICY IF EXISTS "Superadmins manage all custom products" ON public.custom_products;
CREATE POLICY "Superadmins manage all custom products" ON public.custom_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

DROP POLICY IF EXISTS "Superadmins view all custom products" ON public.custom_products;
CREATE POLICY "Superadmins view all custom products" ON public.custom_products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

-- Store Products
DROP POLICY IF EXISTS "Superadmins manage all store products" ON public.store_products;
CREATE POLICY "Superadmins manage all store products" ON public.store_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);

DROP POLICY IF EXISTS "Superadmins view all store products" ON public.store_products;
CREATE POLICY "Superadmins view all store products" ON public.store_products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'superadmin')
);
