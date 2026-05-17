import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/settings")({ component: SettingsAdmin });

function SettingsAdmin() {
  const [contact, setContact] = useState<any>({});
  const [promo, setPromo] = useState<any>({ enabled: true, messages: [""] });
  const [home, setHome] = useState<any>({});
  const [branding, setBranding] = useState<any>({ site_name: "Z Shaikh", logo_url: "/images/logo.png" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("key,value").in("key", ["contact", "promo_bar", "home", "branding"]).then(({ data }) => {
      for (const r of data ?? []) {
        if (r.key === "contact") setContact(r.value);
        if (r.key === "promo_bar") setPromo(r.value);
        if (r.key === "home") setHome(r.value);
        if (r.key === "branding") setBranding(r.value);
      }
    });
  }, []);

  const saveAll = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert([
      { key: "contact", value: contact },
      { key: "promo_bar", value: promo },
      { key: "home", value: home },
      { key: "branding", value: branding },
    ]);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved — refresh to see header changes");
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <h1 className="font-display text-3xl">Settings</h1>

      <section>
        <h2 className="font-display text-xl mb-3">Brand / Logo</h2>
        <Label>Site name (shown next to logo)</Label>
        <Input value={branding.site_name ?? ""} onChange={(e) => setBranding({ ...branding, site_name: e.target.value })} />
        <Label className="mt-3 block">Logo image URL</Label>
        <Input value={branding.logo_url ?? ""} onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })} placeholder="https://… or /images/logo.png" />
        {branding.logo_url && (
          <div className="mt-3 p-4 bg-black inline-block rounded">
            <img src={branding.logo_url} alt="logo preview" className="h-12 w-auto object-contain" />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">Tip: upload your logo to any image host (e.g. imgur, cloudinary) and paste the URL here.</p>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Promo bar (top of every page)</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={promo.enabled ?? true} onChange={(e) => setPromo({ ...promo, enabled: e.target.checked })} /> Show promo bar</label>
        <Label className="mt-3 block">Messages (one per line — they rotate)</Label>
        <Textarea rows={4} value={(promo.messages ?? []).join("\n")} onChange={(e) => setPromo({ ...promo, messages: e.target.value.split("\n").filter(Boolean) })} />
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Homepage text</h2>
        <p className="text-xs text-muted-foreground mb-3">Banners (hero + promo + featured) are managed in the <b>Banners</b> tab. Categories shown on the home page come from the <b>Categories</b> table. Featured products are products marked "featured" in <b>Products</b>.</p>
        <Label>Categories section heading</Label><Input value={home.categories_heading ?? ""} onChange={(e) => setHome({ ...home, categories_heading: e.target.value })} placeholder="Shop by Collection" />
        <Label className="mt-3 block">Featured section heading</Label><Input value={home.featured_heading ?? ""} onChange={(e) => setHome({ ...home, featured_heading: e.target.value })} />
        <Label className="mt-3 block">Featured section subheading</Label><Input value={home.featured_subheading ?? ""} onChange={(e) => setHome({ ...home, featured_subheading: e.target.value })} />
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <h2 className="font-display text-xl mb-1 sm:col-span-2">Contact & Social Media</h2>
        <div><Label>WhatsApp number (with country code, no +)</Label><Input value={contact.whatsapp ?? ""} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} placeholder="923001234567" /></div>
        <div><Label>Phone</Label><Input value={contact.phone ?? ""} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
        <div><Label>Email</Label><Input value={contact.email ?? ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
        <div><Label>Address</Label><Input value={contact.address ?? ""} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
        <div><Label>Instagram URL</Label><Input value={contact.instagram ?? ""} onChange={(e) => setContact({ ...contact, instagram: e.target.value })} placeholder="https://instagram.com/…" /></div>
        <div><Label>Facebook URL</Label><Input value={contact.facebook ?? ""} onChange={(e) => setContact({ ...contact, facebook: e.target.value })} placeholder="https://facebook.com/…" /></div>
        <div><Label>TikTok URL</Label><Input value={contact.tiktok ?? ""} onChange={(e) => setContact({ ...contact, tiktok: e.target.value })} placeholder="https://tiktok.com/@…" /></div>
        <div><Label>YouTube URL</Label><Input value={contact.youtube ?? ""} onChange={(e) => setContact({ ...contact, youtube: e.target.value })} /></div>
      </section>

      <Button onClick={saveAll} disabled={busy} className="rounded-none uppercase text-xs tracking-[0.2em]">{busy ? "Saving…" : "Save all settings"}</Button>
    </div>
  );
}
