# 🚀 HashEquity Project Recap & Dependencies (as of Sept 28, 2025)

This document serves as a **memory bank** for how the system currently works, what has been built, and what must not be broken when adding or changing code.  
It ensures that dependencies between the **frontend, backend, and database** remain intact.

---

## ✅ Major Accomplishments

### 1. Deployment Setup
- Frontend (`hash-frontend`) and backend (`hash-backend`) deployed on **Railway**.
- MongoDB deployed via **Railway Managed MongoDB (Docker image)**.
- **Custom domains:**
  - `https://hashequity.com` → Frontend
  - `https://api.hashequity.com` → Backend (critical for API calls)

### 2. User Authentication
- Signup + Login flow works with:
  - `bcryptjs` → Password hashing
  - `jsonwebtoken` (JWT) → Authentication
- JWT stored in **localStorage** on frontend.
- Upon login/signup:
  - UI switches from **Auth Box** → **User Panel**
  - Shows balances + countdown

### 3. Game Logic
- Circles spawn every **1 second**.
- Clicking a circle:
  - Removes it from canvas
  - Increases **score**
  - Generates **Unminted HASH**
  - Sends API call to `/api/game/destroy` (requires JWT token)

### 4. Balance Tracking
- Two balances tracked:
  - **Unminted HASH** → Gained in-game
  - **HASH** → Minted once per day (00:00 UTC)
- API call: `/api/game/balances`

### 5. Mint Countdown
- Countdown timer always shows **time until next mint (00:00 UTC)**.

### 6. Frontend ↔ Backend Integration
- **All API requests point to:**
Regarding the API

- **CORS Configured** in backend (`server.js`) to accept:
- `https://hashequity.com`
- `https://www.hashequity.com`
- `https://api.hashequity.com`

---

## ⚙️ Critical Environment Variables

### 🔹 Backend (`hash-backend`)
- `MONGO_URI` → Railway MongoDB connection string
- `JWT_SECRET` → Used for signing tokens
- `NODE_ENV=production`
- `PORT=8080`

### 🔹 Frontend (`hash-frontend`)
- `API_BASE` hardcoded in `index.html`:
```js
const API_BASE = "https://api.hashequity.com/api";


