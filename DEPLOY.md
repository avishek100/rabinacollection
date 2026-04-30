# Rabina Closet — Deployment Guide

> Full-stack fashion storefront: **Vite React** (client) + **Express + MongoDB** (server)

---

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────┐
│   Vercel (Static)   │  API   │   Render (Web Service)   │
│   React SPA (Vite)  │───────▶│   Express + Mongoose     │
│   client/dist       │        │   server/src/server.js   │
└─────────────────────┘        └──────────┬───────────────┘
                                          │
                                          ▼
                               ┌──────────────────────┐
                               │   MongoDB Atlas       │
                               │   (cloud database)    │
                               └──────────────────────┘
```

---

## Prerequisites

- **Node.js** ≥ 18
- **MongoDB Atlas** cluster (or any MongoDB URI)
- **Cloudinary** account (for image uploads)
- Git repository pushed to GitHub/GitLab

---

## 1. Frontend — Vercel

1. Create a **new Vercel project** and import your repo.
2. Set **Root Directory** → `client`
3. Vercel auto-detects Vite. Confirm settings:
   | Setting          | Value            |
   |------------------|------------------|
   | Framework        | Vite             |
   | Build Command    | `npm run build`  |
   | Output Directory | `dist`           |
4. **Environment variables** (Settings → Environment Variables):
   | Variable             | Value                                       |
   |----------------------|---------------------------------------------|
   | `VITE_API_URL`       | `https://rabina-closet-server.onrender.com`  |
   | `VITE_WHATSAPP_BASE` | `https://wa.me/9743685571`                   |

> **Note:** `VITE_API_URL` must point to your deployed Render server URL (no trailing slash).

---

## 2. Backend — Render

1. Create a **new Web Service** on Render and connect your repo.
2. Configure:
   | Setting          | Value                             |
   |------------------|-----------------------------------|
   | Runtime          | Node                              |
   | Build Command    | `cd server && npm install`        |
   | Start Command    | `cd server && node src/server.js` |
   | Health Check     | `/api/health`                     |

   > Or import `render.yaml` directly from the repo root for automatic setup.

3. **Environment variables** (Environment tab):
   | Variable                | Value                          |
   |-------------------------|--------------------------------|
   | `NODE_ENV`              | `production`                   |
   | `MONGODB_URI`           | `mongodb+srv://...`            |
   | `CLIENT_ORIGIN`         | `https://your-app.vercel.app`  |
   | `ADMIN_USER`            | *(your admin username)*        |
   | `ADMIN_PASS`            | *(your admin password)*        |
   | `ADMIN_API_KEY`         | *(generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)* |
   | `CLOUDINARY_CLOUD_NAME` | *(your Cloudinary cloud name)* |
   | `CLOUDINARY_API_KEY`    | *(your Cloudinary API key)*    |
   | `CLOUDINARY_API_SECRET` | *(your Cloudinary API secret)* |

   > `PORT` is set automatically by Render — do not override it.

---

## 3. CORS Configuration

The server reads `CLIENT_ORIGIN` to allow cross-origin requests. Set it to your **exact Vercel domain** (e.g., `https://rabinacloset.vercel.app`).

For multiple origins, use a **comma-separated** list:
```
CLIENT_ORIGIN=https://rabinacloset.vercel.app,https://www.rabinacloset.com
```

---

## 4. Local Development

```bash
# Install all dependencies
npm run install:all

# Terminal 1 — start the API server
npm run dev:server

# Terminal 2 — start the Vite dev server
npm run dev:client
```

The Vite dev server proxies `/api` and `/static` requests to `http://localhost:3001` automatically — no `VITE_API_URL` needed locally.

---

## 5. Local Production Build Test

```bash
# From the project root
npm run build          # installs deps + builds client

# Start the server
npm start              # runs server/src/server.js
```

Then open `http://localhost:3001/api/health` to verify the API is running.

---

## Quick Reference — File Map

| File                    | Purpose                                        |
|-------------------------|-------------------------------------------------|
| `package.json`          | Root scripts: `build`, `start`, `install:all`  |
| `render.yaml`           | Render Blueprint — auto-configures both services|
| `client/vercel.json`    | Vercel config — SPA rewrites + security headers|
| `server/.env.example`   | Template for server environment variables      |
| `client/.env.example`   | Template for client environment variables      |
| `.gitignore`            | Excludes `.env`, `node_modules`, `dist`        |

---

## Troubleshooting

| Issue                        | Fix                                                                                 |
|------------------------------|-------------------------------------------------------------------------------------|
| CORS errors after deploy     | Verify `CLIENT_ORIGIN` matches exact Vercel URL (including `https://`)             |
| Images not uploading         | Check all 3 Cloudinary env vars are set on Render                                  |
| 404 on page refresh (Vercel) | Ensure `vercel.json` `rewrites` rule is present                                    |
| Server won't start on Render | Confirm `MONGODB_URI` is set; check Render logs                                   |
| `npm run build` fails at root| Run from the **project root** (not `client/` or `server/`)                         |
