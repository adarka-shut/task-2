import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Processing invite…");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/invite/${token}` } as any });
      return;
    }
    (async () => {
      const { data: invite, error } = await supabase.from("invite_links").select("id,host_id,role,used_by").eq("token", token).maybeSingle();
      if (error || !invite) { setMsg("Invalid or expired invite link."); return; }
      const { error: mErr } = await supabase.from("host_members").insert({ host_id: invite.host_id, user_id: user.id, role: invite.role });
      if (mErr && !mErr.message.includes("duplicate")) { setMsg(mErr.message); return; }
      await supabase.from("invite_links").update({ used_by: user.id }).eq("id", invite.id);
      toast.success(`You're now a ${invite.role} for this host`);
      navigate({ to: "/dashboard" });
    })();
  }, [user, loading, token, navigate]);

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-md py-20">
        <Card><CardContent className="py-10 text-center space-y-3">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{msg}</p>
        </CardContent></Card>
      </div>
    </SiteLayout>
  );
}
