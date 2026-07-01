# Phase 6 — Priority 3 implementation

Priority 3 completes the CyberNest social/platform foundation: Double Date pair operations and matching, public Matchmaker voting/results, events and reusable group chat, Spotify OAuth storage/sync jobs, campus verification, curated discovery, an explainable ML-ready ranking provider, local/cloud media providers, memory/Redis-ready cache, memory/BullMQ/Agenda-ready job architecture, analytics/CSV export, feature flags, health, and expanded admin operations.

Run `npm --prefix server run migrate:priority3` once per environment and run workers with `npm --prefix server run worker`.

Configuration:

- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, `TOKEN_ENCRYPTION_KEY`
- `MEDIA_PROVIDER=local|s3|cloudinary|azure|gcs`
- `CACHE_PROVIDER=memory|redis`
- `JOB_PROVIDER=memory|bullmq|agenda`

Remote provider adapters fail closed until their credentials/SDK adapters are configured. No vendor secrets are embedded.

Primary namespaces: `/api/social`, `/api/community`, `/api/platform`, and `/api/discovery/curated`. Group sockets use `group:join`, `group:typing`, and `group:message`.

Priority 4 has not started.
