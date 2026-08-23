# Heart Kids Wear (心童裝) — Daily Health Check Guide

> **Purpose**: A comprehensive daily operations checklist to verify all external services, infrastructure, and integrations are healthy and functioning correctly.
>
> **Estimated Time**: 10–15 minutes per check

---

## 🗺️ Architecture & External Services Map

```
┌──────────────────────────────────────────────────────────────┐
│                    Heart Kids Wear Stack                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐   API calls    ┌──────────────────────┐    │
│  │   Vercel     │ ─────────────▶│   Render (Backend)   │    │
│  │  (Frontend)  │               │   FastAPI + Uvicorn  │    │
│  │  React+Vite  │               └──────────┬───────────┘    │
│  └─────────────┘                           │                │
│                                    ┌───────┴───────┐        │
│                                    │               │        │
│                              ┌─────▼─────┐  ┌─────▼──────┐ │
│                              │  Supabase  │  │ Cloudflare │ │
│                              │ PostgreSQL │  │  R2 / CDN  │ │
│                              └───────────┘  └────────────┘ │
│                                                              │
│  ┌─────────────┐                                             │
│  │   GitHub     │  CI/CD triggers for Vercel & Render        │
│  │ Repository   │                                            │
│  └─────────────┘                                             │
│                                                              │
│  ┌─────────────┐                                             │
│  │  Resend      │  Transactional Email (future)              │
│  │  (Email)     │                                            │
│  └─────────────┘                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ 1. GitHub Repository

| Item | Check |
|---|---|
| **Dashboard** | [github.com/johnyu1234/heart-kids-wear](https://github.com/johnyu1234/heart-kids-wear) |
| **Branch** | `main` |

### What to verify:
- [ ] Latest commit on `main` matches your last intentional push
- [ ] No unreviewed PRs or stale branches
- [ ] No security vulnerability alerts (Dependabot) under **Security** tab
- [ ] Actions tab: no failed CI/CD workflows

### Quick CLI check (local):
```powershell
cd C:\Users\johny\Desktop\Projects\heart-kids-wear
git fetch origin
git log --oneline -5
git status
```

---

## ✅ 2. Vercel — Frontend Hosting

| Item | Value |
|---|---|
| **Dashboard** | [vercel.com/dashboard](https://vercel.com/dashboard) → Heart Kids Wear project |
| **Framework** | Vite (React SPA) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output** | `dist` |

### What to verify:
- [ ] **Deployment status**: Latest deployment shows ✅ "Ready"
- [ ] **Build logs**: No warnings or errors in the latest build
- [ ] **Environment variable**: `VITE_API_URL` points to correct Render backend URL
- [ ] **Domain**: Production URL loads without errors (check both `/` and `/login`)
- [ ] **HTTPS**: Certificate valid and not expiring soon

### Quick browser check:
1. Open your Vercel production URL
2. Confirm the homepage loads with products and images
3. Open DevTools → **Console** tab → no red errors
4. Open DevTools → **Network** tab → API calls to backend return `200`

---

## ✅ 3. Render — Backend API Hosting

| Item | Value |
|---|---|
| **Dashboard** | [dashboard.render.com](https://dashboard.render.com/) → `heart-kids-wear-backend` |
| **Runtime** | Python 3.11.9 |
| **Region** | Singapore |
| **Plan** | Free |
| **Health Check** | `GET /health` |

### What to verify:
- [ ] **Service status**: Shows "Live" (green dot)
- [ ] **Latest deploy**: Matches your latest GitHub push
- [ ] **Health endpoint**: Returns `{"status": "ok"}` (see command below)
- [ ] **Logs**: No recurring errors (check last 50 lines in Render dashboard → Logs)
- [ ] **Environment variables** are set (spot check — don't display values):
  - `SECRET_KEY` ✓
  - `DATABASE_URL` (should be `postgresql://...supabase...`) ✓
  - `R2_ACCOUNT_ID` ✓
  - `R2_ACCESS_KEY_ID` ✓
  - `R2_SECRET_ACCESS_KEY` ✓
  - `R2_BUCKET_NAME` = `heart-kids-wear-media` ✓
  - `R2_PUBLIC_DOMAIN` ✓

### Quick CLI check:
```powershell
# Health check
curl https://heart-kids-wear-backend.onrender.com/health

# API docs reachable
curl -s -o /dev/null -w "%{http_code}" https://heart-kids-wear-backend.onrender.com/docs

# Products endpoint
curl https://heart-kids-wear-backend.onrender.com/api/products | python -m json.tool | head -20
```

> [!WARNING]
> **Render Free Plan Cold Starts**: The free tier spins down after 15 minutes of inactivity. First request may take 30–60 seconds. If the health check times out, wait and retry.

---

## ✅ 4. Supabase — PostgreSQL Database

| Item | Value |
|---|---|
| **Dashboard** | [supabase.com/dashboard](https://supabase.com/dashboard) → Project |
| **Project Ref** | `hghehxrlcylseaefrgxn` |
| **Region** | `ap-southeast-2` (Sydney) |
| **Connection** | Pooler: `aws-0-ap-southeast-2.pooler.supabase.com:5432` |
| **Database** | `postgres` |

### What to verify:
- [ ] **Project status**: Shows "Active" (green) on Supabase dashboard
- [ ] **Database health**: Table Editor → verify tables exist (products, users, orders, etc.)
- [ ] **Connection pooler**: Pooler mode is "Transaction" (recommended for serverless)
- [ ] **Storage usage**: Check under **Settings → Database** — verify disk usage is within free-tier limits (500 MB)
- [ ] **No paused project**: Free-tier projects auto-pause after 7 days of inactivity → check and unpause if needed!

### Quick CLI check:
```powershell
# Test database connection from local (requires psql installed)
psql "postgresql://postgres.hghehxrlcylseaefrgxn:HeartKidsWear2026Secure@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres" -c "SELECT count(*) FROM products;"

# Or via Python
python -c "
from sqlalchemy import create_engine, text
e = create_engine('postgresql://postgres.hghehxrlcylseaefrgxn:HeartKidsWear2026Secure@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres')
with e.connect() as c:
    r = c.execute(text('SELECT count(*) as cnt FROM products'))
    print('Products count:', r.scalar())
    r2 = c.execute(text('SELECT count(*) as cnt FROM users'))
    print('Users count:', r2.scalar())
print('DB connection OK')
"
```

> [!CAUTION]
> **Supabase Free Tier Auto-Pause**: If no database queries are made for **7 consecutive days**, Supabase will pause your project. This will cause the backend to return `500` errors. Log into the dashboard and click "Restore" to unpause.

---

## ✅ 5. Cloudflare R2 — Object Storage & CDN

| Item | Value |
|---|---|
| **Dashboard** | [dash.cloudflare.com](https://dash.cloudflare.com/) → R2 Object Storage |
| **Account ID** | `8cb75e9b71a26aa2ff541b4622855e89` |
| **Bucket** | `heart-kids-wear-media` |
| **Public Domain** | `https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev` |

### What to verify:
- [ ] **Bucket exists**: Visible in Cloudflare dashboard → R2
- [ ] **Public access**: R2 bucket has public access enabled (r2.dev subdomain)
- [ ] **Objects accessible**: Test a known image URL loads in the browser
- [ ] **API token valid**: Token hasn't expired or been revoked
- [ ] **Storage usage**: Check object count and storage size under R2 → Bucket → Metrics
- [ ] **Bandwidth**: Check monthly egress (free tier: 10 GB/month)

### Quick CLI check:
```powershell
# Test a known product image is accessible
curl -s -o /dev/null -w "HTTP %{http_code} | Size: %{size_download} bytes\n" "https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev/products/frozen_hoodie_main.jpg"

# List objects in bucket (requires AWS CLI configured with R2 credentials)
aws s3 ls s3://heart-kids-wear-media/ --endpoint-url https://8cb75e9b71a26aa2ff541b4622855e89.r2.cloudflarestorage.com --summarize
```

### Quick Python check:
```python
import boto3
from botocore.config import Config

client = boto3.client(
    "s3",
    endpoint_url="https://8cb75e9b71a26aa2ff541b4622855e89.r2.cloudflarestorage.com",
    aws_access_key_id="<R2_ACCESS_KEY_ID>",
    aws_secret_access_key="<R2_SECRET_ACCESS_KEY>",
    config=Config(signature_version="s3v4"),
    region_name="auto"
)
response = client.list_objects_v2(Bucket="heart-kids-wear-media", MaxKeys=10)
print(f"Objects: {response.get('KeyCount', 0)}")
for obj in response.get("Contents", []):
    print(f"  {obj['Key']} ({obj['Size']} bytes)")
```

---

## ✅ 6. Resend — Transactional Email (Future)

| Item | Value |
|---|---|
| **Dashboard** | [resend.com/emails](https://resend.com/emails) |
| **From Address** | `service@heartkidswear.com` |
| **Status** | Configured but not yet active |

### What to verify (when activated):
- [ ] **API key** is valid and not expired
- [ ] **Domain verification**: `heartkidswear.com` DNS records (SPF, DKIM, DMARC) are verified
- [ ] **Sending quota**: Check monthly sends vs. free-tier limit (3,000/month on free plan)
- [ ] **Bounce/complaint rate**: Should be < 2% — check in Resend dashboard
- [ ] **Test email**: Send a test via dashboard or API

---

## ✅ 7. Domain & SSL (if custom domain is configured)

### What to verify:
- [ ] **DNS records** point correctly (A/CNAME for frontend, backend subdomain)
- [ ] **SSL certificates** are valid and auto-renewing
- [ ] **CORS settings**: Backend allows the production frontend origin

---

## 📋 Daily Checklist Summary

Copy and use this checklist each day:

```markdown
## Daily Health Check — [DATE]

### GitHub
- [ ] Latest commit matches last push
- [ ] No security alerts

### Vercel (Frontend)
- [ ] Deployment status: Ready ✅
- [ ] Homepage loads with images
- [ ] No console errors

### Render (Backend)
- [ ] Service status: Live ✅
- [ ] GET /health returns {"status": "ok"}
- [ ] No error spikes in logs

### Supabase (Database)
- [ ] Project status: Active ✅
- [ ] Products count matches expected
- [ ] Not paused (7-day inactivity rule)

### Cloudflare R2 (Images)
- [ ] Known image URL returns HTTP 200
- [ ] Bucket accessible in dashboard
- [ ] Bandwidth within free-tier limits

### Notes:
_[Any issues found and actions taken]_
```

---

## 🚨 Common Issues & Quick Fixes

### Issue: Backend returns 500 errors
1. **Check Supabase**: Project may be paused → unpause in dashboard
2. **Check Render logs**: Look for `OperationalError` or connection refused
3. **Check env vars**: `DATABASE_URL` might be wrong on Render

### Issue: Images not loading (broken thumbnails)
1. **Check R2 public access**: Ensure r2.dev subdomain is enabled
2. **Check R2 token**: Token may have expired → regenerate in Cloudflare dashboard
3. **Check URL format**: Should start with `https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev/`

### Issue: Frontend shows blank page or API errors
1. **Check Vercel env**: `VITE_API_URL` must point to current Render URL
2. **Check CORS**: Backend `allow_origins` must include the Vercel domain
3. **Check Render cold start**: Free plan needs 30–60s to wake up

### Issue: Render free tier stopped / exceeded limits
1. Free tier: 750 hours/month of running time
2. If exceeded, service will be suspended until next billing cycle
3. Consider upgrading to Starter ($7/month) for always-on

### Issue: Supabase project paused
1. Log into [Supabase Dashboard](https://supabase.com/dashboard)
2. Click your project → "Restore project"
3. Wait 2–3 minutes for database to come back online
4. Trigger a request to the backend to verify connection restored

---

## 📊 Free Tier Limits Reference

| Service | Limit | Current Usage | Action if Exceeded |
|---|---|---|---|
| **Vercel** (Hobby) | 100 GB bandwidth/month, 6,000 build minutes | — | Upgrade to Pro ($20/mo) |
| **Render** (Free) | 750 hrs/month, 15-min sleep | — | Upgrade to Starter ($7/mo) |
| **Supabase** (Free) | 500 MB DB, 5 GB bandwidth, 7-day pause | — | Unpause or upgrade to Pro ($25/mo) |
| **Cloudflare R2** (Free) | 10 GB storage, 10 GB egress/month | — | Monitor in R2 dashboard |
| **Resend** (Free) | 3,000 emails/month, 100/day | — | Upgrade if sending order confirmations |
| **GitHub** (Free) | Unlimited public repos | — | N/A |

---

## 🔐 Credentials Quick Reference

> [!CAUTION]
> Never commit credentials to Git. All sensitive values are stored in environment variables on each platform and in local `.env` files (Git-ignored).

| Credential | Where to Find | Where It's Used |
|---|---|---|
| `SECRET_KEY` | Auto-generated on Render | JWT token signing |
| `DATABASE_URL` | Supabase → Settings → Database → Connection String (URI) | Backend → PostgreSQL |
| `R2_ACCOUNT_ID` | Cloudflare Dashboard → R2 → Overview | Backend → Image upload/delete |
| `R2_ACCESS_KEY_ID` | Cloudflare → R2 → Manage R2 API Tokens | Backend → Image upload/delete |
| `R2_SECRET_ACCESS_KEY` | Cloudflare → R2 → Manage R2 API Tokens (shown once!) | Backend → Image upload/delete |
| `R2_PUBLIC_DOMAIN` | Cloudflare → R2 → Bucket → Settings → Public Access | Frontend image URLs |
| `RESEND_API_KEY` | Resend Dashboard → API Keys | Backend → Transactional email |
| `VITE_API_URL` | Vercel → Project → Settings → Environment Variables | Frontend → API base URL |

---

*Last updated: 2026-08-23*
