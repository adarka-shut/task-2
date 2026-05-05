import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { EventCard } from "@/components/event-card";
import { getHost, eventsByHost } from "@/lib/placeholder-data";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/hosts/$id")({
  component: HostPage,
});

function HostPage() {
  const { id } = Route.useParams();
  const host = getHost(id);
  const list = eventsByHost(host.id);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          <img src={host.logo} alt={host.name} className="h-24 w-24 rounded-full" />
          <div>
            <h1 className="text-3xl font-bold">{host.name}</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">{host.bio}</p>
            <a href={`mailto:${host.email}`} className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <Mail className="h-4 w-4" /> {host.email}
            </a>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">Events</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </div>
    </SiteLayout>
  );
}
