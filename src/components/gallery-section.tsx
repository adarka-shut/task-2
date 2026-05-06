import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ReportButton } from "@/components/report-dialog";

type Photo = { id: string; image_url: string; approved: boolean; user_id: string };

export function GallerySection({ eventId, hostId }: { eventId: string; hostId: string }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("gallery").select("id,image_url,approved,user_id").eq("event_id", eventId).order("created_at", { ascending: false });
    setPhotos((data as any) ?? []);
    if (user) {
      const { data: m } = await supabase.from("host_members").select("id").eq("host_id", hostId).eq("user_id", user.id).maybeSingle();
      setIsHost(!!m);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [eventId, user?.id]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      const { error } = await supabase.from("gallery").insert({ event_id: eventId, user_id: user.id, image_url: url, approved: false });
      if (error) throw error;
      toast.success("Photo submitted for approval");
      load();
    } catch (err: any) {
      console.error("Photo upload failed:", err);
      toast.error(`Upload failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const approve = async (id: string) => {
    const { error } = await supabase.from("gallery").update({ approved: true }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  const reject = async (id: string) => {
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const visible = isHost ? photos : photos.filter((p) => p.approved || p.user_id === user?.id);

  return (
    <Card>
      <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {user && canUpload && (
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
              Upload photo
            </Button>
          </div>
        )}
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visible.map((p) => (
              <div key={p.id} className="relative group">
                <img src={p.image_url} alt="" className="w-full aspect-square object-cover rounded-md border" />
                {!p.approved && <span className="absolute top-1 left-1 text-[10px] bg-background/80 px-1.5 py-0.5 rounded">Pending</span>}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isHost && !p.approved && (
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => approve(p.id)} title="Approve"><Check className="h-3.5 w-3.5" /></Button>
                  )}
                  {isHost && (
                    <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => reject(p.id)} title="Reject/Delete"><X className="h-3.5 w-3.5" /></Button>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100">
                  <ReportButton galleryId={p.id} label="" variant="secondary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
