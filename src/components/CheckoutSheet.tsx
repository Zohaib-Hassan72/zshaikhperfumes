import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Banknote, Smartphone } from "lucide-react";
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
  const [whatsappCopy, setWhatsappCopy] = useState(false);
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

    if (whatsappCopy) {
      const { data: contact } = await supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle();
      const wa = (contact?.value as any)?.whatsapp || "923001234567";
      const lines = orderItems.map((i) => `• ${i.name} × ${i.quantity} — ${formatPKR(i.price * i.quantity)}`).join("%0A");
      const msg = `*New order ${data.order_number}*%0A${lines}%0A%0ATotal: ${formatPKR(total)}%0APayment: ${payment.toUpperCase()}%0A%0A${customerName} — ${form.phone}%0A${form.address}, ${form.city}`;
      window.open(`https://wa.me/${wa.replace(/\D/g, "")}?text=${msg}`, "_blank");
    }

    setSubmitting(false);
    clear();
    onOpenChange(false);
    navigate({ to: "/thanks", search: { order: data.order_number } });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-black text-white border-white/10 p-0">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle className="font-display text-3xl text-gold">Checkout</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <p className="text-white/60 text-sm mt-8 text-center">Your cart is empty.</p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white/80">First name *</Label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-900 border-white/15 text-white" />
                </div>
                <div>
                  <Label className="text-white/80">Last name</Label>
                  <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="bg-zinc-900 border-white/15 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-white/80">Contact number *</Label>
                <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XX XXXXXXX" className="bg-zinc-900 border-white/15 text-white" />
              </div>
              <div>
                <Label className="text-white/80">Email <span className="text-white/40 text-xs">(optional)</span></Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-zinc-900 border-white/15 text-white" />
              </div>
              <div>
                <Label className="text-white/80">Full address *</Label>
                <Textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-zinc-900 border-white/15 text-white" />
              </div>
              <div>
                <Label className="text-white/80">City *</Label>
                <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-zinc-900 border-white/15 text-white" />
              </div>

              {/* Payment Method — styled like screenshot */}
              <div className="pt-3">
                <p className="font-display text-xl text-white mb-3">Payment Method</p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPayment("cod")}
                    className={`w-full flex items-start gap-3 p-4 border text-left transition ${payment === "cod" ? "border-gold bg-gold/5" : "border-white/15 hover:border-white/30"}`}
                  >
                    <Banknote className={`h-6 w-6 mt-0.5 ${payment === "cod" ? "text-gold" : "text-white/60"}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Cash on Delivery (COD)</p>
                      <p className="text-xs text-white/60 mt-0.5">Pay when your order arrives</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayment("easypaisa")}
                    className={`w-full flex items-start gap-3 p-4 border text-left transition ${payment === "easypaisa" ? "border-gold bg-gold/5" : "border-white/15 hover:border-white/30"}`}
                  >
                    <Smartphone className={`h-6 w-6 mt-0.5 ${payment === "easypaisa" ? "text-gold" : "text-white/60"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white">Easypaisa</p>
                        <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">Rs. 100 OFF</span>
                      </div>
                      <p className="text-xs text-emerald-400 mt-0.5">Pay via Easypaisa &amp; get Rs. 100 discount</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* WhatsApp copy checkbox */}
              <label className="flex items-start gap-2.5 pt-2 cursor-pointer text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={whatsappCopy}
                  onChange={(e) => setWhatsappCopy(e.target.checked)}
                  className="mt-0.5 accent-gold"
                />
                <span>
                  Also <span className="text-[#25D366] font-medium">open WhatsApp</span> to send this order summary to the store <span className="text-white/40">(optional)</span>
                </span>
              </label>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-white/80"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-400"><span>Easypaisa discount</span><span>– {formatPKR(discount)}</span></div>}
                <div className="flex justify-between text-white/80"><span>Shipping</span><span className="text-gold">Free</span></div>
                <div className="flex justify-between font-display text-xl pt-2 border-t border-white/10 text-white"><span>Total</span><span className="text-gold">{formatPKR(total)}</span></div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-none uppercase tracking-[0.2em] text-sm py-6 bg-gold text-black hover:bg-gold/90 font-bold"
              >
                {submitting ? "Placing order…" : `Place Order — ${formatPKR(total)}`}
              </Button>
              <p className="text-[11px] text-white/40 text-center">Delivery in 3 business days · Free shipping across Pakistan</p>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
