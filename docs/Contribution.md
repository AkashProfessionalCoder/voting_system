# Contribution Guide

> Branching strategy, developer workflow, and PR conventions for the Flutter Chennai Voting System.

---

## Branch Structure

```
main ─────────────────────────────────── production-ready code
  │
  └── dev ────────────────────────────── integration branch (all features merge here)
        │
        ├── feature/add-google-oauth ─── feature branches (from dev)
        ├── fix/otp-expiry-bug ───────── bug fix branches (from dev)
        └── docs/add-architecture ────── documentation branches (from dev)
```

### Branch Roles

| Branch      | Purpose                         | Deploys To | Protected |
| ----------- | ------------------------------- | ---------- | --------- |
| `main`      | Stable, release-ready code      | Production | Yes       |
| `dev`       | Active development, integration | Staging    | Yes       |
| `feature/*` | New features                    | —          | No        |
| `fix/*`     | Bug fixes                       | —          | No        |
| `docs/*`    | Documentation changes           | —          | No        |

---

## Workflow

### 1. Start a New Task

```bash
# Always branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### 2. Develop

- Make small, focused commits
- Follow commit message conventions (below)
- Test locally before pushing

### 3. Push & Create PR

```bash
git push origin feature/your-feature-name
```

- Create a **Pull Request** targeting `dev` (not `main`)
- Fill in the PR template
- Request review

### 4. Review & Merge

- At least 1 approval required
- All conversations resolved
- Merge via **Squash and Merge** (keeps dev history clean)

### 5. Release to Main

- When `dev` is stable, create a PR from `dev` → `main`
- Tag the release: `git tag v1.0.0`

---

## Commit Message Convention

Format:

```
<type>: <short description>
```

| Type       | Usage                        |
| ---------- | ---------------------------- |
| `feat`     | New feature                  |
| `fix`      | Bug fix                      |
| `docs`     | Documentation only           |
| `style`    | Formatting (no logic change) |
| `refactor` | Code restructuring           |
| `test`     | Adding or updating tests     |
| `chore`    | Build, config, dependencies  |

Examples:

```
feat: add Google OAuth login option
fix: handle expired OTP edge case on verify
docs: add architecture documentation
chore: update express to v5.2.1
```

---

## PR Guidelines

### Title

Use the same format as commit messages:

```
feat: add CSV export for admin dashboard
```

### Description Template

```markdown
## What

Brief description of the change.

## Why

Context and motivation.

## How

Implementation approach (if non-obvious).

## Testing

- [ ] Tested locally
- [ ] Voting flow works end-to-end
- [ ] Admin dashboard functional
- [ ] No console errors
```

---

## Local Development Setup

```bash
# 1. Clone and install
git clone https://github.com/AkashProfessionalCoder/voting_system.git
cd voting_system
npm install
cd client && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, Gmail App Password, JWT secret

# 3. Seed the database
npm run seed

# 4. Run (two terminals)
npm run dev:server    # Express API on :5050
npm run dev:client    # React on :3000 (proxies /api → :5050)
```

---

## Code Review Checklist

- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all endpoints
- [ ] Error handling with proper HTTP status codes
- [ ] No `console.log` left in frontend (use proper error states)
- [ ] Mobile responsive if UI changes
- [ ] Follows existing code patterns and naming conventions

---

## Questions?

Open an issue on the [GitHub repository](https://github.com/AkashProfessionalCoder/voting_system/issues).
