import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/host-setup")({
  component: () => <RequireAuth><HostSetup /></RequireAuth>,
});

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function HostSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [slugDirty, setSlugDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { data: host, error } = await supabase
      .from("hosts").insert({ name, slug: slug || slugify(name), bio, contact_email: contactEmail }).select().single();
    if (error || !host) { setLoading(false); return toast.error(error?.message ?? "Failed"); }
    const { error: mErr } = await supabase.from("host_members").insert({ host_id: host.id, user_id: user.id, role: "host" });
    setLoading(false);
    if (mErr) return toast.error(mErr.message);
    toast.success("Host profile created!");
    navigate({ to: "/dashboard" });
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Set up your Host profile</h1>
        <Card>
          <CardHeader><CardTitle>Host details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Host name</Label>
                <Input required value={name} onChange={(e) => { setName(e.target.value); if (!slugDirty) setSlug(slugify(e.target.value)); }} />
              </div>
              <div>
                <Label className="mb-1.5 block">Slug</Label>
                <Input required value={slug} onChange={(e) => { setSlug(e.target.value); setSlugDirty(true); }} />
              </div>
              <div>
                <Label className="mb-1.5 block">Bio</Label>
                <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block">Contact email</Label>
                <Input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block">Logo</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
                  <Upload className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Logo upload coming soon</p>
                </div>
              </div>
              <Button type="submit" disabled={loading}>Create host</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
