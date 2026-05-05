import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — EventPass" },
      { name: "description", content: "About EventPass." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">About EventPass</h1>
        <p className="text-muted-foreground">About EventPass — coming soon.</p>
      </div>
    </SiteLayout>
  );
}
