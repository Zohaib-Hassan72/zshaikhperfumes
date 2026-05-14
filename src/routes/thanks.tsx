import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

type Search = { order?: string };

export const Route = createFileRoute("/thanks")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    order: typeof s.order === "string" ? s.order : undefined,
  }),
  head: () => ({ meta: [{ title: "Thank You — Z Shaikh Perfumes" }] }),
  component: ThanksPage,
});

function ThanksPage() {
  const { order } = Route.useSearch();
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-xl">
      <CheckCircle2 className="h-16 w-16 text-gold mx-auto" />
      <h1 className="font-display text-5xl mt-6">Thank You</h1>
      <p className="mt-3 text-muted-foreground">Your order has been placed. We'll WhatsApp you to confirm shortly.</p>
      {order && <p className="mt-6 text-sm">Order number: <strong className="text-gold">{order}</strong></p>}
      <Link to="/shop" className="inline-block mt-10 px-8 py-3 border border-primary text-xs uppercase tracking-[0.25em] hover:bg-primary hover:text-primary-foreground transition-colors">
        Continue Shopping
      </Link>
    </div>
  );
}
