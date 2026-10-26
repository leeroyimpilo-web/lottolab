# LottoLab — UI-first master prompt and sprint plan

Prepared 26 October 2026. Reference: the ten supplied mobile screenshots, 3391–3400.

## Design decision

Build LottoLab with the supplied app’s visual structure: pale blue-grey backgrounds, rounded white cards, ticket cut-outs, turquoise pill buttons, purple text actions, clear centred page titles, large numbered balls, spacious lists and a central circular menu. Adapt the banking content into lottery results, personal number boards and research tools. This is a UI-first project. Complete and review every screen and state before connecting live data or implementing lottery calculations.

The screenshots show several scroll positions of the same screen, not ten independent screens. Treat them as six reference families: game catalogue, history list, history detail, results/prize table, number-selection sheet, instructional pages, plus the banking dashboard as the shell reference. Do not duplicate pages merely because two screenshots show different scroll offsets.

## Research findings informing the prompt

The following is a focused comparison of relevant tools, not an exhaustive ranking of every lottery product. Feature priorities below are product recommendations for LottoLab, rather than evidence of predictive advantage.

| Source | What was examined | Decision for LottoLab |
|---|---|---|
| LotteryResults.co.za tools [R1] | Checker, generator, pairs, triplets, last seen, individual-number analysis and companions | Make these accessible through a structured LottoLab menu. Avoid its predictive framing around numbers being due. |
| LottoTrekker statistics [R2] | Frequency explorer, eligibility, gaps, expected counts, format separation, patterns and repeats | Show game, rule era, sample size and date range beside every statistic. Provide number detail and table/chart views. |
| Lottery.qtool.io [R3] | Singles, pairs, triplets and pool coverage | Keep historical observations distinct from future probability. Provide simple explanations beside advanced summaries. |
| Lottery Post wheels [R4] | Full, key-number and abbreviated wheels | Put wheeling in Advanced; explain line count, cost and conditional coverage before generated boards. |
| Nedbank lottery FAQ [R5] | Current game names, selection ranges and channel-specific purchase limits | Use configurable game rules. Do not copy banking purchase limits into LottoLab’s personal saved-board limits. |
| National Lottery website [R6] | Operator site and results entry point | Treat official rules/results as the future verification target. The retrieved homepage was largely a JavaScript loading shell; this research did not establish an accessible, licensed API or verify the full official rulebook. |

### Rules and sources: provisional design inputs

Nedbank’s current FAQ describes Lotto as six from 52; PowerBall as five from 50 plus one from 16; Daily Lotto as five from 36. It names Lotto 5 Max and PowerBall Xtra as replacements for Lotto Plus 2 and PowerBall Plus. These are useful prototype defaults, supported by a participating bank, but are not a substitute for verifying all operator rules, effective dates, payouts and exceptions before production. [R5]

The screenshots themselves depict Lotto’s 1–52 picker and Lotto 5 Max. They are visual evidence, not a current results feed. Never assume their displayed jackpot, price, date or payout remains valid.

Channel cutoff times differ: the supplied screenshots show 20:30, while Nedbank describes its own 20:25 draw-day sales window. Do not treat either as a universal draw time. Separate draw time, provider sales cutoff and next scheduled draw. Leave unknown values explicitly unavailable. [R5]

### Priority order

1. Results, prize breakdowns, ticket comparison and saved boards establish everyday usefulness.
2. Frequencies and historical combination search are the central LottoLab features.
3. Last-seen gaps, number profiles, pairs/triplets and companion numbers deepen research.
4. Generators, combination counts, cost and probability calculators support planning.
5. Wheels, coverage comparison and historical strategy replay belong in Advanced.

All valid combinations have equal jackpot probability under a fair independent draw with the same rules. Frequency, gaps and structural filters describe or organise selections; they do not improve the likelihood of a particular line. Wheeling covers multiple lines and costs more; its coverage conditions must be stated precisely. [R3, R4]

---

# COPY-AND-PASTE MASTER PROMPT

You are a senior mobile product designer, Android UI engineer and lottery data analyst. Design the complete user interface for **LottoLab**, an independent South African lottery research, results and number-planning app.

Use the ten attached reference screenshots as the visual specification. Work through the sprints below in sequence. The current assignment is UI design and a navigable UI prototype only. Do not implement live results, databases, payment systems, authentication, statistical algorithms or background updates in this phase.

## 1. Outcome and scope

Deliver a coherent, mobile-first application interface with every route, screen, sheet, dialog, empty state and demonstration result designed. Keep the reference app’s visual appearance as closely as practical while replacing its banking purpose with LottoLab’s purpose.

The end user should understand three things immediately:

- Home shows lottery results and upcoming draws.
- Check my numbers compares a personal board with a draw.
- LottoLab contains number research and planning tools.

Preserve existing working project code and saved user data if a repository exists. Inspect it before choosing implementation technology. If no project exists, document the chosen Android-compatible UI stack before coding; do not change frameworks during the design phase. Native Android or a responsive implementation intended for an Android shell must use the same visual contract. A web preview alone must not be represented as a tested APK.

## 2. Visual fidelity contract

### Reference mapping

| Screenshot | Preserve | LottoLab adaptation |
|---|---|---|
| 3391, 3392 | Stacked rounded game cards, internal ticket panels, scalloped notches, perforation, jackpot hierarchy, two pill actions | Game cards with latest result, next-draw summary, Quick pick and Select numbers; bottom Check my numbers entry |
| 3393 | Plain white history rows, muted second line, right-aligned status, fine separators and chevrons | My boards and ticket-check history |
| 3394 | Label/value detail rows, Board A/B/C ball rows, full-width bottom action | Saved-board detail with draw association, notes, comparison status and Use these numbers |
| 3395, 3396 | Coloured game band, winning-ball strip, draw metadata, shaded division column and stacked payout rows | Draw details with prize breakdown and source status |
| 3397 | Rounded full-height sheet, Board A/Clear header, selection tray, six-column ball grid, Confirm and Randomize | Shared number picker for boards and compatible tools |
| 3398, 3399 | Step headings, bordered instructional examples, generous line spacing, pill stepper and option cards | How to use LottoLab and game-specific help |
| 3400 | Soft background gradient, centred identity, circular shortcuts, white module cards and central floating Menu circle | LottoLab home shell: results, Check, Generate, LottoLab, My boards and reminders |

Do not recreate device status-bar icons, battery percentage, the banking logo, account numbers, account balances or the Android navigation bar as app content. Use LottoLab branding and neutral text game badges until suitable game assets are supplied. Do not imply that LottoLab is the bank or official lottery operator.

### Initial design tokens

These are visual estimates from the screenshots, not claimed exact sampled values. Calibrate them against reference crops during Sprint 1.

| Token | Starting value / behaviour |
|---|---|
| Page background | #E3ECEF |
| Surface | #FFFFFF |
| Subtle inset surface | #ECF2F4 |
| Primary turquoise | #00D6DF; dark label |
| Purple link | #5715D8 |
| Main text | #2D2D38 |
| Secondary text | #707079; darken if needed for contrast |
| Divider | #E4EAEC |
| Lotto accent | #FFC800 |
| PowerBall accent | #15B5D6 |
| Daily Lotto accent | #E51D36 |
| Main card radius | 16–20 logical pixels |
| Inner card radius | 8–12 logical pixels |
| Sheet top radius | 28–32 logical pixels |
| Buttons | Fully rounded, 48–52 logical pixels high |
| Screen gutter | 16 logical pixels |
| Spacing scale | 4, 8, 12, 16, 24, 32 |
| Typography | Closest available clean sans; start with Roboto, compare before substituting |
| Type sizes | Body 14–16; title 18–20; major amount 24–28; helper 12–14 |
| Icon family | One consistent simple vector family; 20–24 logical pixels |

Keep surfaces mostly flat. Use only the reference’s restrained shadow beneath result balls. Do not introduce neon dashboards, glassmorphism, metallic cards, cartoon laboratories, unnecessary gradients or a new visual theme. The pale dashboard gradient and subtle circular menu accent may match the reference.

Translate screenshot proportions into logical dimensions instead of treating screenshot pixels as Android dp. Compare at equal viewport scale after excluding OS chrome.

### Number balls

Build a reusable vector ball with a coloured rim, white centre, curved white perimeter panels and a bold centred numeral. Keep numerals as real text. Supply neutral/unselected, selected, main result, bonus, PowerBall, matched, unmatched, disabled, focus and error states.

Match the reference ball silhouette; avoid replacing it with a generic flat coloured dot. Add explicit labels for bonus and PowerBall. Colour is not the only indication of selection or a match. Preserve the same special-ball pool identity even when a main ball has the same numeric value.

At 360-pixel logical width, six picker columns must retain approximately 48-pixel targets. Result strips with six main balls and a bonus may use smaller noninteractive balls or a deliberate two-row fallback at narrow widths/large text. Never shrink interactive targets merely to preserve a screenshot.

## 3. Navigation architecture

Home is the root. Use the reference’s central circular **Menu** button as the global navigation entry on root-level pages. The menu’s most prominent destination is **LottoLab**, described as “Research and plan your numbers.” Hide the floating circle when it would cover a picker, keyboard, dialog or bottom confirmation action.

Global menu order:

1. Home
2. LottoLab
3. Results & history
4. Check my numbers
5. My boards
6. Draw calendar
7. Notifications
8. How to use LottoLab
9. Settings & data status
10. About LottoLab

Do not introduce competing hamburger, drawer and bottom-tab navigation systems. Child screens have a back arrow and centred title. System Back first dismisses a modal, then returns to the previous page. Preserve selected game, filters and scroll position when returning from details.

The global menu and LottoLab tool menu are different: the former navigates the app; the latter organises calculators and research tools. Label them clearly.

## 4. Home and core screens

### Home

Use the reference dashboard shell with a centred LottoLab wordmark, refresh control and notifications icon. Put the date and last-update/demo status on a quiet secondary line. Show three circular shortcuts: Check, Generate, LottoLab.

Render game cards using the reference ticket construction. Each must contain game identity, latest draw date and winning numbers, a compact upcoming-draw/jackpot section, a View results link and Quick pick/Select numbers buttons. Use sample labels during design. The most recent result is the principal content; the upcoming jackpot is secondary. A separate expanded Games page may follow the reference’s jackpot-first card almost literally.

Use Lotto, Lotto Plus 1, Lotto 5 Max, PowerBall, PowerBall Xtra and Daily Lotto as provisional current-game fixtures pending full rule verification. Maintain each game’s own result card/data identity even if display grouping is used. Show retired games in a separately labelled archive.

Place a prominent full-width Check my numbers card after the result list, plus My boards and LottoLab cards. Keep all bottom content reachable above the floating menu.

### Complete route inventory

| ID | Screen or overlay | Required content |
|---|---|---|
| C01 | Home | Results cards, shortcuts, status, menu |
| C02 | Global menu | Ordered destinations, active state, close |
| C03 | Games catalogue | Ticket-style game cards and rule-era labels |
| C04 | Game overview | Latest draw, next draw, actions, archive link |
| C05 | Results archive | Game/era/date filters and draw rows |
| C06 | Draw detail | Ball strip, draw ID/date, complete payout list, source state |
| C07 | Check numbers input | Game, draw, personal board input |
| C08 | Check comparison | Both number sets, match count, prize pending/available states |
| C09 | My boards | Reference history list, filters, add action |
| C10 | Board detail | A/B/C rows, notes, dates, use/edit actions |
| C11 | Board editor | Name, game, board rows, add/remove, save preview |
| C12 | Number picker sheet | Tray, grid, clear, randomize, confirm |
| C13 | Quick pick setup | Game and board-count stepper |
| C14 | Generated boards | Mock lines, lock/edit/save-preview controls |
| C15 | Draw calendar | Month/list, selected date, game events |
| C16 | Notification list | Result/reminder examples and empty state |
| C17 | Notification preferences | Simple per-game switches, demo permission state |
| C18 | Help index | Games, checking, saving and research explanations |
| C19 | Game/how-to guide | Illustrated steps using actual UI components |
| C20 | Settings | Display preferences and simple data controls |
| C21 | Data status | Last update, coverage, offline/stale/missing states |
| C22 | About | Independent-app identity, sources, privacy/help links |
| C23 | Game/era selector | Separate current and retired formats |
| C24 | Date/range filter sheet | Last-N/custom, valid boundary examples |
| C25 | Save/name sheet | Naming, success and duplicate-name examples |
| C26 | Delete/discard dialog | Cancel, explicit action, unsaved-change state |
| C27 | Export preview | Board/research summary layout; export deferred |

Number picker modes must accommodate six-from-N, five-from-N plus a separate special ball, five-from-N, a subset search and a larger wheel pool. Label the mode so “Pick 6 balls” is never shown for a tool accepting one to six search numbers. Confirmation, full-selection and clear states must be designed.

On saved-board detail, replace purchase totals with planned cost only where relevant. Do not retain service fees, banking account rows or transaction reference codes. A saved board is not proof of purchase. Replace “Buy again” with “Use these numbers.”

The prize table must support all divisions, long descriptions, zero winners, unavailable amounts and payouts pending. Zero and unknown must look different. In the prototype, use a clearly labelled illustrative division table rather than claim current verified prize values.

## 5. LottoLab: the main feature area

Give this destination a dedicated header, game selector, rule-era selector, search field and grouped cards. Use simple icon, title, one-line purpose and chevron. Pin four tools near the top: Number frequencies, Check past combinations, Number generator and Number calculators.

Group the remaining tools under Explore history, Build numbers, Calculators and Advanced. A tool may have one canonical route and several shortcuts; do not duplicate implementations.

### Tool specifications for the UI phase

Every tool below needs a designed input view and a designed result view, plus help, empty and validation states. Result views use fixed, internally consistent demonstration data. Algorithm implementation waits until after UI approval.

| ID / Tool | Inputs | Result UI | Priority |
|---|---|---|---|
| T01 Number frequencies | Game, era, last 20/50/100/all eligible draws or custom dates; main/bonus/special pool | Sortable number grid, bar/table switch, appearances, eligible draws, percent, number detail link | Core |
| T02 Check past combinations | One to six selected numbers where the game permits; date range; contains-all or match-count mode | Exact/subset matches, number of draws examined, matched-date list, highlighted balls, no-match state | Core |
| T03 Number detail | Selected number plus inherited filters | Appearances, last seen, current/average/longest gap, recent draws, companions | Core |
| T04 Last seen & gaps | Game, pool, date range | Sorted rows of ball, last draw date, draws since appearance; never-seen-in-sample state | Core |
| T05 Pairs & triplets | Pair/triplet toggle, optional included number | Ranked sets, count, eligible sample, last seen, matching-draw links | Core |
| T06 Number companions | Anchor number, range | Co-occurring numbers with count and explicitly named denominator | Core |
| T07 Pattern explorer | Range and chosen metric | Odd/even, high/low, sum, spread, consecutive runs, last digits; chart plus table | Secondary |
| T08 Draw repeats | Consecutive-draw comparison or specified two draws | Repeated balls and repeat-count distribution | Secondary |
| T09 Number generator | Game, boards, include/exclude, optional locked numbers, optional structural filters | Unique mock boards, constraint summary, edit/save, impossible-filter state | Core |
| T10 Combination count | Pool size, board size, fixed numbers | Combination count, definition and expandable formula | Core |
| T11 Odds calculator | Game/era, match tier, distinct board count | Probability/“1 in” presentation, assumptions; distinguish jackpot from overlapping lower-tier events | Core |
| T12 Cost planner | Game, boards, draws, eligible add-ons, price source | Itemised estimate, total, unavailable-price state | Core |
| T13 Board analyser | Chosen line | Sum, odd/even, spread, runs, last digits; descriptive summary without score | Secondary |
| T14 Wheel builder | Pool, full/fixed/reduced mode, line or budget cap | Board count, cost estimate, coverage statement, sample boards and export preview | Advanced |
| T15 Coverage & duplicates | Selected board collection | Duplicate lines, distinct lines, pool distribution and shared-number matrix | Advanced |
| T16 Historical replay | Explicit method, training period, later evaluation period, budget | Historical matches/cost/payout-known state, baseline comparison and sample limitations | Advanced |
| T17 Budget log | Month, manual spend/winnings entries | Spend, returns, net result, monthly list; no bank connection | Secondary |

### Required analytic distinctions

- Hot and cold are sort presets within frequencies, not competing prediction tools.
- Use “draws since last appearance,” not “due to win.”
- Frequency percent means draws containing the number divided by eligible draws, clearly labelled. Counts across all numbers need not sum to the number of draws.
- For combinations, distinguish “these numbers all occurred within a draw” from “this exact complete line occurred.” State whether bonus/special pools are included.
- For PowerBall, main numbers and the special ball are separate fields and statistical pools.
- Do not combine old and new matrices in a default statistic. An explicit cross-era comparison requires separate columns/eligibility, never a misleading pooled total.
- High/low boundaries and definitions of gaps must be shown in help and configured per era.
- A sorted-position chart describes numerical sorting, not physical draw order.
- Missing draws require a visible coverage warning; missing data is not zero frequency.
- A reduced wheel’s coverage is conditional on its verified construction and selected pool. Arbitrary filtering can invalidate coverage. Design the unverified-coverage state.
- A probability result must not imply that a “balanced” line is more likely than another particular valid line.
- Historical replay must separate selection/training from later evaluation. Never calculate a strategy on all history and describe its performance on that same history as predictive validation.
- Defer machine/ball-set analysis unless reliable metadata exists. Do not build lucky scores, AI prediction confidence, guaranteed winners or numerology into the core product.

### Shared tool layout

1. Back/title/help header.
2. One-sentence explanation.
3. Game and era controls.
4. White input card with only necessary fields; advanced settings collapsed.
5. Full-width turquoise primary action.
6. Demo-labelled result card with a plain-language lead result.
7. Table/chart and supporting detail.
8. Applicable save/compare/export-preview action.
9. Quiet data-coverage/source note and concise historical-statistics explanation.

Keep numeric interpretation near the number it explains. Never place the key denominator only in a hidden help page.

## 6. Demonstration data and interaction boundary

Use deterministic fixtures stored separately from UI components. All sample jackpots, draws, winnings and statistics must be clearly marked “Sample data — UI preview.” Do not hard-code screenshots’ amounts as latest results. Do not show “Synced successfully” for a simulated update.

Allowed now: navigation, opening/closing overlays, selecting fixture games, local visual number selection, changing tabs, toggles, mock form validation, switching between authored states and session-only board edits.

Deferred: real random generation, mathematical calculators, historical searches, prize determination, persistent accounts/database, network requests, scheduled jobs, notifications, OCR, real export, billing and purchases. Primary tool actions may open an explicitly authored sample result. This is a navigable design prototype, not a silently functioning calculation service.

Create a development-only screen gallery with named fixture states. Do not expose developer terminology in normal user flows. Mock saved boards reset with the prototype; label the demo appropriately rather than imply durable storage.

### Future-ready contracts, no backend implementation

Document view-model shapes for Game, RuleVersion, Draw, PrizeDivision, Board, ToolQuery, ToolResult, DataCoverage and SourceStatus. Include effective dates, game IDs, pool types, currency, Africa/Johannesburg timezone, source and retrieval timestamps, rule-version reference, missing/pending values and demo status. These contracts prevent later integration from changing approved layouts.

## 7. State and accessibility coverage

For each relevant screen design: populated, first-use empty, filtered-empty, loading, offline with cached data, offline without data, stale, unavailable, invalid input and retry states. Also show prize pending, no matching draw, unknown rule, archive-only game, incompatible saved board and partial data coverage.

Use at least 48 logical-pixel interactive targets. Verify contrast, semantic labels, focus order, TalkBack reading, large text, keyboard dismissal and safe areas. Purple links must remain readable. Do not use red/green alone to distinguish matches or statuses.

Validate 360, 390 and 412 logical-pixel widths, a short viewport and 200% text scaling. Allow graceful reflow instead of clipping. Constrain tablet content width. Keep primary controls visible without covering scrollable content. Avoid tiny horizontally scrolling prize tables: preserve the reference’s stacked cell design.

## 8. UI-first sprints

Each sprint delivers its scope, screen previews, a short change log, unresolved questions and a checklist. Complete routine implementation decisions autonomously. A sprint is done only when its exit criteria are met; a decorative screenshot alone is insufficient.

### Sprint 0 — Reference audit and plan

- Inspect all ten screenshots, identify repeated scroll states and map every reference element to a LottoLab equivalent.
- Inventory any existing code/assets without replacing working features or data.
- Produce sitemap, route IDs, component inventory, fixture rules matrix and assumption register.
- Record which values are reference observations, proposed design decisions or verified facts.
- Exit: every reference element and every proposed screen has a documented destination. No backend or app rewrite begins.

### Sprint 1 — Visual foundations

- Build typography, colours, spacing, ticket panel, ball system, buttons, title bars, lists and floating menu.
- Produce three fidelity anchors: game card, number picker and prize table.
- Compare reference crops and new UI at the same logical viewport scale. Refine shape, proportions, spacing and density.
- Exit: all three anchors clearly reproduce the supplied visual language; focus, pressed, disabled and selected styles exist.

### Sprint 2 — Home and navigation

- Implement C01–C04 and C02’s navigation overlay using fixtures.
- Add circular shortcuts, current-game cards, footer ticket-check CTA and menu clearance.
- Exit: Home → game → result stub → Back and Home → Menu → LottoLab work; no menu overlap or dead destinations.

### Sprint 3 — Results and prize screens

- Implement C05, C06, C23 and C24.
- Design all provisional game variants and an archived-era example.
- Include payout pending, zero winners, unknown prize, stale result and no-history states.
- Exit: complete long prize lists scroll correctly; game/era/source context remains clear; zero is distinct from unknown.

### Sprint 4 — Number selection and boards

- Implement C09–C14 and C25–C26.
- Match the reference sheet, selected-ball tray, grids, stepper and stacked board rows.
- Include Lotto, PowerBall, Daily Lotto, subset-search and wheel-pool picker variants.
- Exit: select/clear/confirm/edit flows are visually complete, selections cannot be confused across pools, narrow devices remain usable.

### Sprint 5 — Ticket checking

- Implement C07–C08 and connect entry points from Home, draw detail and saved boards.
- Author no-match, partial-match, bonus/special match, payout-pending and invalid-board examples.
- Exit: users can identify their board, comparison draw and meaning of every highlight; no simulated result is presented as a real win.

### Sprint 6 — LottoLab hub and shared tool shell

- Build grouped menu, search/filter state, pinned tools and shared input/result components.
- Create a canonical route for every T01–T17 tool; make the complete route inventory reachable.
- Exit: tool names and explanations communicate purpose without technical knowledge; every destination has a planned input/result layout.

### Sprint 7 — Core research tools

- Fully design T01–T06 with fixture results, filters, number details and matching-draw drill-downs.
- Show frequency grids/tables, historical combination modes, pairs/triplets and gaps.
- Exit: all metrics show sample size, era, dates and denominator; subset and full-line searches are visually unambiguous.

### Sprint 8 — Generation and calculators

- Fully design T09–T13, including impossible filters, unavailable prices and different game formats.
- Create results that are readable without opening a formula; provide an optional explanation layer.
- Exit: users can distinguish number generation, combination counts, odds, cost and structural analysis; no arbitrary quality score appears.

### Sprint 9 — Secondary and advanced tools

- Fully design T07–T08 and T14–T17.
- Include wheel coverage states, duplicate-board summaries, budget log and replay assumptions.
- Exit: advanced tools remain discoverable without overwhelming the hub; costs and coverage assumptions appear before board output.

### Sprint 10 — Supporting app screens

- Implement C15–C22 and C27.
- Use actual UI components for illustrated help. Include simple notification preferences and data-coverage explanations.
- Exit: every supporting route and preview state exists; help matches the actual interface; no unnecessary sign-in blocks exploration.

### Sprint 11 — Whole-app review and UI freeze

- Review all core screens, tool input/result views and overlays using the screen gallery.
- Test navigation/back behaviour, long names, long lists, empty data, safe areas, contrast and large text.
- Run complete walkthroughs: results check; create/edit board; research a number; search a historical combination; generate-preview/save-preview; advanced wheel-preview.
- Deliver the complete screen atlas, reusable component catalogue, clickable prototype, source files and UI acceptance checklist. For an existing Android project, include a clearly named UI-preview APK if the build environment supports it and report actual build/testing status.
- Exit: no dead route, clipped content, inconsistent button, unlabeled demo result or missing tool state. Record remaining visual issues. Ask for the user’s visual review only after this complete UI package is ready.
- Do not begin functional integration until the user approves the UI. Approval applies to layout and flows, not to unverified game rules or algorithms.

## 9. Subsequent functionality sprints — scheduled only after UI approval

These are a roadmap, not permission to implement during the current UI phase. Revisit the detailed specification of each tool before building it; its approved screen is the presentation contract.

| Sprint | Scope | Required proof |
|---|---|---|
| F1 | Verify operator rules, era boundaries, prices, payout logic and permitted source access | Source register and validated rule fixtures; no assumed free API |
| F2 | Results ingestion, normalisation, deduplication and local cache | Missing/conflicting/pending result handling, provenance and offline tests |
| F3 | Durable boards and ticket comparison | Main/bonus/special matching and archive-era cases; migration/data-preservation checks |
| F4 | Frequencies, gaps and historical combination search | Hand-checked small datasets, eligibility denominators and missing-data behaviour |
| F5 | Pairs, triplets, companions, patterns and repeats | Independent expected examples and consistent game/era filtering |
| F6 | Random generator, counts, odds and cost | Valid unique pools, impossible constraints, combinatorics checks and versioned prices |
| F7 | Wheels, coverage, replay and budget | Verified conditional coverage, bounded computation, held-out replay and duplicate handling |
| F8 | Background updates, notifications and export | Offline/retry behaviour, Android lifecycle checks and printable output verification |
| F9 | Release quality | Device tests, performance, accessibility, privacy, backups and signed-build process |

For each future tool, write a specification of inputs, outputs, definitions, data dependencies, formulas, edge cases, source assumptions and meaningful tests before implementation. Preserve the approved UI unless a necessary change is explained and reviewed.

## 10. Completion rules

Do not claim that a feature works because a static result card exists. Report “UI complete,” “fixture interaction complete,” “calculation verified” and “live-data integrated” separately.

Do not skip screens to rush to an APK. Do not redesign the app while implementing each tool. Reuse approved components. Do not turn a user-friendly interface into a dashboard of unexplained charts.

Start with Sprint 0 and Sprint 1. Continue the UI sprints in order, resolve routine choices using this brief, show concrete previews and maintain the checklist. Stop at the completed UI review milestone before functionality begins.

END OF MASTER PROMPT

---

## Source register

Reviewed 26 October 2026. Recheck current game information before implementing production behaviour. These references support the research choices; they are not permission to ingest or redistribute their data.

- [R1 — LotteryResults.co.za: Lotto tools](https://www.lotteryresults.co.za/tools/lotto/)
- [R2 — LottoTrekker: Daily Lotto statistics](https://www.lottotrekker.com/south-africa-daily-lotto/statistics/)
- [R3 — Lottery.qtool.io: Number statistics](https://lottery.qtool.io/number-statistics.html)
- [R4 — Lottery Post: Lottery wheels](https://www.lotterypost.com/wheels)
- [R5 — Nedbank: Lottery FAQs](https://personal.nedbank.co.za/bank/digital-banking/needs/buy/lottery-faqs.html)
- [R6 — South African National Lottery](https://www.nationallottery.co.za/)

Research limitation: the operator homepage did not expose a full readable rulebook through this retrieval. Bank guidance supports prototype defaults; exact effective dates, all prize tiers, sales-channel exceptions, current prices and production data rights remain validation work. No live API has been selected or connected.
