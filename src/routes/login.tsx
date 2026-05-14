import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Z Shaikh Perfumes" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Account created. Check your email to verify.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <h1 className="font-display text-4xl text-center">{mode === "signin" ? "Sign In" : "Create Account"}</h1>
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
      <p className="mt-3 text-center text-xs text-muted-foreground"><Link to="/">← Back to shop</Link></p>
    </div>
  );
}
