import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPKR } from "@/lib/format";
import { Minus, Plus, ShoppingBag, MessageCircle } from "lucide-react";
import { ProductReviews } from "@/components/ProductReviews";

export const Route = createFileRoute("/products/$slug")({
  component: ProductPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-4xl">Fragrance not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-gold underline">Browse all</Link>
    </div>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [whatsapp, setWhatsapp] = useState("923001234567");
  const { add } = useCart();

  useEffect(() => {
    supabase.from("products").select("*").eq("slug", slug).maybeSingle()
      .then(({ data }) => { setProduct(data as Product | null); setLoading(false); });
    supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle()
      .then(({ data }) => {
        const v = data?.value as { whatsapp?: string } | null;
        if (v?.whatsapp) setWhatsapp(v.whatsapp);
      });
  }, [slug]);

  if (loading) return <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">Loading…</div>;
  if (!product) throw notFound();

  const price = product.sale_price ?? product.price;
  const handleAdd = () => {
    add({ product_id: product.id, slug: product.slug, name: product.name, price, image: product.images[0] ?? "" }, qty);
    toast.success(`${product.name} added to cart`);
  };
  const wamsg = `Hi! I'd like to order ${product.name} (${formatPKR(price)}) — qty ${qty}.`;
  const waUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(wamsg)}`;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/shop" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">← Back to shop</Link>
      <div className="mt-8 grid lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-muted overflow-hidden rounded-sm">
          <img src={product.images[0] ?? "/images/perfume-1.jpg"} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">{product.category_slug}</p>
          <h1 className="font-display text-5xl mt-2">{product.name}</h1>
          <p className="mt-3 text-base text-muted-foreground">{product.short_description}</p>
          <div className="mt-6 flex items-baseline gap-4">
            {product.sale_price != null ? (
              <>
                <span className="font-display text-3xl text-gold">{formatPKR(product.sale_price)}</span>
                <span className="text-muted-foreground line-through">{formatPKR(product.price)}</span>
              </>
            ) : (
              <span className="font-display text-3xl">{formatPKR(product.price)}</span>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2"><Plus className="h-4 w-4" /></button>
            </div>
            <Button onClick={handleAdd} disabled={!product.in_stock} className="flex-1 rounded-none uppercase tracking-[0.2em] text-xs py-6">
              <ShoppingBag className="h-4 w-4 mr-2" /> {product.in_stock ? "Add to Cart" : "Sold Out"}
            </Button>
          </div>

          <a href={waUrl} target="_blank" rel="noopener noreferrer"
             className="mt-3 flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-4 uppercase tracking-[0.2em] text-xs hover:opacity-90">
            <MessageCircle className="h-4 w-4" /> Order via WhatsApp
          </a>

          {product.long_description && (
            <div className="mt-10 prose prose-sm max-w-none">
              <h3 className="font-display text-xl mb-2">Notes</h3>
              <p className="text-muted-foreground leading-relaxed">{product.long_description}</p>
            </div>
          )}

          <div className="mt-8 text-xs text-muted-foreground space-y-1">
            <p>✓ Cash on delivery available all over Pakistan</p>
            <p>✓ Free shipping · ships within 1–2 business days</p>
            <p>✓ 7-day return on unopened bottles</p>
          </div>
        </div>
      </div>
      <ProductReviews productId={product.id} />
    </div>
  );
}
