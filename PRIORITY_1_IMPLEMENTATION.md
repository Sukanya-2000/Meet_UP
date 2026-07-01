# Phase 4 — Priority 1 implementation

Priority 1 adds structured profile fields and completion scoring; moderated text/photo prompts; structured relationship intentions; Super Sparks and optional pre-match notes with entitlements, daily quotas and consumables; Incognito and expiring Travel Mode; Free/Plus/Gold/Platinum plan support; archived unmatch with Socket.IO notification; and a configured GIPHY search/trending/favorites/recent boundary.

Run `npm --prefix server run migrate:priority1` once per environment. The additive migration initializes new profile arrays, maps legacy `premium` subscriptions to `gold`, and synchronizes indexes. Existing users, matches, messages, Stripe identifiers and APIs remain intact.

New configuration: `GIPHY_API_KEY`. Stripe checkout accepts `plus`, `gold`, or `platinum`; legacy `premium` remains readable for backward compatibility.

New APIs:

- `GET|POST|PUT|DELETE /api/profile/prompts`
- `PUT /api/profile/privacy`, `PUT /api/profile/travel`
- `POST /api/like` with `kind: super-like` and optional `note`
- `DELETE /api/matches/:id`
- `GET /api/gifs/search`, `/trending`, `/activity`; `PUT /api/gifs/activity`
- `GET|PUT /api/admin/profile-prompts`; `GET /api/admin/unmatched`

Priority 2 has not started.
