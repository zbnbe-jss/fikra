# FIKRA 2.0 — build notes

This documents what was actually built from the FIKRA 2.0 spec, and what was
deliberately left out (per the spec's own rule: "do not fake AI, fake
compatibility percentages, or randomly recommend projects").

## Built

- New brand palette, fonts, reduced-motion support
- Hero phrase animation (fixed-height, no layout shift)
- 12-question quiz (9 recovered + 3 new: personality, skills, ambition)
- Weighted scoring engine with a real, inspectable compatibility % (`src/lib/scoring.ts`)
- Result page: best match + alternates, "why it fits" reasons, one honest
  challenge, profile summary, working action buttons
- Explore: search/filter/sort, quick filters, category filters (unchanged
  from v1, still real data)
- Idea Detail page: full info, roadmap, related ideas, working actions
- My Idea workspace: select idea, roadmap checklist with real progress,
  tasks (add/complete/delete), autosaved notes, insights, "Ask FIKRA AI about
  my idea" deep link
- FIKRA AI: richer rule-based responder — glossary, budget filtering,
  compare, cheaper/easier alternative, roadmap-aware "what's next",
  same-session memory of the last idea discussed
- Saved ideas (star toggle, separate from My Idea)
- Auth: Supabase email/password + Google OAuth (already wired from v1 recovery)

## Explicitly not built (and why)

- **Real LLM-backed AI / live web search** — the v1 site never called one
  (verified: no fetch to any inference endpoint in the bundle), and the spec
  explicitly forbids "pretending to search the web" or faking AI. The
  responder in `src/lib/aiAssistant.ts` is the seam to wire a real model in
  later; doing so needs a server-side function so the API key never reaches
  the browser.
- **MBTI-style personality diagnosis** — the spec explicitly says personality
  must never be presented as a scientific/medical instrument and must never
  alone determine a recommendation. The "شخصيتك" quiz question feeds one of
  ten weighted scoring dimensions (15%), nothing more.
- **Server-side user data model / RLS policies** — Supabase Auth works
  end-to-end, but Saved Ideas / My Idea / tasks / notes are stored in
  `localStorage`, not a Supabase table, since no database schema was part of
  the recovered project and inventing one wasn't asked for. Swapping the
  storage layer in `src/lib/myIdea.ts` for Supabase calls is the natural next
  step if persistence across devices is wanted.
- **Code-splitting** — the production bundle is a single ~1.1 MB JS file
  (matches the v1 site's own single-bundle shape). Fine for this scope; flagged
  by Vite's build output as a candidate for `dynamic import()` later.
