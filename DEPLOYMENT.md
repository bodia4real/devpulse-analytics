# DevPulse Analytics – Deployment Guide (Free Tier)

Deploy backend on **Railway** (or Render) and frontend on **Vercel**.

---

## 1. Deploy Backend (Railway)

### 1.1 Create Railway account
- Go to [railway.app](https://railway.app) and sign up (GitHub recommended)
- New users get a **$5 free trial**; after that, **$1/month free credit**

### 1.2 New Project
- **New Project** → **Deploy from GitHub repo**
- Select your `devpulse-analytics` repo
- Railway will create a service. Configure it:

### 1.3 Service Settings
- Click the service → **Settings**
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build` (or leave empty; `backend/railway.json` defines it)
- **Start Command:** `npm start` (or leave empty; `railway.json` defines it)
- **Watch Paths:** `backend/**` (optional; only redeploy when backend changes)

### 1.4 Environment Variables
In Railway → your service → **Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Supabase connection string |
| `JWT_SECRET` | Random string (e.g. `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `GITHUB_CLIENT_ID` | From GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | `https://YOUR-RAILWAY-URL.up.railway.app/api/auth/github/callback` |
| `FRONTEND_URL` | `https://YOUR-VERCEL-URL.vercel.app` (set after frontend deploy) |

### 1.5 Generate Domain
- **Settings** → **Networking** → **Generate Domain**
- Your backend URL: `https://devpulse-backend-production-xxxx.up.railway.app` (or similar)

### 1.6 Update GitHub OAuth
- GitHub → Settings → Developer settings → OAuth Apps → your app
- Add **Authorization callback URL:** `https://YOUR-RAILWAY-URL.up.railway.app/api/auth/github/callback`

**Note:** Railway does not spin down like Render; your backend stays warm. No cold starts.

---

## 1b. Deploy Backend (Render – Alternative)

### 1b.1 Create Render account
- Go to [render.com](https://render.com) and sign up (free)

### 1b.2 New Web Service
- **Dashboard** → **New** → **Web Service**
- Connect your GitHub repo
- **Root Directory:** `backend`
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Instance Type:** Free

### 1b.3 Environment Variables
In Render dashboard → your service → **Environment**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Supabase connection string |
| `JWT_SECRET` | Random string (e.g. `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `GITHUB_CLIENT_ID` | From GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | `https://YOUR-RENDER-URL.onrender.com/api/auth/github/callback` |
| `FRONTEND_URL` | `https://YOUR-VERCEL-URL.vercel.app` (set after frontend deploy) |

### 1b.4 Deploy
- Click **Create Web Service**
- Wait for build. Your backend URL: `https://devpulse-backend.onrender.com` (or similar)
- **Note:** Free tier spins down after 15 min inactivity. First request after sleep can take 30–60s.

### 1b.5 Update GitHub OAuth
- Add **Authorization callback URL:** `https://YOUR-RENDER-URL.onrender.com/api/auth/github/callback`

---

## 2. Deploy Frontend (Vercel)

### 2.1 Create Vercel account
- Go to [vercel.com](https://vercel.com) and sign up (free)

### 2.2 Import Project
- **Add New** → **Project**
- Import your GitHub repo
- **Root Directory:** `frontend`
- **Framework Preset:** Next.js (auto-detected)

### 2.3 Environment Variables
In Vercel → Project → **Settings** → **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RAILWAY-URL.up.railway.app` (or your Render URL if using Render) |

### 2.4 Deploy
- Click **Deploy**
- Your frontend URL: `https://your-project.vercel.app`

---

## 3. Final Setup

### 3.1 Update Backend FRONTEND_URL
- Railway (or Render) → your backend service → **Variables** / **Environment**
- Set `FRONTEND_URL` = `https://your-project.vercel.app`
- Redeploy if needed

### 3.2 Update GitHub OAuth (again)
- Add **Homepage URL:** `https://your-project.vercel.app`
- Callback URL should already be the Railway (or Render) backend URL

---

## 4. Verify

1. Open `https://your-project.vercel.app`
2. Click **Login with GitHub**
3. Authorize → should redirect back to your app
4. Check dashboard, repos, contributions, profile

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| **Railway** | $5 trial, then $1/month free credit; no spin-down |
| **Render** | 750 hrs/month, spins down after 15 min idle |
| **Vercel** | 100 GB bandwidth, unlimited static, serverless |
| **Supabase** | 500 MB DB, 2 GB bandwidth |

---

## Troubleshooting

- **CORS errors:** Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly (no trailing slash)
- **OAuth redirect fails:** Check `GITHUB_CALLBACK_URL` and GitHub OAuth app settings
- **Backend slow first load (Render):** Free tier cold start; wait 30–60s. Railway stays warm.
