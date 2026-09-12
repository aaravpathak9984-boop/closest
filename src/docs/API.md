# API & Route Reference Documentation

Complete inventory of application endpoints, HTTP methods, authorization middleware rules, and response formats.

---

## 1. Public Web Routes

| Path | Method | Middleware | Controller | Description |
|---|---|---|---|---|
| `/` | `GET` | None | Page Render | Public landing home page. |
| `/about` | `GET` | None | Page Render | System architecture & about page. |
| `/health` | `GET` | None | `healthController.getHealth` | Liveness check returning `{ "status": "ok" }`. |

---

## 2. Authentication & Guest Routes

| Path | Method | Middleware | Controller | Description |
|---|---|---|---|---|
| `/login` | `GET` | `guest` | `authController.showLogin` | Renders login page (redirects to `/dashboard` if logged in). |
| `/login` | `POST` | `guest`, `authRateLimiter` | `authController.login` | Processes email/password login. |
| `/signup` | `GET` | `guest` | `authController.showSignup` | Renders registration form. |
| `/signup` | `POST` | `guest`, `authRateLimiter` | `authController.signup` | Processes new user registration. |
| `/forgot-password` | `GET` | `guest` | `authController.showForgotPassword` | Password recovery page (extension point). |
| `/logout` | `GET`/`POST` | None | `authController.logout` | Destroys session, clears cookie, redirects to `/login`. |

---

## 3. Protected Dashboard Routes

| Path | Method | Middleware | Controller | Description |
|---|---|---|---|---|
| `/dashboard` | `GET` | `requireAuth` | `dashboardController.index` | Renders overview metrics & filterable data table. |
| `/profile` | `GET` | `requireAuth` | `dashboardController.profile` | User profile page. |
| `/settings` | `GET` | `requireAuth` | `dashboardController.settings` | System settings page. |

---

## 4. API Endpoints (`/api/v1`)

### `GET /api/v1/data`
Demonstrates generic query parameters (`search`, `category`, `status`, `sort`, `page`, `limit`).

**Request Query Parameters:**
- `search` (string): Text search term matched against searchFields.
- `category` (string): Filter by category value.
- `status` (string): Filter by status value.
- `sort` (string): Allowlisted sort key (`newest`, `oldest`, `name_asc`).
- `page` (number): Page number (default: 1).
- `limit` (number): Items per page (default: 10, max: 100).

**Sample Response:**
```json
{
  "success": true,
  "meta": {
    "search": "",
    "sort": "newest",
    "currentPage": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "data": [
    { "id": 1, "name": "Sample Domain Item 1", "status": "active" }
  ]
}
```
