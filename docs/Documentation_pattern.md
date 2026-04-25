# Documentation & Code Standards

> Rules for code-level documentation, commenting, and file organization.

---

## General Principles

1. **Code should be self-documenting** — use clear variable/function names over comments
2. **Comment the "why", not the "what"** — explain intent, not mechanics
3. **Keep comments up to date** — stale comments are worse than no comments
4. **Don't comment out code** — delete it; git has the history

---

## File Headers

Every controller, service, and middleware file should have a brief JSDoc-style comment on each exported function describing:
- What endpoint it handles (for controllers)
- What it does (one line)

```javascript
/**
 * POST /api/otp/request
 * Request an OTP for a Gmail address
 */
const requestOtp = async (req, res) => {
  // ...
};
```

---

## Inline Comments

### When to Comment

- **Business logic** that isn't obvious from the code
- **Security-critical decisions** (e.g., why a unique index matters)
- **Workarounds** with a brief explanation
- **Regex patterns** — always explain what they match

```javascript
// Gmail-only: alphanumeric + dots before @gmail.com
const GMAIL_REGEX = /^[a-zA-Z0-9.]+@gmail\.com$/;

// CRITICAL: unique index on email prevents duplicate votes at DB level
// Application-level check is a courtesy; the index is the real guard
```

### When NOT to Comment

```javascript
// BAD — obvious from the code
const count = items.length; // get the length of items

// BAD — restating the function name
// This function handles login
const login = async (req, res) => { ... };
```

---

## Naming Conventions

### Files

| Type         | Convention           | Example               |
|-------------|----------------------|----------------------|
| Models       | PascalCase, singular | `Vote.js`, `Admin.js` |
| Controllers  | camelCase + suffix   | `otpController.js`    |
| Routes       | camelCase + suffix   | `publicRoutes.js`     |
| Services     | camelCase + suffix   | `emailService.js`     |
| Middlewares  | camelCase            | `authMiddleware.js`   |
| Components   | PascalCase           | `NomineeCard.jsx`     |
| Pages        | PascalCase           | `VotingPage.jsx`      |

### Variables & Functions

| Type         | Convention           | Example               |
|-------------|----------------------|----------------------|
| Variables    | camelCase            | `normalizedEmail`     |
| Constants    | UPPER_SNAKE          | `GMAIL_REGEX`, `STEPS`|
| Functions    | camelCase, verb-first| `handleLogin`, `castVote` |
| Booleans     | is/has/can prefix    | `isLoggedIn`, `hasVoted` |
| React state  | `[noun, setNoun]`    | `[email, setEmail]`   |

### API Routes

| Convention     | Example                      |
|----------------|------------------------------|
| Plural nouns   | `/api/nominees`, `/api/voters`|
| Nested resources | `/api/admin/nominees/:id`  |
| Actions as verbs | `/api/otp/request`, `/api/otp/verify` |

---

## Error Handling Pattern

### Backend

All controllers follow this pattern:

```javascript
const someAction = async (req, res) => {
  try {
    // 1. Validate input
    if (!input) {
      return res.status(400).json({ error: "Input is required." });
    }

    // 2. Business logic
    const result = await doSomething();

    // 3. Success response
    return res.status(200).json({ message: "Done.", data: result });
  } catch (error) {
    console.error("Action error:", error);
    return res.status(500).json({ error: "Action failed." });
  }
};
```

Rules:
- Always return `{ error: "..." }` for errors (consistent shape)
- Always return `{ message: "..." }` for success
- Use specific HTTP status codes (400, 401, 403, 404, 409, 429, 500)
- Log errors with `console.error` and a descriptive prefix

### Frontend

```javascript
try {
  const res = await apiCall();
  // handle success
} catch (err) {
  const msg = err.response?.data?.error || "Something went wrong.";
  setError(msg);
}
```

- Always extract the server error message
- Always provide a fallback message
- Display errors in UI, never silently swallow them

---

## React Component Pattern

```jsx
// 1. Imports
import { useState } from "react";

// 2. Component (named export for pages, default export for components)
export default function ComponentName({ prop1, prop2 }) {
  // 3. State
  const [value, setValue] = useState("");

  // 4. Handlers
  const handleAction = () => { ... };

  // 5. Render
  return (
    <div>...</div>
  );
}
```

- Props: destructured in function signature
- No prop-types (keep it simple for this project scale)
- Tailwind classes: inline, use template literals for conditional classes

---

## Git Commit Comments

Don't add comments explaining what changed — that's the commit message's job. Code comments explain **why** something exists, not **when** it was added.

```javascript
// BAD
// Added on 2026-04-24 to fix login bug
const isMatch = await bcrypt.compare(password, admin.password);

// GOOD (no comment needed — the code is clear)
const isMatch = await bcrypt.compare(password, admin.password);
```
