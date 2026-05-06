import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [msg, setMsg] = useState("Processing invite…");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/invite/${token}` } as any });
      return;
    }
    (async () => {
      try {
        console.log("[invite] fetching token", token);
        const { data: invite, error } = await supabase
          .from("invite_links")
          .select("id,host_id,role,used_by")
          .eq("token", token)
          .maybeSingle();
        console.log("[invite] fetch result", { invite, error });
        if (error || !invite) {
          setStatus("error");
          setMsg("Invalid or expired invite link.");
          return;
        }
        if (invite.used_by && invite.used_by !== user.id) {
          setStatus("error");
          setMsg("This invite link has already been used.");
          return;
        }

        const { data: host } = await supabase.from("hosts").select("name").eq("id", invite.host_id).maybeSingle();
        const hostName = host?.name ?? "this host";

        const { error: mErr } = await supabase.from("host_members").insert({
          host_id: invite.host_id,
          user_id: user.id,
          role: invite.role,
        });
        console.log("[invite] host_members insert", { mErr });
        if (mErr && !mErr.message.toLowerCase().includes("duplicate")) {
          setStatus("error");
          setMsg(`Could not join: ${mErr.message}`);
          return;
        }

        const { error: uErr } = await supabase
          .from("invite_links")
          .update({ used_by: user.id })
          .eq("id", invite.id);
        console.log("[invite] used_by update", { uErr });

        const roleLabel = invite.role.charAt(0).toUpperCase() + invite.role.slice(1);
        setMsg(`You have been added as a ${roleLabel} for ${hostName}.`);
        setStatus("success");
        setTimeout(() => navigate({ to: "/dashboard" }), 2000);
      } catch (e: any) {
        console.error("[invite] acceptance failed:", e);
        setStatus("error");
        setMsg(e?.message ?? "Failed to accept invite.");
      }
    })();
  }, [user, loading, token, navigate]);

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-md py-20">
        <Card>
          <CardContent className="py-10 text-center space-y-4">
            {status === "loading" && <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />}
            {status === "success" && <CheckCircle2 className="h-8 w-8 mx-auto text-green-500" />}
            <p className="text-sm">{msg}</p>
            {status !== "loading" && (
              <Button asChild size="sm"><Link to="/dashboard">Go to dashboard</Link></Button>
            )}
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
