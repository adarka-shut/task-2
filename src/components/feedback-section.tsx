import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

type Fb = { id: string; rating: number; comment: string | null; created_at: string; user_id: string; profiles: { name: string } | null };

export function FeedbackSection({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const [list, setList] = useState<Fb[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("feedback")
      .select("id,rating,comment,created_at,user_id,profiles(name)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    setList((data as any) ?? []);
    if (user) {
      const { data: r } = await supabase.from("rsvps").select("id").eq("event_id", eventId).eq("user_id", user.id).eq("status", "confirmed").maybeSingle();
      setHasConfirmed(!!r);
      const mine = (data ?? []).find((f: any) => f.user_id === user.id);
      setSubmitted(!!mine);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [eventId, user?.id]);

  const submit = async () => {
    if (!user) return;
    if (rating < 1) return toast.error("Please select a rating");
    setLoading(true);
    const { error } = await supabase.from("feedback").insert({ event_id: eventId, user_id: user.id, rating, comment: comment.trim() || null });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks for your feedback!");
    setComment(""); setRating(0);
    load();
  };

  const avg = list.length ? (list.reduce((s, f) => s + f.rating, 0) / list.length) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Feedback
          {list.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {avg.toFixed(1)} ({list.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && hasConfirmed && !submitted && (
          <div className="space-y-3 pb-4 border-b">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star className={`h-6 w-6 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts (optional)" />
            <Button onClick={submit} disabled={loading}>Submit feedback</Button>
          </div>
        )}
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No feedback yet.</p>
        ) : (
          <div className="space-y-3">
            {list.map((f) => (
              <div key={f.id} className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{f.profiles?.name ?? "Attendee"}</span>
                  <span className="flex">
                    {[1,2,3,4,5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= f.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />)}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                {f.comment && <p className="text-sm text-muted-foreground">{f.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
