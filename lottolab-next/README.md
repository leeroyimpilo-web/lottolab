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
- Purchased/favourite distinction; spending by draw month and manually recorded received winnings.
- Validated JSON backup/restore for tickets and syndicates; import merges new IDs without replacing existing records.
- Local syndicate share/payout records with explicit cent-rounding policy.
- Standard-library Python SQLite gateway, scheduled ingestion, validation/quarantine, revision log, ETags, optional ResultsZA credentials kept server-side.

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
