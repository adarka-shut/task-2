import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { events } from "@/lib/placeholder-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EventPass — Discover and host community events" },
      { name: "description", content: "Find free community events near you or host your own with EventPass." },
      { property: "og:title", content: "EventPass — Discover and host community events" },
      { property: "og:description", content: "Find free community events near you or host your own with EventPass." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = events.filter((e) => !e.past).slice(0, 3);
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
          Discover and host community events
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Free events from real people in your community. RSVP in seconds, host without friction.
        </p>
        <div className="mt-8 flex max-w-xl mx-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-9 h-11" />
          </div>
          <Button size="lg" asChild>
            <Link to="/explore">Browse</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured events</h2>
          <Link to="/explore" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </section>
    </SiteLayout>
  );
}
