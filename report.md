# Report: EventPass

## Tools Used

- **Lovable** — AI app builder. All code generated via natural language prompts.
- **Supabase** — PostgreSQL database, email/password auth, file storage.
- **Claude (Anthropic)** — prompt planning, schema design, debugging, documentation.
- **GitHub** — version control, auto-connected from Lovable.

**Tech stack:** React, TypeScript, Tailwind CSS, shadcn/ui, Supabase JS client.

## Approach

Built iteratively in 8 phases:

1. UI skeleton — all pages and routes with placeholder data, no backend
2. Missing pages fix — dashboard, check-in, edit event, mobile menu
3. Supabase integration — auth, database tables, RLS policies
4. Core features — RSVP, waitlist, cancel, check-in, CSV export, calendar
5. Bug fixes — routing, storage, edit page
6. Community features — feedback, gallery moderation, reports, invite links
7. Visual redesign — EDU-inspired lime green + dark teal theme
8. Final polish — role permissions, filters, UX improvements

Each phase = 1–3 prompts prepared in Claude before sending to Lovable. This saved significant credits compared to ad-hoc prompting.

## What Worked

- **Pre-planning prompts in Claude** — detailed specs with table schemas produced much better Lovable output than vague requests.
- **UI-first approach** — building the full skeleton without backend allowed visual validation before adding complexity.
- **Supabase auth and database** — migrations, RLS policies, and queries generated well through Lovable.
- **CSV export with UTF-8 BOM** — opened correctly in Excel and Google Sheets on first attempt.
- **Waitlist auto-promotion** — full FIFO cycle worked reliably.

## What Didn't Work

- **Supabase Storage buckets** — could not be created via Lovable migrations ("relation storage.buckets does not exist"). All three buckets (covers, gallery, avatars) had to be created manually in the Supabase Dashboard with RLS policies added by hand.
- **Image uploads kept failing** even after manual bucket setup due to persistent "schema out of sync" errors. Switched to base64 data URLs stored in the database — works for demo, wouldn't scale for production.
- **Route tree conflicts** — Lovable's dev server sometimes generated stale route imports causing build failures. Required explicit prompts to regenerate.
- **Checker role permissions** — took 3 attempts to properly restrict. Lovable kept hiding buttons with CSS instead of checking the role in component logic.
- **Invite link RLS** — policies initially blocked invited users from reading the token. Required relaxing the SELECT policy on invite_links.

## Key Decisions

1. **Base64 images over Supabase Storage** — chose reliability over scalability for this demo.
2. **Free plan bootstrapping** — built the UI skeleton on free credits (5/day), upgraded to Pro only for backend integration.
3. **Client-side CSV and .ics generation** — avoided Edge Functions complexity.
4. **Feedback open to all authenticated users** — simplified testing for evaluators.
5. **EDU-inspired color scheme** — lime green + dark teal for a distinctive look.
