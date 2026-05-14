import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

type Search = { category?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => ({ meta: [{ title: "Shop All Fragrances — Z Shaikh Perfumes" }] }),
  component: ShopPage,
});

function ShopPage() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
  }, []);

  useEffect(() => {
    let q = supabase.from("products").select("*").order("sort_order");
    if (category) q = q.eq("category_slug", category);
    q.then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [category]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Shop</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-3">All Fragrances</h1>
        <p className="text-muted-foreground mt-3">Explore the full Z Shaikh collection.</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-10">
        <button
          onClick={() => navigate({ search: {} })}
          className={`px-4 py-2 text-xs uppercase tracking-[0.18em] border ${!category ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate({ search: { category: c.slug } })}
            className={`px-4 py-2 text-xs uppercase tracking-[0.18em] border ${category === c.slug ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {products.length === 0 && <p className="text-center text-muted-foreground py-20">No products in this category yet.</p>}
    </div>
  );
}
