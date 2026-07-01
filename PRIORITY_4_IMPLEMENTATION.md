# Phase 7 — Priority 4 enterprise hardening

Priority 4 adds configurable AI profile/photo providers; smart explainable recommendations; consent, export and deletion privacy workflows; web/mobile localization and RTL foundations; WCAG-focused focus, motion, contrast and text scaling; structured logs, trace IDs and metrics; CSP and production environment validation; security events and idempotency; retry/circuit-breaker utilities; lazy-loaded routes and query indexes; Kubernetes/Helm-ready deployment; release automation; and disaster-recovery guidance.

Run `npm --prefix server run migrate:priority4` once per environment.

Important configuration: `AI_PROVIDER=local|openai|anthropic|gemini|azure-openai|local-llm`, with provider credentials supplied only through managed secrets. Non-local adapters fail closed until explicitly implemented/configured.

Privacy APIs are under `/api/enterprise/privacy`; AI APIs under `/api/enterprise/ai`; Prometheus-compatible metrics are available to admins at `/api/enterprise/admin/metrics`.

Deployment assets are under `deploy/`; recovery policy is in `DISASTER_RECOVERY.md`.

Priority 5 has not started.
