# MongoDB Atlas Configuration & Connection Guide

This document details the MongoDB Atlas architecture, connection flow, security setup, and connection troubleshooting.

---

## 1. Atlas Architecture Chain

```
Atlas Account → Project → Cluster → Database User → Network/IP Access
             → Connection String → MONGODB_URI → Mongoose → MongoDB
```

---

## 2. Pre-Configured Database User Credentials

For local development and hackathon testing, the following database user credentials are pre-configured:

- **Database Username:** `aaravpathak9984_db_user`
- **Database Password:** `aaravpathak9984_db_user`

> [!IMPORTANT]
> The **Atlas Account Login** (the account you use to log into mongodb.com) and the **Database User** (`aaravpathak9984_db_user`) are distinct concepts. Database users are created inside the Atlas project under **Security → Database Access** specifically for applications to connect to database clusters.

---

## 3. Step-by-Step MongoDB Atlas Setup Guide

1. **Open MongoDB Atlas**: Log into your [MongoDB Atlas Dashboard](https://cloud.mongodb.com) and select your target project.
2. **Cluster Selection**: Ensure a shared (M0/M2/M5) or dedicated cluster is active.
3. **Configure Database Access User**:
   - Navigate to **Security → Database Access**.
   - Click **Add New Database User**.
   - Set **Authentication Method** to *Password*.
   - Username: `aaravpathak9984_db_user`
   - Password: `aaravpathak9984_db_user`
   - Role: `Read and write to any database`.
4. **Configure Network Access (IP Allowlist)**:
   - Navigate to **Security → Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *Note on Tradeoff:* Render deployments utilize dynamic IP addresses. Allowing `0.0.0.0/0` is a deliberate hackathon-speed tradeoff so your live backend can connect seamlessly without managing static proxies.
5. **Obtain Node.js SRV Connection String**:
   - Go to **Database → Clusters → Connect**.
   - Choose **Drivers** under *Connect to your application*.
   - Driver: `Node.js`, Version: `5.5 or later`.
   - Copy the SRV string format:
     ```
     mongodb+srv://aaravpathak9984_db_user:aaravpathak9984_db_user@<cluster-host>.mongodb.net/hackathon_starter?retryWrites=true&w=majority
     ```
6. **Set Environment Variable**:
   - Paste the connection string into your local `.env` file as `MONGODB_URI=...`.
   - Never commit raw connection strings to source control.

---

## 4. Connection Error Handling in Code

The Mongoose connection module (`src/config/db.js`) enforces the following safety measures:
- Validates existence of `process.env.MONGODB_URI` on startup and fails fast if omitted.
- Sanitizes the URI in logs so passwords are never printed to stdout.
- Uses a 5000ms connection timeout to prevent hanging the process indefinitely.
