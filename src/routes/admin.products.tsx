import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";
import { Trash2, Plus, Upload, X, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

type EditState = Partial<Product> & { images?: string[] };

function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () =>
    supabase.from("products").select("*").order("sort_order")
      .then(({ data }) => setItems((data ?? []) as Product[]));
  useEffect(() => { load(); }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editing) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (error) { toast.error(`Upload failed: ${error.message}`); continue; }
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      uploaded.push(pub.publicUrl);
    }
    setEditing({ ...editing, images: [...(editing.images ?? []), ...uploaded] });
    setUploading(false);
    if (uploaded.length) toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    if (!editing) return;
    const next = [...(editing.images ?? [])];
    next.splice(idx, 1);
    setEditing({ ...editing, images: next });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name || !editing.slug) return toast.error("Name and slug required");
    const payload: any = {
      slug: editing.slug,
      name: editing.name,
      short_description: editing.short_description ?? null,
      long_description: editing.long_description ?? null,
      price: Number(editing.price ?? 0),
      sale_price: editing.sale_price ? Number(editing.sale_price) : null,
      images: editing.images ?? [],
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
        <Button
          onClick={() => setEditing({ in_stock: true, featured: false, price: 0, images: [] })}
          className="rounded-none uppercase text-xs tracking-[0.2em]"
        >
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      <div className="mt-6 border border-border divide-y divide-border">
        {items.map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-4">
            <img src={p.images?.[0] ?? "/images/perfume-1.jpg"} alt="" className="h-14 w-14 object-cover rounded-sm" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                /{p.slug} · {p.category_slug} · Rs {p.price}{p.sale_price ? ` (sale Rs ${p.sale_price})` : ""} · {p.images?.length ?? 0} image{(p.images?.length ?? 0) !== 1 ? "s" : ""}
              </p>
            </div>
            {p.featured && <span className="text-xs bg-gold text-gold-foreground px-2 py-0.5">Featured</span>}
            {!p.in_stock && <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5">Sold out</span>}
            <Button size="sm" variant="outline" onClick={() => setEditing({ ...p, images: p.images ?? [] })}>Edit</Button>
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
              <div>
                <Label>Category</Label>
                <select className="w-full border border-input bg-background h-9 px-2" value={editing.category_slug ?? ""} onChange={(e) => setEditing({ ...editing, category_slug: e.target.value })}>
                  <option value="">—</option>
                  <option value="women">For Her</option>
                  <option value="men">For Him</option>
                  <option value="unisex">Unisex</option>
                  <option value="oud">Oud</option>
                </select>
              </div>
              <div><Label>Sort order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              <div className="flex gap-4 items-end sm:col-span-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.in_stock ?? true} onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })} /> In stock</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.featured ?? false} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured</label>
              </div>
              <div className="sm:col-span-2"><Label>Short description</Label><Input value={editing.short_description ?? ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Long description</Label><Textarea rows={5} value={editing.long_description ?? ""} onChange={(e) => setEditing({ ...editing, long_description: e.target.value })} /></div>

              {/* Multi-image upload */}
              <div className="sm:col-span-2">
                <Label>Product images</Label>
                <p className="text-xs text-muted-foreground mb-2">First image is the cover. Upload multiple for the gallery.</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {(editing.images ?? []).map((src, i) => (
                    <div key={i} className="relative aspect-square border border-border group">
                      <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute top-1 left-1 bg-gold text-gold-foreground text-[9px] px-1.5 py-0.5 uppercase tracking-wider">Cover</span>}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer text-xs text-muted-foreground hover:text-primary transition">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                    <span className="mt-1">{uploading ? "Uploading…" : "Upload"}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => handleUpload(e.target.files)}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={uploading}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
