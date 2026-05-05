import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { EventCard } from "@/components/event-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { events } from "@/lib/placeholder-data";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore Events — EventPass" }, { name: "description", content: "Browse upcoming community events." }] }),
  component: Explore,
});

function Explore() {
  const [includePast, setIncludePast] = useState(false);
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");

  const filtered = events.filter((e) => {
    if (!includePast && e.past) return false;
    if (q && !e.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (loc && !(e.venue + (e.online ? "online" : "")).toLowerCase().includes(loc.toLowerCase())) return false;
    return true;
  });

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Explore</h1>
        <div className="grid gap-4 md:grid-cols-4 mb-8 p-4 border rounded-lg bg-card">
          <div className="md:col-span-2">
            <Label className="mb-1.5 block">Search</Label>
            <Input placeholder="Search events..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">When</Label>
            <Select defaultValue="upcoming">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="any">Any time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Location</Label>
            <Input placeholder="City or 'Online'" value={loc} onChange={(e) => setLoc(e.target.value)} />
          </div>
          <div className="md:col-span-4 flex items-center gap-2">
            <Switch id="past" checked={includePast} onCheckedChange={setIncludePast} />
            <Label htmlFor="past">Include past events</Label>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No events match your filters.</p>
        )}
      </div>
    </SiteLayout>
  );
}
