# CyberNest — Phase 1

CyberNest is a MERN onboarding and discovery application with authentication, profile setup, interests, photos, and swipe-based discovery.

## Included

- Responsive pink/purple welcome and authentication UI
- React Router protected routes
- Redux Toolkit authentication state with local persistence
- React Hook Form and Zod client validation
- Axios API client with JWT bearer-token interceptor
- Express, MongoDB, and Mongoose API
- Password hashing with bcrypt and JWT authentication
- Centralized API errors, Helmet, CORS, and auth rate limiting
- User and Profile models
- Interest selection and six-photo drag/reorder management
- Paginated discovery with pass, like, favorite, and rewind actions
- Reciprocal-like match engine with match celebration
- Socket.IO chat with presence, typing, unread counts, timestamps, and read receipts
- Trust & Safety layer with blocking, in-context reporting, trust scores, and date check-ins

Matches, chat, notifications, premium behavior, and admin features are intentionally excluded. Boost is visual-only.

## Project structure

```text
src/
  assets/ components/ hooks/ layouts/ pages/
  redux/ routes/ services/ utils/
server/
  config/ controllers/ middleware/ models/
  routes/ services/ uploads/ utils/
```

## Setup

1. Install frontend dependencies:

   ```bash
   npm install
   ```

2. Install backend dependencies:

   ```bash
   npm --prefix server install
   ```

3. Copy `.env.example` to `.env`, and `server/.env.example` to `server/.env`.

4. Keep the sample Mongo value unchanged in source control:

   ```env
   MONGO_URI=YOUR_MONGO_URI_HERE
   ```

   Replace it only in your ignored local `server/.env` when you are ready to connect MongoDB. Also set a strong local `JWT_SECRET`.

5. Run the API and frontend in separate terminals:

   ```bash
   npm run server
   npm run dev
   ```

Frontend: `http://localhost:5173`  
API: `http://localhost:5000`

## API

| Method | Endpoint | Authentication |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/profile/basic` | Bearer JWT |
| POST | `/api/profile/interests` | Bearer JWT |
| GET/POST | `/api/photos`, `/api/photos/upload` | Bearer JWT |
| DELETE | `/api/photos/:id` | Bearer JWT |
| PUT | `/api/photos/main/:id` | Bearer JWT |
| GET | `/api/discovery` | Bearer JWT |
| POST | `/api/swipe` | Bearer JWT |
| POST | `/api/like` | Bearer JWT |
| GET | `/api/matches` | Bearer JWT |
| GET | `/api/messages/:matchId` | Bearer JWT |
| POST | `/api/messages` | Bearer JWT |

The forgot-password endpoint intentionally returns a privacy-safe acknowledgement only. Email delivery and reset-token persistence are outside Phase 1.

Although Multer is installed per the specified stack, no upload route is exposed because photos are explicitly outside this phase.
