import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { EventForm } from "@/components/event-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/events_/$id/edit")({
  component: EditPage,
});

function EditGuard({ id }: { id: string }) {
  const { user } = useAuth();
  const [state, setState] = useState<"loading" | "ok" | "deny">("loading");
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: ev } = await supabase.from("events").select("host_id").eq("id", id).maybeSingle();
      if (!ev) return setState("deny");
      const { data: m } = await supabase.from("host_members").select("role").eq("user_id", user.id).eq("host_id", ev.host_id).maybeSingle();
      setState(m?.role === "host" ? "ok" : "deny");
    })();
  }, [user?.id, id]);
  if (state === "loading") return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div></SiteLayout>;
  if (state === "deny") return <Navigate to="/dashboard" />;
  return <SiteLayout><EventForm mode="edit" eventId={id} /></SiteLayout>;
}

function EditPage() {
  const { id } = Route.useParams();
  return <RequireAuth><EditGuard id={id} /></RequireAuth>;
}
