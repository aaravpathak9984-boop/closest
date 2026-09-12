# 3-Hour Product Hackathon Starter Kit

> **Core Philosophy:** Build the boring parts now. Solve the actual problem during the exam.

A clean, modular, production-ready foundation designed for 3-hour product hackathons. Pre-configures server-side rendered EJS layouts, Mongoose MongoDB Atlas connectivity, bcrypt password authentication, role-ready session management, rate limiting, and reusable data utilities (search, filter, allowlisted sort, pagination, debounce) with an editorial paper + glassmorphism UI design system.

---

## 1. Mandatory Technology Stack

- **Frontend:** EJS (Server-Side Rendering), HTML5, Vanilla CSS (Design Tokens), Vanilla JavaScript.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas via Mongoose with `connect-mongo` session persistence.
- **Authentication:** bcrypt password hashing + session abstraction (`requireAuth` & `guest` middleware).
- **Security:** Helmet HTTP headers, express-rate-limit brute force protection.
- **Deployment Host:** Render (using standard `npm start`). **Repo Host:** GitHub.

---

## 2. Directory Structure

```
hackathon-starter/
├── src/
│   ├── app.js                   # Express application & middleware assembly
│   ├── server.js                # Server listener & database boot script
│   ├── config/
│   │   ├── db.js                # Mongoose connection with sanitized error logs
│   │   ├── env.js               # Fail-fast environment variable validator
│   │   └── appConfig.js         # App constants, pagination & rate limits
│   ├── controllers/
│   │   ├── authController.js    # Login, signup, logout & validation error retention
│   │   ├── dashboardController.js# Domain-neutral dashboard & data filtering demo
│   │   ├── healthController.js   # GET /health endpoint for deployment liveness
│   │   └── errorController.js   # Error rendering helpers
│   ├── models/
│   │   ├── User.js              # User Mongoose model with bcrypt pre-save hook
│   │   └── README.md            # Guide on adding domain models during exam
│   ├── routes/
│   │   ├── index.js             # Central app router
│   │   ├── authRoutes.js        # /login, /signup, /forgot-password, /logout
│   │   ├── dashboardRoutes.js   # /dashboard, /profile, /settings (requireAuth)
│   │   └── apiRoutes.js         # /api/v1/data (JSON query utility demo)
│   ├── middleware/
│   │   ├── auth.js              # Server-side requireAuth guard
│   │   ├── guest.js             # Guest guard (redirects logged-in users to /dashboard)
│   │   ├── errorHandler.js      # Global 500 error handler (suppresses stack in prod)
│   │   ├── notFound.js          # 404 page handler
│   │   ├── validate.js          # Form validation helper
│   │   └── rateLimiter.js       # Express rate limiters for auth & API
│   ├── services/
│   │   ├── authService.js       # User registration, login & password comparison
│   │   └── tokenService.js      # Session initialization & token helper
│   ├── utils/
│   │   ├── asyncHandler.js      # Async error wrapper for controllers
│   │   ├── validators.js        # Email regex, password strength & string sanitizer
│   │   ├── pagination.js        # Pagination offset, limit & metadata calculator
│   │   ├── queryBuilder.js      # Generic search, filter & allowlisted sort builder
│   │   ├── flash.js             # Session flash notification helper
│   │   └── logger.js            # Console logger with timestamps
│   ├── public/
│   │   ├── css/
│   │   │   ├── main.css         # Design tokens (#F4F0E7, #111111, #8F2D2D, #E8E0D2)
│   │   │   ├── components.css   # Buttons, glass cards, badges, tables, modals, toasts
│   │   │   ├── forms.css        # Form inputs, error states, password strength meter
│   │   │   └── utilities.css    # Sketch annotations, red markers, layout helpers
│   │   └── js/
│   │       ├── main.js          # Flash dismiss & client initializers
│   │       ├── search.js        # Search input URL query sync
│   │       ├── filters.js       # Category/status filter dropdown listeners
│   │       ├── debounce.js      # Reusable debounce utility
│   │       ├── sort.js          # Sort dropdown handler
│   │       ├── modal.js         # Accessible modal dialog controller
│   │       ├── toast.js         # Client-side toast notifications
│   │       └── validation.js    # Client validation, password meter & generator
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.ejs         # Master EJS HTML layout
│   │   ├── partials/
│   │   │   ├── head.ejs, navbar.ejs, sidebar.ejs, footer.ejs
│   │   │   ├── flash.ejs, loading.ejs, empty-state.ejs
│   │   ├── auth/                # login.ejs, signup.ejs, forgot-password.ejs
│   │   ├── dashboard/           # index.ejs (domain-neutral dashboard)
│   │   ├── errors/              # 404.ejs, 500.ejs, error.ejs
│   │   └── pages/               # home.ejs, about.ejs
│   └── docs/                    # ARCHITECTURE.md, DATABASE.md, API.md, HACKATHON_WORKFLOW.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Environment Setup & Local Installation

### Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Start local development server (with nodemon auto-reload)
npm run dev

# 4. Start production server
npm start
```

Default local URL: `http://localhost:3000`

---

## 4. MongoDB Atlas Connection Setup

The database is powered by MongoDB Atlas. Pre-configured database user credentials:

- **Database Username:** `aaravpathak9984_db_user`
- **Database Password:** `aaravpathak9984_db_user`

### Atlas Configuration Steps

1. Open [MongoDB Atlas](https://cloud.mongodb.com) and select your project.
2. Go to **Security → Database Access** → Create database user `aaravpathak9984_db_user` with password `aaravpathak9984_db_user`. Note: The Atlas account login and database user are different concepts.
3. Go to **Security → Network Access** → Add IP access `0.0.0.0/0` (Allows connections from any IPv4 address for dynamic Render deployment IPs).
4. Go to **Database → Connect → Drivers → Node.js** and copy the SRV connection string:
   ```
   mongodb+srv://aaravpathak9984_db_user:aaravpathak9984_db_user@<cluster-name>.mongodb.net/hackathon_starter?retryWrites=true&w=majority
   ```
5. Paste the string into `.env` under `MONGODB_URI=...`.

---

## 5. Security & Authentication Flow

- **Public Routes:** `GET /`, `/about`, `/login`, `/signup`, `/forgot-password`, `/health`.
- **Private Routes (`requireAuth`):** `GET /dashboard`, `/profile`, `/settings`. Enforced server-side. Unauthenticated URL access redirects to `/login`.
- **Guest Routes (`guest`):** `GET /login`, `/signup`. Redirects already-logged-in users to `/dashboard`.
- **Password Protection:** Plaintext passwords are never stored. Bcrypt hashes passwords automatically inside `src/models/User.js` pre-save hook.
- **Form Error Retention:** Signup and login re-render EJS forms with per-field error messages, retain safe previous input (`name`, `email`), visually highlight invalid fields, and clear password inputs.
- **Client Password Features:** Real-time strength meter (Weak/Fair/Good/Strong) + "Generate strong password" button in `public/js/validation.js`.

---

## 6. Reusable Data Utilities (Search / Filter / Sort / Pagination / Debounce)

- **Search:** `buildQuery(req.query, { searchFields: ['title', 'description'] })` handles `?search=value`.
- **Filter:** `buildQuery(req.query, { filterFields: ['category', 'status'] })` handles query parameters.
- **Sort:** `buildQuery()` validates `?sort=newest|oldest|title` against an explicit allowlist to prevent query injection.
- **Pagination:** `getPaginationParams(req.query)` and `getPaginationResult(totalItems, page, limit)` generate `?page=` and `?limit=` metadata.
- **Debounce:** `public/js/debounce.js` delays search input triggers by 400ms.

---

## 7. Render Deployment Guide

Deploying to Render takes 2 minutes:

1. Push repo to GitHub (ensure `.env` is gitignored).
2. On Render Dashboard, create a new **Web Service** and connect the GitHub repo.
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Environment Variables:** Add `NODE_ENV=production`, `MONGODB_URI=...`, `SESSION_SECRET=...`, `JWT_SECRET=...`, `APP_NAME=Hackathon Starter`.
6. Render automatically assigns `PORT`. Express listens on `process.env.PORT`.
7. Verify liveness via `GET /health`.

---

## 8. Exam-Day Adaptation Workflow

When the problem statement is revealed (e.g. Healthcare, Agriculture, Transportation, Railways):

1. Read problem statement & identify domain entities and roles.
2. Create domain Mongoose models in `src/models/`.
3. Create controllers in `src/controllers/` and routes in `src/routes/`.
4. Create EJS views in `src/views/` using the editorial layout and components.
5. Wire up `queryBuilder.js` and `pagination.js` for table views.
6. Test locally (`npm run dev`) and deploy to Render.
# closest
