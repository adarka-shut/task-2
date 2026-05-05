import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getEvent, getHost, formatDate } from "@/lib/placeholder-data";
import { Calendar, MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/events/$id")({
  component: EventPage,
});

function EventPage() {
  const { id } = Route.useParams();
  const event = getEvent(id);
  const host = getHost(event.hostId);

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-muted mb-8">
          <img src={event.cover} alt={event.title} className="h-full w-full object-cover" />
          {event.past && <Badge className="absolute top-4 left-4" variant="secondary">Ended</Badge>}
        </div>

        {event.past && (
          <div className="mb-6 rounded-lg border border-muted bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            This event has ended.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mt-4 text-muted-foreground">
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(event.start)} ({event.timezone})</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.online ? "Online" : event.venue}</span>
                <span className="flex items-center gap-2"><Users className="h-4 w-4" />{event.going} / {event.capacity} spots</span>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <h2 className="text-xl font-semibold mb-2">About this event</h2>
              <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
            </div>

            {event.past && (
              <Card>
                <CardHeader><CardTitle>Post-event feedback</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Feedback collection will appear here after the event.
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {!event.past && (
              <Card>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">Free event</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="block">
                        <Button className="w-full" disabled>RSVP</Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Sign in to RSVP</TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle className="text-base">Hosted by</CardTitle></CardHeader>
              <CardContent>
                <Link to="/hosts/$id" params={{ id: host.id }} className="flex items-center gap-3 group">
                  <img src={host.logo} alt={host.name} className="h-12 w-12 rounded-full" />
                  <div>
                    <div className="font-medium group-hover:text-primary">{host.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{host.bio}</div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
