import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Banner, Category } from "@/lib/types";
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

function BannerImg({ b, className }: { b: Banner; className?: string }) {
  const desktop = b.image_url ?? "/images/hero-banner.jpg";
  const mobile = b.image_url_mobile ?? desktop;
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} />
      <img src={mobile} alt={b.title ?? ""} className={className} />
    </picture>
  );
}

function HomePage() {
  const [hero, setHero] = useState<Banner | null>(null);
  const [promo, setPromo] = useState<Banner | null>(null);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [home, setHome] = useState<{ featured_heading?: string; featured_subheading?: string; categories_heading?: string }>({});

  useEffect(() => {
    supabase.from("banners").select("*").eq("key", "hero").eq("active", true).order("sort_order").limit(1).maybeSingle()
      .then(({ data }) => setHero(data as Banner | null));
    supabase.from("banners").select("*").eq("key", "promo").eq("active", true).order("sort_order").limit(1).maybeSingle()
      .then(({ data }) => setPromo(data as Banner | null));
    supabase.from("products").select("*").eq("featured", true).order("sort_order").limit(4)
      .then(({ data }) => setFeatured((data ?? []) as Product[]));
    supabase.from("categories").select("*").order("sort_order")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
    supabase.from("site_settings").select("value").eq("key", "home").maybeSingle()
      .then(({ data }) => setHome((data?.value as any) ?? {}));
  }, []);

  return (
    <div>
      {/* Hero banner (mobile + desktop images) */}
      <section className="relative">
        <Link to={hero?.link_url ?? "/shop"} aria-label="Shop the collection" className="block">
          <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
            {hero ? (
              <BannerImg b={hero} className="w-full h-full object-cover" />
            ) : (
              <img src="/images/hero-banner.jpg" alt="" className="w-full h-full object-cover" />
            )}
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

      {/* Brand promise band */}
      <section className="bg-black border-y border-white/10">
        <div className="container mx-auto px-4 py-10 grid gap-6 sm:grid-cols-3 text-center">
          {[
            { t: "Free Delivery", s: "All orders, all over Pakistan" },
            { t: "Cash on Delivery", s: "Pay when your scent arrives" },
            { t: "7-Day Returns", s: "Unopened bottles, full refund" },
          ].map((b) => (
            <div key={b.t}>
              <h3 className="font-display text-xl text-gold">{b.t}</h3>
              <p className="text-sm text-white/60 mt-1">{b.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editable promo banner (after free-delivery band) */}
      {promo && (
        <section className="bg-black">
          <Link to={promo.link_url ?? "/shop"} aria-label={promo.title ?? "Promo"} className="block group overflow-hidden">
            <div className="relative">
              <BannerImg b={promo} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
              {(promo.title || promo.subtitle) && (
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-6 text-white">
                    {promo.title && <h2 className="font-display text-2xl sm:text-4xl md:text-5xl max-w-2xl">{promo.title}</h2>}
                    {promo.subtitle && <p className="mt-2 max-w-xl text-sm sm:text-base text-white/80">{promo.subtitle}</p>}
                  </div>
                </div>
              )}
            </div>
          </Link>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-black text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Explore</p>
              <h2 className="font-display text-4xl sm:text-5xl mt-2">{home.categories_heading ?? "Shop by Collection"}</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c, i) => (
                <Link
                  key={c.id}
                  to="/shop"
                  search={{ category: c.slug } as any}
                  className="group relative aspect-[4/3] overflow-hidden border border-white/10 hover:border-gold transition"
                >
                  <img
                    src={`/images/perfume-${(i % 9) + 1}.jpg`}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-2xl sm:text-3xl text-white">{c.name}</h3>
                    <span className="mt-1 inline-block text-xs uppercase tracking-[0.2em] text-gold opacity-0 group-hover:opacity-100 transition">Shop now →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="bg-black text-white py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Curated Selection</p>
            <h2 className="font-display text-4xl sm:text-5xl mt-3">{home.featured_heading ?? "Our Premium Fragrances"}</h2>
            <p className="text-white/60 mt-3">{home.featured_subheading ?? "Signature scents, hand-picked this season."}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop">
              <Button variant="outline" className="border-gold text-gold bg-transparent hover:bg-gold hover:text-black uppercase tracking-[0.2em] text-xs px-8 py-6 rounded-none">
                View All Fragrances
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-black text-white border-t border-white/10">
        <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Our Story</p>
            <h2 className="font-display text-4xl sm:text-5xl mt-3">Bottled romance, page by page.</h2>
            <p className="mt-5 text-white/70 leading-relaxed">
              Every Z Shaikh perfume is named after an unforgettable Urdu novel character — Umrao Jaan, Heer, Sassi, Mahjabeen — and crafted to feel like wearing their world. French perfumery technique meets traditional South Asian attar craft.
            </p>
            <Link to="/about" className="inline-block mt-6 text-sm uppercase tracking-[0.2em] text-gold border-b border-gold pb-1">
              Read our story →
            </Link>
          </div>
          <div className="aspect-[4/5] overflow-hidden">
            <img src="/images/perfume-3.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>
    </div>
  );
}
