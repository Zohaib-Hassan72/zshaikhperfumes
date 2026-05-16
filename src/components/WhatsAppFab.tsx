import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { supabase } from "@/integrations/supabase/client";

export function WhatsAppFab({ message }: { message?: string }) {
  const [phone, setPhone] = useState<string>("923001234567");

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle()
      .then(({ data }) => {
        const v = data?.value as { whatsapp?: string } | null;
        if (v?.whatsapp) setPhone(v.whatsapp);
      });
  }, []);

  const url = `https://wa.me/${phone.replace(/\D/g, "")}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
