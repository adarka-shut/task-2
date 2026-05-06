import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/date-time-picker";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function EventForm({ mode, eventId }: { mode: "new" | "edit"; eventId?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hostId, setHostId] = useState<string>("");
  const [hosts, setHosts] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [timezone, setTimezone] = useState("Europe/Berlin");
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("host_members").select("host_id,role,hosts(id,name)").eq("user_id", user.id).eq("role", "host").then(({ data }) => {
      const list = (data ?? []).map((m: any) => m.hosts).filter(Boolean);
      setHosts(list);
      if (list.length && !hostId) setHostId(list[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (mode !== "edit" || !eventId) return;
    supabase.from("events").select("*").eq("id", eventId).maybeSingle().then(({ data }) => {
      if (!data) return;
      setHostId(data.host_id);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setStart(data.start_time.slice(0, 16));
      setEnd(data.end_time.slice(0, 16));
      setTimezone(data.timezone);
      setIsOnline(data.is_online);
      setLocation(data.is_online ? (data.online_link ?? "") : (data.venue_address ?? ""));
      setCapacity(data.capacity);
      setVisibility((data.visibility as "public" | "unlisted") ?? "public");
      setCoverUrl(data.cover_image_url);
    });
  }, [mode, eventId]);

  const onPickFile = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File too large (max 2MB for inline images)"); return; }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      setCoverUrl(dataUrl);
      toast.success("Cover loaded");
    } catch (err: any) {
      console.error("Cover load failed", JSON.stringify(err, null, 2), err);
      toast.error(`Load failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (status: "draft" | "published") => {
    if (!hostId) return toast.error("Create a host profile first");
    if (!title || !start || !end) return toast.error("Title, start and end are required");
    setLoading(true);
    const payload = {
      host_id: hostId, title, description,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      timezone, capacity, is_online: isOnline,
      venue_address: isOnline ? null : location,
      online_link: isOnline ? location : null,
      cover_image_url: coverUrl,
      visibility,
      status,
    };
    const op = mode === "edit" && eventId
      ? supabase.from("events").update(payload).eq("id", eventId)
      : supabase.from("events").insert(payload);
    const { error } = await op;
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(status === "published" ? "Published!" : "Draft saved");
    navigate({ to: "/dashboard" });
  };

  const duplicate = async () => {
    if (!eventId) return;
    setLoading(true);
    const { data, error } = await supabase.from("events").insert({
      host_id: hostId, title: `${title} (copy)`, description,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      timezone, capacity, is_online: isOnline,
      venue_address: isOnline ? null : location,
      online_link: isOnline ? location : null,
      cover_image_url: coverUrl,
      status: "draft",
    }).select("id").maybeSingle();
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Duplicated as draft");
    if (data) navigate({ to: "/events/$id/edit", params: { id: data.id } });
  };

  const deleteEvent = async () => {
    if (!eventId) return;
    setLoading(true);
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Event deleted");
    navigate({ to: "/dashboard" });
  };

  if (hosts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Card><CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">You need a host profile to create events.</p>
          <Button onClick={() => navigate({ to: "/host-setup" })}>Set up host profile</Button>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{mode === "new" ? "Create event" : "Edit event"}</h1>
      <Card>
        <CardContent className="space-y-6">
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
            <Label className="mb-1.5 block">Cover image</Label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            {coverUrl ? (
              <div className="relative">
                <img src={coverUrl} alt="cover" className="w-full aspect-[2/1] object-cover rounded-lg border" />
                <div className="mt-2 flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={onPickFile} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCoverUrl(null)}>Remove</Button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={onPickFile} disabled={uploading}
                className="w-full border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground hover:bg-muted/30">
                {uploading ? <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" /> : <Upload className="h-6 w-6 mx-auto mb-2" />}
                <p className="text-sm">{uploading ? "Uploading…" : "Click to upload (max 5MB)"}</p>
              </button>
            )}
          </div>

          <div>
            <Label htmlFor="title" className="mb-1.5 block">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
          </div>
          <div>
            <Label htmlFor="desc" className="mb-1.5 block">Description</Label>
            <Textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell people what to expect..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="mb-1.5 block">Start</Label><DateTimePicker value={start} onChange={setStart} /></div>
            <div><Label className="mb-1.5 block">End</Label><DateTimePicker value={end} onChange={setEnd} /></div>
          </div>
          <div>
            <Label className="mb-1.5 block">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch id="online" checked={isOnline} onCheckedChange={setIsOnline} />
              <Label htmlFor="online">This is an online event</Label>
            </div>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={isOnline ? "Online meeting link" : "Venue address"} />
          </div>

          <div>
            <Label className="mb-1.5 block">Capacity</Label>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
          </div>

          <div>
            <Label className="mb-2 block">Pricing</Label>
            <div className="inline-flex rounded-md border p-1 gap-1">
              <Button size="sm" variant="default">Free</Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button size="sm" variant="ghost" disabled>Paid</Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {mode === "edit" ? (
              <>
                <Button onClick={() => save("published")} disabled={loading}>Save</Button>
                <Button variant="outline" onClick={() => save("draft")} disabled={loading}>Unpublish</Button>
                <Button variant="outline" onClick={duplicate} disabled={loading}>Duplicate</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => save("draft")} disabled={loading}>Save Draft</Button>
                <Button onClick={() => save("published")} disabled={loading}>Publish</Button>
              </>
            )}
          </div>
          {mode === "edit" && eventId && (
            <div className="pt-6 border-t mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Event
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this event? This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
