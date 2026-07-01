# API reference

The canonical machine-readable contract is `docs/openapi.yaml`. All private endpoints require `Authorization: Bearer <token>`. Mutation clients should send `Idempotency-Key`. Errors return an HTTP status plus `{ success: false, message, traceId? }`. Rate limits use standard headers. Socket clients authenticate with the same access token and join only server-authorized rooms.
