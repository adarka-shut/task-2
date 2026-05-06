import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { EventCard, type EventRow } from "@/components/event-card";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/hosts/$id")({
  component: HostPage,
});

type Host = { id: string; name: string; logo_url: string | null; bio: string | null; contact_email: string };

function HostPage() {
  const { id } = Route.useParams();
  const [host, setHost] = useState<Host | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    supabase.from("hosts").select("*").eq("id", id).maybeSingle().then(({ data }) => setHost(data as any));
    supabase.from("events")
      .select("id,title,cover_image_url,start_time,end_time,venue_address,is_online")
      .eq("host_id", id).eq("status", "published")
      .order("start_time", { ascending: false })
      .then(({ data }) => setEvents(data ?? []));
  }, [id]);

  if (!host) return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div></SiteLayout>;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          <img src={host.logo_url || `https://placehold.co/120x120?text=${encodeURIComponent(host.name.charAt(0))}`} alt={host.name} className="h-24 w-24 rounded-full" />
          <div>
            <h1 className="text-3xl font-bold">{host.name}</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">{host.bio}</p>
            <a href={`mailto:${host.contact_email}`} className="mt-3 inline-flex items-center gap-2 text-sm text-foreground font-medium underline hover:no-underline">
              <Mail className="h-4 w-4" /> {host.contact_email}
            </a>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">Events</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </div>
    </SiteLayout>
  );
}
