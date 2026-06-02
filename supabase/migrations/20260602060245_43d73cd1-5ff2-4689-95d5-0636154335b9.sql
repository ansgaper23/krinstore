-- Temporary debugging policy for the owner
DO $$ 
BEGIN
    -- Profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owner bypass profiles') THEN
        CREATE POLICY "Owner bypass profiles" ON public.profiles FOR SELECT USING (auth.uid() = 'c3516877-c169-49e2-bb97-254924ac5936');
    END IF;
    
    -- Subscriptions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owner bypass subscriptions') THEN
        CREATE POLICY "Owner bypass subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = 'c3516877-c169-49e2-bb97-254924ac5936');
    END IF;
    
    -- Stores
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owner bypass stores') THEN
        CREATE POLICY "Owner bypass stores" ON public.stores FOR SELECT USING (auth.uid() = 'c3516877-c169-49e2-bb97-254924ac5936');
    END IF;
END $$;
