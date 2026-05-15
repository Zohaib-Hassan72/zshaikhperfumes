import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/format";
import { sendOrderConfirmation } from "@/lib/email.functions";

const EASYPAISA_DISCOUNT = 100;

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const CheckoutCtx = createContext<Ctx | null>(null);

export function useCheckoutSheet() {
  const ctx = useContext(CheckoutCtx);
  if (!ctx) throw new Error("useCheckoutSheet must be used within CheckoutSheetProvider");
  return ctx;
}

export function CheckoutSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CheckoutCtx.Provider value={{ open, setOpen }}>
      {children}
      <CheckoutSheet open={open} onOpenChange={setOpen} />
    </CheckoutCtx.Provider>
  );
}

function CheckoutSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const sendEmail = useServerFn(sendOrderConfirmation);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<"cod" | "easypaisa">("cod");
  const [form, setForm] = useState({
    name: "", last_name: "", phone: "", email: "", address: "", city: "", notes: "",
  });

  const discount = payment === "easypaisa" ? EASYPAISA_DISCOUNT : 0;
  const total = Math.max(0, subtotal - discount);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast.error("Please complete all required fields"); return;
    }
    if (items.length === 0) { toast.error("Your cart is empty"); return; }
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
      subtotal, shipping: 0, discount, total,
      payment_method: payment,
    }).select("order_number").single();

    if (error) {
      setSubmitting(false);
      toast.error("Couldn't place order. Please try again.");
      console.error(error); return;
    }

    if (form.email) {
      try {
        await sendEmail({
          data: {
            to: form.email, customer_name: customerName, order_number: data.order_number,
            items: orderItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            subtotal, discount, total, payment_method: payment,
            address: form.address, city: form.city,
          },
        });
      } catch (err) { console.warn("Email send failed:", err); }
    }

    setSubmitting(false);
    clear();
    onOpenChange(false);
    navigate({ to: "/thanks", search: { order: data.order_number } });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-background">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Checkout</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm mt-8 text-center">Your cart is empty.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First name *</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Contact number *</Label>
              <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XX XXXXXXX" />
            </div>
            <div>
              <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
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
              <Label>Order notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-display text-lg">Payment</p>
              <label className={`flex items-start gap-3 p-3 border cursor-pointer text-sm ${payment === "cod" ? "border-gold bg-gold/5" : "border-border"}`}>
                <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} className="mt-1" />
                <div><p className="font-medium">Cash on Delivery</p><p className="text-xs text-muted-foreground">Free shipping. Pay on arrival.</p></div>
              </label>
              <label className={`flex items-start gap-3 p-3 border cursor-pointer text-sm ${payment === "easypaisa" ? "border-gold bg-gold/5" : "border-border"}`}>
                <input type="radio" checked={payment === "easypaisa"} onChange={() => setPayment("easypaisa")} className="mt-1" />
                <div><p className="font-medium">Easypaisa <span className="ml-1 text-xs text-gold">Save Rs 100</span></p><p className="text-xs text-muted-foreground">Pay online & get instant Rs 100 off.</p></div>
              </label>
            </div>

            <div className="border-t border-border pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-gold"><span>Discount</span><span>– {formatPKR(discount)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span className="text-gold">Free</span></div>
              <div className="flex justify-between font-display text-lg pt-2 border-t border-border"><span>Total</span><span>{formatPKR(total)}</span></div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full rounded-none uppercase tracking-[0.2em] text-xs py-6">
              {submitting ? "Placing order…" : "Place Order"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Delivery in 3 business days · CoD across Pakistan</p>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
