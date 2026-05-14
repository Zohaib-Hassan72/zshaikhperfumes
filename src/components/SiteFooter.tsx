import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  const [contact, setContact] = useState<any>({});
  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle()
      .then(({ data }) => setContact(data?.value ?? {}));
  }, []);

  return (
    <footer className="mt-24 bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Z Shaikh" className="h-12 w-auto bg-background/10 p-1 rounded-sm" />
            <span className="font-display text-xl tracking-[0.2em]">Z SHAIKH</span>
          </div>
          <p className="mt-4 text-sm text-sidebar-foreground/70 leading-relaxed">
            Hand-crafted premium fragrances inspired by the romance of Urdu literature.
          </p>
          <div className="mt-4 flex gap-3">
            {contact?.instagram && <a href={contact.instagram} aria-label="Instagram" className="hover:text-gold"><Instagram className="h-5 w-5" /></a>}
            {contact?.facebook && <a href={contact.facebook} aria-label="Facebook" className="hover:text-gold"><Facebook className="h-5 w-5" /></a>}
          </div>
        </div>
        <div>
          <h4 className="text-gold uppercase text-xs tracking-[0.2em] mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/80">
            <li><Link to="/shop" className="hover:text-gold">All Fragrances</Link></li>
            <li><Link to="/shop" search={{ category: "women" }} className="hover:text-gold">For Her</Link></li>
            <li><Link to="/shop" search={{ category: "men" }} className="hover:text-gold">For Him</Link></li>
            <li><Link to="/shop" search={{ category: "attar" }} className="hover:text-gold">Attar Collection</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-gold uppercase text-xs tracking-[0.2em] mb-4">Help</h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/80">
            <li><Link to="/pages/$slug" params={{ slug: "shipping" }} className="hover:text-gold">Shipping & Delivery</Link></li>
            <li><Link to="/pages/$slug" params={{ slug: "return-policy" }} className="hover:text-gold">Return Policy</Link></li>
            <li><Link to="/pages/$slug" params={{ slug: "exchange-policy" }} className="hover:text-gold">Exchange Policy</Link></li>
            <li><Link to="/pages/$slug" params={{ slug: "privacy-policy" }} className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-gold uppercase text-xs tracking-[0.2em] mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-sidebar-foreground/80">
            {contact?.phone && <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5" /> {contact.phone}</li>}
            {contact?.email && <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5" /> {contact.email}</li>}
            {contact?.address && <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" /> {contact.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="container mx-auto px-4 py-5 text-xs text-sidebar-foreground/60 flex flex-wrap gap-2 justify-between">
          <p>© {new Date().getFullYear()} Z Shaikh Perfumes. All rights reserved.</p>
          <p>Cash on Delivery · Free Shipping across Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
