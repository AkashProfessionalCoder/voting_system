# Architecture

> System design and technical architecture of the Flutter Chennai Annual Voting System.

---

## Overview

The application follows a **monolithic architecture** — a single Node.js process serves both the REST API and the React frontend (in production). In development, they run as separate processes with a Vite proxy bridging them.

```
┌─────────────────────────────────────────────────┐
│                   Client (Browser)               │
│          React 19 + Tailwind CSS v4              │
│     VotingPage  |  AdminDashboard                │
└──────────────────┬──────────────────────────────┘
                   │ HTTP (Axios)
                   ▼
┌─────────────────────────────────────────────────┐
│                Express 5 Server                  │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ Public API │  │ Admin API  │  │ Static    │  │
│  │ /api/*     │  │ /api/admin │  │ Serve     │  │
│  └─────┬──────┘  └─────┬──────┘  │ (prod)    │  │
│        │               │         └───────────┘  │
│  ┌─────▼───────────────▼──────────────────────┐ │
│  │            Middleware Layer                  │ │
│  │  Helmet │ CORS │ Rate Limiter │ JWT Auth    │ │
│  └─────────────────┬──────────────────────────┘ │
│                    │                             │
│  ┌─────────────────▼──────────────────────────┐ │
│  │            Controller Layer                 │ │
│  │  OTP │ Vote │ Nominee │ Admin              │ │
│  └─────────────────┬──────────────────────────┘ │
│                    │                             │
│  ┌─────────────────▼──────────────────────────┐ │
│  │            Service Layer                    │ │
│  │  OTP Generation │ Email (Nodemailer)        │ │
│  └─────────────────┬──────────────────────────┘ │
│                    │                             │
│  ┌─────────────────▼──────────────────────────┐ │
│  │            Data Layer (Mongoose)            │ │
│  │  Admin │ Nominee │ User │ OtpRequest │ Vote│ │
│  └─────────────────┬──────────────────────────┘ │
└────────────────────┼────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │   MongoDB    │
              └──────────────┘
```

---

## Layers

### 1. Presentation Layer (Client)

| Concern        | Implementation                     |
|----------------|------------------------------------|
| Framework      | React 19 (Vite)                    |
| Styling        | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing        | React Router v6                    |
| HTTP Client    | Axios (baseURL: `/api`)            |
| State          | React `useState` / `useEffect`     |

**Pages:**
- `VotingPage` — multi-step voting flow (select → email → OTP → vote → success)
- `AdminDashboard` — login gate → tabbed dashboard (results, voters, nominees, settings)

**Components:**
- `NomineeCard` — selectable card with highlight
- `EmailInput` — Gmail validation
- `OtpInput` — 6-digit boxes with auto-focus and paste support
- `SuccessScreen` — vote confirmation
- `Loader` — spinner with text

### 2. API Layer (Routes)

Two route groups mounted on Express:

| Mount Point    | File               | Auth        |
|----------------|--------------------|-------------|
| `/api`         | `publicRoutes.js`  | None / JWT  |
| `/api/admin`   | `adminRoutes.js`   | Admin JWT   |

### 3. Middleware Layer

| Middleware       | Purpose                                    |
|------------------|--------------------------------------------|
| `helmet`         | Security headers                           |
| `cors`           | Cross-origin control (dev: `localhost:3000`)|
| `express.json`   | Body parsing (1MB limit)                   |
| `apiLimiter`     | 100 req / 15 min per IP (global)           |
| `otpLimiter`     | 10 req / hour per IP (OTP route)           |
| `verifyAdminToken` | JWT role check (`role: admin`)           |
| `verifyVoterToken` | JWT role check (`role: voter`)           |
| Request logger   | Logs method, path, status, duration        |

### 4. Controller Layer

| Controller          | Responsibilities                              |
|---------------------|-----------------------------------------------|
| `otpController`     | Request OTP (rate check, deadline check, already-voted check), verify OTP (atomic) |
| `voteController`    | Cast vote (deadline + duplicate check), vote status, deadline query |
| `nomineeController` | CRUD nominees                                 |
| `adminController`   | Login, results aggregation, voter list, CSV export, deadline management |

### 5. Service Layer

| Service         | Purpose                                      |
|-----------------|----------------------------------------------|
| `otpService`    | `crypto.randomInt` 6-digit OTP, expiry calc  |
| `emailService`  | Nodemailer Gmail transport, HTML email template |

### 6. Data Layer (MongoDB)

| Collection     | Key Constraints                            |
|----------------|--------------------------------------------|
| `admins`       | `username`: unique                         |
| `nominees`     | Standard CRUD                              |
| `users`        | `email`: unique                            |
| `otp_requests` | `email`: indexed, TTL on `expiresAt`       |
| `votes`        | **`email`: unique index** (critical)       |

---

## Data Flow: Voting

```
User selects nominee
        │
        ▼
User enters Gmail ──► POST /api/otp/request
        │                    │
        │              ┌─────▼─────────────────┐
        │              │ Validate Gmail         │
        │              │ Check deadline         │
        │              │ Check already voted    │
        │              │ Check rate limit (3/hr)│
        │              │ Generate OTP           │
        │              │ Save to otp_requests   │
        │              │ Send email via SMTP    │
        │              └─────┬─────────────────┘
        │                    │ 200 OK
        ▼                    ▼
User enters OTP ───► POST /api/otp/verify
        │                    │
        │              ┌─────▼─────────────────┐
        │              │ Atomic findOneAndUpdate│
        │              │ Mark OTP verified      │
        │              │ Return JWT (15 min)    │
        │              └─────┬─────────────────┘
        │                    │ { token }
        ▼                    ▼
Submit vote ────────► POST /api/vote
                             │
                       ┌─────▼─────────────────┐
                       │ Verify JWT (voter)     │
                       │ Check deadline         │
                       │ Verify nominee exists  │
                       │ Insert vote            │
                       │ ← unique index rejects │
                       │   duplicate (11000)    │
                       └─────┬─────────────────┘
                             │ 200 OK
                             ▼
                       Vote recorded
```

---

## Security Model

| Threat                  | Mitigation                                          |
|-------------------------|-----------------------------------------------------|
| Duplicate voting        | MongoDB unique index on `votes.email` (DB-enforced) |
| OTP brute force         | 3 OTP/hour/email rate limit + 5-min expiry          |
| OTP race condition      | Atomic `findOneAndUpdate` (not find + save)         |
| Unauthorized admin      | JWT with `role: admin` check                        |
| Non-Gmail emails        | Regex validation at OTP request and verify          |
| Late votes              | Server-side deadline check (OTP + vote endpoints)   |
| CSV formula injection   | Fields escaped with formula-char prefix             |
| Request flooding        | express-rate-limit (global + OTP-specific)          |
| Header attacks          | Helmet.js security headers                          |

---

## Environment Modes

| Mode        | Frontend            | Backend       | Static Serving |
|-------------|---------------------|---------------|----------------|
| Development | Vite `:3000` (proxy)| Express `:5050`| No            |
| Production  | Built to `client/dist` | Express `:5050` | Yes (Express) |
