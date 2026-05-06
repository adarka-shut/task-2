import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// value: ISO-local string "YYYY-MM-DDTHH:mm" (matches datetime-local format)
export function DateTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { date, hour, minute } = useMemo(() => {
    if (!value) return { date: "", hour: "18", minute: "00" };
    const [d, t = "18:00"] = value.split("T");
    const [h = "18", m = "00"] = t.split(":");
    const minSnap = ["00", "15", "30", "45"].reduce((a, b) =>
      Math.abs(parseInt(b) - parseInt(m)) < Math.abs(parseInt(a) - parseInt(m)) ? b : a, "00");
    return { date: d, hour: h.padStart(2, "0"), minute: minSnap };
  }, [value]);

  const update = (d: string, h: string, m: string) => {
    if (!d) return onChange("");
    onChange(`${d}T${h}:${m}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className="flex gap-2">
      <Input type="date" value={date} onChange={(e) => update(e.target.value, hour, minute)} className="flex-1" />
      <Select value={hour} onValueChange={(h) => update(date, h, minute)}>
        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
        <SelectContent>{hours.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={minute} onValueChange={(m) => update(date, hour, m)}>
        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
        <SelectContent>{minutes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
