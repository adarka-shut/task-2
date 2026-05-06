import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, formatDate } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/events_/$id/checkin")({
  component: () => <RequireAuth><CheckIn /></RequireAuth>,
});

function CheckIn() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<{ title: string; start_time: string; capacity: number; host_id: string } | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [stats, setStats] = useState({ checked: 0, total: 0 });
  const [last, setLast] = useState<{ id: string; name: string; code: string } | null>(null);

  const load = async () => {
    const { data: ev } = await supabase.from("events").select("title,start_time,capacity,host_id").eq("id", id).maybeSingle();
    setEvent(ev as any);
    if (ev && user) {
      const { data: m } = await supabase.from("host_members").select("role").eq("host_id", ev.host_id).eq("user_id", user.id).maybeSingle();
      setAuthorized(!!m && (m.role === "host" || m.role === "checker"));
    } else {
      setAuthorized(false);
    }
    const { count: total } = await supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("event_id", id).eq("status", "confirmed");
    const { count: checked } = await supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("event_id", id).eq("checked_in", true);
    setStats({ checked: checked ?? 0, total: total ?? 0 });
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user?.id]);

  const checkIn = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    const { data: r } = await supabase.from("rsvps")
      .select("id,checked_in,user_id,event_id,profiles(name)")
      .eq("ticket_code", c).maybeSingle();
    if (!r) { toast.error("Invalid code"); return; }
    if (r.event_id !== id) { toast.error("Ticket not for this event"); return; }
    if (r.checked_in) { toast.error("Already checked in"); return; }
    const { error } = await supabase.from("rsvps")
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    const name = (r as any).profiles?.name ?? "Attendee";
    setLast({ id: r.id, name, code: c });
    setCode("");
    toast.success(`Checked in: ${name}`);
    load();
  };

  const undo = async () => {
    if (!last) return;
    const { error } = await supabase.from("rsvps").update({ checked_in: false, checked_in_at: null }).eq("id", last.id);
    if (error) return toast.error(error.message);
    toast.success("Undone");
    setLast(null);
    load();
  };

  if (authorized === false) {
    return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">You don't have permission to check in attendees for this event.</div></SiteLayout>;
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-2xl font-bold">Check-in</h1>
        <p className="text-muted-foreground mb-1">{event?.title}</p>
        {event && <p className="text-sm text-muted-foreground mb-6">{formatDate(event.start_time)}</p>}

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card><CardContent><div className="text-sm text-muted-foreground">Checked in</div><div className="text-3xl font-bold">{stats.checked} / {stats.total}</div></CardContent></Card>
          <Card><CardContent><div className="text-sm text-muted-foreground">Capacity</div><div className="text-3xl font-bold">{event?.capacity}</div></CardContent></Card>
        </div>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Manual entry</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="TICK-XXXXXX" className="font-mono" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkIn()} />
            <Button onClick={checkIn}>Check In</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Last scanned</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{last ? `${last.name} (${last.code})` : "No tickets scanned yet."}</p>
            {last && <Button size="sm" variant="outline" onClick={undo}>Undo Last</Button>}
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
