# CyberNest architecture

```mermaid
flowchart LR
  Web[React Web] --> API[Express API]
  Mobile[Flutter Mobile] --> API
  API --> Mongo[(MongoDB)]
  API <--> Socket[Socket.IO]
  API --> Stripe[Stripe]
  API --> Providers[AI / Media / Spotify / Push providers]
  API --> Cache[Cache provider]
  API --> Queue[Job provider]
  Worker[CyberNest Worker] --> Queue
  Worker --> Mongo
  Admin[React Admin] --> API
```

Provider boundaries isolate AI, calls, moderation, media, cache, recommendations and jobs. MongoDB is authoritative; cache is disposable. API instances are stateless except when memory providers are selected for development.
