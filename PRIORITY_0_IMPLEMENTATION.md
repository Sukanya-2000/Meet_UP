# Phase 3 — Priority 0 foundations

Implemented without replacing existing CyberNest APIs or data:

- Password reset tokens are hashed, single-use, and expire through a MongoDB TTL index. Production email delivery must be connected to the notification worker/provider.
- Notifications now expose inbox, unread count, mark-read, channel preferences, and mobile/web device registration APIs.
- Profiles accept consented GeoJSON coordinates and use a `2dsphere` index. Discovery reports calculated distance and never fabricates distance.
- Stripe remains the web payment source. Apple/Google receipt verification and restore endpoints use configured verification services and fail closed when unavailable.
- Premium access is synchronized to explicit entitlement records. The former mock subscription creation/webhook routes are retired.
- Admin status, report, verification, and premium changes create immutable audit-log records.
- CI validates lint, web build, API unit tests, Flutter analysis, and Flutter tests.

Required production configuration: `STRIPE_SECRET_KEY`, `APPLE_RECEIPT_VERIFICATION_URL`, `APPLE_RECEIPT_SECRET`, `GOOGLE_RECEIPT_VERIFICATION_URL`, and `GOOGLE_SERVICE_TOKEN`. `STRIPE_WEBHOOK_SECRET` is optional, but Stripe webhook processing remains disabled until it is configured. Push/email transport credentials remain provider-specific; device registration and preferences are ready for those workers.
