import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) { toast.error("Logo too large (max 1MB)"); return; }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      setLogoUrl(dataUrl);
      toast.success("Logo loaded");
    } catch (err: any) {
      console.error("Logo load failed", JSON.stringify(err, null, 2), err);
      toast.error(`Load failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { data: host, error } = await supabase
      .from("hosts").insert({ name, slug: slug || slugify(name), bio, contact_email: contactEmail, logo_url: logoUrl }).select().single();
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
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                {logoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={logoUrl} alt="logo" className="h-20 w-20 rounded-full object-cover border" />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl(null)}>Remove</Button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground hover:bg-muted/30">
                    {uploading ? <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" /> : <Upload className="h-6 w-6 mx-auto mb-2" />}
                    <p className="text-sm">{uploading ? "Uploading…" : "Click to upload (max 5MB)"}</p>
                  </button>
                )}
              </div>
              <Button type="submit" disabled={loading || uploading}>Create host</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
