import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Facebook, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  const [contact, setContact] = useState<any>({});
  const [logoUrl, setLogoUrl] = useState("/images/logo.png");
  const [siteName, setSiteName] = useState("Z Shaikh");

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle()
      .then(({ data }) => setContact(data?.value ?? {}));
    supabase.from("site_settings").select("value").eq("key", "branding").maybeSingle()
      .then(({ data }) => {
        const v = data?.value as { logo_url?: string; site_name?: string } | null;
        if (v?.logo_url) setLogoUrl(v.logo_url);
        if (v?.site_name) setSiteName(v.site_name);
      });
  }, []);

  return (
    <footer className="bg-black text-white border-t border-gold/30">
      {/* Newsletter band */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
          <Sparkles className="h-6 w-6 text-gold mb-3" />
          <h3 className="font-display text-3xl sm:text-4xl text-gold">Join the Inner Circle</h3>
          <p className="mt-2 text-sm text-white/60 max-w-md">
            Subscribe for early access to new releases, private launches, and storytelling notes from our perfumers.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="mt-6 flex flex-col sm:flex-row gap-2 w-full max-w-md"
          >
            <Input
              type="email"
              required
              placeholder="your@email.com"
              className="bg-white/5 border-white/15 text-white placeholder:text-white/40 rounded-none h-12"
            />
            <Button type="submit" className="bg-gold text-black hover:bg-gold/90 uppercase tracking-[0.2em] text-xs rounded-none h-12 px-6">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt={siteName} className="h-12 w-auto" />
          </div>
          <p className="mt-5 text-sm text-white/60 leading-relaxed">
            Hand-crafted premium fragrances inspired by the romance of Urdu literature — bottled poetry for the modern soul.
          </p>
          <div className="mt-5 flex gap-3">
            {contact?.instagram && (
              <a href={contact.instagram} aria-label="Instagram" className="w-10 h-10 border border-gold/40 text-gold hover:bg-gold hover:text-black flex items-center justify-center transition">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {contact?.facebook && (
              <a href={contact.facebook} aria-label="Facebook" className="w-10 h-10 border border-gold/40 text-gold hover:bg-gold hover:text-black flex items-center justify-center transition">
                <Facebook className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-gold uppercase text-xs tracking-[0.3em] mb-5">Shop</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link to="/shop" className="hover:text-gold transition">All Fragrances</Link></li>
            <li><Link to="/shop" search={{ category: "women" }} className="hover:text-gold transition">For Her</Link></li>
            <li><Link to="/shop" search={{ category: "men" }} className="hover:text-gold transition">For Him</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gold uppercase text-xs tracking-[0.3em] mb-5">Help</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link to="/pages/$slug" params={{ slug: "shipping" }} className="hover:text-gold transition">Shipping & Delivery</Link></li>
            <li><Link to="/pages/$slug" params={{ slug: "return-policy" }} className="hover:text-gold transition">Return Policy</Link></li>
            <li><Link to="/pages/$slug" params={{ slug: "exchange-policy" }} className="hover:text-gold transition">Exchange Policy</Link></li>
            <li><Link to="/pages/$slug" params={{ slug: "privacy-policy" }} className="hover:text-gold transition">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gold uppercase text-xs tracking-[0.3em] mb-5">Contact</h4>
          <ul className="space-y-3 text-sm text-white/70">
            {contact?.phone && <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-gold" /> {contact.phone}</li>}
            {contact?.email && <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-gold" /> {contact.email}</li>}
            {contact?.address && <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold" /> {contact.address}</li>}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 text-xs text-white/50 flex flex-wrap gap-2 justify-between">
          <p>© {new Date().getFullYear()} {siteName} Perfumes — All rights reserved.</p>
          <p className="text-gold/70">Cash on Delivery · Free Shipping across Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
