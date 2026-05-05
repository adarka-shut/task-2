import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Copy } from "lucide-react";

export function EventForm({ mode }: { mode: "new" | "edit" }) {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{mode === "new" ? "Create event" : "Edit event"}</h1>
        <div className="flex items-center gap-3">
          <Badge variant={mode === "edit" ? "default" : "secondary"}>
            {mode === "edit" ? "Published" : "Draft"}
          </Badge>
          {mode === "edit" && (
            <Button variant="outline" size="sm"><Copy className="h-4 w-4 mr-2" />Duplicate</Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-1.5 block">Cover image</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground hover:bg-muted/30 cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">Click to upload or drag & drop</p>
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="mb-1.5 block">Title</Label>
            <Input id="title" placeholder="Event title" />
          </div>
          <div>
            <Label htmlFor="desc" className="mb-1.5 block">Description</Label>
            <Textarea id="desc" rows={5} placeholder="Tell people what to expect..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Start</Label>
              <Input type="datetime-local" />
            </div>
            <div>
              <Label className="mb-1.5 block">End</Label>
              <Input type="datetime-local" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Timezone</Label>
            <Select defaultValue="Europe/Berlin">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch id="online" />
              <Label htmlFor="online">This is an online event</Label>
            </div>
            <Input placeholder="Venue address or online meeting link" />
          </div>

          <div>
            <Label className="mb-1.5 block">Capacity</Label>
            <Input type="number" defaultValue={50} />
          </div>

          <div>
            <Label className="mb-2 block">Pricing</Label>
            <div className="inline-flex rounded-md border p-1 gap-1">
              <Button size="sm" variant="default">Free</Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button size="sm" variant="ghost" disabled>Paid</Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button variant="outline">Save Draft</Button>
            <Button>Publish</Button>
            {mode === "edit" && <Button variant="ghost">Unpublish</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
