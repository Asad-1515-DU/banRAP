# BanRAP

BanRAP (Road Safety Assessment Program) is a full-stack web application for collecting, annotating, reviewing, and monitoring road-safety labels.

The repository currently contains the active project under [test/](test/), split into:
- [test/backend](test/backend): Node.js + Express + Prisma API
- [test/frontend](test/frontend): React + Vite client

## Tech Stack

### Backend
- Node.js (>=18)
- Express
- Prisma ORM
- PostgreSQL
- JWT + HTTP-only cookie authentication
- Nodemailer (OTP email)

### Frontend
- React 19
- React Router
- Vite

## Repository Layout

- [test/backend/server.js](test/backend/server.js): API entrypoint
- [test/backend/src/controllers](test/backend/src/controllers): business logic
- [test/backend/src/routes](test/backend/src/routes): route registration (currently includes admin routes file)
- [test/backend/src/middleware](test/backend/src/middleware): auth middleware
- [test/backend/src/config](test/backend/src/config): Prisma/email/env config
- [test/backend/prisma/schema.prisma](test/backend/prisma/schema.prisma): database schema
- [test/backend/prisma/migrations](test/backend/prisma/migrations): migration history
- [test/backend/prisma/seed.js](test/backend/prisma/seed.js): seed script
- [test/frontend/src](test/frontend/src): app source code
- [test/frontend/src/component](test/frontend/src/component): UI views/components
- [test/frontend/src/utils/api.js](test/frontend/src/utils/api.js): API client wrapper

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- PostgreSQL

## Backend Setup

1. Go to backend:

```bash
cd test/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file [test/backend/.env](test/backend/.env):

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/banrap?schema=public"

# Auth
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRE=7d

# SMTP (optional in local development, required for real OTP emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# OTP sender used by emailConfig.js
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password

# Optional external key
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

4. Run migrations and generate Prisma client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

5. (Optional) seed initial test accounts:

```bash
node prisma/seed.js
```

6. Start backend in development mode:

```bash
npm run dev
```

Backend runs on http://localhost:5000 by default.

Useful endpoints:
- `GET /homepage`
- `GET /health`
- `GET /test-stats`

## Frontend Setup

1. Open a second terminal and go to frontend:

```bash
cd test/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file [test/frontend/.env](test/frontend/.env):

```env
VITE_API_BASE_URL=http://localhost:5000
```

4. Start frontend:

```bash
npm run dev
```

Frontend runs on http://localhost:5173 by default.

## Available Scripts

### Backend ([test/backend/package.json](test/backend/package.json))
- `npm run dev`: start with nodemon
- `npm run start`: start with node
- `npm run prisma:migrate`: apply/create migrations in dev
- `npm run prisma:studio`: open Prisma Studio
- `npm run prisma:generate`: generate Prisma client

### Frontend ([test/frontend/package.json](test/frontend/package.json))
- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint

## Authentication Flow

- Registration requires OTP verification.
- OTP is saved in database and emailed using configured mailbox.
- On successful login/verification, backend sets `authToken` HTTP-only cookie.
- Frontend API utility also sends `Authorization: Bearer <token>` when token exists in localStorage.

## Main Roles

- TRAVELLER: view routes/ratings and submit feedback/complaints
- ANNOTATOR: submit and manage labels
- ADMIN: review labels, monitor dashboard, manage annotators/feedback

## Database Highlights

Defined in [test/backend/prisma/schema.prisma](test/backend/prisma/schema.prisma):
- Users and role-specific tables (Traveller, Annotator, Admin)
- Roads, RoadSegments, Labels and subtype tables (Roadside, Intersection, Speed)
- Star ratings and navigation routes
- Feedback/complaints workflow
- Label review workflow
- Notifications
- OTP verification table

## API Surface (as used by frontend)

The frontend client in [test/frontend/src/utils/api.js](test/frontend/src/utils/api.js) calls these route groups:
- `/api/auth/*`
- `/api/traveller/*`
- `/api/annotator/*`
- `/api/admin/*`

## Seeded Development Accounts

If you run [test/backend/prisma/seed.js](test/backend/prisma/seed.js), it creates:
- Admin:
  - Email: `tarekjamiladnan007@gmail.com`
  - Password: `Adnan1234`
- Annotator:
  - Email: `annotator@test.com`
  - Password: `Test1234`

Use these only for local development.

## Troubleshooting

- CORS errors:
  - Check `FRONTEND_URL` in backend `.env`.
  - Confirm frontend is running on an allowed origin.

- Prisma connection issues:
  - Verify `DATABASE_URL` and PostgreSQL availability.
  - Re-run `npm run prisma:generate` after schema changes.

- OTP email not arriving:
  - Confirm `EMAIL_USER` and `EMAIL_PASSWORD` are valid.
  - For Gmail, use an App Password.

## Current Codebase Notes

- The backend entrypoint imports route/middleware modules for auth, traveller, annotator, and security handling from [test/backend/server.js](test/backend/server.js).
- In the current workspace snapshot, only [test/backend/src/routes/adminRoutes.js](test/backend/src/routes/adminRoutes.js) is present in the routes directory. If missing route/middleware files are not in your local branch, add/restore them before running the full API.

