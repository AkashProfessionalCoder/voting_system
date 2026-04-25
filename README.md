# Flutter Chennai — Annual Voting System

A secure, OTP-based voting platform for the Flutter Chennai community's annual awards. Built as a monolithic Node.js + React application with MongoDB.

---

## Features

- **OTP-based email verification** — Gmail-only, 6-digit codes, 5-minute expiry
- **One vote per email** — enforced at the database level (MongoDB unique index)
- **Voting deadline** — configurable, strictly enforced server-side
- **Admin dashboard** — real-time results, voter list, nominee CRUD, CSV export
- **Rate limiting** — max 3 OTP requests per email per hour
- **JWT authentication** — separate tokens for voters (15 min) and admins (8 hr)

---

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Backend  | Node.js, Express 5          |
| Frontend | React 19, Vite, Tailwind v4 |
| Database | MongoDB, Mongoose           |
| Email    | Nodemailer (Gmail SMTP)     |
| Auth     | JWT, bcryptjs               |

---

## Project Structure

```
annual_voting_system/
├── server/                  # Express backend
│   ├── controllers/         # Route handlers
│   ├── routes/              # Public + admin route definitions
│   ├── models/              # Mongoose schemas
│   ├── services/            # OTP generation, email sending
│   ├── middlewares/         # JWT auth, rate limiting
│   ├── config/              # DB connection
│   ├── app.js               # Express app setup
│   ├── server.js            # Entry point
│   └── seed.js              # Seed admin + sample nominees
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # VotingPage, AdminDashboard
│       └── services/        # Axios API layer
├── docs/                    # Project documentation
│   ├── Architecture.md      # System design & layers
│   ├── Contribution.md      # Branching & developer workflow
│   └── Documentation_pattern.md  # Code commenting standards
├── .env.example             # Environment variable template
└── package.json             # Root scripts
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

### 1. Clone & Install

```bash
git clone https://github.com/AkashProfessionalCoder/voting_system.git
cd voting_system
npm install
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable           | Description                          |
|--------------------|--------------------------------------|
| `PORT`             | Server port (default: `5050`)        |
| `MONGODB_URI`      | MongoDB connection string            |
| `JWT_SECRET`       | Secret key for JWT signing           |
| `EMAIL_USER`       | Gmail address (sender)               |
| `EMAIL_PASS`       | Gmail App Password (not regular pwd) |
| `CLIENT_URL`       | Frontend URL for CORS                |
| `VOTING_DEADLINE`  | ISO 8601 timestamp                   |

### 3. Seed Database

```bash
npm run seed
```

Creates default admin (`admin` / `admin123`) and 6 sample nominees.

### 4. Run Development

```bash
# Terminal 1 — Backend
npm run dev:server

# Terminal 2 — Frontend
npm run dev:client
```

- Frontend: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`
- API: `http://localhost:5050/api`

### 5. Production Build

```bash
npm run build:client
npm start
```

Serves both API and React from a single Express instance.

---

## API Endpoints

### Public

| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| GET    | `/api/nominees`     | List all nominees       |
| POST   | `/api/otp/request`  | Request OTP             |
| POST   | `/api/otp/verify`   | Verify OTP → get token  |
| POST   | `/api/vote`         | Cast vote (JWT required)|
| GET    | `/api/vote/status`  | Check if email voted    |
| GET    | `/api/deadline`     | Get voting deadline     |

### Admin (JWT required)

| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| POST   | `/api/admin/login`        | Admin login          |
| GET    | `/api/admin/results`      | Vote counts          |
| GET    | `/api/admin/voters`       | Voter list           |
| GET    | `/api/admin/export`       | CSV export           |
| POST   | `/api/admin/nominees`     | Add nominee          |
| PUT    | `/api/admin/nominees/:id` | Update nominee       |
| DELETE | `/api/admin/nominees/:id` | Delete nominee       |
| PUT    | `/api/admin/deadline`     | Set voting deadline  |

---

## Roadmap

- [ ] Google OAuth as alternative to OTP
- [ ] Real-time vote count updates (WebSocket)
- [ ] Multi-category voting support
- [ ] Nominee image upload (S3/Cloudinary)
- [ ] Email notification on vote confirmation
- [ ] Admin role management (multi-admin)
- [ ] Deployment guide (Railway / Render / VPS)

---

## Documentation

| Document | Purpose |
|----------|---------|
| [Architecture](docs/Architecture.md) | System design, layers, data flow |
| [Contribution Guide](docs/Contribution.md) | Branching strategy, PR workflow |
| [Documentation Standards](docs/Documentation_pattern.md) | Code commenting rules |

---

## License

ISC
