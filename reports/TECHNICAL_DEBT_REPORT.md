# Technical debt

1. Main web bundle remains approximately 858 kB minified; more route-level and vendor chunking is needed.
2. Several controllers are dense single-line modules and should be formatted and decomposed into domain services.
3. Memory cache/job implementations are development-only; remote adapters need production implementations and tests.
4. Legacy `premium` remains in plan enums for compatibility and needs a scheduled retirement migration.
5. Discovery still ranks a bounded candidate set in application memory rather than a scalable retrieval/ranking service.
6. Test coverage is structural and narrow relative to the feature surface.
7. Localization covers core scaffolding, not every product string.
