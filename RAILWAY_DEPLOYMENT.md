# Railway Deployment Tutorial - Step by Step

Complete guide to deploy DevPulse Analytics backend on Railway.

---

## Prerequisites

Before starting, make sure you have:
- ✅ GitHub repo pushed (`git push origin main`)
- ✅ Supabase database URL ready
- ✅ GitHub OAuth App created (Client ID & Secret)
- ✅ Railway account (sign up at [railway.app](https://railway.app))

---

## Step 1: Create Railway Account & Connect GitHub

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"** if you have an account
3. Choose **"Deploy from GitHub repo"** (recommended)
4. Authorize Railway to access your GitHub account
5. Select your `devpulse-analytics` repository
6. Railway will automatically create a new project

**What happens:** Railway creates a project and tries to auto-detect your app. It might fail initially - that's OK! We'll configure it manually.

---

## Step 2: Configure the Service

After Railway creates your project, you'll see a service (usually named after your repo).

### 2.1 Open Service Settings

1. Click on your service (the box/card in the Railway dashboard)
2. Click the **"Settings"** tab at the top
3. You'll see several sections: **General**, **Build**, **Deploy**, **Networking**, etc.

### 2.2 Set Root Directory

**This is critical!** Railway needs to know where your backend code is.

1. Scroll to **"Root Directory"** section (under General or Build)
2. Click the input field
3. Type exactly: `backend`
4. Press Enter or click outside to save

**Why:** Your repo has both `frontend/` and `backend/` folders. Railway needs to know to use `backend/`.

### 2.3 Configure Build Settings

Railway should auto-detect Node.js, but let's verify:

1. Go to **"Build"** section in Settings
2. **Build Command:** Should show `npm install && npm run build` (or leave empty - `railway.json` handles it)
3. **Start Command:** Should show `npm start` (or leave empty - `railway.json` handles it)

**Note:** Since you have `backend/railway.json`, Railway will use those commands automatically. You can leave these fields empty OR set them manually:

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 2.4 Set Node Version (Optional but Recommended)

1. In Settings → **"Build"** section
2. Look for **"NODE_VERSION"** or **"Node Version"**
3. Set to: `20` or `18` (LTS versions)
4. Or add as environment variable: `NODE_VERSION=20`

---

## Step 3: Add Environment Variables

**Critical step!** Your app won't work without these.

1. In your service, click **"Variables"** tab (or go to Settings → Variables)
2. Click **"New Variable"** or **"Raw Editor"** button
3. Add each variable one by one:

### Required Variables:

| Variable Name | Value | Where to Get |
|--------------|-------|--------------|
| `NODE_ENV` | `production` | Just type this |
| `PORT` | `5001` | Railway auto-sets this, but you can set it |
| `DATABASE_URL` | `postgresql://...` | From Supabase → Settings → Database → Connection String |
| `JWT_SECRET` | Random string | Generate: `openssl rand -hex 32` (run in terminal) |
| `JWT_EXPIRES_IN` | `7d` | Just type this |
| `GITHUB_CLIENT_ID` | `your_client_id` | From GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | `your_client_secret` | From GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | `https://YOUR-URL.up.railway.app/api/auth/github/callback` | Set AFTER getting Railway URL (Step 4) |
| `FRONTEND_URL` | `https://your-vercel-app.vercel.app` | Set AFTER deploying frontend |

**How to add variables:**
- Click **"New Variable"**
- Enter variable name (e.g., `DATABASE_URL`)
- Enter value
- Click **"Add"** or press Enter
- Repeat for each variable

**Tip:** Use **"Raw Editor"** to paste multiple variables at once in format:
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
```

---

## Step 4: Generate Public Domain

1. In your service, go to **"Settings"** → **"Networking"** tab
2. Scroll to **"Public Networking"** section
3. Click **"Generate Domain"** button
4. Railway will create a domain like: `devpulse-backend-production-xxxx.up.railway.app`
5. **Copy this URL** - you'll need it!

**Important:** 
- The domain is free
- It's HTTPS by default
- It might take 1-2 minutes to provision

---

## Step 5: Update GITHUB_CALLBACK_URL

Now that you have your Railway URL:

1. Go back to **"Variables"** tab
2. Find `GITHUB_CALLBACK_URL` variable
3. Click to edit it
4. Set value to: `https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/auth/github/callback`
   - Replace `YOUR-RAILWAY-DOMAIN` with your actual domain from Step 4
   - Example: `https://devpulse-backend-production-abc123.up.railway.app/api/auth/github/callback`

---

## Step 6: Trigger Deployment

Railway should auto-deploy when you:
- Push to GitHub (if connected)
- Change settings
- Add variables

**To manually trigger:**

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** or **"Deploy"**
3. Watch the build logs

**What to expect:**
- Build should take 2-5 minutes
- You'll see logs like: `npm install`, `npm run build`, `npm start`
- Look for: `✓ Compiled successfully` or `Server running on port...`

---

## Step 7: Verify Deployment

### Check Build Logs

1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Check **"Build Logs"**:
   - ✅ Should see: `npm install` completing
   - ✅ Should see: `npm run build` completing (TypeScript compilation)
   - ✅ Should see: `npm start` running
   - ❌ If errors, see Troubleshooting below

### Check Runtime Logs

1. In **"Deployments"** → latest deployment
2. Check **"Runtime Logs"**:
   - ✅ Should see: `🚀 Server running on http://localhost:5001`
   - ✅ Should see: No errors

### Test Health Endpoint

1. Copy your Railway domain (from Step 4)
2. Open in browser: `https://YOUR-DOMAIN.up.railway.app/api/health`
3. Should return: `{"status":"ok"}` or similar JSON

**If it works:** ✅ Your backend is deployed!

---

## Step 8: Update GitHub OAuth App

1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. Click your OAuth app
3. Update **Authorization callback URL**:
   - Add: `https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/auth/github/callback`
4. Save changes

---

## Common Issues & Solutions

### ❌ Build Failed: "Cannot find module"

**Problem:** Missing dependencies or wrong root directory

**Solution:**
1. Verify **Root Directory** is set to `backend` (not empty!)
2. Check `backend/package.json` exists
3. Check build logs - should see `npm install` running

### ❌ Build Failed: "TypeScript errors"

**Problem:** Type errors in code

**Solution:**
1. Run locally: `cd backend && npm run build`
2. Fix any TypeScript errors
3. Commit and push: `git push origin main`
4. Railway will auto-redeploy

### ❌ Runtime Error: "Cannot connect to database"

**Problem:** Wrong `DATABASE_URL` or database not accessible

**Solution:**
1. Check `DATABASE_URL` in Variables
2. Verify Supabase database is running
3. Test connection string locally
4. Make sure Supabase allows connections from Railway IPs (usually enabled by default)

### ❌ Runtime Error: "Port already in use" or "EADDRINUSE"

**Problem:** Port conflict

**Solution:**
1. Railway sets `PORT` automatically - don't override it
2. Your code should use: `process.env.PORT || 5001`
3. Remove any hardcoded port in your code

### ❌ Deployment stuck on "Building..."

**Problem:** Build taking too long or hanging

**Solution:**
1. Check build logs for errors
2. Try canceling and redeploying
3. Verify `railway.json` is correct
4. Check if `npm install` is completing

### ❌ 502 Bad Gateway or "Application Error"

**Problem:** App crashed after starting

**Solution:**
1. Check **Runtime Logs** (not build logs!)
2. Look for error messages
3. Common causes:
   - Missing environment variables
   - Database connection failed
   - Port mismatch
   - Code errors

### ❌ CORS Errors in Browser

**Problem:** Frontend can't connect to backend

**Solution:**
1. Set `FRONTEND_URL` variable in Railway (after deploying frontend)
2. Verify backend CORS allows your frontend URL
3. Check browser console for exact error

---

## Verification Checklist

Before moving to frontend deployment:

- [ ] Railway service is deployed and running
- [ ] Health endpoint works: `https://YOUR-DOMAIN/api/health`
- [ ] Build logs show successful compilation
- [ ] Runtime logs show "Server running"
- [ ] All environment variables are set
- [ ] GitHub OAuth callback URL is updated
- [ ] No errors in Railway logs

---

## Next Steps

Once backend is working:

1. **Deploy Frontend to Vercel** (see `DEPLOYMENT.md`)
2. **Update `FRONTEND_URL`** in Railway variables with your Vercel URL
3. **Update GitHub OAuth** Homepage URL
4. **Test the full app**

---

## Railway Dashboard Overview

**Main sections you'll use:**

- **Overview:** See service status, metrics
- **Deployments:** View build history and logs
- **Variables:** Manage environment variables
- **Settings:** Configure build, deploy, networking
- **Metrics:** CPU, memory, network usage
- **Logs:** Real-time application logs

**Pro Tips:**

- Use **"Watch Paths"** in Settings to only redeploy when `backend/` changes
- Check **"Metrics"** to monitor resource usage
- Use **"Logs"** tab for debugging runtime issues
- Railway auto-redeploys on git push (if GitHub connected)

---

## Need Help?

If deployment still fails:

1. **Check Railway Status:** [status.railway.app](https://status.railway.app)
2. **Railway Docs:** [docs.railway.com](https://docs.railway.com)
3. **Common Issues:** Check Railway Discord/Community

**Most common mistake:** Not setting **Root Directory** to `backend`!

---

## Quick Reference: Railway Settings Summary

```
Root Directory: backend
Build Command: npm install && npm run build (or leave empty)
Start Command: npm start (or leave empty)
Node Version: 20 (optional)

Environment Variables:
- NODE_ENV=production
- DATABASE_URL=your_supabase_url
- JWT_SECRET=your_secret
- JWT_EXPIRES_IN=7d
- GITHUB_CLIENT_ID=your_id
- GITHUB_CLIENT_SECRET=your_secret
- GITHUB_CALLBACK_URL=https://your-domain.up.railway.app/api/auth/github/callback
- FRONTEND_URL=https://your-vercel-app.vercel.app (set later)
```

Good luck! 🚀
