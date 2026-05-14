import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Z Shaikh Perfumes" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", notes: "" });

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-gold underline">Browse fragrances</Link>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast.error("Please complete all required fields"); return;
    }
    setSubmitting(true);
    const orderItems = items.map((i) => ({
      product_id: i.product_id, name: i.name, slug: i.slug, price: i.price, quantity: i.quantity,
    }));
    const { data, error } = await supabase.from("orders").insert({
      customer_name: form.name,
      phone: form.phone,
      email: form.email || null,
      address: form.address,
      city: form.city,
      notes: form.notes || null,
      items: orderItems,
      subtotal,
      shipping: 0,
      total: subtotal,
      payment_method: "cod",
    }).select("order_number").single();
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't place order. Please try again.");
      console.error(error); return;
    }
    clear();
    navigate({ to: "/thanks", search: { order: data.order_number } });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="text-muted-foreground mt-1">Cash on delivery — pay when your fragrance arrives.</p>

      <form onSubmit={onSubmit} className="mt-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-5">
          <h2 className="font-display text-2xl">Delivery Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Full name *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Phone *</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XX XXXXXXX" /></div>
          </div>
          <div><Label>Email (optional)</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Address *</Label><Textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label>City *</Label><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div><Label>Order notes (optional)</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>

        <div>
          <div className="bg-secondary/40 p-6 rounded-sm sticky top-28">
            <h2 className="font-display text-xl mb-4">Order Summary</h2>
            <ul className="space-y-3 mb-4">
              {items.map((i) => (
                <li key={i.product_id} className="flex justify-between text-sm">
                  <span>{i.name} × {i.quantity}</span>
                  <span>{formatPKR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-gold">Free</span></div>
              <div className="flex justify-between font-display text-lg pt-2 border-t border-border"><span>Total</span><span>{formatPKR(subtotal)}</span></div>
            </div>
            <div className="mt-4 p-3 bg-background border border-border text-xs text-muted-foreground">
              <strong className="text-foreground">Cash on Delivery</strong> — pay in cash when your order arrives.
            </div>
            <Button type="submit" disabled={submitting} className="w-full mt-5 rounded-none uppercase tracking-[0.2em] text-xs py-6">
              {submitting ? "Placing order…" : "Place Order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
