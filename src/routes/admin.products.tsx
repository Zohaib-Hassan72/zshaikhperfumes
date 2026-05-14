import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const load = () => supabase.from("products").select("*").order("sort_order").then(({ data }) => setItems((data ?? []) as Product[]));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload: any = {
      slug: editing.slug,
      name: editing.name,
      short_description: editing.short_description ?? null,
      long_description: editing.long_description ?? null,
      price: Number(editing.price ?? 0),
      sale_price: editing.sale_price ? Number(editing.sale_price) : null,
      images: typeof editing.images === "string" ? [editing.images as any] : (editing.images ?? []),
      category_slug: editing.category_slug ?? null,
      in_stock: editing.in_stock ?? true,
      featured: editing.featured ?? false,
      sort_order: Number(editing.sort_order ?? 0),
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <Button onClick={() => setEditing({ in_stock: true, featured: false, price: 0, images: [] })} className="rounded-none uppercase text-xs tracking-[0.2em]">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      <div className="mt-6 border border-border divide-y divide-border">
        {items.map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-4">
            <img src={(p.images?.[0] ?? "/images/perfume-1.jpg")} alt="" className="h-14 w-14 object-cover rounded-sm" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg">{p.name}</p>
              <p className="text-xs text-muted-foreground">/{p.slug} · {p.category_slug} · Rs {p.price}{p.sale_price ? ` (sale Rs ${p.sale_price})` : ""}</p>
            </div>
            {p.featured && <span className="text-xs bg-gold text-gold-foreground px-2 py-0.5">Featured</span>}
            {!p.in_stock && <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5">Sold out</span>}
            <Button size="sm" variant="outline" onClick={() => setEditing({ ...p, images: p.images?.[0] as any })}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-background w-full max-w-2xl p-6 max-h-[90vh] overflow-auto">
            <h2 className="font-display text-2xl mb-4">{editing.id ? "Edit" : "New"} Product</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="umrao-jaan" /></div>
              <div><Label>Price (Rs)</Label><Input type="number" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
              <div><Label>Sale Price (optional)</Label><Input type="number" value={editing.sale_price ?? ""} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value ? Number(e.target.value) : null })} /></div>
              <div><Label>Category</Label>
                <select className="w-full border border-input bg-background h-9 px-2" value={editing.category_slug ?? ""} onChange={(e) => setEditing({ ...editing, category_slug: e.target.value })}>
                  <option value="">—</option><option value="women">For Her</option><option value="men">For Him</option><option value="unisex">Unisex</option><option value="attar">Attar</option>
                </select>
              </div>
              <div><Label>Image URL</Label><Input value={(editing.images as any) ?? ""} onChange={(e) => setEditing({ ...editing, images: e.target.value as any })} placeholder="/images/perfume-1.jpg" /></div>
              <div><Label>Sort order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              <div className="flex gap-4 items-end">
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.in_stock ?? true} onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })} /> In stock</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.featured ?? false} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured</label>
              </div>
              <div className="sm:col-span-2"><Label>Short description</Label><Input value={editing.short_description ?? ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Long description</Label><Textarea rows={5} value={editing.long_description ?? ""} onChange={(e) => setEditing({ ...editing, long_description: e.target.value })} /></div>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
