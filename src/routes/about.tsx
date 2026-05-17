import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Award, Heart, Leaf } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Z Shaikh Perfumes" },
      { name: "description", content: "Luxury perfumes inspired by Urdu novel legends. Where storytelling meets French perfumery." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative h-[55vh] sm:h-[65vh] overflow-hidden">
        <img src="/images/perfume-5.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Our Story</p>
            <h1 className="font-display text-5xl sm:text-7xl leading-[1.05]">Bottled romance,<br/><em className="text-gold not-italic">page by page.</em></h1>
            <p className="mt-6 text-white/70 max-w-xl mx-auto leading-relaxed">
              Z Shaikh is a tribute to the unforgettable heroines and heroes of Urdu literature — distilled into scent.
            </p>
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3 space-y-6 text-white/75 leading-relaxed">
            <p className="text-2xl font-display text-gold leading-snug">"A scent is the closest thing to a memory you can wear."</p>
            <p>Every bottle in our collection is named after a character from a classic Urdu novel — Umrao Jaan's velvet melancholy, Heer's defiance, Sassi's longing. We translate each life into top, heart and base notes so you can wear their world for a day.</p>
            <p>Our perfumers blend French essences with traditional South Asian attar craft. Small batches, hand-finished in our studio in Karachi. No two bottles are exactly alike — and neither are the moments you'll wear them.</p>
          </div>
          <div className="lg:col-span-2">
            <div className="aspect-[4/5] overflow-hidden">
              <img src="/images/perfume-2.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-zinc-950 border-y border-white/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">What we believe</p>
            <h2 className="font-display text-4xl mt-2">The Z Shaikh standard</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Leaf className="h-7 w-7" />, t: "Finest Ingredients", s: "Sourced from Grasse, Lucknow, and Kannauj." },
              { icon: <Award className="h-7 w-7" />, t: "100% Authentic", s: "Hand-finished, individually quality-checked." },
              { icon: <Heart className="h-7 w-7" />, t: "Made With Love", s: "Each blend takes months to perfect." },
              { icon: <Sparkles className="h-7 w-7" />, t: "Luxury Without Compromise", s: "Premium quality at honest prices." },
            ].map((v) => (
              <div key={v.t} className="text-center border border-white/10 p-6 hover:border-gold/50 transition">
                <div className="text-gold inline-flex">{v.icon}</div>
                <h3 className="font-display text-xl mt-4">{v.t}</h3>
                <p className="text-sm text-white/60 mt-2">{v.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-4xl sm:text-5xl">Find your character.</h2>
        <p className="mt-4 text-white/60 max-w-xl mx-auto">Explore our signature collection — each scent a story waiting to be worn.</p>
        <Link to="/shop" className="inline-block mt-8 bg-gold text-black px-10 py-4 uppercase tracking-[0.25em] text-xs font-semibold hover:bg-gold/90 transition">
          Shop the Collection
        </Link>
      </section>
    </div>
  );
}
