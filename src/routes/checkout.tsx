import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/format";
import { sendOrderConfirmation } from "@/lib/email.functions";

const EASYPAISA_DISCOUNT = 100;

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Z Shaikh Perfumes" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const sendEmail = useServerFn(sendOrderConfirmation);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<"cod" | "easypaisa">("cod");
  const [form, setForm] = useState({
    name: "", last_name: "", phone: "", email: "", address: "", city: "", notes: "",
  });

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-gold underline">Browse fragrances</Link>
      </div>
    );
  }

  const discount = payment === "easypaisa" ? EASYPAISA_DISCOUNT : 0;
  const total = Math.max(0, subtotal - discount);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast.error("Please complete all required fields"); return;
    }
    setSubmitting(true);
    const customerName = form.last_name ? `${form.name} ${form.last_name}` : form.name;
    const orderItems = items.map((i) => ({
      product_id: i.product_id, name: i.name, slug: i.slug, price: i.price, quantity: i.quantity,
    }));
    const { data, error } = await supabase.from("orders").insert({
      customer_name: customerName,
      phone: form.phone,
      email: form.email || null,
      address: form.address,
      city: form.city,
      notes: form.notes || null,
      items: orderItems,
      subtotal,
      shipping: 0,
      discount,
      total,
      payment_method: payment,
    }).select("order_number").single();

    if (error) {
      setSubmitting(false);
      toast.error("Couldn't place order. Please try again.");
      console.error(error); return;
    }

    // Fire-and-forget order confirmation email
    if (form.email) {
      try {
        await sendEmail({
          data: {
            to: form.email,
            customer_name: customerName,
            order_number: data.order_number,
            items: orderItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            subtotal, discount, total, payment_method: payment,
            address: form.address, city: form.city,
          },
        });
      } catch (err) {
        console.warn("Email send failed (order still placed):", err);
      }
    }

    setSubmitting(false);
    clear();
    navigate({ to: "/thanks", search: { order: data.order_number } });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="text-muted-foreground mt-1">Free shipping all over Pakistan · Delivery within 3 business days.</p>

      <form onSubmit={onSubmit} className="mt-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-5">
          <h2 className="font-display text-2xl">Delivery Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>First name *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Last name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Contact number *</Label>
            <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XX XXXXXXX" />
          </div>
          <div>
            <Label>Email <span className="text-muted-foreground text-xs">(optional — for order confirmation)</span></Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Full address *</Label>
            <Textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label>City *</Label>
            <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>

          <div>
            <Label>Order notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div>
            <h2 className="font-display text-2xl mt-6">Payment Method</h2>
            <div className="mt-3 space-y-3">
              <label className={`flex items-start gap-3 p-4 border cursor-pointer transition ${payment === "cod" ? "border-gold bg-gold/5" : "border-border"}`}>
                <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} className="mt-1" />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay full amount in cash when your fragrance arrives. Free shipping.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 border cursor-pointer transition ${payment === "easypaisa" ? "border-gold bg-gold/5" : "border-border"}`}>
                <input type="radio" name="payment" checked={payment === "easypaisa"} onChange={() => setPayment("easypaisa")} className="mt-1" />
                <div>
                  <p className="font-medium">Easypaisa Online Transfer <span className="ml-2 text-xs text-gold font-semibold">Save Rs 100</span></p>
                  <p className="text-xs text-muted-foreground">Pay online via Easypaisa & get an instant Rs 100 discount.</p>
                </div>
              </label>
            </div>
          </div>
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
              {discount > 0 && (
                <div className="flex justify-between text-gold"><span>Easypaisa discount</span><span>– {formatPKR(discount)}</span></div>
              )}
              <div className="flex justify-between"><span>Shipping</span><span className="text-gold">Free</span></div>
              <div className="flex justify-between font-display text-lg pt-2 border-t border-border"><span>Total</span><span>{formatPKR(total)}</span></div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full mt-5 rounded-none uppercase tracking-[0.2em] text-xs py-6">
              {submitting ? "Placing order…" : "Place Order"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-3">Delivery in 3 business days · CoD across Pakistan</p>
          </div>
        </div>
      </form>
    </div>
  );
}
