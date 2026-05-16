
-- Storage bucket para assets de tiendas (logos, banners)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas: cualquiera puede ver, cada usuario sube/edita/borra solo en su carpeta (uid)
CREATE POLICY "Public read store-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-assets');

CREATE POLICY "Owner upload store-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner update store-assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'store-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner delete store-assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'store-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Extensiones para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
