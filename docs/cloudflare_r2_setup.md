# ☁️ Cloudflare R2 Media & Product Image Storage Setup Guide

This guide walks you through setting up **Cloudflare R2 Object Storage** (10 GB free permanent storage with **$0 egress/bandwidth fees**) for hosting all product images, banners, and size charts for **Heart Kids Wear**.

---

## 🛠️ Step 1: Create a Cloudflare Account & R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation menu, click **R2** (or **Storage & Databases** ➔ **R2**).
3. Click **"Create bucket"**:
   * **Bucket Name**: `heart-kids-wear-media`
   * **Location**: *Automatic* (or *APAC - Asia Pacific* for lowest latency).
   * Click **Create Bucket**.

---

## 🌐 Step 2: Enable Public Access (Get your CDN URL)

1. Inside your `heart-kids-wear-media` bucket:
2. Go to the **Settings** tab.
3. Scroll down to **"Public access"**:
   * Option A: Click **"Allow Access"** on **R2.dev subdomain** (e.g. `https://pub-xxxxxxxxxxxxxx.r2.dev`).
   * Option B: Connect your custom domain (e.g. `cdn.heartkidswear.com`).
4. Copy your public domain URL (e.g., `https://pub-xxxxxxxxxxxxxx.r2.dev`).

---

## 🔑 Step 3: Generate R2 API Access Keys (S3 Credentials)

1. In the left menu of Cloudflare R2, click **"Manage R2 API Tokens"** (top right of R2 Overview).
2. Click **"Create API token"**:
   * **Token Name**: `heart-kids-wear-r2-token`
   * **Permissions**: Select **Object Read & Write**.
   * **Apply to**: Select specific bucket `heart-kids-wear-media` (or All buckets).
   * Click **Create API Token**.
3. Cloudflare will display:
   * **Access Key ID** (e.g., `a1b2c3d4e5f6...`)
   * **Secret Access Key** (e.g., `7890abcdef...`)
   * **Account ID** (found on the R2 overview page or in the endpoint URL: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`)

---

## 🚀 Step 4: Add Environment Variables in Render

In your **Render Dashboard** ➔ **`heart-kids-wear-backend`** ➔ **Environment**, add the following 5 variables:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| **`R2_ACCOUNT_ID`** | `9a8b7c6d5e4f3a2b1c0d` | Your Cloudflare Account ID |
| **`R2_ACCESS_KEY_ID`** | `9876543210abcdef...` | R2 API Token Access Key ID |
| **`R2_SECRET_ACCESS_KEY`** | `fedcba0987654321...` | R2 API Token Secret Access Key |
| **`R2_BUCKET_NAME`** | `heart-kids-wear-media` | Name of your R2 bucket |
| **`R2_PUBLIC_DOMAIN`** | `https://pub-xxx.r2.dev` | Public CDN URL for images |

Click **Save Changes** in Render.

---

## ✨ Features Supported

* 📤 **1-Click Local Uploads**: Admin can pick image files directly from the browser in the Admin Products panel.
* ⚡ **Global Cloudflare Edge Caching**: All uploaded images receive `Cache-Control: public, max-age=31536000` for lightning-fast loads.
* 🔄 **Smart Fallback**: If R2 credentials are not set, uploads automatically fall back to local disk storage seamlessly.
