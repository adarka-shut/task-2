import { supabase } from "@/integrations/supabase/client";

// After cancelling/removing a confirmed RSVP, promote the oldest waitlisted user.
export async function promoteWaitlist(eventId: string) {
  const { data: ev } = await supabase.from("events").select("capacity").eq("id", eventId).maybeSingle();
  if (!ev) return;
  const { count } = await supabase.from("rsvps").select("*", { count: "exact", head: true })
    .eq("event_id", eventId).eq("status", "confirmed");
  if ((count ?? 0) >= ev.capacity) return;
  const { data: next } = await supabase.from("rsvps").select("id")
    .eq("event_id", eventId).eq("status", "waitlisted")
    .order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (next) await supabase.from("rsvps").update({ status: "confirmed" }).eq("id", next.id);
}

export async function waitlistPosition(eventId: string, rsvpId: string) {
  const { data } = await supabase.from("rsvps").select("id,created_at")
    .eq("event_id", eventId).eq("status", "waitlisted")
    .order("created_at", { ascending: true });
  const idx = (data ?? []).findIndex((r) => r.id === rsvpId);
  return idx === -1 ? null : idx + 1;
}
