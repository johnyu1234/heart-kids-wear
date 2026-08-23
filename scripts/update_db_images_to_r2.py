import os
import sys
from dotenv import load_dotenv

# Ensure utf-8 stdout on windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

load_dotenv("backend/.env")
load_dotenv(".env")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import SessionLocal
from backend.app.models.product import Product, ProductImage

R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN", "https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev").rstrip("/")

def update_product_images():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        print(f"Found {len(products)} products in database to verify/update images...")

        for p in products:
            # Update size chart
            if not p.size_chart_url or "unsplash" in p.size_chart_url:
                p.size_chart_url = f"{R2_PUBLIC_DOMAIN}/products/size_chart_standard.jpg"
                print(f"Updated size chart for product #{p.id} ({p.name_zh}) -> {p.size_chart_url}")

            # Update product images
            for img in p.images:
                if "unsplash" in img.image_url:
                    if "519238263530" in img.image_url or "上衣" in p.name_zh or "Tee" in (p.name_en or ""):
                        img.image_url = f"{R2_PUBLIC_DOMAIN}/products/tee_boy_classic.jpg"
                    elif "622290291468" in img.image_url or "洋裝" in p.name_zh or "Dress" in (p.name_en or ""):
                        img.image_url = f"{R2_PUBLIC_DOMAIN}/products/dress_girl_floral.jpg"
                    else:
                        img.image_url = f"{R2_PUBLIC_DOMAIN}/products/joggers_boy_casual.jpg"
                    print(f"   Updated image #{img.id} -> {img.image_url}")

        db.commit()
        print("\nAll database product images successfully updated to Cloudflare R2 CDN URLs!")
    except Exception as e:
        db.rollback()
        print(f"Error updating product images: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_product_images()
