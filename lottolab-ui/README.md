# LottoLab UI-first (separate preview)

Repo: leeroyimpilo-web/lottolab
Branch: lottolab-ui-first
Directory: lottolab-ui
Preview route: /ui-preview (in root Next.js workspace)

This is a new design-only interface. All values are invented sample data. It is NOT the existing LottoLab app and does not modify the original Android app. No draw feeds, databases, calculations, prizes or real random-number generation are enabled.

## How to preview

1. Check out the lottolab-ui-first branch in the root repository.
2. Install the root dependencies: pnpm install.
3. Start the Next.js development server: pnpm dev.
4. Open http://localhost:3000/ui-preview.

Sprint 1 fidelity anchors are available at /ui-preview/gallery (development route, not shown in normal navigation). This branch also includes a first slice of Sprint 2 (Home, catalogue, game overview, draw-detail example, central Menu and LottoLab hub). Other menu destinations are clearly marked as upcoming screen shells.

## Source

- docs/MASTER_PROMPT.md — verbatim design authority
- design/screen-inventory.json — C01–C27 and T01–T17
- design/tokens.json — initial design values
- design/state-matrix.md — required states and fixture assumptions
- docs/SPRINT_1_CHECKLIST.md — what is implemented, what remains untested
- src/fixtures.ts — deterministic UI example data
- src/components.tsx — reusable visual components
- src/LottoLabPreview.tsx — navigable demonstration

## Boundary

Keep design changes in lottolab-ui/ and app/ui-preview/ until the complete visual review. No new APIs, database, statistics, auth, payments, notifications, real exports, or Android APK until explicitly scheduled and approved. The preview route uses CSS to hide the old app's surrounding navigation only on /ui-preview; no existing source screens were modified.

See the master prompt's Sprint 0–11 sequence. Current focus: Sprint 1 verification, then Sprint 2 screen completion.

## Standalone Android UI-preview build

From `lottolab-ui/`, run `npm install`, `npm run typecheck`, `npm run build`, `npx cap add android`, and `npx cap sync android`, followed by Android Gradle `assembleDebug`. The GitHub Actions workflow `lottolab-ui-android.yml` builds and uploads the debug APK. The UI project deliberately uses its own npm dependency installation, distinct from the root pnpm workspace.
