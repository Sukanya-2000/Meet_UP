# CyberNest backup and disaster recovery

- MongoDB: encrypted daily snapshots, continuous point-in-time recovery, 35-day operational retention and quarterly archive. Test restoration monthly into an isolated account.
- Media: enable provider versioning, cross-region replication and lifecycle rules. Database backups do not contain media binaries.
- Secrets: store only in a managed secret service; rotate JWT, encryption, Stripe and OAuth credentials after any suspected exposure.
- Redis/queues: treat caches as disposable. Persist queues where supported and replay dead-letter jobs after database recovery.
- Recovery order: freeze writes, restore MongoDB, validate indexes/migrations, restore media access, deploy API, deploy workers, then re-enable traffic gradually.
- Targets: RPO 15 minutes for MongoDB and RTO 2 hours. Record every exercise and remediation.
