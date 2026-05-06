import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, formatDate } from "@/lib/auth";
import { useRoles } from "@/lib/use-roles";

export const Route = createFileRoute("/my-events")({
  component: () => <RequireAuth><MyEvents /></RequireAuth>,
});

type Ev = { id: string; title: string; start_time: string; hosts: { name: string } | null };

function MyEvents() {
  const { user } = useAuth();
  const { isHost } = useRoles();
  const [events, setEvents] = useState<Ev[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: m } = await supabase.from("host_members").select("host_id").eq("user_id", user.id);
      const ids = (m ?? []).map((x) => x.host_id);
      if (ids.length === 0) return setEvents([]);
      const { data } = await supabase.from("events").select("id,title,start_time,hosts(name)").in("host_id", ids).order("start_time", { ascending: false });
      setEvents((data as any) ?? []);
    })();
  }, [user]);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Events</h1>
        {events.length === 0 ? (
          <p className="text-muted-foreground">You're not managing any events yet. <Link to="/host-setup" className="text-foreground font-medium underline hover:no-underline">Set up a host profile</Link> to get started.</p>
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <Card key={e.id}>
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatDate(e.start_time)} · {e.hosts?.name}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {isHost && <Button size="sm" variant="outline" asChild><Link to="/events/$id" params={{ id: e.id }}>View</Link></Button>}
                    {isHost && <Button size="sm" variant="outline" asChild><Link to="/events/$id/edit" params={{ id: e.id }}>Edit</Link></Button>}
                    <Button size="sm" variant="outline" asChild><Link to="/events/$id/checkin" params={{ id: e.id }}>Check-in</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
