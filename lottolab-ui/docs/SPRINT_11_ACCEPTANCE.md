# LottoLab UI — Sprint 11 acceptance & release gate

**Scope:** UI-only design prototype on `lottolab-ui-first`. No real lottery ingestion, persistence, payouts, ticket scanning, live notification delivery, statistical calculation or probability generation has been integrated.

## Implemented route coverage

| Group | Count | Evidence |
|---|---:|---|
| Core screens and overlays | 27 | C01–C27 reachable from gallery, normal menu or contextual links |
| LottoLab research/planning tools | 17 | T01–T17, each with form and labelled sample result |
| Total route destinations | **44** | Browser route test in `tests/audit.mjs` |
| Input modes | 3 | Standard main board, partial combination search, wheel pool |
| Example games | 6 | Lotto, Lotto Plus 1, Lotto 5 Max, PowerBall, PowerBall Xtra, Daily Lotto |
| Screen-state examples | 10 | populated, empty, loading, cached/no-cache offline, stale, missing, invalid, pending, no-match |

## Checks performed

- [x] New screens, menus and tools committed to isolated branch; original apps preserved
- [x] Automated route enumeration for C01–C27 and T01–T17
- [x] Home/Menu/LottoLab/frequency example navigation walkthrough
- [x] Narrow-screen horizontal-overflow checks at 360, 390 and 412 logical pixels
- [x] Six-column picker grid at short 360 × 700 viewport
- [x] Incomplete and complete number-selection demonstration
- [x] Child draw detail hides floating Menu so payout table remains unobstructed
- [x] Unknown prize winner count rendered `N/A`, distinctly from verified zero and pending
- [x] Calendar months roll correctly; mock events only appear in October 2026
- [x] Session-only board controls and clearly labelled fake data
- [x] Browser screenshot atlas with Home, prize table, number picker, tool and settings
- [x] TypeScript and offline asset compilation in CI; Next.js static export in CI
- [x] Android-specific UI source isolated from legacy LottoLab application
- [x] Hardware Back listener wired in Capacitor bootstrap
- [x] APK workflow set to manual-only during all UI source changes

## Manual acceptance still needed before production

- [ ] Side-by-side inspection against the original ten screenshot crops: their pixels are **not stored in the project**, so exact visual equivalence cannot be certified
- [ ] Physical-device TalkBack focus order and spoken labels
- [ ] Physical Android accessibility with system display/font scaling at 200% and landscape
- [ ] Device performance and deep native lifecycle checks
- [ ] User's sign-off on actual layouts and navigation

These manual checks do **not** prevent creation of an installable **UI-review debug APK**, but that APK remains a prototype, not a production release. UI scope stops at review; F1–F9 need a separate post-approval implementation.

## Special handling

- Statistics display sample denominators and draw coverage; they do not predict winning numbers
- Current rule defaults are provisional; official rules, prices and effective dates must be verified before the future functional release
- Older and current rule eras stay separate
- Null/unknown prizes and zero-prize counts are visually distinct
- Saved boards are not proof of purchase and disappear when the prototype session resets

## Handoff

1. Review screenshots in GitHub Actions artifact `LottoLab-UI-Sprint11-Screen-Atlas`.
2. Install the final Android **UI-review** APK after its post-freeze build.
3. Review all flows and sign off UI changes.
4. Only then start functionality F1–F9 from the master prompt.
