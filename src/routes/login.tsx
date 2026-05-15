import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { claimAdmin } from "@/lib/admin.functions";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Z Shaikh Perfumes" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const claim = useServerFn(claimAdmin);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin")
      .then(({ count }) => setAdminExists((count ?? 0) > 0));
  }, [user, isAdmin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Account created — sign in to continue.");
      setMode("signin");
    }
  };

  const onClaim = async () => {
    setClaiming(true);
    try {
      const res = await claim();
      if (res.ok) {
        toast.success(res.alreadyAdmin ? "You're already an admin" : "Admin access granted");
        // Refetch role
        window.location.href = "/admin";
      } else {
        toast.error(res.reason || "Could not claim admin");
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not claim admin");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <h1 className="font-display text-4xl text-center">
        {user ? "Account" : mode === "signin" ? "Sign In" : "Create Account"}
      </h1>

      {!user ? (
        <>
          <form onSubmit={submit} className="mt-10 space-y-4">
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button disabled={busy} className="w-full rounded-none uppercase tracking-[0.2em] text-xs py-6">
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-gold underline">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </>
      ) : (
        <div className="mt-10 space-y-6 text-center">
          <p className="text-sm text-muted-foreground">Signed in as <span className="text-foreground">{user.email}</span></p>

          {isAdmin ? (
            <Button onClick={() => navigate({ to: "/admin" })} className="w-full rounded-none uppercase tracking-[0.2em] text-xs py-6">
              Open Dashboard
            </Button>
          ) : adminExists === false ? (
            <div className="border border-gold/40 bg-gold/5 p-5 text-left">
              <div className="flex items-center gap-2 text-gold">
                <ShieldCheck className="h-5 w-5" />
                <p className="font-display text-lg">Claim admin access</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                No admin exists yet. Claim ownership of this site in one click — only the first signed-in user can do this.
              </p>
              <Button onClick={onClaim} disabled={claiming} className="mt-4 w-full rounded-none uppercase tracking-[0.2em] text-xs py-5">
                {claiming ? "Claiming…" : "Claim Admin"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground border border-border p-4">
              An admin already exists for this site. Contact the owner for access.
            </p>
          )}

          <button onClick={async () => { await supabase.auth.signOut(); }} className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground"><Link to="/">← Back to shop</Link></p>
    </div>
  );
}
