import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { EventCard, type EventRow } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EventPass — Discover and host community events" },
      { name: "description", content: "Find free community events near you or host your own with EventPass." },
    ],
  }),
  component: Index,
});

function Index() {
  const [featured, setFeatured] = useState<EventRow[]>([]);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,cover_image_url,start_time,end_time,venue_address,is_online")
      .eq("status", "published")
      .eq("visibility", "public")
      .gte("end_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(3)
      .then(({ data }) => setFeatured(data ?? []));
  }, []);

  const goExplore = (e?: React.FormEvent) => {
    e?.preventDefault();
    navigate({ to: "/explore", search: { q: q || undefined } as any });
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">Discover and host community events</h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">Free events from real people in your community. RSVP in seconds, host without friction.</p>
        <form onSubmit={goExplore} className="mt-8 flex max-w-xl mx-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-9 h-11" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button type="submit" size="lg">Browse</Button>
        </form>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured events</h2>
          <Link to="/explore" className="text-sm text-foreground font-medium underline hover:no-underline">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No upcoming events yet. Be the first to host!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
