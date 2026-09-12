# System Architecture & Request Flow

This document details the software architecture, folder responsibilities, and request processing flow for the **3-Hour Product Hackathon Starter**.

---

## 1. Preferred Request Flow

```
HTTP Request 
   ↓
Route (`src/routes/`)
   ↓
Middleware (`src/middleware/` - auth, guest, rateLimiter, validate)
   ↓
Controller (`src/controllers/` - handles req/res, view data assembly)
   ↓
Service (`src/services/` - business logic, credentials verification)
   ↓
Model (`src/models/` - Mongoose schema, validation, bcrypt hooks)
   ↓
MongoDB Atlas Cluster
   ↓
EJS Template Render (`src/views/` - SSR HTML with Editorial layout)
   ↓
HTTP Response
```

---

## 2. Directory Responsibilities

| Directory | Purpose |
|---|---|
| `src/config/` | Application boot configuration (`env.js`), Mongoose Atlas DB connection (`db.js`), and global constants (`appConfig.js`). |
| `src/controllers/` | Route handlers that receive Express requests, call services or query models, and render EJS views or JSON. |
| `src/models/` | Mongoose schema definitions (`User.js`), pre-save hooks, and model methods. |
| `src/routes/` | Express Router instances defining public, guest-protected, and auth-protected URL endpoints. |
| `src/middleware/` | Server-side security guards (`auth.js`, `guest.js`), rate limiting, input validation, and global error catchers. |
| `src/services/` | Decoupled business logic (registration, credential matching, session management). |
| `src/utils/` | Generic reusable utilities (async error wrapper, query builder, pagination helper, password validators, logger). |
| `src/public/` | Static CSS stylesheets (editorial tokens, components, forms, utilities) and vanilla JS scripts (search, filter, sort, debounce, validation, modal, toast). |
| `src/views/` | EJS server-side templates with master layout (`layouts/main.ejs`) and modular partials. |
| `src/docs/` | Step-by-step developer guides for database, architecture, API endpoints, and exam-day adaptation. |

---

## 3. Server-Side Security Architecture

- **Auth Enforcement**: Handled strictly on the server by `requireAuth` middleware. Protected routes redirect unauthenticated users to `/login` with flash alerts.
- **Guest Guards**: Handled by `guest` middleware. Logged-in users attempting to view `/login` or `/signup` are redirected to `/dashboard`.
- **Session Persistence**: Sessions are saved in MongoDB using `connect-mongo`, ensuring persistent user sessions across server restarts.
- **Password Security**: Plaintext passwords are NEVER stored. Hashing is performed automatically via `bcryptjs` with cost factor 10 inside the Mongoose pre-save hook.
