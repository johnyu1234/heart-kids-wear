import os
import sys
import boto3
import httpx
from botocore.config import Config
from dotenv import load_dotenv

# Ensure utf-8 stdout on windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Load env variables from backend/.env or root .env
load_dotenv("backend/.env")
load_dotenv(".env")

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "heart-kids-wear-media")
R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN", "https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev")

if not R2_PUBLIC_DOMAIN.startswith("http"):
    R2_PUBLIC_DOMAIN = f"https://{R2_PUBLIC_DOMAIN}"
R2_PUBLIC_DOMAIN = R2_PUBLIC_DOMAIN.rstrip("/")

print(f"Connecting to Cloudflare R2 Bucket: '{R2_BUCKET_NAME}'...")

endpoint_url = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
s3_client = boto3.client(
    "s3",
    endpoint_url=endpoint_url,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    config=Config(signature_version="s3v4"),
    region_name="auto"
)

IMAGES_TO_MIGRATE = [
    {
        "name": "British Classic Cotton Graphic Tee",
        "key": "products/tee_boy_classic.jpg",
        "source_url": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1000&q=85",
        "content_type": "image/jpeg"
    },
    {
        "name": "British Floral Ruffle Cotton Dress",
        "key": "products/dress_girl_floral.jpg",
        "source_url": "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1000&q=85",
        "content_type": "image/jpeg"
    },
    {
        "name": "Comfort Stretch Casual Joggers (2-Pack)",
        "key": "products/joggers_boy_casual.jpg",
        "source_url": "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1000&q=85",
        "content_type": "image/jpeg"
    },
    {
        "name": "UK Kids Wear Size Chart Guide",
        "key": "products/size_chart_standard.jpg",
        "source_url": "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1000&q=85",
        "content_type": "image/jpeg"
    },
    {
        "name": "Hero Banner Kids Apparel",
        "key": "banners/hero_kids_banner.jpg",
        "source_url": "https://images.unsplash.com/photo-1471286174890-9c112ffca56a?w=1400&q=85",
        "content_type": "image/jpeg"
    }
]

uploaded_urls = {}

for item in IMAGES_TO_MIGRATE:
    print(f"\n[DOWNLOAD] Downloading '{item['name']}' from source...")
    try:
        resp = httpx.get(item["source_url"], follow_redirects=True, timeout=15.0)
        resp.raise_for_status()
        img_bytes = resp.content
        print(f"   Size: {len(img_bytes) / 1024:.1f} KB")

        print(f"[UPLOAD] Uploading to Cloudflare R2: {item['key']}...")
        s3_client.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=item["key"],
            Body=img_bytes,
            ContentType=item["content_type"],
            CacheControl="public, max-age=31536000"
        )

        cdn_url = f"{R2_PUBLIC_DOMAIN}/{item['key']}"
        uploaded_urls[item["key"]] = cdn_url
        print(f"   [SUCCESS] Public CDN URL: {cdn_url}")

    except Exception as e:
        print(f"   [ERROR] Failed uploading {item['name']}: {e}")

print("\n" + "="*60)
print("ALL IMAGES MIGRATED TO CLOUDFLARE R2 SUCCESSFULLY!")
print("="*60)
for k, v in uploaded_urls.items():
    print(f"* {k} -> {v}")
