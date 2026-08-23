# Heart Kids Wear (心童裝) — Production Deployment Guide

This guide walks you through deploying **Heart Kids Wear** to production using **Vercel** (Frontend) and **Render / Railway / Supabase** (Backend & Database).

---

## 🏗️ Architecture Overview

* **Frontend (React + Vite + Vanilla CSS)**: Deployed to **Vercel** with Global Edge CDN and SPA rewrites.
* **Backend (FastAPI REST API)**: Deployed to **Render** or **Railway** as a Python Web Service.
* **Database (PostgreSQL / SQLite)**: Hosted on **Supabase** / **Neon** (or persistent disk volume on Render).

---

## 🚀 Part 1: Deploying the Frontend to Vercel

### Step 1: Push Code to GitHub
Ensure all code and newly generated `vercel.json` files are committed and pushed to your GitHub repository.

### Step 2: Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Connect your GitHub account and select the `heart-kids-wear` repository.
3. Configure the Project Settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend` (or leave as `./` since root `vercel.json` is configured)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Add **Environment Variables**:
   * `VITE_API_URL`: `https://your-backend-service.onrender.com/api` (URL of your backend API)
5. Click **Deploy**.

---

## 🐍 Part 2: Deploying the Backend API (Render / Railway)

### Option A: Deploy on Render (Recommended)
1. Sign in to [Render.com](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your `heart-kids-wear` GitHub repo.
4. Configure settings:
   * **Runtime**: `Python` (or `Docker`)
   * **Build Command**: `pip install -r backend/requirements.txt`
   * **Start Command**: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Add **Environment Variables**:
   * `SECRET_KEY`: `<Generate a secure 64-char random string>`
   * `DATABASE_URL`: `sqlite:///./backend/data/heart_kids_wear.db` (or PostgreSQL URL from Supabase)
   * `PAYMENT_GATEWAY_ENABLED`: `false`
6. Click **Create Web Service**.

---

## 🗄️ Part 3: Production Database (Supabase / Neon PostgreSQL)

When you are ready to switch from local SQLite to cloud PostgreSQL:
1. Create a free project at [Supabase.com](https://supabase.com/).
2. Copy your PostgreSQL connection string from **Database Settings** -> **Connection string (URI)**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
3. Set this as `DATABASE_URL` in your backend environment variables (on Render/Railway).
4. When the backend starts up, FastAPI's `lifespan` automatically runs `init_db()` to create all 19 relational tables and initial seed data fixtures!

---

## ✅ Deployment Checklist

- [x] `frontend/vercel.json` SPA rewrite rules configured.
- [x] Root `vercel.json` configured.
- [x] `backend/Dockerfile` and `backend/Procfile` created for container & PaaS deployment.
- [x] `backend/requirements.txt` updated with PostgreSQL driver (`psycopg2-binary`).
- [x] `backend/app/database.py` updated to auto-detect SQLite vs PostgreSQL schemas.
- [x] `frontend/.env.example` and `backend/.env.example` templates created.
- [x] Production build tested (`npm run build` passed with zero errors).
