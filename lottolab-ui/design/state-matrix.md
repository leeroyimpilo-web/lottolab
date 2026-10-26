# Sprint 0 — route, state and assumptions matrix

This table preserves the exact C01–C27 screen inventory in MASTER_PROMPT.md. Source: supplied screenshots described there; no reference screenshots have been committed as media.

| IDs | Screen family | Core states to author | Sprint |
|---|---|---|---|
| C01–C04 | Home, menu, games and game overview | demo, menu open/closed, empty/offline preview, selected game | 2 |
| C05–C06 | Results archive and draw detail | populated, archive-only, filtered-empty, pending payout, zero vs unknown, stale, source missing | 3 |
| C07–C08 | Check and comparison | no match, partial match, bonus/special match, invalid board, pending payout | 5 |
| C09–C11 | My boards, board detail/editor | first-use empty, several boards, unsaved, duplicate name, incompatible rule | 4 |
| C12–C14 | Picker, quick pick and generated boards | empty selection, partial/full, cleared, main/special, invalid limit, sample output | 4 |
| C15–C17 | Calendar/notifications/preferences | no events, several draws, offline, permissions unavailable, toggles | 10 |
| C18–C19 | Help index/how-to | index, example boards, game-specific information, accessibility | 10 |
| C20–C22 | Settings/data status/about | cached, never loaded, stale, missing source, offline, accessibility settings | 10 |
| C23–C24 | Game/era selector and date filter | current, retired, custom range, invalid dates, no eligible draws | 3 |
| C25–C26 | Name/save sheet and delete/discard | empty name, duplicate, save-preview success, cancel, discard confirmation | 4 |
| C27 | Export preview | mock printable report, no real export | 10 |

## Sprint 1 component inventory

- PageTitle: back arrow, centred title, right action
- DemoLabel: compulsory sample-data indicator
- NumberBall: white core, four curved white sectors, numeric text, interactive/noninteractive sizes, selected/disabled styles
- Pill: primary, outlined, secondary, disabled/active/focus
- TicketCard: game mark, latest sample results, cutouts, perforated ticket, illustrative jackpot and actions
- PrizeTable: stacked division, winner and amount columns; explicitly separate pending/unknown/zero
- NumberPicker: six-column grid, selected tray, clear, example-randomized selection, confirm and separate PowerBall pool
- FloatingMenu: central circular global menu
- Page shell: pale backdrop, generous rounded cards, restricted mobile canvas

## Prototype sample rules — NOT PRODUCTION RULE CONFIRMATION

| Game fixture | Main | Special |
|---|---|---|
| Lotto / Lotto Plus 1 / Lotto 5 Max | pick 6 from 1–52 | bonus in result-only demo |
| PowerBall / PowerBall Xtra | pick 5 from 1–50 | pick 1 from 1–16 |
| Daily Lotto | pick 5 from 1–36 | none |

All draw dates, jackpot values, numbers and payouts are invented to test visual layout. No download, historical calculation, prize check or source integration exists.

## Assumption register

- Reference asset images are not committed; shapes are implemented from their textual measurements, pending human side-by-side review.
- Typography uses Roboto/Arial. Token estimates remain unverified.
- Game names/rules are provisional until official operator verification in functionality sprint F1.
- Dynamic/real probabilities, updating, storage, push, APIs and winnings are not implemented in the UI sprints.
- The existing Next.js/Capacitor application remains in its original routes. /ui-preview is a distinct demonstration route on the development branch.
- Future full UI states must include keyboard focus, TalkBack labels, 200% text, 360/390/412 dp and short-screen layouts.
