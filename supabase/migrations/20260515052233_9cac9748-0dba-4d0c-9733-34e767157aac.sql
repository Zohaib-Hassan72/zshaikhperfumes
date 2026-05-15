
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  author_name TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT
  USING (approved = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "reviews_public_insert" ON public.reviews FOR INSERT
  WITH CHECK (
    length(author_name) BETWEEN 1 AND 100
    AND length(body) BETWEEN 3 AND 2000
    AND rating BETWEEN 1 AND 5
  );

CREATE POLICY "reviews_admin_write" ON public.reviews FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews(product_id);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC NOT NULL DEFAULT 0;
