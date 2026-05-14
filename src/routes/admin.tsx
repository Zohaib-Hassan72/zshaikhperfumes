import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LayoutDashboard, Package, Image as ImageIcon, FileText, Settings, ShoppingBag, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [makingAdmin, setMakingAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  if (!isAdmin) {
    const claim = async () => {
      setMakingAdmin(true);
      // Check if any admin exists; if none, allow first user to claim
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
      if ((count ?? 0) === 0) {
        const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
        setMakingAdmin(false);
        if (error) return toast.error("Could not claim admin: " + error.message);
        toast.success("You are now admin. Reloading…");
        setTimeout(() => window.location.reload(), 800);
      } else {
        setMakingAdmin(false);
        toast.error("An admin already exists. Ask them to grant you access.");
      }
    };
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <h1 className="font-display text-3xl">Admin access required</h1>
        <p className="mt-3 text-muted-foreground text-sm">
          Signed in as <strong>{user.email}</strong>. If you're the site owner, claim admin access below (only works if no admin exists yet).
        </p>
        <Button onClick={claim} disabled={makingAdmin} className="mt-6 rounded-none uppercase tracking-[0.2em] text-xs">
          {makingAdmin ? "Claiming…" : "Claim Admin Access"}
        </Button>
        <Button variant="ghost" onClick={signOut} className="mt-3 w-full">Sign out</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Dashboard</p>
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to as any}
              activeOptions={{ exact: n.exact }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
          <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary w-full text-left mt-4">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>
        <section><Outlet /></section>
      </div>
    </div>
  );
}
