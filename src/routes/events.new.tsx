import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { RequireAuth } from "@/components/require-auth";
import { EventForm } from "@/components/event-form";
import { HostOnly } from "@/components/host-only";

export const Route = createFileRoute("/events/new")({
  component: () => <RequireAuth><HostOnly><SiteLayout><EventForm mode="new" /></SiteLayout></HostOnly></RequireAuth>,
});
