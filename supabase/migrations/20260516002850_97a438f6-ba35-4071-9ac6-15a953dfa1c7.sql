
-- 1) Make Jorge a superadmin
INSERT INTO public.user_roles (user_id, role)
VALUES ('c3516877-c169-49e2-bb97-254924ac5936', 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2) Add customization columns to store_products
ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS image_url_2 text,
  ADD COLUMN IF NOT EXISTS custom_name text,
  ADD COLUMN IF NOT EXISTS custom_description text;
