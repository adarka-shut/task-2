import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/events/$id/checkin")({
  component: () => <RequireAuth><CheckIn /></RequireAuth>,
});

function CheckIn() {
  const { id } = Route.useParams();
  const [event, setEvent] = useState<{ title: string; capacity: number } | null>(null);
  const [code, setCode] = useState("");
  const [stats, setStats] = useState({ checked: 0, total: 0 });
  const [last, setLast] = useState<string | null>(null);

  const refresh = async () => {
    const { data: ev } = await supabase.from("events").select("title,capacity").eq("id", id).maybeSingle();
    setEvent(ev as any);
    const { count: total } = await supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("event_id", id).eq("status", "confirmed");
    const { count: checked } = await supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("event_id", id).eq("checked_in", true);
    setStats({ checked: checked ?? 0, total: total ?? 0 });
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [id]);

  const checkIn = async () => {
    if (!code.trim()) return;
    const { data, error } = await supabase.from("rsvps")
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq("event_id", id).eq("ticket_code", code.trim().toUpperCase()).select().maybeSingle();
    if (error || !data) { toast.error("Ticket not found"); return; }
    setLast(code.trim().toUpperCase());
    setCode("");
    toast.success("Checked in");
    refresh();
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-2xl font-bold">Check-in</h1>
        <p className="text-muted-foreground mb-6">{event?.title}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card><CardContent><div className="text-sm text-muted-foreground">Checked in</div><div className="text-3xl font-bold">{stats.checked}</div></CardContent></Card>
          <Card><CardContent><div className="text-sm text-muted-foreground">Confirmed</div><div className="text-3xl font-bold">{stats.total}</div></CardContent></Card>
        </div>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Manual entry</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="TICK-XXXXXX" className="font-mono" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkIn()} />
            <Button onClick={checkIn}>Check in</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Last scanned</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{last ?? "No tickets scanned yet."}</p>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
