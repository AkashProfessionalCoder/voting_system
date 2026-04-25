<div align="center">
  <h1>🏆 Flutter Chennai — Annual Voting System</h1>
  <p>A secure, OTP-based voting platform for the Flutter Chennai community's annual awards.</p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br />

Built as a monolithic Node.js + React application with MongoDB.

---

## ✨ Features

- **🔐 OTP-based email verification** — Gmail-only, 6-digit codes, 5-minute expiry.
- **🛡️ One vote per email** — Enforced at the database level (MongoDB unique index).
- **⏳ Voting deadline** — Configurable and strictly enforced server-side.
- **📊 Admin dashboard** — Real-time results, voter list, nominee CRUD operations, and CSV export.
- **🚦 Rate limiting** — Maximum **5 OTP requests** per email per hour.
- **🔑 JWT authentication** — Separate tokens for voters (15 minutes) and admins (8 hours).
- **✨ Animated UI** — Includes interactive canvas particle background and modern Tailwind V4 styling.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express 5 |
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Database** | MongoDB, Mongoose |
| **Email** | Nodemailer (Gmail SMTP) |
| **Auth & Security** | JWT, bcryptjs, Helmet, Express Rate Limit |

---

## 📂 Project Structure

```text
annual_voting_system/
├── server/                  # Express backend
│   ├── controllers/         # Route handlers
│   ├── routes/              # Public + admin route definitions
│   ├── models/              # Mongoose schemas
│   ├── services/            # OTP generation, email sending
│   ├── middlewares/         # JWT auth, rate limiting
│   ├── config/              # DB connection & Constants
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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

### 1. Clone & Install

```bash
git clone https://github.com/AkashProfessionalCoder/voting_system.git
cd voting_system

# Install root & server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit the `.env` file with your values:

| Variable | Description |
| :--- | :--- |
| `PORT` | Server port (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `EMAIL_USER` | Gmail address (sender) |
| `EMAIL_PASS` | Gmail App Password (not regular password) |
| `CLIENT_URL` | Frontend URL for CORS (default: `http://localhost:3000`) |
| `VOTING_DEADLINE` | ISO 8601 timestamp |

### 3. Seed Database

Creates a default admin account (`admin` / `admin123`) and sample nominees.

```bash
npm run seed
```

### 4. Run Development

Start both the backend and frontend development servers concurrently:

```bash
# Terminal 1 — Backend API
npm run dev:server

# Terminal 2 — Frontend Client
npm run dev:client
```

- **Frontend Application**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`
- **API Base URL**: `http://localhost:5000/api`

### 5. Production Build

To build the client and run the server serving static files:

```bash
npm run build:client
npm start
```

---

## 📡 API Endpoints

### Public
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/nominees` | List all nominees |
| `POST` | `/api/otp/request` | Request an OTP to your email |
| `POST` | `/api/otp/verify` | Verify OTP and receive JWT |
| `POST` | `/api/vote` | Cast a vote (Requires Voter JWT) |
| `GET` | `/api/vote/status` | Check if current email has already voted |
| `GET` | `/api/deadline` | Get the configured voting deadline |

### Admin (Requires Admin JWT)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Admin authentication |
| `GET` | `/api/admin/results` | Fetch real-time vote counts |
| `GET` | `/api/admin/voters` | Fetch paginated list of voters |
| `GET` | `/api/admin/export` | Download voting results as CSV |
| `POST` | `/api/admin/nominees` | Create a new nominee |
| `PUT` | `/api/admin/nominees/:id`| Update an existing nominee |
| `DELETE`| `/api/admin/nominees/:id`| Delete a nominee |
| `PUT` | `/api/admin/deadline` | Update the global voting deadline |

---

## 🗺️ Roadmap

- [ ] Google OAuth integration as an alternative to OTP.
- [ ] Real-time vote count updates using WebSockets (Socket.io).
- [ ] Multi-category voting support (e.g., Best UI, Best Logic).
- [ ] Nominee image upload capability via AWS S3 / Cloudinary.
- [ ] Automated email notification upon vote confirmation.
- [ ] Advanced Admin role management (Super Admin vs. Moderators).
- [ ] Deployment guides (Railway, Render, AWS EC2).

---

## 📚 Documentation

| Document | Purpose |
| :--- | :--- |
| [Architecture](docs/Architecture.md) | System design, data flow, and layers |
| [Contribution Guide](docs/Contribution.md) | Branching strategy and PR workflow |
| [Documentation Standards](docs/Documentation_pattern.md) | Guidelines for code comments and structuring |

---

## 📄 License

This project is licensed under the **ISC License**.
