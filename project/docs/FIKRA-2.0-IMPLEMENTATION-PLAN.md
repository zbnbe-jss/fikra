# FIKRA 2.0 implementation plan

## Audit snapshot

- **Runtime:** Vite, React 18, TypeScript and Tailwind 3. The app is static-client compatible with the existing Cloudflare deployment configuration.
- **Routes:** Home, Explore, idea detail, quiz, results, FIKRA AI, My Idea, comparison, saved ideas, profile, settings, login and about are already wired through React Router.
- **State:** Language, visual preferences, quiz answers/results, saved ideas and My Idea workspace use browser storage. Supabase is used only for optional authentication.
- **Product logic:** The quiz currently renders 12 questions. Matching has configurable dimension weights and produces reasons/challenges. Search recognizes a useful Arabic/English starter vocabulary. My Idea persists roadmap state, tasks and notes.
- **Data reality:** The repository contains 203 structured ideas and 333 glossary records. It is not yet a 500-idea or 1,000-term dataset. The code must retain this fact, avoid fake counts, and support a future repository or database-backed expansion.

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

- No fabricated 500-entry idea catalog or 1,000-term Arabic layer will be generated to inflate a count.
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
