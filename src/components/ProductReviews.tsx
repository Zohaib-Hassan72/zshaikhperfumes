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
    <section>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Reviews</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2 text-white">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <Stars value={avg} />
            <span className="text-sm text-white/60">{avg.toFixed(1)} · {reviews.length} review{reviews.length !== 1 && "s"}</span>
          </div>
        )}
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          {reviews.length === 0 && (
            <p className="text-white/50 text-sm text-center py-12 border border-dashed border-white/10">
              Be the first to review this fragrance.
            </p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="bg-zinc-950 border border-white/10 hover:border-gold/30 transition p-5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center font-display text-lg">
                    {r.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{r.author_name}</p>
                    <p className="text-[11px] text-white/40">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Stars value={r.rating} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{r.body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="bg-zinc-950 border border-gold/30 p-6 h-fit">
          <h3 className="font-display text-2xl mb-1 text-gold">Write a review</h3>
          <p className="text-xs text-white/50 mb-4">Share your experience with this fragrance.</p>
          <Label className="text-white/80">Your name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="bg-black border-white/15 text-white" />
          <Label className="mt-3 block text-white/80">Rating</Label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
                <Star className={`h-7 w-7 transition-transform hover:scale-110 ${i <= rating ? "fill-gold text-gold" : "text-white/30"}`} />
              </button>
            ))}
          </div>
          <Label className="mt-3 block text-white/80">Your review</Label>
          <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} className="bg-black border-white/15 text-white" />
          <Button type="submit" disabled={busy} className="mt-4 w-full rounded-none uppercase tracking-[0.2em] text-xs py-6 bg-gold text-black hover:bg-gold/90 font-semibold">
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
        <Star key={i} className={`h-4 w-4 ${i <= Math.round(value) ? "fill-gold text-gold" : "text-white/25"}`} />
      ))}
    </div>
  );
}
