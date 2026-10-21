# LottoLab Next — Production release gates (21 October 2026)

The sprints in this repository are preview implementations. A successful debug APK is NOT a commercially approved lottery application.

## Implemented in preview
- Draw results cards, filters, historical research, charts, combination explorer, two-number comparisons, numbers generator, reusable presets and PDF/CSV reports.
- Offline Room storage, local ticket photo extraction with manual review, purchased/favourite distinction, multi-draw ticket records, syndicates, cost tracking and optional saved-ticket notifications.
- Validated JSON backup v2 with additive restore of v1/v2 records and named generator presets.
- Provider feed validation, duplicate quarantine, backend cross-source conflict detection, coverage audit and offline user guide.
- Automatic unit tests, Gradle lint, build artifact and device-check workflow.

## External dependencies that cannot be claimed complete without evidence
1. **Official rules:** Obtain signed/current Sizekhaya/National Lottery rules and verify effective dates, official schedules, add-on conditions, draw IDs, exact prize-tier names, jackpot cascade payouts and claim time limits. The preview's June 2026 boundary remains provisional.
2. **Lotto 5 Max and payout completeness:** The keyless BetTip snapshot lacks this game. The optional ResultsZA provider has a server-side `get_lotto_5_max_results` endpoint requiring an API key. Configure it on a deployed backend, test live/current data, verify response fields and ensure data-provider permission for proposed commercial use. Never embed keys in the Android APK.
3. **Independent reconciliation:** The gateway now quarantines differing third-party results and records agreement, but does not prove an official result. Add independently sourced operator verification where legally and technically allowed and monitor freshness and corrections over multiple weeks.
4. **Production backend:** The Python/SQLite gateway code is not deployed as part of Android CI. Configure HTTPS, durable storage, monitoring, alerts and provider secrets before enabling it in a distributed APK.
5. **Signing and updates:** Replace debug signing with a securely managed production keystore. Maintain its certificate to install upgrades without losing on-device data. VersionCode must increase for every new release.
6. **Privacy and accessibility:** Perform accessibility testing, Play Store eligibility review, privacy disclosures for uploaded images and exported records, and regulatory/legal advice on lottery branding and consumer-facing claims.
7. **Physical device testing:** Pass real Android device smoke tests, backup/restore tests, offline/online transitions, multi-draw and locale/time-zone cases, and existing-install upgrade tests. Emulator CI is supplementary.
8. **No ticket purchase or payouts:** Generated numbers are planning suggestions, not purchases. A LottoLab match and recorded expected payout are not official ticket or prize verification.

## Valid sources reviewed
- https://www.nationallottery.co.za/
- https://bettip.co.za/api/
- https://resultsza.co.za/api_docs
- https://resultsza.co.za/south-african-lottery-api

Do not advertise a guaranteed-win algorithm or imply that overdue numbers are more likely in an independent draw.
