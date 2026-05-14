import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { formatPKR } from "@/lib/format";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "For Her", to: "/shop", search: { category: "women" } },
  { label: "For Him", to: "/shop", search: { category: "men" } },
  { label: "Attar", to: "/shop", search: { category: "attar" } },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-20">
          {/* Left: hamburger / sider */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[360px] bg-sidebar text-sidebar-foreground border-sidebar-border">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl text-sidebar-foreground">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col">
                  {NAV.map((n) => (
                    <Link
                      key={n.label}
                      to={n.to as any}
                      search={(n as any).search}
                      className="px-2 py-3 border-b border-sidebar-border hover:text-gold transition-colors text-base tracking-wide"
                    >
                      {n.label}
                    </Link>
                  ))}
                  <Link to="/cart" className="px-2 py-3 border-b border-sidebar-border hover:text-gold">Cart ({count})</Link>
                  {isAdmin && <Link to="/admin" className="px-2 py-3 border-b border-sidebar-border text-gold">Dashboard</Link>}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center: logo */}
          <div className="flex justify-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/logo.png" alt="Z Shaikh Perfumes" className="h-12 w-auto" />
              <span className="hidden md:inline font-display text-xl tracking-[0.2em] uppercase">Z Shaikh</span>
            </Link>
          </div>

          {/* Right: search, login, cart */}
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Link to={user ? (isAdmin ? "/admin" : "/account") : "/login"}>
              <Button variant="ghost" size="icon" aria-label="Account">
                <UserIcon className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
              </Button>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-gold-foreground text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop secondary nav */}
        <nav className="hidden lg:flex items-center justify-center gap-8 pb-3 -mt-2">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to as any}
              search={(n as any).search}
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
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
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur" role="dialog" aria-label="Search">
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
