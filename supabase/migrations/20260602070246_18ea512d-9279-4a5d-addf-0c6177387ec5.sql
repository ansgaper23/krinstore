CREATE TABLE public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Use GRANT to set permissions for different roles
GRANT SELECT ON public.system_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System settings are viewable by everyone" 
ON public.system_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can update system settings" 
ON public.system_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'superadmin'
    )
);

-- Seed default support phone
INSERT INTO public.system_settings (key, value, description)
VALUES ('support_whatsapp', '51987654321', 'Número de WhatsApp para soporte técnico y renovaciones');

-- Create function to update timestamps
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
