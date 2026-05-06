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
import { promoteWaitlist, waitlistPosition } from "@/lib/rsvp";
import { FeedbackSection } from "@/components/feedback-section";
import { GallerySection } from "@/components/gallery-section";
import { ReportButton } from "@/components/report-dialog";

export const Route = createFileRoute("/events/$id")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("events")
      .select("id,title,description,cover_image_url")
      .eq("id", params.id)
      .maybeSingle();
    return { meta: data };
  },
  head: ({ loaderData, params }) => {
    const e = loaderData?.meta as { title?: string; description?: string | null; cover_image_url?: string | null } | null;
    const title = e?.title || "Event";
    const description = (e?.description || "View event details on EventPass").slice(0, 200);
    const url = `/events/${params.id}`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (e?.cover_image_url && !e.cover_image_url.startsWith("data:")) {
      meta.push({ property: "og:image", content: e.cover_image_url });
      meta.push({ name: "twitter:image", content: e.cover_image_url });
    }
    return { meta };
  },
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
  const [position, setPosition] = useState<number | null>(null);
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
      const { data: r } = await supabase.from("rsvps").select("id,status").eq("event_id", id).eq("user_id", user.id).neq("status", "cancelled").maybeSingle();
      setMyRsvp(r);
      if (r?.status === "waitlisted") setPosition(await waitlistPosition(id, r.id));
      else setPosition(null);
    } else {
      setMyRsvp(null);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user?.id]);

  if (!event) return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div></SiteLayout>;

  const past = new Date(event.end_time) < new Date();
  const full = going >= event.capacity;
  const cover = event.cover_image_url || `https://placehold.co/1200x600?text=${encodeURIComponent(event.title)}`;
  const host = event.hosts;

  const handleRsvp = async () => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/events/${id}` } as any });
      return;
    }
    setLoading(true);
    const status = full ? "waitlisted" : "confirmed";
    const { error } = await supabase.from("rsvps").insert({
      event_id: id, user_id: user.id, status, ticket_code: generateTicketCode(),
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "confirmed" ? "You're going!" : "Added to waitlist");
    load();
  };

  const handleCancel = async () => {
    if (!myRsvp) return;
    setLoading(true);
    const wasConfirmed = myRsvp.status === "confirmed";
    const { error } = await supabase.from("rsvps").update({ status: "cancelled" }).eq("id", myRsvp.id);
    if (error) { setLoading(false); toast.error(error.message); return; }
    if (wasConfirmed) await promoteWaitlist(id);
    setLoading(false);
    toast.success("RSVP cancelled");
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
            <div><ReportButton eventId={event.id} variant="outline" /></div>
            {past && <FeedbackSection eventId={event.id} />}
            {past && <GallerySection eventId={event.id} hostId={event.host_id} />}
          </div>

          <div className="space-y-4">
            {!past && (
              <Card>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">Free event</div>
                  {myRsvp ? (
                    <div className="space-y-2">
                      <Button className="w-full" disabled>
                        {myRsvp.status === "confirmed" ? "You're going" : `On waitlist${position ? ` (position ${position})` : ""}`}
                      </Button>
                      <Button className="w-full" variant="outline" onClick={handleCancel} disabled={loading}>Cancel RSVP</Button>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={handleRsvp} disabled={loading}>
                      {full ? "Join waitlist" : "RSVP"}
                    </Button>
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
                      <div className="font-medium text-foreground group-hover:underline">{host.name}</div>
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
