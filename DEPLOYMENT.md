# Deployment Guide

Full deployment uses three free services:
- **MongoDB Atlas** — database (already done ✓)
- **Render** — Node/Express backend
- **Vercel** — React frontend

---

## Step 1 — Push to GitHub

Create a new GitHub repo (e.g. `weekly-planner-ai`), then:

```bash
cd weekly-planner-ai
git init
git add .
git commit -m "feat: initial release — AI weekly planner"
git remote add origin https://github.com/<your-username>/weekly-planner-ai.git
git push -u origin master
```

---

## Step 2 — Deploy backend to Render

1. Go to **render.com** → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Add these environment variables under "Environment":
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | *(your Atlas connection string)* |
   | `JWT_SECRET` | *(any long random string)* |
   | `ALLOWED_ORIGINS` | *(fill in after Step 3)* |
5. Click **Deploy**. Wait for "Live" status.
6. Copy the Render URL — looks like `https://weekly-planner-ai-backend.onrender.com`

---

## Step 3 — Deploy frontend to Vercel

1. Go to **vercel.com** → New Project → Import your GitHub repo
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add this environment variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://<your-render-url>/api` |
4. Click **Deploy**. Wait for the URL — looks like `https://weekly-planner-ai.vercel.app`

---

## Step 4 — Connect frontend → backend (CORS)

1. Go back to **Render** → your backend service → Environment
2. Set `ALLOWED_ORIGINS` to your Vercel URL:
   ```
   https://weekly-planner-ai.vercel.app
   ```
3. Click **Save Changes** — Render restarts automatically.

---

## Step 5 — Verify

Visit your Vercel URL, register an account, add an event. Check that it saves and appears on the grid. Done.

---

## MongoDB Atlas network access (important)

If your Atlas cluster's Network Access is set to a specific IP, change it to `0.0.0.0/0` so Render's dynamic IPs can connect.

In Atlas: **Network Access → Add IP Address → Allow Access from Anywhere**
