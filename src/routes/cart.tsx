import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useCheckoutSheet } from "@/components/CheckoutSheet";
import { formatPKR } from "@/lib/format";
import { Minus, Plus, X } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Z Shaikh Perfumes" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, update, remove, subtotal, count } = useCart();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-display text-4xl">Your Cart</h1>
      <p className="text-muted-foreground mt-1">{count} {count === 1 ? "item" : "items"}</p>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop"><Button className="mt-6 rounded-none uppercase tracking-[0.2em] text-xs">Shop fragrances</Button></Link>
        </div>
      ) : (
        <>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {items.map((it) => (
              <div key={it.product_id} className="py-5 flex gap-4 items-center">
                <img src={it.image} alt={it.name} className="h-24 w-24 object-cover rounded-sm bg-muted" />
                <div className="flex-1">
                  <Link to="/products/$slug" params={{ slug: it.slug }} className="font-display text-xl hover:text-gold">{it.name}</Link>
                  <p className="text-sm text-muted-foreground">{formatPKR(it.price)}</p>
                </div>
                <div className="flex items-center border border-border">
                  <button onClick={() => update(it.product_id, it.quantity - 1)} className="px-2 py-1"><Minus className="h-3 w-3" /></button>
                  <span className="w-8 text-center text-sm">{it.quantity}</span>
                  <button onClick={() => update(it.product_id, it.quantity + 1)} className="px-2 py-1"><Plus className="h-3 w-3" /></button>
                </div>
                <p className="w-24 text-right">{formatPKR(it.price * it.quantity)}</p>
                <button onClick={() => remove(it.product_id)} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-end gap-2">
            <div className="flex justify-between w-full sm:w-80">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between w-full sm:w-80">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-gold text-sm">Free</span>
            </div>
            <div className="flex justify-between w-full sm:w-80 pt-2 border-t border-border">
              <span className="font-display text-xl">Total</span>
              <span className="font-display text-xl">{formatPKR(subtotal)}</span>
            </div>
            <Link to="/checkout" className="w-full sm:w-80 mt-4">
              <Button className="w-full rounded-none uppercase tracking-[0.2em] text-xs py-6">Proceed to Checkout</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
