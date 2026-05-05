import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getEvent } from "@/lib/placeholder-data";
import { ScanLine, Undo2 } from "lucide-react";

export const Route = createFileRoute("/events/$id/checkin")({
  component: CheckIn,
});

function CheckIn() {
  const { id } = Route.useParams();
  const event = getEvent(id);
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-2xl font-bold">Check-in</h1>
        <p className="text-muted-foreground mb-6">{event.title}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card><CardContent><div className="text-sm text-muted-foreground">Checked in</div><div className="text-3xl font-bold">0</div></CardContent></Card>
          <Card><CardContent><div className="text-sm text-muted-foreground">Total</div><div className="text-3xl font-bold">0</div></CardContent></Card>
        </div>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Manual entry</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="TICK-XXXX" className="font-mono" />
            <Button>Check in</Button>
            <Button variant="outline"><ScanLine className="h-4 w-4 mr-2" />Scan</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Last scanned</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">No tickets scanned yet.</p>
            <Button variant="outline" size="sm"><Undo2 className="h-4 w-4 mr-2" />Undo Last</Button>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
