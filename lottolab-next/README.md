# LottoLab Next — fresh native Android project

Standalone subproject in `leeroyimpilo-web/lottolab/lottolab-next`. No previous app source is imported. Package ID `za.co.lottolab.next` installs alongside earlier LottoLab apps.

## Build

Java 17, Android SDK 35 and Gradle 8.11.1:

```sh
gradle :core:test :app:testDebugUnitTest :app:assembleDebug :app:lintDebug
```

The root workflow `.github/workflows/lottolab-next.yml` builds this project independently. APK artifact: **LottoLab-Next-Android-APK**. This is a debug-signed preview, not a production release. Preserve a managed release key before distributing updates commercially.

## Implemented

- Native Kotlin / Compose results-first UI, drawer navigation, six game cards and bottom Check Ticket action.
- Room storage for draws, purchased tickets, favourites, corrections, syndicates and notification inbox.
- Bundled compressed real BetTip archive and payout snapshot captured 19 October 2026; no synthetic results. Invalid/unsupported records are excluded.
- Refresh on open/manual action; WorkManager periodic sync; cached data remains usable offline.
- Schema and rule-period validation; renamed game mapping; source timestamps and correction history.
- Current-rule multi-line ticket checking; distinct pending-result, pending-payout and published-payout states.
- Local photo text extraction, with mandatory manual correction/review before checking or saving.
- Uniform random generation; locked/excluded numbers, odd count, sum, spread and consecutive-number filters; unique multiple lines.
- Frequency, observed gaps, pairs/triples, group history, odd/even, low/high, sum/spread, prior-draw repeats and horizontal heatmap.
- Explicit comparison of per-period number appearance rates. No mixed-period rankings.
- Full wheel generation (maximum 2,000 lines), cost planning, overlap summary, sharing and multipage PDF export.
- Sprint 1: tap-to-select main numbers and PowerBall; conservative ticket-photo pre-parser with explicit manual review; saved-result freshness display.
- Sprint 2: consecutive eligible 1–10 draw ticket planner and automatic saved-ticket review states (future, not downloaded, unconfirmed payout, possible published payout). Existing Room schema retained.
- Sprint 3: Combination Explorer with selectable single game/rule period, joint historical subset counts, match histograms, and ranked matching draw dates. No future predictions.
- Sprint 3: Ticket Portfolio analyser distinguishing same-draw duplicates from legitimate repeats across games and dates; main-number overlap, recorded cost, purchased/favourite separation.
- Sprint 3: Results & Sources screen showing per-game current-period availability, last stored date, provider, and coverage of prize divisions. Missing results remain missing.

- Purchased/favourite distinction; spending by draw month and manually recorded received winnings.
- Validated JSON backup/restore for tickets and syndicates; import merges new IDs without replacing existing records.
- Local syndicate share/payout records with explicit cent-rounding policy.
- Standard-library Python SQLite gateway, scheduled ingestion, validation/quarantine, revision log, ETags, optional ResultsZA credentials kept server-side.

## Sprint 3 research boundaries

Historical combination matches count **only draws actually saved to the device** and never mix changed game formats. A historical joint appearance, gap, or apparent pattern cannot improve next-draw odds. Bonus/PowerBall analysis remains separate.

Portfolio uniqueness is defined by **game, draw date, all main numbers and PowerBall where applicable**. Two same-number lines on separate dates are not duplicates. Two paid identical lines on the same draw may be intentional and may affect any eventual payout quantity; they simply do not represent an additional distinct outcome. Largest main-number overlap is skipped for portfolios larger than 300 unique lines per draw to avoid heavy processing.

The optional ResultsZA Lotto 5 Max API adapter remains **server-side only**, requires valid credentials, and is not connected to the distributed preview by default. Sprint 3 does not claim the Lotto 5 Max archive is complete or officially verified.

## Sprint 4 — Number comparisons, reusable presets and research exports

- **Compare Two Numbers** appears in the side menu and compares two main numbers inside one selected game and rules era. The report shows individual historical appearances, joint appearances, observed dates, and analytically expected appearances under independent draws. Expected values are **averages**, never winning scores or forecasts.
- **Generator presets** are saved on-device per game in private Android preferences (up to 12 per game) and can be loaded or deleted. They store filter settings, not purchased tickets. A normal application upgrade preserves them, but the current JSON Backup & Export feature **does not include presets**, and uninstalling loses presets without an external device backup.
- **CSV exports** added to the Number Comparison, Combination Explorer and Ticket Portfolio tools. Reports include honest source/coverage warnings and encode untrusted text defensively to reduce spreadsheet formula risks. Comparison also supports a PDF summary.
- Android version 1.4.0-preview / versionCode 4. The package name and Room version 1 schema remain unchanged; **in-place Android upgrades also require the same APK signing certificate**, which GitHub's temporary preview debug key has not reliably preserved. Export a backup before replacing a preview.
- Tests cover expected main-ball/pair counts, rule boundaries, CSV report fields and spreadsheet-injection handling.

## Sprints 5–7 — Offline safety, visual research and data integrity

- **Backup schema v2**: exported JSON includes all local generator presets in addition to tickets/spending and syndicates. v1 backups (without presets) still restore; records and named presets are merged additively. Presets do not require a separate account or internet access.
- **Visual frequency chart** in Explore Numbers: paged, labelled observed-versus-expected bars for single numbers within a selected game/rules era, with approximate binomial variation bounds. These are descriptions of the downloaded history, not predictions.
- **Coverage audit** in Results & Sources: identifies missing scheduled result dates from the earliest stored result through yesterday. A game with no stored data is identified as unknown coverage, not assigned a misleading 0% completion score.
- **Gateway source reconciliation**: contradictory result numbers from different providers are quarantined and cannot silently overwrite stored numbers. Matching third-party sources are tracked as corroboration only. Health endpoint reports quarantines, disagreements and matching third-party source counts; it never claims official verification.
- **Offline User Guide** explains checking, multi-draws, chart interpretation, receipts, exports, source gaps, and responsible spending.
- **CI emulator disk fix** reclaims runner storage before boot and lowers AVD data partition size. Android unit tests and lint run as mandatory build steps.
- Preview version **1.5.0** / versionCode **5**, package ID and Room schema unchanged. **Debug certificates from previous preview builds may differ**, so an in-place update is not guaranteed; back up your data and reinstall only if needed. This build is still a debug-signed preview.

## Installing this debug preview safely

Debug signing certificate continuity is **not guaranteed** by the current GitHub Actions cache. Inspection of prior preview APKs found different signer fingerprints. Keeping `za.co.lottolab.next` unchanged does **not** fix a signature mismatch. Android will reject an update with `INSTALL_FAILED_UPDATE_INCOMPATIBLE` if the installed version was signed by another key.

1. In your existing LottoLab Next installation, open **Backup & Export** and save a JSON backup to a known location outside the app's private storage (e.g. Downloads). Confirm the file exists and is non-empty.
2. Try installing the new preview directly. If Android refuses due to a conflicting package/signature, keep the old app until you have safely checked the backup.
3. Only after confirming the backup, uninstall the old preview and install the new APK. Uninstalling deletes local database and private presets on that installation.
4. Use **Backup & Export → Restore backup** to recover tickets, groups, and presets (v2); legacy v1 backups restore tickets/groups.
5. Do not release commercially until a **single persistent private production signing key** is provisioned securely and retained for future upgrades.

## Honest preview limitations / release gates

1. June 2026 rule configuration is based on secondary-source research. Obtain current official signed rule documents, effective draw IDs, claim/cutoff details and cascade conditions before commercial release. No cascade prize is invented.
2. BetTip's inspected archive has **no Lotto 5 Max or Daily Lotto Plus records**. The corresponding current card is visibly unavailable. A ResultsZA adapter in the gateway supports the current Lotto 5 Max feed when a valid server-side key is configured. It has not been integration-tested against a paid account.
3. Snapshot counts: 7,591 source draws and 3,686 source payout records. Accepted counts are lower due to unconfirmed old PowerBall rules and validation. Completeness is not claimed. No full years of pre-2015 results are supplied by this feed.
4. A source's official/verified flags do not establish independent verification. App displays published provider data; it is not an official ticket validator. Zero-winner prize tiers are not treated as payable winnings.
5. Backend code is supplied, **not deployed**. Default APK reads BetTip directly; configure `-PfeedBaseUrl=https://YOUR_HOST/api/v1/lotto/` to use your hosted gateway. Do not embed provider secrets in the APK. HTTPS is required.
6. Background updates are best effort (six-hour WorkManager schedule); backend push and exact-time reminders are not implemented. Local notifications announce new/revised records when a background sync runs. In-app tickets recompute their matches from stored results.
7. Abbreviated-wheel guarantees, automatic ticket barcode validation, official ticket purchasing, authenticated cloud sync, Matchplay and raffles are outside this preview.
8. Payout coverage and source availability need multi-week monitoring. Corrections are retained, but no independent second-source reconciliation is active.
9. Dates are South African calendar dates. ResultsZA timestamp timezone semantics need provider confirmation; gateway intentionally uses the supplied date portion, not an assumed UTC conversion.
10. Review final Play Store eligibility, naming/trademark assets, privacy disclosures and production signing before distribution. User data stays on device; no gambling advertising or payment flow is included.

## Rules and statistical decisions

Current default begins 2026-06-01 as a provisional configuration boundary. Lotto families use 6/52, PowerBall 5/50 + 1/16, Daily Lotto 5/36. Older supported matrix periods are distinct IDs. Daily Lotto Plus has its own retired game identity. Pre-2015-11-28 PowerBall is rejected until confirmed. Main and special-ball statistics remain separate. Missing data must never be represented as a losing ticket.

Generator uses `SecureRandom` and an unbiased Fisher–Yates shuffle. Optional filters are rejection sampling; they change the candidate set, not the true chance of any valid ticket. Generation has an attempt limit and explains impossible constraints. Full wheels enumerate all k-subsets. Price estimates are per game; add-on prices exclude required base entries.

## Data and sources

Data attribution: [BetTip](https://bettip.co.za/) — [API terms and documentation](https://bettip.co.za/api/). Free commercial use with attribution according to inspected documentation. Snapshot carries original source URLs. Source data is provided without guarantee.

Rule research: https://www.lottery.co.za/2026-south-africa-lottery-changes
Optional richer provider: https://resultsza.co.za/api_docs
Official reference: https://www.nationallottery.co.za/

## Backend

```sh
python -m unittest discover -s backend -v
python backend/server.py
```

Environment: `HOST` (default 127.0.0.1), `PORT` (8080), `LOTTO_DATA_DIR`, optional `RESULTSZA_API_KEY`. Use a persistent volume for the SQLite directory, TLS reverse proxy and a process supervisor in production. Endpoints: `/api/v1/lotto/draws.json`, `latest.json`, `payouts.json`, `health`. Draws endpoint supports `?since=` against retrieval timestamps. Full archive refresh every six hours; latest feed every fifteen minutes. This gateway does not store personal tickets.
