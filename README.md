# LottoLab 🇿🇦

A mobile-first South African lottery research app built with Next.js, React and TypeScript. The current v0 visual theme is preserved.

## What works in source

- Main dashboard with published results (where the source provides them).
- Latest results and historical draw lists.
- Number generation for the current SA game rules.
- Lottery laboratory: frequency, hot/cold, number patterns, combination matching, odds.
- Check a ticket against a published draw (possible division, not proof of winnings).
- On-device saved combinations, ticket checks and spending tracker.
- Online draw refresh on startup (if due), connectivity restoration and manual update.
- IndexedDB cached draw history.
- Bundled draw snapshot for Android first-launch offline use.
- Help library and FAQs.

## Public result source

Uses the freely accessible [BetTip Draws API](https://bettip.co.za/api/), with the attribution required by its terms. BetTip is a third-party results publisher, **not the National Lottery**. Source `official` and `verified` flags are publisher metadata, not an independent audit by LottoLab.

Only draws dated **1 June 2026 or later** are included in the current data store to avoid mixing historically different lottery number ranges and draw rules. Lotto 5 Max is not presently supplied by this feed and must not be populated with guessed results. Complete verified prize divisions and jackpot payouts are not yet integrated. Treat "possible division" labels in the ticket checker as informational only.

## Run as a web app

```sh
corepack enable
pnpm install
pnpm dev
```

## Build a static export

```sh
pnpm build
```

Next.js outputs the static web app to `out/`. The static repository includes a small, published starter results snapshot in `public/data/lotto-seed.json`. On Android builds, that file is replaced with a newly downloaded validated snapshot containing all the available current-era results.

## Android debug APK (Capacitor)

GitHub Actions workflow: [Build LottoLab Android Debug APK](.github/workflows/android-debug.yml).

To obtain a test APK:
1. Open the repository's **Actions** tab.
2. Select **Build LottoLab Android Debug APK**.
3. Choose **Run workflow** (or open a completed push build).
4. After a **successful** run, open the run and download **LottoLab-Android-Debug-APK** under **Artifacts**.
5. Extract the ZIP and install `app-debug.apk` on an Android phone.

A debug APK is signed with the debug certificate for testing. It is **not** a Play Store production release or a separately verified build. If the workflow fails, use its job log for the actual error; no APK should be presented as built.

The build workflow creates its Android native wrapper on the runner rather than committing generated Gradle scaffolding to the web repository. It downloads the recent BetTip results before export, so a network failure or invalid feed causes the build to fail rather than silently bundling invented data.

## Offline behavior

In the Android APK, previously bundled results and local records work without Wi-Fi/mobile data. The web version caches visited pages with a service worker and persists results with IndexedDB; a browser must visit the pages at least once online to cache their assets.

The app checks for fresh results while open / when connectivity returns. It does **not** yet guarantee background updates while completely closed. Clearing application data or uninstalling can delete saved records.

## Still needed before production

- Additional authoritative source for Lotto 5 Max and prize/winner breakdowns.
- Payout tables, claim validation, official number verification.
- Historical-rule archives stored separately (before 1 June 2026).
- Export and backup for personal data; PDF/PNG reporting.
- Successful Android CI, device testing, release signing and deployment checks.
- Automated nightly refresh pipeline and transparent freshness indicators.

LottoLab is independent of the National Lottery and does not sell tickets. Play responsibly. **18+ only**.
