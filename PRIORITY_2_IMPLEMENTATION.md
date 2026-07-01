# Phase 5 — Priority 2 implementation

Priority 2 adds configurable Opening Moves; match expiration, grace, Extend and premium Rematch histories; first-move policies; provider-neutral dummy/WebRTC-ready call sessions and Socket.IO signaling; configurable Question Game content; live Share Date transitions; moderation-provider abstractions and safety scans; selfie/liveness/identity verification retries and levels; and timed Snooze Mode.

Run `npm --prefix server run migrate:priority2` once per environment. It adds default settings and starter questions, initializes new profile/match fields without deleting data, and synchronizes indexes.

Admin configuration is available through `/api/admin/settings`, `/opening-moves`, `/questions`, and `/moderation-queue`. Call providers use `CALL_PROVIDER=dummy|webrtc`; no vendor credentials are embedded. The rules moderation provider is deliberately replaceable through the `ModerationProvider` interface.

Primary user APIs:

- `/api/opening-moves`
- `/api/lifecycle/matches/:id/extend|rematch|history` and `/api/lifecycle/snooze`
- `/api/interactions/calls` and `/api/interactions/games`
- `/api/features/date-plans/shared/:token` and `/date-plans/:id/status`
- `/api/verifications` and `/api/verifications/:id/retry`

Socket events include `match:extended`, `match:rematched`, `call:incoming`, `call:signal`, `call:state`, `call:status`, `game:started`, `game:updated`, and `date-plan:updated`.

Priority 3 has not started.
