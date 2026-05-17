import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Instagram, Facebook } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Z Shaikh Perfumes" },
      { name: "description", content: "Get in touch with Z Shaikh Perfumes — WhatsApp, email, and store locations." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [contact, setContact] = useState<{ whatsapp?: string; email?: string; phone?: string; address?: string; instagram?: string; facebook?: string }>({});
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle()
      .then(({ data }) => setContact((data?.value as any) ?? {}));
  }, []);

  const wa = (contact.whatsapp ?? "923126056141").replace(/\D/g, "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return toast.error("Please fill in your name and message");
    setSending(true);
    const text = `Hi! ${form.name}${form.email ? ` (${form.email})` : ""} says:%0A%0A${encodeURIComponent(form.message)}`;
    window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
    setSending(false);
    toast.success("Opening WhatsApp…");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
        <img src="/images/perfume-7.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-3">Get in touch</p>
            <h1 className="font-display text-5xl sm:text-7xl">Let's talk scents.</h1>
            <p className="mt-4 text-white/70 max-w-md mx-auto">We'd love to help you find your signature fragrance.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-display text-3xl text-gold">Reach us</h2>

            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-5 border border-white/10 hover:border-[#25D366] transition group">
              <div className="text-[#25D366] mt-1"><WhatsAppIcon className="h-6 w-6" /></div>
              <div>
                <p className="font-display text-lg group-hover:text-[#25D366] transition">WhatsApp</p>
                <p className="text-white/60 text-sm">{contact.whatsapp ?? "+92 312 6056141"}</p>
                <p className="text-xs text-white/40 mt-1">Fastest reply · usually within an hour</p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-5 border border-white/10">
              <Mail className="h-6 w-6 text-gold mt-1" />
              <div>
                <p className="font-display text-lg">Email</p>
                <p className="text-white/60 text-sm">{contact.email ?? "zshaikhperfumes@gmail.com"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 border border-white/10">
              <Phone className="h-6 w-6 text-gold mt-1" />
              <div>
                <p className="font-display text-lg">Phone</p>
                <p className="text-white/60 text-sm">{contact.phone ?? "+92 312 6056141"}</p>
              </div>
            </div>

            {contact.address && (
              <div className="flex items-start gap-4 p-5 border border-white/10">
                <MapPin className="h-6 w-6 text-gold mt-1" />
                <div>
                  <p className="font-display text-lg">Studio</p>
                  <p className="text-white/60 text-sm">{contact.address}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="w-11 h-11 border border-white/15 flex items-center justify-center hover:border-gold hover:text-gold transition"><Instagram className="h-5 w-5" /></a>}
              {contact.facebook && <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="w-11 h-11 border border-white/15 flex items-center justify-center hover:border-gold hover:text-gold transition"><Facebook className="h-5 w-5" /></a>}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="border border-white/10 p-6 sm:p-10 bg-zinc-950">
              <h2 className="font-display text-3xl">Send a message</h2>
              <p className="text-white/60 text-sm mt-1">Your message opens directly in WhatsApp — no waiting on email.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-white/60">Your name</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 bg-black border-white/15 text-white" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-white/60">Email <span className="text-white/30">(optional)</span></label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 bg-black border-white/15 text-white" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-white/60">Message</label>
                  <Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 bg-black border-white/15 text-white" />
                </div>
                <Button type="submit" disabled={sending} className="w-full rounded-none bg-[#25D366] hover:bg-[#1ebe57] text-white py-6 uppercase tracking-[0.25em] text-xs font-semibold">
                  <MessageCircle className="h-5 w-5 mr-2" /> Send via WhatsApp
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
