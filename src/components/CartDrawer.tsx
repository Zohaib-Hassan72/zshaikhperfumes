import { createContext, useContext, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useCheckoutSheet } from "@/components/CheckoutSheet";
import { formatPKR } from "@/lib/format";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const CartCtx = createContext<Ctx | null>(null);

export function useCartDrawer() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCartDrawer must be used within CartDrawerProvider");
  return ctx;
}

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CartCtx.Provider value={{ open, setOpen }}>
      {children}
      <CartDrawer open={open} onOpenChange={setOpen} />
    </CartCtx.Provider>
  );
}

function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { items, update, remove, subtotal, count } = useCart();
  const { setOpen: openCheckout } = useCheckoutSheet();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-background flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-display text-2xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Your Cart ({count})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" onClick={() => onOpenChange(false)}>
              <Button className="mt-6 rounded-none uppercase tracking-[0.2em] text-xs">Shop fragrances</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border">
              {items.map((it) => (
                <div key={it.product_id} className="py-4 flex gap-3">
                  <img src={it.image} alt={it.name} className="h-20 w-20 object-cover rounded-sm bg-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link to="/products/$slug" params={{ slug: it.slug }} onClick={() => onOpenChange(false)}
                          className="font-display text-lg leading-tight hover:text-gold line-clamp-1">{it.name}</Link>
                    <p className="text-xs text-muted-foreground">{formatPKR(it.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-border">
                        <button onClick={() => update(it.product_id, it.quantity - 1)} className="px-2 py-1"><Minus className="h-3 w-3" /></button>
                        <span className="w-7 text-center text-sm">{it.quantity}</span>
                        <button onClick={() => update(it.product_id, it.quantity + 1)} className="px-2 py-1"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => remove(it.product_id)} aria-label="Remove" className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium whitespace-nowrap">{formatPKR(it.price * it.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-5 space-y-3 bg-muted/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-gold">Free</span>
              </div>
              <div className="flex justify-between font-display text-xl pt-2 border-t border-border">
                <span>Total</span><span>{formatPKR(subtotal)}</span>
              </div>
              <Button
                onClick={() => { onOpenChange(false); openCheckout(true); }}
                className="w-full rounded-none uppercase tracking-[0.2em] text-xs py-6"
              >
                Checkout
              </Button>
              <Link to="/cart" onClick={() => onOpenChange(false)}
                    className="block text-center text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                View full cart
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
