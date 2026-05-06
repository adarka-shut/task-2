import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type HostMembership = { host_id: string; role: "host" | "checker" };

export function useRoles() {
  const { user, loading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState<HostMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setMemberships([]); setLoading(false); return; }
    setLoading(true);
    supabase.from("host_members").select("host_id,role").eq("user_id", user.id).then(({ data }) => {
      setMemberships((data ?? []) as HostMembership[]);
      setLoading(false);
    });
  }, [user?.id, authLoading]);

  const isHost = memberships.some((m) => m.role === "host");
  const isChecker = memberships.some((m) => m.role === "checker");
  // Checker-only when user has memberships and none are host
  const isCheckerOnly = !isHost && isChecker;
  const hostIds = memberships.filter((m) => m.role === "host").map((m) => m.host_id);
  const checkerHostIds = memberships.filter((m) => m.role === "checker").map((m) => m.host_id);

  return { memberships, isHost, isChecker, isCheckerOnly, hostIds, checkerHostIds, loading };
}
