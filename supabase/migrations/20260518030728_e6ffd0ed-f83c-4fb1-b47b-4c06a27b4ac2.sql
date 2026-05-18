
-- Sections config on stores
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS sections jsonb NOT NULL DEFAULT '[
    {"id":"logo","type":"logo","visible":true,"data":{}},
    {"id":"hero","type":"hero","visible":true,"data":{"title":"Bienvenida a mi tienda","subtitle":"Cosmética que enamora","cta":"Ver productos"}},
    {"id":"benefits","type":"benefits","visible":true,"data":{"items":[
      {"icon":"truck","title":"Envío y entrega","text":"Opciones de envío a domicilio para mayor conveniencia."},
      {"icon":"shield","title":"Seguridad","text":"Procesos de pago seguros y protección de datos personales."},
      {"icon":"clock","title":"24/7","text":"Compra desde cualquier lugar y en cualquier momento."}
    ]}},
    {"id":"categories","type":"categories","visible":true,"data":{"title":"Categorías destacadas"}},
    {"id":"promo","type":"promo","visible":false,"data":{"title":"¡Regreso a clases con el mejor estilo!","cta":"Ver más","image_url":null}},
    {"id":"products","type":"products","visible":true,"data":{"title":"Todos los productos"}},
    {"id":"footer","type":"footer","visible":true,"data":{"text":"© Mi tienda"}}
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'personalizada';

-- Add FKs so PostgREST joins work in superadmin
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.stores ADD CONSTRAINT stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.free_plan_tickets ADD CONSTRAINT free_plan_tickets_used_by_fkey FOREIGN KEY (used_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.store_products ADD CONSTRAINT store_products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.store_analytics ADD CONSTRAINT store_analytics_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
