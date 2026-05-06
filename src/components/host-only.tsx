import { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useRoles } from "@/lib/use-roles";
import { SiteLayout } from "@/components/site-layout";

export function HostOnly({ children, redirectTo = "/host-setup" }: { children: ReactNode; redirectTo?: string }) {
  const { isHost, loading } = useRoles();
  if (loading) {
    return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div></SiteLayout>;
  }
  if (!isHost) {
    return <Navigate to={redirectTo} />;
  }
  return <>{children}</>;
}
