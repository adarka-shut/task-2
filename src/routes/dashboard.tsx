import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Plus } from "lucide-react";
import { downloadCsv } from "@/lib/calendar";
import { toast } from "sonner";

async function exportCsv(eventId: string, title: string) {
  const { data, error } = await supabase.from("rsvps")
    .select("status,checked_in_at,profiles(name,email)")
    .eq("event_id", eventId);
  if (error) return toast.error(error.message);
  const rows = (data ?? []).map((r: any) => ({
    name: r.profiles?.name ?? "",
    email: r.profiles?.email ?? "",
    rsvp_status: r.status,
    checked_in_time: r.checked_in_at ?? "",
  }));
  downloadCsv(`${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-attendees.csv`, rows);
}

export const Route = createFileRoute("/dashboard")({
  component: () => <RequireAuth><Dashboard /></RequireAuth>,
});

type Ev = { id: string; title: string; end_time: string; capacity: number; going: number };

function Row({ e }: { e: Ev }) {
  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/events/$id" params={{ id: e.id }} className="font-medium hover:text-primary">{e.title}</Link>
          <div className="text-xs text-muted-foreground mt-1">Going {e.going} / {e.capacity}</div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild><Link to="/events/$id/edit" params={{ id: e.id }}>Edit</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/events/$id/checkin" params={{ id: e.id }}>Check-in</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Ev[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: members } = await supabase.from("host_members").select("host_id").eq("user_id", user.id);
      const hostIds = (members ?? []).map((m) => m.host_id);
      if (hostIds.length === 0) { setEvents([]); return; }
      const { data: evs } = await supabase.from("events").select("id,title,end_time,capacity").in("host_id", hostIds).order("start_time", { ascending: false });
      const list = evs ?? [];
      const counts = await Promise.all(list.map((e) =>
        supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("event_id", e.id).eq("status", "confirmed").then((r) => r.count ?? 0)
      ));
      setEvents(list.map((e, i) => ({ ...e, going: counts[i] })));
    })();
  }, [user]);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.end_time) >= now);
  const past = events.filter((e) => new Date(e.end_time) < now);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Host dashboard</h1>
          <Button asChild><Link to="/events/new"><Plus className="h-4 w-4 mr-2" />Create Event</Link></Button>
        </div>
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {upcoming.length === 0 ? <p className="text-muted-foreground py-6">No upcoming events. <Link to="/events/new" className="text-primary hover:underline">Create one</Link>.</p> : upcoming.map((e) => <Row key={e.id} e={e} />)}
          </TabsContent>
          <TabsContent value="past" className="space-y-3 mt-4">
            {past.length === 0 ? <p className="text-muted-foreground py-6">No past events.</p> : past.map((e) => <Row key={e.id} e={e} />)}
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}
