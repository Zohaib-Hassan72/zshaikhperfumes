import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);
  if (!user) return null;
  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center">
      <h1 className="font-display text-4xl">Welcome</h1>
      <p className="mt-2 text-muted-foreground">{user.email}</p>
      {isAdmin && <p className="mt-2 text-gold text-sm">You have admin access</p>}
      <Button variant="outline" onClick={signOut} className="mt-8">Sign out</Button>
    </div>
  );
}
