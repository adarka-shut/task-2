import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Plus, Copy, Settings } from "lucide-react";
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
          <Link to="/events/$id" params={{ id: e.id }} className="font-medium text-foreground hover:underline">{e.title}</Link>
          <div className="text-xs text-muted-foreground mt-1">Going {e.going} / {e.capacity}</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" asChild><Link to="/events/$id/edit" params={{ id: e.id }}>Edit</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/events/$id/checkin" params={{ id: e.id }}>Check-in</Link></Button>
          <Button size="sm" variant="outline" onClick={() => exportCsv(e.id, e.title)}>Export CSV</Button>
        </div>
      </CardContent>
    </Card>
  );
}

type Report = {
  id: string; reason: string; status: string; created_at: string;
  event_id: string | null; gallery_id: string | null;
  events: { title: string } | null;
  gallery: { image_url: string; event_id: string } | null;
  profiles: { name: string } | null;
};

function ReportsPanel({ hostIds }: { hostIds: string[] }) {
  const [reports, setReports] = useState<Report[]>([]);
  const load = async () => {
    if (hostIds.length === 0) return;
    const { data: evs } = await supabase.from("events").select("id").in("host_id", hostIds);
    const evIds = (evs ?? []).map((e) => e.id);
    if (evIds.length === 0) { setReports([]); return; }
    const { data: gals } = await supabase.from("gallery").select("id").in("event_id", evIds);
    const galIds = (gals ?? []).map((g) => g.id);
    const { data } = await supabase.from("reports")
      .select("id,reason,status,created_at,event_id,gallery_id,events(title),gallery(image_url,event_id),profiles!reports_reporter_id_fkey(name)")
      .or([
        evIds.length ? `event_id.in.(${evIds.join(",")})` : "",
        galIds.length ? `gallery_id.in.(${galIds.join(",")})` : "",
      ].filter(Boolean).join(","))
      .order("created_at", { ascending: false });
    setReports((data as any) ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [hostIds.join(",")]);

  const hide = async (r: Report) => {
    if (r.event_id) await supabase.from("events").update({ visibility: "unlisted" }).eq("id", r.event_id);
    if (r.gallery_id) await supabase.from("gallery").update({ approved: false }).eq("id", r.gallery_id);
    await supabase.from("reports").update({ status: "hidden" }).eq("id", r.id);
    toast.success("Hidden"); load();
  };
  const dismiss = async (r: Report) => {
    await supabase.from("reports").update({ status: "dismissed" }).eq("id", r.id);
    toast.success("Dismissed"); load();
  };

  if (reports.length === 0) return <p className="text-muted-foreground py-6">No reports.</p>;
  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex gap-3 items-start">
              {r.gallery?.image_url && <img src={r.gallery.image_url} alt="" className="h-14 w-14 object-cover rounded border" />}
              <div className="text-sm">
                <div className="font-medium">{r.events?.title ?? (r.gallery_id ? "Gallery photo" : "Item")}</div>
                <div className="text-muted-foreground">{r.reason}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  by {r.profiles?.name ?? "Unknown"} · {new Date(r.created_at).toLocaleDateString()} · {r.status}
                </div>
              </div>
            </div>
            {r.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => hide(r)}>Hide</Button>
                <Button size="sm" variant="ghost" onClick={() => dismiss(r)}>Dismiss</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InvitePanel({ hostIds }: { hostIds: string[] }) {
  const [links, setLinks] = useState<{ id: string; token: string; role: string; host_id: string }[]>([]);
  const load = async () => {
    if (hostIds.length === 0) return;
    const { data } = await supabase.from("invite_links").select("id,token,role,host_id").in("host_id", hostIds).order("created_at", { ascending: false });
    setLinks(data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [hostIds.join(",")]);

  const create = async (role: "host" | "checker") => {
    if (!hostIds[0]) return toast.error("No host profile");
    const token = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase.from("invite_links").insert({ host_id: hostIds[0], role, token });
    if (error) return toast.error(error.message);
    toast.success(`${role} invite created`);
    load();
  };

  const copy = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Invite Members</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => create("host")}>Invite Host</Button>
          <Button size="sm" variant="outline" onClick={() => create("checker")}>Invite Checker</Button>
        </div>
        {links.length > 0 && (
          <div className="space-y-2">
            {links.map((l) => (
              <div key={l.id} className="flex items-center gap-2">
                <span className="text-xs uppercase text-muted-foreground w-16">{l.role}</span>
                <Input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${l.token}`} className="flex-1 text-xs" />
                <Button size="icon" variant="outline" onClick={() => copy(l.token)}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Ev[]>([]);
  const [hostIds, setHostIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: members } = await supabase.from("host_members").select("host_id").eq("user_id", user.id);
      const ids = (members ?? []).map((m) => m.host_id);
      setHostIds(ids);
      if (ids.length === 0) { setEvents([]); return; }
      const { data: evs } = await supabase.from("events").select("id,title,end_time,capacity").in("host_id", ids).order("start_time", { ascending: false });
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
          <div className="flex gap-2">
            <Button variant="outline" size="icon" asChild title="Host Settings"><Link to="/host-settings"><Settings className="h-4 w-4" /></Link></Button>
            <Button asChild><Link to="/events/new"><Plus className="h-4 w-4 mr-2" />Create Event</Link></Button>
          </div>
        </div>
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {upcoming.length === 0 ? <p className="text-muted-foreground py-6">No upcoming events. <Link to="/events/new" className="text-foreground font-medium underline hover:no-underline">Create one</Link>.</p> : upcoming.map((e) => <Row key={e.id} e={e} />)}
          </TabsContent>
          <TabsContent value="past" className="space-y-3 mt-4">
            {past.length === 0 ? <p className="text-muted-foreground py-6">No past events.</p> : past.map((e) => <Row key={e.id} e={e} />)}
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
            <ReportsPanel hostIds={hostIds} />
          </TabsContent>
          <TabsContent value="invites" className="mt-4">
            <InvitePanel hostIds={hostIds} />
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}
