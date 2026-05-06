import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { EventForm } from "@/components/event-form";
import { HostOnly } from "@/components/host-only";

export const Route = createFileRoute("/events_/$id/edit")({
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  return <RequireAuth><HostOnly><SiteLayout><EventForm mode="edit" eventId={id} /></SiteLayout></HostOnly></RequireAuth>;
}

