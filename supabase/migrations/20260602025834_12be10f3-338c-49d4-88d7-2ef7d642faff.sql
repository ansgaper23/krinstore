-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create orders table
CREATE TABLE public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    customer_city TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL DEFAULT 'whatsapp',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for performance
CREATE INDEX idx_orders_store_id ON public.orders(store_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Permissions
GRANT ALL ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

-- RLS Policies
CREATE POLICY "Store owners can view their own orders"
ON public.orders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE public.stores.id = public.orders.store_id
        AND public.stores.user_id = auth.uid()
    )
);

CREATE POLICY "Store owners can update their own orders"
ON public.orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.stores
        WHERE public.stores.id = public.orders.store_id
        AND public.stores.user_id = auth.uid()
    )
);

CREATE POLICY "Anyone can create an order"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Create trigger
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
