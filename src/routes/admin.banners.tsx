import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Banner } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/banners")({ component: BannersAdmin });

function BannersAdmin() {
  const [items, setItems] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);

  const load = () => supabase.from("banners").select("*").order("sort_order").then(({ data }) => setItems((data ?? []) as Banner[]));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload: any = {
      key: editing.key ?? "hero", title: editing.title ?? null, subtitle: editing.subtitle ?? null,
      image_url: editing.image_url ?? null,
      image_url_mobile: editing.image_url_mobile ?? null,
      link_url: editing.link_url ?? "/shop",
      active: editing.active ?? true, sort_order: Number(editing.sort_order ?? 0),
    };
    const { error } = editing.id
      ? await supabase.from("banners").update(payload).eq("id", editing.id)
      : await supabase.from("banners").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  };

  const uploadImage = async (file: File, field: "image_url" | "image_url_mobile", inputEl?: HTMLInputElement | null) => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const tId = toast.loading("Uploading…");
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error(error.message, { id: tId }); if (inputEl) inputEl.value = ""; return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEditing((cur) => ({ ...(cur ?? {}), [field]: data.publicUrl }));
    toast.success("Uploaded", { id: tId });
    if (inputEl) inputEl.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Banners</h1>
        <Button onClick={() => setEditing({ key: "hero", active: true, link_url: "/shop" })} className="rounded-none uppercase text-xs tracking-[0.2em]"><Plus className="h-4 w-4 mr-1" /> New</Button>
      </div>
          <p className="text-sm text-muted-foreground mt-1">
            Banner keys: <b>hero</b> = top of homepage. <b>promo</b> = strip below the free-delivery band. <b>featured</b> = optional banner above featured grid. Each banner supports a desktop image (wide, ~1920×800) and a separate mobile image (portrait, ~800×1000) plus a click-through link.
          </p>

      <div className="mt-6 border border-border divide-y divide-border">
        {items.map((b) => (
          <div key={b.id} className="p-4 flex items-center gap-4">
            <img src={b.image_url ?? ""} alt="" className="h-14 w-24 object-cover rounded-sm bg-muted" />
            <div className="flex-1">
              <p className="font-display text-lg">{b.title || "(untitled)"}</p>
              <p className="text-xs text-muted-foreground">key: {b.key} · → {b.link_url} {b.active ? "" : "· Inactive"}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing(b)}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("banners").delete().eq("id", b.id); load(); } }}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-background w-full max-w-2xl p-6 max-h-[90vh] overflow-auto">
            <h2 className="font-display text-2xl mb-4">{editing.id ? "Edit" : "New"} Banner</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Key</Label>
                <select className="w-full border border-input bg-background h-9 px-2" value={editing.key ?? "hero"} onChange={(e) => setEditing({ ...editing, key: e.target.value })}>
                  <option value="hero">Hero (homepage top)</option>
                  <option value="promo">Promo (below feature band)</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
              <div><Label>Sort order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              <div className="sm:col-span-2"><Label>Title</Label><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Subtitle</Label><Input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>

              <div className="sm:col-span-2">
                <Label>Desktop image (wide)</Label>
                <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, "image_url"); }} />
                {editing.image_url && <img src={editing.image_url} alt="" className="mt-2 h-24 object-cover border border-border" />}
                <Input className="mt-2" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="Or paste URL" />
              </div>

              <div className="sm:col-span-2">
                <Label>Mobile image (portrait)</Label>
                <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, "image_url_mobile"); }} />
                {editing.image_url_mobile && <img src={editing.image_url_mobile} alt="" className="mt-2 h-32 object-cover border border-border" />}
                <Input className="mt-2" value={editing.image_url_mobile ?? ""} onChange={(e) => setEditing({ ...editing, image_url_mobile: e.target.value })} placeholder="Or paste URL (falls back to desktop image if empty)" />
              </div>

              <div className="sm:col-span-2"><Label>Link URL (where to go when clicked)</Label><Input value={editing.link_url ?? ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} placeholder="/shop or https://…" /></div>
              <div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" checked={editing.active ?? true} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label></div>
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
