import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, formatDate, generateTicketCode } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/events/$id")({
  component: EventPage,
});

type EventDetail = {
  id: string; title: string; description: string | null; cover_image_url: string | null;
  start_time: string; end_time: string; timezone: string; venue_address: string | null;
  is_online: boolean; online_link: string | null; capacity: number; host_id: string;
  hosts: { id: string; name: string; logo_url: string | null; bio: string | null } | null;
};

function EventPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [going, setGoing] = useState(0);
  const [myRsvp, setMyRsvp] = useState<{ id: string; status: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("events")
      .select("id,title,description,cover_image_url,start_time,end_time,timezone,venue_address,is_online,online_link,capacity,host_id,hosts(id,name,logo_url,bio)")
      .eq("id", id)
      .maybeSingle();
    setEvent(data as any);
    const { count } = await supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("event_id", id).eq("status", "confirmed");
    setGoing(count ?? 0);
    if (user) {
      const { data: r } = await supabase.from("rsvps").select("id,status").eq("event_id", id).eq("user_id", user.id).maybeSingle();
      setMyRsvp(r);
    } else {
      setMyRsvp(null);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user?.id]);

  if (!event) return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div></SiteLayout>;

  const past = new Date(event.end_time) < new Date();
  const cover = event.cover_image_url || `https://placehold.co/1200x600?text=${encodeURIComponent(event.title)}`;
  const host = event.hosts;

  const handleRsvp = async () => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/events/${id}` } as any });
      return;
    }
    setLoading(true);
    const status = going >= event.capacity ? "waitlisted" : "confirmed";
    const { error } = await supabase.from("rsvps").insert({
      event_id: id, user_id: user.id, status, ticket_code: generateTicketCode(),
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "confirmed" ? "You're going!" : "Added to waitlist");
    load();
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-muted mb-8">
          <img src={cover} alt={event.title} className="h-full w-full object-cover" />
          {past && <Badge className="absolute top-4 left-4" variant="secondary">Ended</Badge>}
        </div>

        {past && <div className="mb-6 rounded-lg border border-muted bg-muted/50 px-4 py-3 text-sm text-muted-foreground">This event has ended.</div>}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mt-4 text-muted-foreground">
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(event.start_time)} ({event.timezone})</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.is_online ? "Online" : event.venue_address || "TBA"}</span>
                <span className="flex items-center gap-2"><Users className="h-4 w-4" />{going} / {event.capacity} spots</span>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <h2 className="text-xl font-semibold mb-2">About this event</h2>
              <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
            </div>
            {past && (
              <Card>
                <CardHeader><CardTitle>Post-event feedback</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Feedback collection will appear here after the event.</CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {!past && (
              <Card>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">Free event</div>
                  {myRsvp ? (
                    <Button className="w-full" disabled>{myRsvp.status === "confirmed" ? "You're going" : "On waitlist"}</Button>
                  ) : (
                    <Button className="w-full" onClick={handleRsvp} disabled={loading}>RSVP</Button>
                  )}
                </CardContent>
              </Card>
            )}
            {host && (
              <Card>
                <CardHeader><CardTitle className="text-base">Hosted by</CardTitle></CardHeader>
                <CardContent>
                  <Link to="/hosts/$id" params={{ id: host.id }} className="flex items-center gap-3 group">
                    <img src={host.logo_url || `https://placehold.co/120x120?text=${encodeURIComponent(host.name.charAt(0))}`} alt={host.name} className="h-12 w-12 rounded-full" />
                    <div>
                      <div className="font-medium group-hover:text-primary">{host.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{host.bio}</div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
