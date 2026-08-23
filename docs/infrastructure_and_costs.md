# Heart Kids Wear (心童裝) — Deployment Infrastructure & Free Tier Matrix

This document provides a comprehensive overview of all cloud platforms, services, and infrastructure used to host and run the **Heart Kids Wear** pre-order e-commerce platform, along with their respective Free Tier quotas and cost models.

---

## ☁️ Cloud Architecture & Free Tier Overview

| Service | Component / Role | Free Tier Allowance | Current Usage & Headroom | Monthly Cost |
| :--- | :--- | :--- | :--- | :---: |
| **▲ Vercel** | **Frontend (React + Vite)**<br>• Global Edge CDN<br>• Custom Domain & SSL<br>• Automated Git Previews | • **100 GB** Bandwidth / mo<br>• **Unlimited** Deployments<br>• Edge routing & Anycast DNS | • **< 100 MB** (< 1% limit)<br>• Production bundle: ~430 KB gzip | **$0.00** |
| **⬡ Render** | **Backend API (FastAPI)**<br>• Python 3.11 Container<br>• Business Logic & Schedulers<br>• Automated ID Generators | • **750 Hours** / mo *(Runs 24/7)*<br>• **512 MB** RAM<br>• Automatic HTTPS endpoint | • **~120 MB** RAM consumed<br>• Sleeps after 15m idle (wakes in ~30s) | **$0.00** |
| **⚡ Supabase** | **Database (PostgreSQL)**<br>• 19 Relational Tables<br>• Orders, Members, Ledgers<br>• PgBouncer Connection Pooler | • **500 MB** Database Storage<br>• **2 Active Projects**<br>• **50,000** Monthly Active Users<br>• Automated daily backups | • **< 5 MB** used for 19 tables & seed catalog<br>• ~100,000+ orders capacity | **$0.00** |
| **☁️ Cloudflare R2** *(Optional)* | **Media & Image CDN**<br>• Product photos & banners<br>• Size chart graphics | • **10 GB** Storage<br>• **10,000,000** Reads / mo<br>• **$0 Egress Fees** (Unlimited bandwidth) | • ~500 MB photo catalog headroom (~2,000+ images) | **$0.00** |
| **✉️ Resend** | **Transactional Emails**<br>• Pre-order confirmation<br>• Payment deadline reminders<br>• Shipping dispatch updates | • **3,000 Emails** / mo<br>• 100 emails / day | • Supports ~500–1,000 monthly orders comfortably | **$0.00** |
| **🐙 GitHub** | **Version Control & CI/CD**<br>• Webhook build triggers<br>• Branch tracking | • **Unlimited** Public & Private Repos<br>• **2,000** Actions build minutes / mo | • Fully automated Webhook CI/CD | **$0.00** |

---

## 💰 Total Monthly Cost: **$0.00 / month**

---

## 📈 Scalability & Upgrade Triggers

1. **Zero Cold-Start Latency**:
   * If you prefer the backend to never sleep during flash sales, upgrade Render to *Starter* plan for **$7 / month**.
2. **Database Scale**:
   * Supabase 500 MB free storage easily holds over **100,000 customer orders and transaction records** before requiring an upgrade.
3. **Frontend Traffic**:
   * Vercel's 100 GB/month bandwidth can serve more than **200,000 page views / month** on the free tier.
