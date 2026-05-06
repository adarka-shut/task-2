import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function ReportButton({ eventId, galleryId, label = "Report", size = "sm", variant = "ghost" }: {
  eventId?: string; galleryId?: string; label?: string;
  size?: "sm" | "icon" | "default"; variant?: "ghost" | "outline" | "secondary";
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) { navigate({ to: "/login" }); return; }
    if (!reason.trim()) return toast.error("Please provide a reason");
    setLoading(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      event_id: eventId ?? null,
      gallery_id: galleryId ?? null,
      reason: reason.trim(),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Report submitted");
    setReason("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant}><Flag className="h-4 w-4 mr-1" />{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Report this {galleryId ? "photo" : "event"}</DialogTitle></DialogHeader>
        <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What's the problem?" />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>Submit report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
