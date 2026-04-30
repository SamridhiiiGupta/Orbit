# Orbit — Run Instructions

## 🏃 Local Development (10-minute setup)

### Step 1 — Clone & navigate
```bash
cd orbit
```

### Step 2 — Backend setup
```bash
cd backend
npm install
npx prisma db push       # Creates dev.db (SQLite, no installation needed)
npm run dev              # Starts on http://localhost:5000
```

### Step 3 — Frontend setup (new terminal)
```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:5173
```

Open **http://localhost:5173** — register an account and start using Orbit.

---

## 🚀 Railway Deployment

### Backend

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select the `backend` folder (or set Root Directory to `backend`)
4. Add a **PostgreSQL** plugin in Railway dashboard
5. Set environment variables:
   ```
   DATABASE_URL   = (auto-filled by Railway Postgres plugin)
   JWT_SECRET     = some-long-random-string-here
   CLIENT_URL     = https://your-frontend.railway.app
   PORT           = 5000
   ```
6. **IMPORTANT:** In `prisma/schema.prisma`, change:
   ```
   provider = "sqlite"  →  provider = "postgresql"
   ```
7. Railway auto-runs: `npx prisma generate && npx prisma db push && node src/index.js`

### Frontend

1. New Railway service → select `frontend` folder
2. Set environment variable:
   ```
   VITE_API_URL = https://your-backend.railway.app
   ```
3. Build command: `npm run build`
4. Start command: `npx serve dist -l 3000`  (or use Railway's static hosting)

---

## 📡 API Reference

| Method | Endpoint                            | Auth | Role   |
|--------|-------------------------------------|------|--------|
| POST   | /api/auth/register                  | No   | —      |
| POST   | /api/auth/login                     | No   | —      |
| GET    | /api/auth/me                        | Yes  | Any    |
| GET    | /api/projects                       | Yes  | Any    |
| POST   | /api/projects                       | Yes  | Any    |
| GET    | /api/projects/:id                   | Yes  | Member |
| PATCH  | /api/projects/:id                   | Yes  | Admin  |
| DELETE | /api/projects/:id                   | Yes  | Admin  |
| GET    | /api/members/:projectId             | Yes  | Member |
| POST   | /api/members/:projectId             | Yes  | Admin  |
| PATCH  | /api/members/:projectId/:userId     | Yes  | Admin  |
| DELETE | /api/members/:projectId/:userId     | Yes  | Admin  |
| GET    | /api/tasks/dashboard                | Yes  | Any    |
| GET    | /api/tasks/project/:projectId       | Yes  | Member |
| POST   | /api/tasks/project/:projectId       | Yes  | Member |
| GET    | /api/tasks/:taskId                  | Yes  | Any    |
| PATCH  | /api/tasks/:taskId                  | Yes  | Member*|
| DELETE | /api/tasks/:taskId                  | Yes  | Admin  |

*Members can only update status of tasks assigned to them.
