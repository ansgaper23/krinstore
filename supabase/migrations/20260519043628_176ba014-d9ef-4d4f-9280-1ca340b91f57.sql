CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.custom_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  image_url_2 TEXT,
  category TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_custom_products_store ON public.custom_products(store_id);

ALTER TABLE public.custom_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own custom products"
ON public.custom_products FOR ALL
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = custom_products.store_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = custom_products.store_id AND s.user_id = auth.uid()));

CREATE POLICY "Public can view visible custom products of active stores"
ON public.custom_products FOR SELECT
USING (
  is_visible = true AND EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = custom_products.store_id AND s.is_active = true AND s.status = 'active'::store_status
  )
);

CREATE POLICY "Superadmins manage all custom products"
ON public.custom_products FOR ALL
USING (public.has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER trg_custom_products_updated_at
BEFORE UPDATE ON public.custom_products
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();