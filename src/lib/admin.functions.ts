import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // Check if any admin already exists
    const { data: existing, error: checkErr } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (checkErr) throw new Error(checkErr.message);

    if (existing && existing.length > 0) {
      // Allow only if this user is already the admin
      const { data: mine } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("role", "admin")
        .eq("user_id", userId)
        .maybeSingle();
      if (mine) return { ok: true, alreadyAdmin: true };
      return { ok: false, reason: "An admin already exists for this site." };
    }

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (insErr) throw new Error(insErr.message);

    return { ok: true, claimed: true };
  });
