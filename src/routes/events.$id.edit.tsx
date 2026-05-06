import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { EventForm } from "@/components/event-form";

export const Route = createFileRoute("/events/$id/edit")({
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  return <RequireAuth><SiteLayout><EventForm mode="edit" eventId={id} /></SiteLayout></RequireAuth>;
}

