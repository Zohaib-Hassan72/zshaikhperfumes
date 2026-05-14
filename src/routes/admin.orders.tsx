import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const load = () => supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setOrders(data ?? []));
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <div className="mt-6 border border-border divide-y divide-border">
        {orders.length === 0 && <p className="p-6 text-muted-foreground text-sm">No orders yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <p className="font-display text-lg">{o.order_number}</p>
              <span className="text-xs px-2 py-0.5 bg-secondary">{o.status}</span>
              <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</span>
              <span className="ml-auto font-medium">{formatPKR(Number(o.total))}</span>
            </div>
            <p className="text-sm mt-1">{o.customer_name} · {o.phone}{o.email ? ` · ${o.email}` : ""}</p>
            <p className="text-xs text-muted-foreground">{o.address}, {o.city}</p>
            <ul className="text-xs mt-2 text-muted-foreground">
              {(o.items ?? []).map((i: any, idx: number) => (
                <li key={idx}>• {i.name} × {i.quantity} — {formatPKR(i.price * i.quantity)}</li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2 flex-wrap">
              {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                <Button key={s} size="sm" variant={o.status === s ? "default" : "outline"} onClick={() => setStatus(o.id, s)}>{s}</Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
