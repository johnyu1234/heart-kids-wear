import os
import uuid
import mimetypes
from pathlib import Path
from typing import Optional
import boto3
from botocore.config import Config
from fastapi import UploadFile, HTTPException
from backend.app.config import settings

def get_r2_client():
    """Create S3 client configured for Cloudflare R2."""
    if not settings.R2_ACCOUNT_ID or not settings.R2_ACCESS_KEY_ID or not settings.R2_SECRET_ACCESS_KEY:
        return None

    endpoint_url = f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto"
    )

def extract_r2_key(url_or_key: str) -> Optional[str]:
    """Extract object key from a full CDN URL or relative path."""
    if not url_or_key:
        return None
    url_or_key = url_or_key.strip()
    if "/products/" in url_or_key:
        return "products/" + url_or_key.split("/products/")[-1].split("?")[0]
    elif "/banners/" in url_or_key:
        return "banners/" + url_or_key.split("/banners/")[-1].split("?")[0]
    elif url_or_key.startswith("products/") or url_or_key.startswith("banners/"):
        return url_or_key.split("?")[0]
    return None

async def upload_image_to_r2(file: UploadFile, folder: str = "products") -> str:
    """
    Upload an image to Cloudflare R2 bucket.
    Falls back to local file storage if R2 credentials are not yet configured.
    """
    # 1. Validate MIME type
    content_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "image/jpeg"
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, WebP, GIF) are supported.")

    # 2. Generate unique filename
    extension = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if not extension:
        extension = ".jpg"
    unique_filename = f"{uuid.uuid4().hex[:12]}{extension}"
    object_key = f"{folder}/{unique_filename}"

    # Read file content
    contents = await file.read()

    r2_client = get_r2_client()

    if r2_client and settings.R2_BUCKET_NAME:
        try:
            # Upload to Cloudflare R2
            r2_client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=object_key,
                Body=contents,
                ContentType=content_type,
                CacheControl="public, max-age=31536000"  # 1 year CDN cache
            )

            # Build Public URL
            if settings.R2_PUBLIC_DOMAIN:
                public_base = settings.R2_PUBLIC_DOMAIN.strip().rstrip("/")
                if not public_base.startswith("http://") and not public_base.startswith("https://"):
                    public_base = f"https://pub-{public_base}" if not public_base.startswith("pub-") else f"https://{public_base}"
                return f"{public_base}/{object_key}"
            else:
                return f"https://{settings.R2_BUCKET_NAME}.r2.dev/{object_key}"

        except Exception as e:
            print(f"[R2 Storage Error] Failed to upload to Cloudflare R2: {e}. Falling back to local storage.")

    # 3. Fallback to Local Storage (when running locally or before R2 keys are entered)
    local_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "uploads", folder))
    os.makedirs(local_dir, exist_ok=True)
    local_path = os.path.join(local_dir, unique_filename)
    
    with open(local_path, "wb") as f:
        f.write(contents)

    return f"/static/uploads/{folder}/{unique_filename}"

def delete_image_from_r2(url_or_key: str) -> bool:
    """
    Delete an image object from Cloudflare R2 (and local disk if present).
    """
    key = extract_r2_key(url_or_key)
    if not key:
        return False

    r2_client = get_r2_client()
    if r2_client and settings.R2_BUCKET_NAME:
        try:
            r2_client.delete_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=key
            )
            print(f"[R2 Storage] Deleted object from Cloudflare R2: {key}")
            return True
        except Exception as e:
            print(f"[R2 Storage Error] Failed to delete object from Cloudflare R2: {e}")

    # Also clean up local file if it exists
    local_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "uploads", key))
    if os.path.exists(local_path):
        try:
            os.remove(local_path)
            print(f"[Local Storage] Deleted local file: {local_path}")
            return True
        except Exception as e:
            print(f"[Local Storage Error] Failed to delete local file: {e}")

    return False
