# FIKRA — Recovery & FIKRA 2.0 Rebuild

Source: `https://fikra-business-idea-78u6.bolt.host/#/` (public Bolt.new deployment)
Recovered: 2026-09-06 · Rebuilt as FIKRA 2.0: 2026-09-06

This folder contains everything legitimately recoverable from the public v1 deployment,
plus a working local app rebuilt on top of that recovered material — including the
expanded "FIKRA 2.0" product (12-question quiz, weighted scoring engine, My Idea
workspace, richer AI) described in `project/FIKRA-2.0.md`.

```
fikra/
├── original/     verbatim files as served by the live v1 site (byte-for-byte)
├── reference/    beautified/derived reference material (NOT original source)
└── project/      working Vite + React + TS app — npm install && npm run dev
                  see project/FIKRA-2.0.md for what changed in the 2.0 rebuild
```

## FIKRA 2.0 rebuild — what's new

Built directly in `project/` on top of the recovered v1 (same data, same repo,
no separate Bolt project):

- **Design system**: rebranded to the 2.0 palette (`#6D4AFF` primary purple /
  `#5533CC` deep purple / `#111827` navy / lavender + soft-blue surfaces),
  `IBM Plex Sans Arabic` + `Inter`, `prefers-reduced-motion` support.
- **Hero animation**: 4 rotating phrases in a fixed-height container (no layout
  shift), fade + blur + translateY transitions — `src/components/HeroAnimation.tsx`.
- **12-question quiz**: the 9 recovered questions plus 3 new ones (personality,
  skills, growth ambition) — `src/data/quizExtra.ts`.
- **Real weighted scoring engine** (`src/lib/scoring.ts`): budget 20% / interests
  15% / personality 15% / time 10% / skills 10% / work style 10% / channel 5% /
  customer interaction 5% / motivation 5% / experience 5% — produces an actual
  compatibility %, "why it fits" reasons, and one honest challenge, never a
  fabricated number.
- **Enriched idea database**: the 203 recovered ideas were augmented (`project/
  scripts/enrich-ideas.mjs`, deterministic — not random) with `riskLevel`,
  `scalability`, `skills`, `personalityTags`, a 9-step `roadmap`, and
  `relatedIdeas` — none of that metadata existed in the original bundle.
- **Explore + Idea Detail pages**: working "View Idea" / "Choose My Idea" /
  "Save" / "Ask FIKRA AI" actions (`src/pages/IdeaDetail.tsx`).
- **My Idea workspace** (`src/pages/MyIdea.tsx`, persisted in `localStorage`
  under `fikra_my_idea*`): interactive roadmap checklist with real progress %,
  add/complete/delete tasks, autosaved notes, and an insights panel — nothing
  here is faked, progress is computed from actual completed steps.
- **Smarter FIKRA AI** (`src/lib/aiAssistant.ts`): still a local rule-based
  responder — confirmed the v1 site never called a real LLM, so 2.0 doesn't
  fake one either — but now understands compare/develop/cheaper-alternative/
  "what's next" (roadmap-aware) requests and keeps light same-session context
  (last idea discussed), on top of the recovered glossary/budget/quiz-result
  matching.

Nothing here claims real web search or a wired-up LLM backend — the spec this
was built from explicitly forbids faking those, so this module is left as the
seam to swap in a real one later.

## 1. How the site is built

Single-page app: Vite + React 18 + TypeScript + Tailwind CSS + `react-router-dom`
(`HashRouter`, hence the `/#/` in the URL) + Supabase (`@supabase/supabase-js`) for
auth. No server-side framework — `index.html` loads one JS entry and one CSS file,
both content-hashed by Vite's build (`index-<hash>.js` / `.css`).

## 2. What was captured

| Item | Status |
|---|---|
| `index.html` | ✅ recovered verbatim (`original/index.html`) |
| Main JS bundle `index-6Mhln4o0.js` (1.0 MB) | ✅ recovered verbatim (`original/assets/`) |
| Main CSS bundle `index-CWwukEVr.css` (46 KB, compiled Tailwind) | ✅ recovered verbatim |
| `robots.txt` | ✅ recovered verbatim |
| Additional JS/CSS chunks | none exist — Vite emitted a single non-split bundle (confirmed via live Network tab: only 3 requests fire on load, and none on client-side navigation) |
| Source maps (`*.js.map`, `*.css.map`) | ❌ not public. Every request for `/assets/*.map`, `/manifest.json`, `/favicon.svg`, and any other unknown path returns HTTP 200 with the **same `index.html` SPA-fallback body** (this host doesn't serve real 404s) — verified by comparing `content-type`/`content-length` headers. So `favicon.svg` and `manifest.json` referenced in the HTML don't actually resolve to real files either. |
| Images / fonts / icons | none — the UI uses emoji as icons and only a `font-family` stack (`IBM Plex Sans Arabic, system-ui, sans-serif`, presumably a system/Google font, not self-hosted) |
| Web Workers, lazy-loaded chunks | none found (single bundle, no `import()` calls in the code) |

**Conclusion:** no source maps means no original TS/TSX file tree was recoverable.
Everything under `project/` is a reconstruction, built from data and logic extracted
out of the minified bundle plus behavior observed by driving the live site — not a
decompiled 1:1 copy of the author's source.

## 3. Data recovered (real, not reconstructed)

The bundle embeds its entire content as plain JS object/array literals (no API calls
fetch this data — it ships inside the JS). These were located precisely with an AST
parse (not regex) and safely evaluated in a sandboxed `vm` context, then dumped to
JSON. This is the highest-value recovery: it's the actual original data, verbatim.

- **203 business ideas**, bilingual (Arabic + English), each with category, budget
  range, time commitment, required supplies, first steps, selling method, icon, etc.
  → `project/src/data/raw/ideas-merged.json`
- **15 categories** with Arabic↔English translation → `.../categories.json`
- **9 quiz questions** (single/multi-select) with bilingual labels and icons
  → `.../quiz-questions.json`
- **333-term business glossary** (SaaS, B2B, marketplace, dropshipping, etc.), bilingual,
  with aliases/examples → `.../glossary.json`

## 4. Backend / external services referenced

- **Supabase**: `https://0ec90b57d6e95fcbda19832f.supabase.co`, used for `auth`
  (email/password + Google OAuth, seen live on `/#/login`). The bundle contains
  a Supabase **anon** public key (JWT payload: `"role":"anon"`) — this is the key
  type Supabase/Bolt.new intentionally ship inside every client bundle; it is
  meaningless without server-side Row Level Security, so it was preserved as
  public client config (per the recovery brief), not treated as a secret.
  No service-role key or other private credential exists anywhere in the bundle.
- **No other external API** is called. Notably: the in-app **"FIKRA AI" chat is not
  an LLM call** — it's a local, client-side rule-based function fed by the
  glossary + ideas data already in the bundle. It does not hit OpenAI/Anthropic/
  any inference endpoint.
- `bolt.new/badge.js` / `deployed-preview-script.js` — Bolt.new's own preview-badge
  scripts, unrelated to app functionality, dropped from the reconstruction.

## 5. Routes discovered (client-side, `HashRouter`)

`/`, `/quiz`, `/explore`, `/ai`, `/about`, `/login`, `/profile`, `/result/latest`
— all confirmed live by driving the deployed site and reading the DOM/network
after each navigation (zero extra network requests fire on any of these; it's
all client-side rendering from the embedded data).

## 6. What had to be reconstructed (clearly marked as such in code comments)

Original component source (JSX/TSX) was not recoverable — no source maps existed.
Reconstructed instead, from data + observed UI/behavior:

- All React components/pages (`project/src/pages/*`, `project/src/components/*`)
- Tailwind config (`tailwind.config.js`) — the custom color names found throughout
  the CSS (`fikra`, `azure`, `ink`) turned out to be plain aliases for Tailwind's
  built-in `violet` / `blue` / `slate` scales (hex values matched exactly), so the
  config recreates them under those names rather than guessing a new palette
- The quiz→idea matching/scoring algorithm (the real one is an inlined, mangled
  closure in the bundle; behavior is approximated with a transparent point-scoring
  heuristic — see `project/src/lib/quizState.ts`)
- The "FIKRA AI" chat responder (`project/src/pages/Ai.tsx`) — reproduces the
  observed behaviors (glossary lookup, budget-based filtering, quiz-result
  suggestions) but is not the original mangled matching function
- `vite.config.ts`, `tsconfig.json`, `package.json` — inferred from the bundle's
  output shape (esbuild-minified, single hashed JS+CSS, React 18 JSX runtime,
  `@supabase/supabase-js` import found in the bundle)

Two `sessionStorage` keys (`fikra_answers`, `fikra_results`, `fikra_selected_idea`)
and one `localStorage` key (`fikra-lang`) were recovered **verbatim** from the
bundle's source strings and are used as-is in the reconstruction, so quiz/session
persistence behaves the same as the live site.

## 7. Verified locally

```bash
cd project
npm install
npm run dev      # http://localhost:5183 (or whatever Vite picks)
npm run build    # production build — succeeds, ~860 KB single JS chunk (matches
                  # the original's single-bundle, non-code-split shape)
```

Both `tsc -b` and `vite build` complete with no errors. The dev server was driven
in a browser and compared side-by-side against the live deployment: home page
hero/steps/category grid/idea cards, the 9-question quiz flow (progress bar,
single vs. multi-select, next/previous), the Explore page (203 ideas, category
filters, quick filters, sort), and the AI chat page all render and behave
equivalently using the real recovered data.

## 8. Nothing else was found publicly

No hidden routes, no additional hosts, no analytics/tracking scripts beyond the
Bolt.new preview badge, no other environment values. Anything that only ever
lived in the original Bolt.new project workspace (the author's real source tree,
build history, any server-side/edge-function code beyond what's implied by the
Supabase Auth calls, and any admin-side data) is not publicly served and could not
be recovered — only what an ordinary browser can legitimately fetch was captured.
