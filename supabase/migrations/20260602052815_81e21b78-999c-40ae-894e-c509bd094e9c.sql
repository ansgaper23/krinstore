-- Add original_price to custom_products
ALTER TABLE public.custom_products ADD COLUMN original_price NUMERIC;

-- Add original_price to store_products
ALTER TABLE public.store_products ADD COLUMN original_price NUMERIC;

-- Update types will happen automatically after migration
