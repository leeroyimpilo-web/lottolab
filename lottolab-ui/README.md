# LottoLab UI First

New, isolated UI project following the supplied 26 October 2026 master prompt.

## Location

Repository: leeroyimpilo-web/lottolab
Branch: lottolab-ui-first
Project directory: lottolab-ui

## Source of truth

Read docs/MASTER_PROMPT.md before implementing. The original web app and lottolab-next Android application remain intact.

## Architecture decision

Retain React and TypeScript with an Android-compatible responsive UI, consistent with the root Next.js/Capacitor project. Build the new presentation layer in this isolated directory. Do not import the existing live-data providers, analytics, service worker, storage or calculations into the UI preview. Android packaging follows UI review; use a distinct application ID so previews do not replace existing installs.

## Current status

- Repository access and push permission verified.
- Existing web and native project manifests inspected.
- No AGENTS.md appeared in the complete repository tree.
- Original brief saved verbatim.
- Route/tool inventory and initial visual tokens recorded.
- Sprint 0 started: reference mapping is in the master prompt; detailed state matrix still pending.
- Sprint 1 pending: actual components and three fidelity previews still to be built.
- Sprints 2–11 pending.
- All functional sprints deferred until UI approval.

No working UI, live integration or APK is claimed by this setup commit.
