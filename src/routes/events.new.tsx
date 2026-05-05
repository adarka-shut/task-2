import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { EventForm } from "@/components/event-form";

export const Route = createFileRoute("/events/new")({
  component: () => <SiteLayout><EventForm mode="new" /></SiteLayout>,
});
