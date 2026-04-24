---
name: full-stack-dev
description: Describe what this skill does and when to use it. Include keywords that help agents identify relevant tasks.
---
 
## 📌 Overview

This repository uses a reusable Copilot/Claude skill to generate a complete **OTP-based voting system** with:

- Node.js + Express (backend)
- React + Tailwind CSS (frontend)
- MongoDB (database)

The skill is designed for:
- Fast development (2-day build scenarios)
- Clean architecture (open-source friendly)
- Reliable voting logic (no duplicate votes)

---

## ⚙️ Skill Name

**Full-Stack-Dev (Node + React + Mongo)**

---

## 🎯 Purpose

This skill helps generate a complete voting system with:

- Nominee listing UI
- Gmail-based OTP voting
- One-vote-per-user enforcement
- Admin dashboard with analytics
- Clean, modern UI

---

## 🚨 Important Behavior

The skill is designed to work in **phases**, not all at once.

> ❗ Do NOT ask it to generate the full project in one prompt.

---

## 🧭 Recommended Usage Flow

### Step 1: Start System Design

```txt
Use the Full-Stack Voting System Generator and start Step 1: System Design
````

---

### Step 2: Generate Backend

```txt
Continue with Step 2: Backend implementation
```

---

### Step 3: Generate Frontend

```txt
Continue with Step 3: Frontend implementation
```

---

### Step 4: Integration

```txt
Continue with Step 4: Integration
```

---

### Step 5: Final Hardening

```txt
Review and harden the system for:
- duplicate voting issues
- OTP validation edge cases
- deadline enforcement
```

---

## 🔒 Critical Engineering Rules

The skill enforces these rules:

* ✅ One vote per email (MongoDB UNIQUE INDEX)
* ✅ OTP expiry (5 minutes)
* ✅ Rate limiting (max 3 OTP/hour/email)
* ✅ Voting deadline enforcement
* ✅ Backend validation for all inputs

---

## 🗂️ Expected Project Structure

```
project-root/
  server/
    controllers/
    routes/
    models/
    services/
    middlewares/
    app.js

  client/
    src/
      components/
      pages/
```

---

## 🎨 UI Guidelines

* Card-based nominee layout
* Clean spacing and typography
* Tailwind CSS styling
* Responsive design (mobile + desktop)
* OTP input with 6-digit UI
* Clear loading, error, and success states

---

## ⚠️ Common Mistakes to Avoid

* ❌ Asking for full project in one prompt
* ❌ Skipping system design
* ❌ Ignoring DB-level constraints
* ❌ Overengineering architecture

---

## 🧠 Pro Tips

* After backend generation:

  ```txt
  Audit this backend for race conditions and duplicate vote issues
  ```

* After frontend generation:

  ```txt
  Improve UI aesthetics using Tailwind without changing logic
  ```

---

## ✅ Success Criteria

* Users can vote with OTP successfully
* Duplicate votes are impossible
* Admin can view votes and leaderboard
* UI is clean and usable
* App runs locally without issues

---

## 🚀 Notes

This skill prioritizes:

> Reliability > UI polish
> Simplicity > complexity
> Correctness > speed

---

## 🤝 Contribution

If you improve the skill or workflow:

* Update this file
* Keep instructions simple and reusable

---

**Built for Namma Flutter | Flutter Chennai Community ❤️**

```

---

## 💡 What to do next

- Save this as `SKILLS.md` in your root
- Commit it with your repo
- Share it with your team so everyone uses the skill properly

---

If you want, I can also generate:
- `README.md` (public-facing project doc)
- `.env.example`
- or a **final pre-launch checklist** (very useful before your event)

That’s usually what separates a “working project” from a “smooth event.”
```
