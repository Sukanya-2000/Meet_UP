# Database health report

Additive schemas preserve existing data. Pair uniqueness, message timelines, notification unread queries, discovery traits/geospatial location, moderation queues, TTL sessions/resets/privacy requests/idempotency and analytics/event queries are indexed. The duplicate session TTL index declaration found during certification was removed.

Release requirements: run all migrations against a staging clone, capture `validate` and `explain('executionStats')`, verify unique-index conflicts, take/restore a backup, and test transactional match/payment workflows under concurrency.
