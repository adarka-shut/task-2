# EventPass

Community event platform for tech meetups, hackathons, and workshops.

**Live:** https://local-meetup-forge.lovable.app/

---

## Quick Start

**Browse events** — open the app, no account needed.

**Attend an event** — click RSVP, sign in or register, get your ticket.

**Host events** — register → click "Register as Host" → set up your profile → create events.

---

## Main Flows

### Publish an Event

1. Click **+ Create Event** in the navbar.
2. Fill in: title, description, dates (15-min slots), timezone, venue or online link, capacity, cover image.
3. Set visibility: **Public** (appears on Explore) or **Unlisted** (direct link only).
4. Click **Publish**. The event is live.

To edit later: Dashboard → Edit. You can also Unpublish, Duplicate, or Delete.

### RSVP

1. Find an event on **Explore** or via a shared link.
2. Click **RSVP** (sign in if needed — you'll return to the event page).
3. If spots available → confirmed. If full → added to waitlist with your position shown.
4. If someone cancels → next in line is auto-promoted.

### Get Your Ticket

1. Go to **My Tickets** in the navbar.
2. Each ticket has: QR code, unique code (e.g. `TICK-2UY6EE`), event details.
3. **Add to Calendar** downloads an .ics file.
4. **Cancel RSVP** frees your spot (waitlist auto-promotes).

### Check-in at the Event

1. Host or Checker opens Dashboard → **Check-in** next to the event.
2. Enter the attendee's ticket code → click **Check In**.
3. Success: green banner with name. Already scanned: red error banner.
4. Live counter updates. **Undo Last** reverses the most recent scan.

---

## Other Features

| Feature | Details |
|---------|---------|
| **CSV Export** | Dashboard → Export CSV per event. Columns: name, email, rsvp_status, checked_in_time. Opens in Excel/Sheets. |
| **Feedback** | After event ends, attendees rate 1–5 stars + optional comment. Average shown on event page. |
| **Photo Gallery** | Attendees upload photos to past events. Require host approval before public display. |
| **Reports** | Flag any event or photo. Host reviews in Dashboard → Reports → Hide or Dismiss. |
| **Roles** | Host (full access) and Checker (check-in only). Invite via copyable link from Dashboard → Invites. |
| **Paid toggle** | Visible but disabled with "Coming soon" tooltip. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Hosting | Lovable Cloud |
| Version Control | GitHub |

---

## Seed Data

The deployed app includes:
- 1 host profile
- 2 past events (with feedback and gallery photos)
- 5 upcoming events with cover images
