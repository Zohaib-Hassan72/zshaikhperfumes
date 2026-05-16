import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useCartDrawer } from "@/components/CartDrawer";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { formatPKR } from "@/lib/format";

const NAV = [
  { label: "Shop", to: "/shop" },
  { label: "For Her", to: "/shop", search: { category: "women" } },
  { label: "For Him", to: "/shop", search: { category: "men" } },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const { count } = useCart();
  const { setOpen: openCart } = useCartDrawer();
  const { user, isAdmin } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/images/logo.png");
  const [siteName, setSiteName] = useState("Z Shaikh");

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "branding").maybeSingle()
      .then(({ data }) => {
        const v = data?.value as { logo_url?: string; site_name?: string } | null;
        if (v?.logo_url) setLogoUrl(v.logo_url);
        if (v?.site_name) setSiteName(v.site_name);
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 h-16 sm:h-20">
          {/* Left: hamburger + search */}
          <div className="flex items-center gap-1 sm:gap-2 justify-start">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="text-white hover:bg-white/15 hover:text-gold">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[360px] bg-black text-white border-white/10">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl text-gold">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col">
                  {NAV.map((n) => (
                    <Link
                      key={n.label}
                      to={n.to as any}
                      search={(n as any).search}
                      className="px-2 py-3 border-b border-white/10 hover:text-gold transition-colors"
                    >
                      {n.label}
                    </Link>
                  ))}
                  <button onClick={() => openCart(true)} className="text-left px-2 py-3 border-b border-white/10 hover:text-gold">Cart ({count})</button>
                  {isAdmin && <Link to="/admin" className="px-2 py-3 border-b border-white/10 text-gold">Dashboard</Link>}
                </nav>
              </SheetContent>
            </Sheet>
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-full px-5 py-2.5 w-64 lg:w-80 text-sm transition"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search fragrances…</span>
            </button>
          </div>

          {/* Center: logo only */}
          <Link to="/" className="flex items-center justify-center" aria-label={siteName}>
            <img src={logoUrl} alt={siteName} className="h-10 sm:h-14 w-auto object-contain" />
          </Link>

          {/* Right: search (mobile), account, cart */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)} className="md:hidden text-white hover:bg-white/15 hover:text-gold">
              <Search className="h-5 w-5" />
            </Button>
            <Link to={user ? (isAdmin ? "/admin" : "/account") : "/login"} aria-label="Account">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-gold">
                <UserIcon className="h-5 w-5" />
              </Button>
            </Link>
            <button onClick={() => openCart(true)} aria-label="Open cart" className="relative p-2 text-white hover:text-gold transition">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop nav row */}
        <nav className="hidden lg:flex items-center justify-center gap-10 py-3 border-t border-white/10">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to as any}
              search={(n as any).search}
              className="text-xs uppercase tracking-[0.25em] text-white/80 hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) { setQ(""); setResults([]); return; }
  }, [open]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${q}%,short_description.ilike.%${q}%`)
        .limit(8);
      setResults((data ?? []) as Product[]);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur animate-in fade-in" role="dialog" aria-label="Search">
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fragrances…"
            className="border-0 shadow-none text-lg focus-visible:ring-0"
          />
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-6 max-w-2xl mx-auto">
          {results.length === 0 && q && (
            <p className="text-muted-foreground text-sm py-8 text-center">No matches for "{q}"</p>
          )}
          <ul>
            {results.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => { onOpenChange(false); navigate({ to: "/products/$slug", params: { slug: p.slug } }); }}
                  className="w-full flex items-center gap-4 py-3 border-b border-border hover:bg-muted/40 px-2 text-left"
                >
                  <img src={p.images[0] ?? "/images/perfume-1.jpg"} alt="" className="h-14 w-14 object-cover rounded-sm" />
                  <div className="flex-1">
                    <p className="font-display text-lg">{p.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{p.short_description}</p>
                  </div>
                  <span className="text-sm">{formatPKR(p.sale_price ?? p.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
