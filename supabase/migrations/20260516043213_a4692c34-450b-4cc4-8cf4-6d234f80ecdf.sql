
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "product_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "product_images_admin_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "product_images_admin_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));
