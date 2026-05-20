
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS checkout_method text NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS checkout_whatsapp text,
  ADD COLUMN IF NOT EXISTS checkout_payment_url text,
  ADD COLUMN IF NOT EXISTS checkout_instructions text;
