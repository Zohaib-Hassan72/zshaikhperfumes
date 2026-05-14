import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Page } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/pages")({ component: PagesAdmin });

function PagesAdmin() {
  const [items, setItems] = useState<Page[]>([]);
  const [editing, setEditing] = useState<Partial<Page> | null>(null);

  const load = () => supabase.from("pages").select("*").order("title").then(({ data }) => setItems((data ?? []) as Page[]));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload: any = {
      slug: editing.slug, title: editing.title, content: editing.content ?? "",
      page_type: editing.page_type ?? "custom", published: editing.published ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("pages").update(payload).eq("id", editing.id)
      : await supabase.from("pages").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Pages</h1>
        <Button onClick={() => setEditing({ published: true, page_type: "custom" })} className="rounded-none uppercase text-xs tracking-[0.2em]"><Plus className="h-4 w-4 mr-1" /> New page</Button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Edit return/exchange/privacy/about/contact policies — or add new pages.</p>

      <div className="mt-6 border border-border divide-y divide-border">
        {items.map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-display text-lg">{p.title}</p>
              <p className="text-xs text-muted-foreground">/pages/{p.slug} · {p.page_type} {p.published ? "" : "· Draft"}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("pages").delete().eq("id", p.id); load(); } }}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-background w-full max-w-3xl p-6 max-h-[90vh] overflow-auto">
            <h2 className="font-display text-2xl mb-4">{editing.id ? "Edit" : "New"} Page</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Title</Label><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="return-policy" /></div>
              <div><Label>Type</Label>
                <select className="w-full border border-input bg-background h-9 px-2" value={editing.page_type ?? "custom"} onChange={(e) => setEditing({ ...editing, page_type: e.target.value })}>
                  <option value="custom">Custom</option><option value="policy">Policy</option><option value="home">Home</option>
                </select>
              </div>
              <div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label></div>
              <div className="sm:col-span-2"><Label>Content (HTML supported)</Label><Textarea rows={14} value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
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
