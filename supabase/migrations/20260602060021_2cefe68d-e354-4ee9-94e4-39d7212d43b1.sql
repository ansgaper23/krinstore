-- Create a function to check if the current user is a superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies to use the function

-- Profiles
DROP POLICY IF EXISTS "Superadmins view all profiles" ON public.profiles;
CREATE POLICY "Superadmins view all profiles" ON public.profiles FOR SELECT USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins update all profiles" ON public.profiles;
CREATE POLICY "Superadmins update all profiles" ON public.profiles FOR UPDATE USING (is_superadmin());

-- User Roles
DROP POLICY IF EXISTS "Superadmins manage roles" ON public.user_roles;
CREATE POLICY "Superadmins manage roles" ON public.user_roles FOR ALL USING (is_superadmin());

-- Stores
DROP POLICY IF EXISTS "Superadmins manage all stores" ON public.stores;
CREATE POLICY "Superadmins manage all stores" ON public.stores FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins view all stores" ON public.stores;
CREATE POLICY "Superadmins view all stores" ON public.stores FOR SELECT USING (is_superadmin());

-- Subscriptions
DROP POLICY IF EXISTS "Superadmins manage subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmins manage subscriptions" ON public.subscriptions FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins view all subscriptions" ON public.subscriptions;
CREATE POLICY "Superadmins view all subscriptions" ON public.subscriptions FOR SELECT USING (is_superadmin());

-- Store Analytics
DROP POLICY IF EXISTS "Superadmins view all analytics" ON public.store_analytics;
CREATE POLICY "Superadmins view all analytics" ON public.store_analytics FOR SELECT USING (is_superadmin());

-- Custom Products
DROP POLICY IF EXISTS "Superadmins manage all custom products" ON public.custom_products;
CREATE POLICY "Superadmins manage all custom products" ON public.custom_products FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins view all custom products" ON public.custom_products;
CREATE POLICY "Superadmins view all custom products" ON public.custom_products FOR SELECT USING (is_superadmin());

-- Store Products
DROP POLICY IF EXISTS "Superadmins manage all store products" ON public.store_products;
CREATE POLICY "Superadmins manage all store products" ON public.store_products FOR ALL USING (is_superadmin());

DROP POLICY IF EXISTS "Superadmins view all store products" ON public.store_products;
CREATE POLICY "Superadmins view all store products" ON public.store_products FOR SELECT USING (is_superadmin());
