import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { events, hosts, getHost, formatDate } from "@/lib/placeholder-data";

export const Route = createFileRoute("/my-events")({
  component: MyEvents,
});

function MyEvents() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Events</h1>

        <div className="grid gap-3 md:grid-cols-4 mb-6 p-4 border rounded-lg bg-card">
          <div className="md:col-span-2">
            <Label className="mb-1.5 block">Search</Label>
            <Input placeholder="Search..." />
          </div>
          <div>
            <Label className="mb-1.5 block">Host</Label>
            <Select defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hosts</SelectItem>
                {hosts.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">When</Label>
            <Select defaultValue="any">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {events.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(e.start)} · {getHost(e.hostId).name}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" asChild><Link to="/events/$id" params={{ id: e.id }}>View</Link></Button>
                  <Button size="sm" variant="outline" asChild><Link to="/events/$id/edit" params={{ id: e.id }}>Edit</Link></Button>
                  <Button size="sm" variant="outline" asChild><Link to="/events/$id/checkin" params={{ id: e.id }}>Check-in</Link></Button>
                  <Button size="sm" variant="outline" asChild><Link to="/dashboard">Dashboard</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
