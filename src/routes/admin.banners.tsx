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
      image_url: editing.image_url ?? null, link_url: editing.link_url ?? "/shop",
      active: editing.active ?? true, sort_order: Number(editing.sort_order ?? 0),
    };
    const { error } = editing.id
      ? await supabase.from("banners").update(payload).eq("id", editing.id)
      : await supabase.from("banners").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Banners</h1>
        <Button onClick={() => setEditing({ key: "hero", active: true, link_url: "/shop" })} className="rounded-none uppercase text-xs tracking-[0.2em]"><Plus className="h-4 w-4 mr-1" /> New</Button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">The "hero" banner shows on the homepage. Click the banner on the site to follow its link.</p>

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
                  <option value="hero">Hero (homepage)</option><option value="featured">Featured</option><option value="promo">Promo</option>
                </select>
              </div>
              <div><Label>Sort order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              <div className="sm:col-span-2"><Label>Title</Label><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Subtitle</Label><Input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Image URL</Label><Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="/images/hero-banner.jpg" /></div>
              <div className="sm:col-span-2"><Label>Link URL</Label><Input value={editing.link_url ?? ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} placeholder="/shop" /></div>
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
