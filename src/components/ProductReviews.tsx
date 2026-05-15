import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Review } from "@/lib/types";

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    supabase.from("reviews").select("*").eq("product_id", productId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data ?? []) as Review[]));

  useEffect(() => { load(); }, [productId]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || body.length < 3) return toast.error("Add your name and a short review");
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId, author_name: name, body, rating,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks for your review!");
    setName(""); setBody(""); setRating(5);
    load();
  };

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="font-display text-3xl">Customer Reviews</h2>
      {reviews.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Stars value={avg} />
          <span className="text-sm text-muted-foreground">{avg.toFixed(1)} · {reviews.length} review{reviews.length !== 1 && "s"}</span>
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          {reviews.length === 0 && <p className="text-muted-foreground text-sm">Be the first to review this fragrance.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2"><Stars value={r.rating} /><span className="text-sm font-medium">{r.author_name}</span></div>
              <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="bg-secondary/40 p-6 rounded-sm h-fit">
          <h3 className="font-display text-xl mb-4">Write a review</h3>
          <Label>Your name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          <Label className="mt-3 block">Rating</Label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
                <Star className={`h-6 w-6 ${i <= rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Label className="mt-3 block">Your review</Label>
          <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} />
          <Button type="submit" disabled={busy} className="mt-4 rounded-none uppercase tracking-[0.2em] text-xs">
            {busy ? "Submitting…" : "Submit Review"}
          </Button>
        </form>
      </div>
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= Math.round(value) ? "fill-gold text-gold" : "text-muted-foreground"}`} />
      ))}
    </div>
  );
}
