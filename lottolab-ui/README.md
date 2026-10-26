# LottoLab UI-first — complete interface preview

Repository: `leeroyimpilo-web/lottolab`  
Branch: `lottolab-ui-first`  
Isolated presentation source: `lottolab-ui/`  
Web review: `/ui-preview`  
Screen gallery: `/ui-preview/gallery`

## UI-first delivery

This branch contains 27 core screen/overlay destinations (C01–C27), 17 tool input/result screens (T01–T17), shared design components, deterministic sample fixtures, designed state variants, a screen-gallery entry, Android-compatible standalone Vite assets, and accessibility labels.

The complete presentation follows `docs/MASTER_PROMPT.md`. It is deliberately distinct from the original Next.js and LottoLab Next Android projects. It does not import their live data, calculators, accounts, paid functionality, storage or network services. All sample lottery values and prizes are invented and visibly labelled.

### Route families

- C01–C04: Home, global menu, games, game overview
- C05–C06/C23–C24: results, prize detail, game/era and date selection
- C09–C14/C25–C26: boards, editing, picker, quick-pick setup, sample board output, save/discard
- C07–C08: ticket-check input and comparison illustration
- T01–T17: every LottoLab research/number planning tool, with input and result panels
- C15–C22/C27: calendar, notifications, help, settings, data status, about and export preview
- Sprint 11: route/state gallery and mobile screenshot test automation

### Local web preview

From repository root run `pnpm install` and `pnpm dev`, then open `http://localhost:3000/ui-preview`. The gallery is at `http://localhost:3000/ui-preview/gallery`.

### Offline Android UI code

From `lottolab-ui/` run `npm install`, `npm run typecheck`, `npm run build`, `npx cap add android`, `npx cap sync android`. Capacitor app ID: `za.co.lottolab.uipreview`. Android's physical Back button dismisses the current sheet or returns to the previous UI screen.

The original Android debug build pipeline is **manual-only**. Build and signing must happen **after** the completed UI is reviewed, not on each new source change. The resulting APK is a debug UI preview and cannot be described as a working lottery-analysis application.

### QA evidence

- `.github/workflows/lottolab-ui-preview.yml` — TypeScript (root and isolated), offline Vite assets and static Next.js export, *no APK*
- `.github/workflows/lottolab-ui-review.yml` — Playwright route audit and mobile screenshot atlas
- `tests/audit.mjs` — 44 destinations, mobile widths, menu/picker/comparison/calendar and screenshots
- `docs/SPRINT_11_ACCEPTANCE.md` — acceptance evidence, remaining manual checks and handoff status
- `src/contracts.ts` — future-ready typed view-model boundaries; not implemented business logic

All functionality sprints F1–F9 are deferred until visual UI approval and official lottery rules/data access are verified.
