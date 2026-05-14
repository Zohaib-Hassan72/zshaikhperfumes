import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Banner } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Z Shaikh Perfumes — Premium Fragrances Inspired by Urdu Legends" },
      { name: "description", content: "Discover hand-crafted perfumes named after iconic Urdu novel characters. 25% off + free cash-on-delivery across Pakistan." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [hero, setHero] = useState<Banner | null>(null);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [home, setHome] = useState<{ featured_heading?: string; featured_subheading?: string }>({});

  useEffect(() => {
    supabase.from("banners").select("*").eq("key", "hero").eq("active", true).order("sort_order").limit(1).maybeSingle()
      .then(({ data }) => setHero(data as Banner | null));
    supabase.from("products").select("*").eq("featured", true).order("sort_order").limit(3)
      .then(({ data }) => setFeatured((data ?? []) as Product[]));
    supabase.from("site_settings").select("value").eq("key", "home").maybeSingle()
      .then(({ data }) => setHome((data?.value as any) ?? {}));
  }, []);

  return (
    <div>
      {/* Editable hero banner */}
      <section className="relative">
        <Link to={hero?.link_url ?? "/shop"} aria-label="Shop the collection" className="block">
          <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
            <img
              src={hero?.image_url ?? "/images/hero-banner.jpg"}
              alt={hero?.title ?? "Z Shaikh hero"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 pb-12 sm:pb-20 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">New Arrivals</p>
                <h1 className="font-display text-4xl sm:text-6xl md:text-7xl max-w-3xl leading-[1.05]">
                  {hero?.title ?? "The Z Shaikh Signature Collection"}
                </h1>
                {hero?.subtitle && (
                  <p className="mt-4 max-w-xl text-base sm:text-lg text-white/80">{hero.subtitle}</p>
                )}
                <span className="inline-block mt-6 border border-gold text-gold px-8 py-3 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-gold-foreground transition-colors">
                  Shop the Collection
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Featured 3 products */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Curated Selection</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-3">{home.featured_heading ?? "Our Premium Fragrances"}</h2>
          <p className="text-muted-foreground mt-3">{home.featured_subheading ?? "Three signature scents, hand-picked this season."}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-12">
          <Link to="/shop">
            <Button variant="outline" className="border-primary text-primary uppercase tracking-[0.2em] text-xs px-8 py-6 rounded-none">
              View All Fragrances
            </Button>
          </Link>
        </div>
      </section>

      {/* Brand promise band */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container mx-auto px-4 py-12 grid gap-8 sm:grid-cols-3 text-center">
          {[
            { t: "Free Delivery", s: "All orders, all over Pakistan" },
            { t: "Cash on Delivery", s: "Pay when your scent arrives" },
            { t: "7-Day Returns", s: "Unopened bottles, full refund" },
          ].map((b) => (
            <div key={b.t}>
              <h3 className="font-display text-xl text-gold">{b.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{b.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Our Story</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-3">Bottled romance, page by page.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Every Z Shaikh perfume is named after an unforgettable Urdu novel character — Umrao Jaan, Heer, Sassi, Mahjabeen — and crafted to feel like wearing their world. French perfumery technique meets traditional South Asian attar craft.
          </p>
          <Link to="/about" className="inline-block mt-6 text-sm uppercase tracking-[0.2em] text-primary border-b border-gold pb-1">
            Read our story →
          </Link>
        </div>
        <div className="aspect-[4/5] overflow-hidden rounded-sm">
          <img src="/images/perfume-3.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      </section>
    </div>
  );
}
