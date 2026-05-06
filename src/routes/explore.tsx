import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { EventCard, type EventRow } from "@/components/event-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/explore")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : undefined }),
  head: () => ({ meta: [{ title: "Explore Events — EventPass" }] }),
  component: Explore,
});

type WhenFilter = "upcoming" | "week" | "month" | "custom";

function Explore() {
  const search = Route.useSearch();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [includePast, setIncludePast] = useState(false);
  const [q, setQ] = useState(search.q ?? "");
  const [loc, setLoc] = useState<string>("all");
  const [when, setWhen] = useState<WhenFilter>("upcoming");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,cover_image_url,start_time,end_time,venue_address,is_online")
      .eq("status", "published")
      .eq("visibility", "public")
      .order("start_time", { ascending: true })
      .then(({ data }) => setEvents(data ?? []));
  }, []);

  const locations = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.venue_address && e.venue_address.trim()) set.add(e.venue_address.trim());
    });
    return Array.from(set).sort();
  }, [events]);

  const hasOnline = useMemo(() => events.some((e) => e.is_online), [events]);

  const now = new Date();
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
  const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const filtered = events.filter((e) => {
    const start = new Date(e.start_time);
    const end = new Date(e.end_time);
    const past = end < now;
    if (!includePast) {
      if (past) return false;
      if (when === "upcoming" && start < now && end < now) return false;
      if (when === "week" && (end < startOfWeek || start >= endOfWeek)) return false;
      if (when === "month" && (end < startOfMonth || start >= endOfMonth)) return false;
      if (when === "custom") {
        if (customStart && end < new Date(customStart)) return false;
        if (customEnd) {
          const ce = new Date(customEnd); ce.setHours(23,59,59,999);
          if (start > ce) return false;
        }
      }
    }
    if (q && !e.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (loc && loc !== "all") {
      if (loc === "__online__") { if (!e.is_online) return false; }
      else if ((e.venue_address || "").trim() !== loc) return false;
    }
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
            <Select value={when} onValueChange={(v) => setWhen(v as WhenFilter)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Location</Label>
            <Select value={loc} onValueChange={setLoc}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {hasOnline && <SelectItem value="__online__">Online</SelectItem>}
                {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {when === "custom" && (
            <>
              <div>
                <Label className="mb-1.5 block">From</Label>
                <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 block">To</Label>
                <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
              </div>
            </>
          )}
          <div className="md:col-span-4 flex items-center gap-2">
            <Switch id="past" checked={includePast} onCheckedChange={setIncludePast} />
            <Label htmlFor="past">Include past events</Label>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No events match your filters.</p>}
      </div>
    </SiteLayout>
  );
}
