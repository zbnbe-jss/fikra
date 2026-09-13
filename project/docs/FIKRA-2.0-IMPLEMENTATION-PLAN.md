# FIKRA 2.0 implementation plan

## Audit snapshot

- **Runtime:** Vite, React 18, TypeScript and Tailwind 3. The app is static-client compatible with the existing Cloudflare deployment configuration.
- **Routes:** Home, Explore, idea detail, quiz, results, FIKRA AI, My Idea, comparison, saved ideas, profile, settings, login and about are already wired through React Router.
- **State:** Language, visual preferences, quiz answers/results, saved ideas and My Idea workspace use browser storage. Supabase is used only for optional authentication.
- **Product logic:** The quiz currently renders 12 questions. Matching has configurable dimension weights and produces reasons/challenges. Search recognizes a useful Arabic/English starter vocabulary. My Idea persists roadmap state, tasks and notes.
- **Product logic:** The quiz currently renders 12 questions. Matching has configurable dimension weights, hard constraints, diversity ranking and reasons/challenges. Search and the local assistant share Arabic/English intent normalization. My Idea persists roadmap state, tasks and notes.
- **Data reality:** The repository now contains the original 203 ideas plus 200 newly authored, distinct additions: 403 ideas total, spread across 20 categories. The glossary contains 333 records with 939 reviewed aliases; the combined intent layer exposes 1,455 searchable phrases, including 1,043 Arabic/Gulf variants. The code retains these counts honestly and exposes a typed access seam for a future repository or database-backed expansion.

## Findings to preserve

1. Keep all existing route paths, navigation names, quiz answer keys and storage keys.
2. Keep the current local-first behavior so the product works without Supabase configuration.
3. Retain the weighted scorer and enrich its explanations instead of replacing it with a superficial recommendation UI.
4. Preserve language switching and direction handling as application-level behavior.

## Transformation phases

1. **Foundation:** centralize FIKRA Liquid semantic tokens, dark-mode materials, typography, focus, reduced-motion and responsive primitives.
2. **Global product shell:** create a restrained floating glass navigation and shared controls/cards without making reading surfaces translucent.
3. **Discovery surfaces:** transform home, Explore, Results and idea detail into progressive product storytelling with real state-backed previews.
4. **Decision system:** expose score dimensions, avoid unexplained percentages, and improve relevance/search fallbacks.
5. **Workspace and AI:** retain local persistence, improve contextual action surfaces and clearly position the deterministic assistant as FIKRA knowledge rather than a fabricated live model.
6. **Scale readiness:** introduce data-layer validation/loading seams for a future JSON, Supabase or D1 source. Data expansion is a separate content-production stream requiring reviewed, distinct entries.
7. **QA:** typecheck/build, responsive review, dark/light review, reduced-motion check and route smoke test.

## Non-goals for this pass

- No duplicated or numbered filler ideas are used to inflate the catalog; the 200 additions have distinct titles, categories, formats and business models.
- No external AI or web-search service will be claimed or added without server-side credentials and an approved backend boundary.
- No route or storage migration will be performed silently.

## Implemented in this pass

- Central FIKRA Liquid tokens for color, depth, controlled translucency, focus and reduced-transparency fallbacks.
- Motion-safe floating navigation using Motion scroll values rather than a raw scroll event listener.
- A home hero that shows a live preview of the actual My Idea browser workspace state.
- Product-story navigation on the idea-detail page with live compatibility and roadmap progress.
- Explanatory match signals in the scorer and result surface.
- Shared Arabic text normalization and constraint extraction for search and the local assistant.
- Visual consistency updates across Explore, FIKRA AI, My Idea, results and reusable idea cards.
- Arabic auth and RTL pass: direct `/signup` route, field labels, logical padding, localized Supabase errors, and corrected Arabic UI copy across the primary product surfaces.
- Typed idea access layer (`getAllIdeas`, `getIdeaById`, `searchIdeas`, `filterIdeas`, `getRelatedIdeas`) with deterministic schema adapters and relationship validation.
- Local-first user profile model carrying language, preferences, quiz answers and selected idea; auth sessions hydrate it without discarding existing quiz/workspace state.
- Matching hard constraints plus category/channel/difficulty diversity selection; reusable `getPersonalizedIdeas` recommendation seam.
- Matching now weights budget, interests, personality, time, skills, work style, format, interaction, motivation, experience, risk tolerance, scalability, difficulty and readiness (weights sum to 100).
- Intent layer for Gulf Arabic and mixed English business phrases, conversation recommendation memory, rejected-idea down-ranking and a structured `getAIContext` read model for My Idea + quiz state.
- AI context and rejected/recent idea IDs persist for the browser session; the user profile stores a workspace snapshot containing roadmap statuses, tasks, notes and actual progress.
- Signup now captures a display name, confirms passwords, supports show/hide password, and stores localized auth feedback.
- `npm run validate:catalog` verifies idea count, unique IDs, core fields, relationship references and glossary term count.
- Added 200 new idea descriptors in `src/data/raw/idea-additions.json`; the runtime builder gives every addition the complete v2 metadata shape and deterministic related/alternative idea links.
