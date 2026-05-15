
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('seller', 'superadmin');
CREATE TYPE public.subscription_plan AS ENUM ('free_mayorista', 'basic', 'pro');
CREATE TYPE public.subscription_status AS ENUM ('active', 'grace', 'suspended', 'cancelled');
CREATE TYPE public.store_status AS ENUM ('active', 'suspended', 'grace');
CREATE TYPE public.button_style AS ENUM ('rounded', 'sharp', 'pill');

-- PROFILES (NO foreign key to auth.users per guidelines except via id pattern allowed)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  is_mayorista BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USER ROLES (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'seller',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- STORES
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#FF6B9D',
  secondary_color TEXT DEFAULT '#FFF0F5',
  font_family TEXT NOT NULL DEFAULT 'Playfair Display',
  button_style public.button_style NOT NULL DEFAULT 'rounded',
  banner_url TEXT,
  description TEXT,
  template TEXT NOT NULL DEFAULT 'minimal',
  custom_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status public.store_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_stores_subdomain ON public.stores(subdomain);

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL DEFAULT 'basic',
  status public.subscription_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_billing_date TIMESTAMPTZ,
  grace_until TIMESTAMPTZ,
  payment_method TEXT,
  amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);

-- KRINCESA CACHE
CREATE TABLE public.krincesa_products_cache (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  description TEXT,
  category TEXT,
  raw JSONB,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STORE PRODUCTS
CREATE TABLE public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_api_id TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  custom_price NUMERIC(10,2),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, product_api_id)
);
CREATE INDEX idx_store_products_store ON public.store_products(store_id);

-- MAYORISTA PURCHASES
CREATE TABLE public.mayorista_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STORE ANALYTICS
CREATE TABLE public.store_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  product_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_analytics_store ON public.store_analytics(store_id, created_at DESC);

-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.krincesa_products_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mayorista_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_analytics ENABLE ROW LEVEL SECURITY;

-- POLICIES: profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Superadmins view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmins update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'superadmin'));

-- POLICIES: user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Superadmins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- POLICIES: stores
CREATE POLICY "Public can view active stores" ON public.stores FOR SELECT USING (is_active = true AND status = 'active');
CREATE POLICY "Owners view own store" ON public.stores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners insert own store" ON public.stores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners update own store" ON public.stores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners delete own store" ON public.stores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Superadmins manage all stores" ON public.stores FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- POLICIES: subscriptions
CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Superadmins manage subscriptions" ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- POLICIES: store_products
CREATE POLICY "Public can view visible products of active stores" ON public.store_products FOR SELECT USING (
  is_visible = true AND EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.is_active = true AND s.status = 'active')
);
CREATE POLICY "Owners manage own store products" ON public.store_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid())
);
CREATE POLICY "Superadmins manage all store products" ON public.store_products FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- POLICIES: krincesa_products_cache (public read)
CREATE POLICY "Anyone can read cache" ON public.krincesa_products_cache FOR SELECT USING (true);
CREATE POLICY "Superadmins manage cache" ON public.krincesa_products_cache FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- POLICIES: mayorista_purchases
CREATE POLICY "Users view own purchases" ON public.mayorista_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Superadmins manage purchases" ON public.mayorista_purchases FOR ALL USING (public.has_role(auth.uid(), 'superadmin'));

-- POLICIES: store_analytics
CREATE POLICY "Anyone can insert analytics events" ON public.store_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners view own store analytics" ON public.store_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid())
);
CREATE POLICY "Superadmins view all analytics" ON public.store_analytics FOR SELECT USING (public.has_role(auth.uid(), 'superadmin'));

-- TRIGGER: auto-create profile + seller role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'seller');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
