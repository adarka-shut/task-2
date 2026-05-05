import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { events } from "@/lib/placeholder-data";
import { Plus, Download } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function EventRow({ id, title, going, waitlist, checkedIn }: any) {
  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/events/$id" params={{ id }} className="font-medium hover:text-primary">{title}</Link>
          <div className="text-xs text-muted-foreground mt-1">
            Going {going} · Waitlist {waitlist} · Checked-in {checkedIn}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild><Link to="/events/$id/edit" params={{ id }}>Edit</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/events/$id/checkin" params={{ id }}>Check-in</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const upcoming = events.filter((e) => !e.past);
  const past = events.filter((e) => e.past);
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Host dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
            <Button asChild><Link to="/events/new"><Plus className="h-4 w-4 mr-2" />Create Event</Link></Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {upcoming.map((e) => <EventRow key={e.id} id={e.id} title={e.title} going={e.going} waitlist={3} checkedIn={0} />)}
          </TabsContent>
          <TabsContent value="past" className="space-y-3 mt-4">
            {past.map((e) => <EventRow key={e.id} id={e.id} title={e.title} going={e.going} waitlist={0} checkedIn={e.going - 5} />)}
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}
