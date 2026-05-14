import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      const [p, o] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);
      const revenue = (o.data ?? []).reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);
      setStats({ products: p.count ?? 0, orders: (o.data ?? []).length, revenue });
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">Welcome back</h1>
      <p className="text-muted-foreground mt-1">Here's what's happening in your store.</p>
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {[
          { label: "Products", value: stats.products },
          { label: "Orders", value: stats.orders },
          { label: "Revenue", value: formatPKR(stats.revenue) },
        ].map((s) => (
          <div key={s.label} className="p-6 border border-border bg-card">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
            <p className="font-display text-3xl mt-2">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 p-6 border border-border bg-secondary/30 text-sm">
        <h2 className="font-display text-xl mb-3">Quick actions</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Edit products, prices and images in <strong>Products</strong></li>
          <li>Update return / exchange / privacy text in <strong>Pages</strong></li>
          <li>Change the homepage hero image and link in <strong>Banners</strong></li>
          <li>Update the promo bar messages and WhatsApp number in <strong>Settings</strong></li>
        </ul>
      </div>
    </div>
  );
}
