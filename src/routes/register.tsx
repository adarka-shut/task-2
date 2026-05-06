import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>) => ({ host: s.host === "true" || s.host === true }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const { host } = useSearch({ from: "/register" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name }, emailRedirectTo: `${window.location.origin}/explore` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    navigate({ to: host ? "/host-setup" : "/explore" });
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader><CardTitle>Create your account</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div><Label className="mb-1.5 block">Name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label className="mb-1.5 block">Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label className="mb-1.5 block">Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" className="w-full" disabled={loading}>Sign up</Button>
              {!host && (
                <p className="text-sm text-center text-muted-foreground">
                  Want to host events? <Link to="/register" search={{ host: true } as any} className="text-foreground font-medium underline hover:no-underline">Register as Host</Link>
                </p>
              )}
              <p className="text-sm text-center text-muted-foreground">
                Already a member? <Link to="/login" className="text-foreground font-medium underline hover:no-underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
