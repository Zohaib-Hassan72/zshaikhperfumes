import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useCartDrawer } from "@/components/CartDrawer";
import { formatPKR } from "@/lib/format";
import {
  Minus, Plus, Heart, Leaf, ShieldCheck, Truck, ChevronDown,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
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
  const [activeImage, setActiveImage] = useState(0);
  const [whatsapp, setWhatsapp] = useState("923001234567");
  const [openSection, setOpenSection] = useState<string | null>("shipping");
  const { add } = useCart();
  const { setOpen: openCart } = useCartDrawer();

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
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
  const onSale = product.sale_price != null && product.sale_price < product.price;
  const off = onSale ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0;
  const images = product.images.length ? product.images : ["/images/perfume-1.jpg"];

  const handleAdd = () => {
    add({ product_id: product.id, slug: product.slug, name: product.name, price, image: images[0] }, qty);
    toast.success(`${product.name} added to cart`);
    openCart(true);
  };

  const wamsg = `Hi! I'd like to order ${product.name} (${formatPKR(price)}) — qty ${qty}.`;
  const waUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(wamsg)}`;

  const toggle = (k: string) => setOpenSection(openSection === k ? null : k);

  return (
    <div className="bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        <Link to="/shop" className="text-xs uppercase tracking-[0.2em] text-white/60 hover:text-gold">← Back to shop</Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: thumbnails + main image */}
          <div className="flex gap-3 lg:gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3 w-16 sm:w-20 shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square overflow-hidden border-2 transition ${activeImage === i ? "border-gold" : "border-white/10 hover:border-white/40"}`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main */}
            <div className="flex-1 aspect-square bg-zinc-900 overflow-hidden">
              <img
                key={activeImage}
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover animate-in fade-in duration-500"
              />
            </div>
          </div>

          {/* RIGHT: details */}
          <div className="flex flex-col">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">{product.name}</h1>

            <div className="mt-6 flex items-center flex-wrap gap-3">
              <span className="text-2xl sm:text-3xl font-medium">{formatPKR(price)}</span>
              {onSale && (
                <>
                  <span className="text-white/40 line-through">{formatPKR(product.price)}</span>
                  <span className="bg-emerald-500 text-white text-xs font-bold uppercase px-2.5 py-1 rounded">{off}% OFF</span>
                </>
              )}
            </div>

            <div className="mt-8 h-px bg-white/10" />

            {/* Trust row */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
              <Feature icon={<Leaf className="h-5 w-5" />} title="Finest" sub="Ingredients" />
              <Feature icon={<ShieldCheck className="h-5 w-5" />} title="100% Authentic" sub="Guaranteed" />
              <Feature icon={<Truck className="h-5 w-5" />} title="COD" sub="Across Pakistan" />
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center bg-zinc-900 border border-white/10">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-white/5"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center text-base">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3 hover:bg-white/5"><Plus className="h-4 w-4" /></button>
              </div>
              <Button
                onClick={handleAdd}
                disabled={!product.in_stock}
                className="flex-1 rounded-none uppercase tracking-[0.2em] text-xs sm:text-sm py-6 bg-gold text-black hover:bg-gold/90 font-semibold"
              >
                + {product.in_stock ? "Add to Cart" : "Sold Out"}
              </Button>
              <button
                aria-label="Add to wishlist"
                className="w-12 h-12 sm:w-14 sm:h-14 border border-gold/60 flex items-center justify-center hover:bg-gold/10 transition"
              >
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
              </button>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-5 uppercase tracking-[0.25em] text-xs sm:text-sm font-semibold hover:opacity-90 transition"
            >
              <MessageCircle className="h-5 w-5" /> Order on WhatsApp
            </a>

            {/* Accordions */}
            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              <Accordion title="Shipping Information" open={openSection === "shipping"} onToggle={() => toggle("shipping")}>
                <ul className="space-y-1.5">
                  <li>• Cash on Delivery available all over Pakistan</li>
                  <li>• Free shipping on every order</li>
                  <li>• Delivery in 3 business days maximum</li>
                  <li>• Easypaisa: get Rs 100 instant discount</li>
                </ul>
              </Accordion>
              {product.long_description && (
                <Accordion title="Fragrance Notes" open={openSection === "notes"} onToggle={() => toggle("notes")}>
                  <p className="leading-relaxed">{product.long_description}</p>
                </Accordion>
              )}
              {product.short_description && (
                <Accordion title="Description" open={openSection === "desc"} onToggle={() => toggle("desc")}>
                  <p className="leading-relaxed">{product.short_description}</p>
                </Accordion>
              )}
              <Accordion title="Returns & Authenticity" open={openSection === "returns"} onToggle={() => toggle("returns")}>
                <p>7-day return on unopened bottles. Every bottle is 100% authentic and hand-finished in our studio.</p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews on light background */}
      <div className="bg-background text-foreground">
        <div className="container mx-auto px-4 py-12">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-gold shrink-0">{icon}</div>
      <div className="leading-tight">
        <p className="font-medium">{title}</p>
        <p className="text-white/60">{sub}</p>
      </div>
    </div>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-4 text-left">
        <span className="font-display text-lg sm:text-xl">{title}</span>
        <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-5 text-sm text-white/70 animate-in fade-in slide-in-from-top-1 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}
