function fmt(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
export function downloadIcs(opts: { title: string; description?: string; start: string; end: string; location?: string; uid: string }) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EventPass//EN",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@eventpass`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(new Date(opts.start))}`,
    `DTEND:${fmt(new Date(opts.end))}`,
    `SUMMARY:${(opts.title || "").replace(/\n/g, " ")}`,
    `DESCRIPTION:${(opts.description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${(opts.location || "").replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  triggerDownload(blob, `${opts.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`);
}

export function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) {
    const blob = new Blob(["\uFEFF"], { type: "text/csv;charset=utf-8" });
    return triggerDownload(blob, filename);
  }
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
