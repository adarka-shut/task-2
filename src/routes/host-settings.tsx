import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/host-settings")({
  component: () => <RequireAuth><HostSettings /></RequireAuth>,
});

function HostSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hosts, setHosts] = useState<{ id: string; name: string }[]>([]);
  const [hostId, setHostId] = useState<string>("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("host_members").select("host_id,hosts(id,name)").eq("user_id", user.id).eq("role", "host")
      .then(({ data }) => {
        const list = (data ?? []).map((m: any) => m.hosts).filter(Boolean);
        setHosts(list);
        if (list.length && !hostId) setHostId(list[0].id);
      });
  }, [user]);

  useEffect(() => {
    if (!hostId) return;
    supabase.from("hosts").select("*").eq("id", hostId).maybeSingle().then(({ data }) => {
      if (!data) return;
      setName(data.name ?? "");
      setBio(data.bio ?? "");
      setContactEmail(data.contact_email ?? "");
      setLogoUrl(data.logo_url ?? null);
    });
  }, [hostId]);

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
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostId) return;
    setLoading(true);
    const { error } = await supabase.from("hosts")
      .update({ name, bio, contact_email: contactEmail, logo_url: logoUrl })
      .eq("id", hostId);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Host profile updated");
    navigate({ to: "/dashboard" });
  };

  if (hosts.length === 0) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <Card><CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You don't have a host profile yet.</p>
            <Button onClick={() => navigate({ to: "/host-setup" })}>Create host profile</Button>
          </CardContent></Card>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Host Settings</h1>
        <Card>
          <CardHeader><CardTitle>Edit host profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-4">
              {hosts.length > 1 && (
                <div>
                  <Label className="mb-1.5 block">Host</Label>
                  <Select value={hostId} onValueChange={setHostId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{hosts.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="mb-1.5 block">Host name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
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
                    <p className="text-sm">{uploading ? "Uploading…" : "Click to upload"}</p>
                  </button>
                )}
              </div>
              <Button type="submit" disabled={loading || uploading}>Save changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
