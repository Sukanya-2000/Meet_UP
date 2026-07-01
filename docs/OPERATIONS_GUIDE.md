# Operations guide

- Deploy API and worker independently; use Redis-backed cache/queue and distributed Socket.IO in multi-instance production.
- Monitor `/api/health`, admin metrics, HTTP error rates, latency, queue depth, dead letters, payment webhooks and notification delivery.
- Rotate secrets regularly. Stripe webhook verification must remain enabled.
- Run migrations as a pre-deploy job and take a verified backup first.
- Follow `DISASTER_RECOVERY.md` for incidents. Roll back application images before rolling back additive schemas.
