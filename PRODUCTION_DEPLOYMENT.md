# CyberNest Production Deployment

Keep source control configured with:

```env
MONGO_URI=YOUR_MONGO_URI_HERE
```

Provide real values only through deployment secrets:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=a-long-random-production-secret
CLIENT_URL=https://your-domain.example
MOCK_WEBHOOK_SECRET=a-separate-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=a-strong-initial-password
```

## Docker Compose

```bash
docker compose up -d --build
docker compose exec api npm run create-admin
```

Open `http://localhost:8080`. Nginx proxies REST, uploads, and Socket.IO to the API. Uploaded photos persist in the `cybernest_uploads` volume.

## Mock subscriptions

`POST /api/subscription/create` creates a pending mock subscription and never charges money. Activate premium from the admin user screen, or simulate a signed webhook:

```bash
curl -X POST https://your-domain.example/api/subscription/webhook \
  -H "Content-Type: application/json" \
  -H "x-mock-signature: YOUR_MOCK_WEBHOOK_SECRET" \
  -d '{"providerSubscriptionId":"mock_sub_ID","status":"active"}'
```

## Production checklist

- Terminate TLS at the load balancer or reverse proxy.
- Restrict CORS to the production frontend domain.
- Store MongoDB, JWT, admin, and webhook values in a secret manager.
- Use a least-privilege Atlas user, network allowlists, backups, and credential rotation.
- Persist uploads or replace local storage with object storage.
- Forward WebSocket upgrade headers. For horizontal scaling, add a Socket.IO Redis adapter and sticky sessions.
- Centralize HTTP/error logs and alerts.
- Run lint, build, dependency audit, backups, and smoke tests before release.
- Remove `ADMIN_PASSWORD` after creating the first admin.
