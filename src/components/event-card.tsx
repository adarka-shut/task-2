import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { type Event, formatDate } from "@/lib/placeholder-data";

export function EventCard({ event }: { event: Event }) {
  return (
    <Link
      to="/events/$id"
      params={{ id: event.id }}
      className="group block transition-transform hover:-translate-y-0.5"
    >
      <Card className="overflow-hidden h-full pt-0">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={event.cover}
            alt={event.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {event.past && (
            <Badge variant="secondary" className="absolute top-3 left-3">
              Ended
            </Badge>
          )}
        </div>
        <CardContent className="space-y-2">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(event.start)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {event.online ? "Online" : event.venue}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
