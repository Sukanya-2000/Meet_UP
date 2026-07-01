# Developer guide

1. Copy `.env.example`, configure MongoDB and a 32+ character JWT secret.
2. Run `npm ci`, `npm --prefix server ci`, then `npm run dev` and `npm run server`.
3. Apply migrations in numerical order through `migrate:priority4`.
4. Run `npm run lint`, `npm run build`, `npm --prefix server test` before review.
5. Keep controllers transport-focused, domain behavior in services, provider code behind interfaces, and all privileged actions auditable.
6. Never commit secrets, production exports, uploaded user content or provider tokens.
