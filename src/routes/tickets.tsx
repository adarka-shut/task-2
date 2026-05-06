import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, formatDate } from "@/lib/auth";
import { toast } from "sonner";
import { downloadIcs } from "@/lib/calendar";
import { promoteWaitlist } from "@/lib/rsvp";

export const Route = createFileRoute("/tickets")({
  component: () => <RequireAuth><Tickets /></RequireAuth>,
});

type T = {
  id: string; ticket_code: string; status: string;
  events: { id: string; title: string; description: string | null; start_time: string; end_time: string; venue_address: string | null; online_link: string | null; is_online: boolean } | null;
};

function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<T[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("rsvps")
      .select("id,ticket_code,status,events(id,title,description,start_time,end_time,venue_address,online_link,is_online)")
      .eq("user_id", user.id).neq("status", "cancelled");
    setTickets((data as any) ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const cancel = async (t: T) => {
    const wasConfirmed = t.status === "confirmed";
    const { error } = await supabase.from("rsvps").update({ status: "cancelled" }).eq("id", t.id);
    if (error) return toast.error(error.message);
    if (wasConfirmed && t.events) await promoteWaitlist(t.events.id);
    toast.success("RSVP cancelled");
    load();
  };

  const addToCalendar = (t: T) => {
    if (!t.events) return;
    downloadIcs({
      uid: t.id,
      title: t.events.title,
      description: t.events.description ?? "",
      start: t.events.start_time,
      end: t.events.end_time,
      location: t.events.is_online ? (t.events.online_link ?? "Online") : (t.events.venue_address ?? ""),
    });
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">My Tickets</h1>
        {tickets.length === 0 && <p className="text-muted-foreground">You don't have any tickets yet.</p>}
        <div className="space-y-4">
          {tickets.map((t) => t.events && (
            <Card key={t.id}>
              <CardContent className="flex flex-col sm:flex-row gap-6">
                <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-muted shrink-0">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <Link to="/events/$id" params={{ id: t.events.id }} className="font-semibold text-lg text-foreground hover:underline">{t.events.title}</Link>
                  <div className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{formatDate(t.events.start_time)}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{t.events.is_online ? "Online" : t.events.venue_address || "TBA"}</div>
                  <div className="font-mono text-xs bg-muted px-2 py-1 rounded inline-block">{t.ticket_code}</div>
                  <div className="text-xs text-muted-foreground capitalize">Status: {t.status}</div>
                  <div className="flex gap-2 pt-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => addToCalendar(t)}>Add to Calendar</Button>
                    <Button size="sm" variant="outline" onClick={() => cancel(t)}>Cancel RSVP</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
