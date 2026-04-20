Prerequisites
- Git repo connected to Vercel and Render (or push to GitHub/GitLab).
- Ensure `.env` values are set on Render and Vercel project settings (see below).

Frontend — Vercel
1. Create a new Vercel project and point it at the `client` folder of this repo (set "Root Directory" to `/client`).
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables (if needed):
   - `VITE_API_URL` -> https://<your-render-server-url>

Notes: A `client/vercel.json` is included to instruct Vercel to use `@vercel/static-build` and to rewrite routes to `index.html`.

Backend — Render
1. Create a new Web Service on Render and connect your repo.
2. Set the service root to the repository root and use the following settings (or import from `render.yaml`):
   - Service type: `Web Service`
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: `Node`
3. Set environment variables in Render (Environment tab):
   - `PORT` (Render will set automatically; keep default)
   - `MONGODB_URI` -> your MongoDB connection string
   - `CLIENT_ORIGIN` -> https://<your-vercel-domain>
   - `ADMIN_USER`, `ADMIN_PASS`, `ADMIN_API_KEY`

Static Frontend on Render (alternative)
- You can also host the frontend as a static site on Render using the second service in `render.yaml` (static site type). It runs `cd client && npm run build` and publishes `client/dist`.

CORS and env notes
- The server uses `CLIENT_ORIGIN` to allow requests from the frontend. Set `CLIENT_ORIGIN` to your Vercel site URL (e.g. `https://your-app.vercel.app`). You can provide multiple origins as a comma-separated list.
- The server reads `PORT` and `MONGODB_URI` from env; Render provides `PORT` automatically.

Local testing before deploy
- Start server locally:

```powershell
cd server
npm install
npm run dev
```

- Start client locally:

```powershell
cd client
npm install
npm run dev
```

Troubleshooting
- If uploads rely on `multer`, ensure `multer` is installed in `server/package.json` (already added).
- If you see CORS errors after deployment, confirm `CLIENT_ORIGIN` matches the exact origin served by Vercel/Render.

Files added
- `client/vercel.json` — Vercel static-build config for the client.
- `render.yaml` — Render manifest for server and client (optional import).
- `DEPLOY.md` — This deployment guide.

If you want, I can:
- Add a GitHub Action to build client and push static files to a CDN.
- Add a `Procfile` or extra Render health checks.
- Configure immediate upload-on-select behavior or serverless upload handlers for Vercel Functions.
