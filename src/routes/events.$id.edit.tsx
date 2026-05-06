import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { EventForm } from "@/components/event-form";

export const Route = createFileRoute("/events/$id/edit")({
  component: () => <RequireAuth><SiteLayout><EventForm mode="edit" /></SiteLayout></RequireAuth>,
});
