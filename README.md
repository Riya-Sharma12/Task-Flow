# Indexcard — Task Management App

A brutalist/newspaper-aesthetic task management application built with Next.js 14 App Router, TypeScript, TanStack Query, ShadCN UI, Tailwind CSS, and PostgreSQL.

---

## Live Demo

Deployed on Vercel — [https://task-flow-riya.vercel.app](https://task-flow-riya.vercel.app) *(update this link after deploy)*

---

## Features

- **Authentication** — Register, login, logout with email verification
- **JWT Sessions** — `httpOnly` cookie-based sessions, 7-day expiry
- **Protected Routes** — Middleware-level route protection at the Edge
- **Task CRUD** — Create, read, update, delete tasks
- **Mark Complete** — Toggle task status with instant optimistic updates
- **Search & Filter** — Search by title/description, filter by status
- **Dashboard Metrics** — Total, completed, pending count + completion percentage
- **Progress Bar** — Visual completion progress
- **Custom Delete Modal** — Brutalist confirmation dialog (no native `window.confirm`)
- **Email Verification** — Transactional emails via Resend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | ShadCN UI |
| State Management | TanStack Query v5 |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma v5 |
| Auth | JWT via `jose` (HMAC-HS256) |
| Password Hashing | PBKDF2 via Web Crypto API |
| Email | Resend |
| Linting | ESLint + Prettier |

---

## Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/Riya-Sharma12/Task-Flow.git
cd Task-Flow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env.local` file in the root with the following variables:

```env
# PostgreSQL connection string (Neon, Supabase, or local)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT signing secret — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-strong-random-secret-here

# Resend API key for email verification (get from resend.com)
RESEND_API_KEY=re_your_api_key_here

# Your app's public URL (used in verification email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Push the database schema

```bash
# Prisma reads .env — copy DATABASE_URL there temporarily, or use:
$env:DATABASE_URL = "your-connection-string"; npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user, send verification email |
| `POST` | `/api/auth/login` | Login, set JWT cookie |
| `POST` | `/api/auth/logout` | Clear cookie, redirect to `/` |
| `GET` | `/api/auth/verify?token=...` | Verify email token |

### Tasks (all require authentication)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List all tasks for authenticated user |
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks/:id` | Get a single task |
| `PATCH` | `/api/tasks/:id` | Update title, description, status, or dueDate |
| `DELETE` | `/api/tasks/:id` | Delete a task |

---

## Project Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── register/route.ts
│   │   └── verify/route.ts
│   └── tasks/
│       ├── route.ts            # GET list, POST create
│       └── [id]/route.ts       # GET one, PATCH, DELETE
├── auth/
│   ├── page.tsx                # Server component
│   └── AuthForm.tsx            # Client component
├── dashboard/
│   ├── page.tsx                # Server component (reads JWT cookie)
│   └── TaskBoard.tsx           # Client component (TanStack Query)
├── layout.tsx
├── page.tsx                    # Landing page
└── providers.tsx               # QueryClientProvider

components/ui/
├── button.tsx                  # ShadCN Button (brutalist variants)
├── input.tsx                   # ShadCN Input
├── textarea.tsx                # ShadCN Textarea
└── badge.tsx                   # ShadCN Badge (pending/completed variants)

lib/
├── auth.ts                     # JWT + PBKDF2 password hashing
├── email.ts                    # Resend email sender
├── prisma.ts                   # Prisma singleton client
├── tasks.ts                    # Task DB queries
├── users.ts                    # User DB queries
└── utils.ts                    # cn() helper

prisma/
└── schema.prisma               # User + Task models

middleware.ts                   # Edge route protection
```

---

## Architecture Decisions

### 1. JWT over NextAuth
Custom JWT implementation using `jose` was chosen over NextAuth to keep the auth flow transparent and demonstrate understanding of token-based authentication. Sessions are stored in `httpOnly` cookies (not `localStorage`) to prevent XSS attacks.

### 2. PBKDF2 Password Hashing
Passwords are hashed using PBKDF2 (100,000 iterations, SHA-256, random 16-byte salt) via the browser's built-in Web Crypto API — no third-party library required. Constant-time comparison prevents timing attacks.

### 3. Middleware-level Route Protection
Route protection runs in `middleware.ts` at the **Edge** before any page renders — no flash of protected content, no client-side redirect race conditions.

### 4. TanStack Query with Optimistic Updates
All task mutations (toggle status, delete) use optimistic updates — the UI responds instantly while the API call runs in the background. On error, the cache rolls back automatically.

### 5. PostgreSQL via Neon + Prisma
Neon provides a serverless PostgreSQL instance with a generous free tier. Prisma v5 handles the ORM layer with type-safe queries. The Prisma client uses a singleton pattern to avoid connection pool exhaustion in Next.js dev mode.

### 6. CUID over Auto-increment IDs
Task and User IDs use `cuid()` instead of sequential integers. Sequential IDs in API URLs (`/api/tasks/3`) are guessable — CUIDs prevent users from accessing or probing other users' resources by incrementing an ID.

### 7. App Router with Server + Client Components
- **Server components** (`dashboard/page.tsx`, `auth/page.tsx`) read cookies and verify JWT server-side before rendering
- **Client components** (`TaskBoard.tsx`, `AuthForm.tsx`) handle interactivity and TanStack Query

---

## Assumptions Made

1. **Email verification is required** before a user can log in. Users who register but don't verify cannot access the dashboard.
2. **Due dates are stored as strings** (`YYYY-MM-DD`) rather than full timestamps to avoid timezone conversion issues on the client.
3. **Task ownership is enforced server-side** — every API route verifies the JWT and checks that the requested task belongs to the authenticated user.
4. **No password reset flow** — out of scope for this assignment.
5. **Single user per email** — duplicate email registration returns a `409 Conflict`.
6. **Resend free tier** limits sending to verified email addresses only. In development, if no `RESEND_API_KEY` is set, the verification link is returned in the API response and displayed in the UI for easy testing.

---

## Running Linting & Formatting

```bash
npm run lint        # ESLint
npx prettier --write .  # Prettier
```

---

## Deployment

The app is deployed on Vercel. Required environment variables on Vercel:

- `DATABASE_URL`
- `JWT_SECRET` (use a strong random value, not the dev placeholder)
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL)
