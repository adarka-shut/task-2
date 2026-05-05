import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tickets, getEvent, formatDate } from "@/lib/placeholder-data";
import { Calendar, MapPin, QrCode } from "lucide-react";

export const Route = createFileRoute("/tickets")({
  component: Tickets,
});

function Tickets() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">My Tickets</h1>
        <div className="space-y-4">
          {tickets.map((t) => {
            const e = getEvent(t.eventId);
            return (
              <Card key={t.id}>
                <CardContent className="flex flex-col sm:flex-row gap-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-muted shrink-0">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Link to="/events/$id" params={{ id: e.id }} className="font-semibold text-lg hover:text-primary">{e.title}</Link>
                    <div className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{formatDate(e.start)}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{e.online ? "Online" : e.venue}</div>
                    <div className="font-mono text-xs bg-muted px-2 py-1 rounded inline-block">{t.code}</div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">Add to Calendar</Button>
                      <Button size="sm" variant="ghost">Cancel RSVP</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
