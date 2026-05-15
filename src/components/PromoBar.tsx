import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_MESSAGES = [
  "Enjoy Free Shipping on Orders Above Rs. 3000",
  "25% Discount Running on All Orders",
  "Cash on Delivery available all over Pakistan",
];

export function PromoBar() {
  const [messages, setMessages] = useState<string[]>(DEFAULT_MESSAGES);
  const [enabled, setEnabled] = useState(true);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "promo_bar").maybeSingle()
      .then(({ data }) => {
        const v = data?.value as { enabled?: boolean; messages?: string[] } | null;
        if (v) {
          if (typeof v.enabled === "boolean") setEnabled(v.enabled);
          if (Array.isArray(v.messages) && v.messages.length) setMessages(v.messages);
        }
      });
  }, []);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(id);
  }, [messages]);

  if (!enabled) return null;

  return (
    <div className="bg-black text-white text-xs sm:text-sm font-medium tracking-wide">
      <div className="container mx-auto px-4 h-10 flex items-center justify-center text-center overflow-hidden">
        <span key={idx} className="animate-in fade-in slide-in-from-bottom-1 duration-500">
          {messages[idx]}
        </span>
      </div>
    </div>
  );
}
