# HashEquity Monorepo

This repository hosts the HashEquity gameplay frontend and the Express API that powers wallet authentication, balances, and game telemetry. The code follows the product specification defined in `AGENTS.md` and is structured as two npm workspaces living side by side:

- [`frontend/`](frontend) – Vite + React client that renders the ten-object loop, wallet connect, and telemetry panels.
- [`backend/`](backend) – Node.js + Express service backed by MongoDB that persists balances and stats.

## Local Development

### Backend

1. Copy `backend/.env.example` to `backend/.env` and fill in the values (at minimum `MONGO_URI` and `JWT_SECRET`).
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the API locally:
   ```bash
   npm run dev
   ```
   The server listens on [http://localhost:8080](http://localhost:8080) and exposes the `/api/game` and `/api/auth` routes expected by the frontend.

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env` and update the addresses for your environment.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Run the Vite dev server:
   ```bash
   npm run dev
   ```
   Vite serves the app on [http://localhost:5173](http://localhost:5173). When `VITE_BACKEND_URL` is omitted the client proxies API calls to the same origin, which is useful when running behind a local reverse proxy.

## Railway Deployment

Railway should host the backend and frontend as separate services:

### Backend service
- **Install command:** `npm install`
- **Start command:** `npm start`
- **Environment variables:**
  - `MONGO_URI` – MongoDB connection string (you can map `DATABASE_URL` to the same value for backwards compatibility).
  - `JWT_SECRET` – secret used to sign wallet login tokens.
  - `PORT` – provided by Railway; the server falls back to `8080` locally.
  - Optional: `CORS_ALLOWED_ORIGINS` (comma-delimited) to restrict HTTP origins in production.

### Frontend service
- **Install command:** `npm install`
- **Build command:** `npm run build`
- **Start command:** `npm start` (runs `vite preview --host 0.0.0.0 --port $PORT` so Railway can serve the static bundle).
- **Environment variables:** mirror the keys in `frontend/.env.example`, especially `VITE_BACKEND_URL` pointing to the backend service URL.

## Health & Monitoring

- `GET /api/health` exposes a lightweight health check for uptime monitoring.
- MongoDB connection errors cause the process to exit with a non-zero status so Railway restarts the container with corrected configuration.

Refer to `docs/merge-conflicts.md` for collaboration practices and `AGENTS.md` for product requirements.
