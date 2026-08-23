import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal

# Set up python path if executed directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.database import engine, Base, SessionLocal
from backend.app.utils.auth import hash_password
from backend.app.models import (
    Member, ShippingAddress, Category, GroupCampaign,
    Product, ProductVariant, ProductImage, SystemConfig,
    MessageTemplate, Message, PointsCard, ExpenseLedger
)

R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN", "https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev").rstrip("/")

def init_db():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    db = SessionLocal()
    try:
        # 1. Seed System Configuration
        configs = [
            {"config_key": "PAYMENT_GATEWAY_ENABLED", "config_value": "false", "description": "Enable live payment gateway integration"},
            {"config_key": "CREDIT_CARD_ENABLED", "config_value": "false", "description": "Enable credit card payments"},
            {"config_key": "LOYALTY_POINTS_ENABLED", "config_value": "false", "description": "Enable purchase rebate loyalty points"},
            {"config_key": "LOYALTY_POINTS_RATE", "config_value": "0.002", "description": "Loyalty rebate rate (0.2%)"},
            {"config_key": "POINTS_VALIDITY_MONTHS", "config_value": "3", "description": "Points validity duration in months"},
            {"config_key": "BULK_DISCOUNT_THRESHOLD", "config_value": "4000", "description": "Minimum subtotal for bulk discount in NT$"},
            {"config_key": "BULK_DISCOUNT_AMOUNT", "config_value": "60", "description": "Bulk discount amount in NT$"},
            {"config_key": "SHIPPING_FEE_711", "config_value": "60", "description": "7-11 store-to-store shipping fee in NT$"},
            {"config_key": "SHIPPING_FEE_POST", "config_value": "80", "description": "Post office home delivery fee in NT$"},
            {"config_key": "MAX_ITEMS_711", "config_value": "15", "description": "Max items before forcing Post Office shipping"},
            {"config_key": "REGISTRATION_BONUS_POINTS", "config_value": "60", "description": "Points awarded on registration (= NT$60)"},
            {"config_key": "OVERDUE_GRACE_DAYS", "config_value": "3", "description": "Grace period days after checkout deadline"},
            {"config_key": "RETURN_RESHIPPING_FEE", "config_value": "120", "description": "Reshipping fee for uncollected returned parcels in NT$"},
            {"config_key": "CATHAY_BANK_ACCOUNT", "config_value": "國泰世華銀行 (013) 帳號：123-456-789012", "description": "Static bank account for overdue manual transfers"}
        ]

        for cfg in configs:
            existing = db.query(SystemConfig).filter(SystemConfig.config_key == cfg["config_key"]).first()
            if not existing:
                db.add(SystemConfig(**cfg))
        db.commit()
        print("System configurations seeded.")

        # 2. Seed 2-Tier Categories
        tier1_categories = [
            {"name_zh": "男孩", "name_en": "Boys", "tier_type": "GENDER_TYPE", "sort_order": 1},
            {"name_zh": "女孩", "name_en": "Girls", "tier_type": "GENDER_TYPE", "sort_order": 2},
            {"name_zh": "男寶", "name_en": "Baby Boys", "tier_type": "GENDER_TYPE", "sort_order": 3},
            {"name_zh": "女寶", "name_en": "Baby Girls", "tier_type": "GENDER_TYPE", "sort_order": 4},
            {"name_zh": "其他（配件、玩具與書本）", "name_en": "Others (Accessories, Toys & Books)", "tier_type": "GENDER_TYPE", "sort_order": 5},
        ]

        age_groups = [
            {"name_zh": "0-6個月", "name_en": "0-6 Months", "tier_type": "AGE_GROUP", "sort_order": 1},
            {"name_zh": "6-12個月", "name_en": "6-12 Months", "tier_type": "AGE_GROUP", "sort_order": 2},
            {"name_zh": "1-2歲", "name_en": "1-2 Years", "tier_type": "AGE_GROUP", "sort_order": 3},
            {"name_zh": "2-3歲", "name_en": "2-3 Years", "tier_type": "AGE_GROUP", "sort_order": 4},
            {"name_zh": "3-4歲", "name_en": "3-4 Years", "tier_type": "AGE_GROUP", "sort_order": 5},
            {"name_zh": "4-5歲", "name_en": "4-5 Years", "tier_type": "AGE_GROUP", "sort_order": 6},
            {"name_zh": "5-6歲", "name_en": "5-6 Years", "tier_type": "AGE_GROUP", "sort_order": 7},
            {"name_zh": "6歲以上", "name_en": "6+ Years", "tier_type": "AGE_GROUP", "sort_order": 8},
        ]

        for t1 in tier1_categories:
            cat = db.query(Category).filter(Category.name_zh == t1["name_zh"]).first()
            if not cat:
                cat = Category(**t1)
                db.add(cat)
                db.flush()

                # Add age brackets for each gender category
                if t1["name_zh"] != "其他（配件、玩具與書本）":
                    for ag in age_groups:
                        sub_cat = Category(
                            parent_id=cat.id,
                            name_zh=ag["name_zh"],
                            name_en=ag["name_en"],
                            tier_type=ag["tier_type"],
                            sort_order=ag["sort_order"]
                        )
                        db.add(sub_cat)
        db.commit()
        print("Categories seeded.")

        # 3. Seed Message Templates
        templates = [
            {
                "template_name": "7-11 出貨通知",
                "template_type": "SHIPPING",
                "template_content": "【出貨通知】哈囉您好：您 {{month}} 月預購的商品已出貨，寄編 {{tracking}}，查看包裹進度可以至 7-11 網站或 app 的交貨便查詢喔！7-11 也會有取貨簡訊，如怕遺漏請務必查詢包裹進度。🔺包裹如果未取被退回，需再寄出一次，第二次運費為 120NT，請特別留意。‼為保雙方權益，拆封包裹請錄影‼ ♻️環保愛地球，商品可能不會單獨包裝。如需裝箱，外箱可能使用回收紙箱（乾淨、衛生的），商品的完整度不受影響，特此說明。✨如果對商品有疑問，請與我們反應，我們會盡速回覆處理。收到商品很喜歡、很滿意的話，也歡迎給我們留下好評支持。🫶🫶🫶 感謝您選擇心童裝Heart Kids Wear，感謝您的購買！🙇‍♀️"
            },
            {
                "template_name": "7-11 未取貨催領通知",
                "template_type": "PICKUP_REMINDER",
                "template_content": "【7-11取貨截止日為 {{date}}】哈囉您好：您的包裹尚未至 7-11 取貨。可能 7-11 漏發簡訊通知您，請盡快撥控於截止日前前往領取。✨包裹如果未取被退回，需再寄出一次，第二次運費為 120NT，請特別留意。感謝您選擇心童裝Heart Kids Wear，感謝您的購買！🙇‍♀️"
            },
            {
                "template_name": "結帳截止日催繳通知 (Day 0)",
                "template_type": "PAYMENT_REMINDER",
                "template_content": "哈囉您好：提醒您【今日 {{date}} 為結帳截止日】，再麻煩撥控結帳及完成表單回覆，謝謝您！"
            },
            {
                "template_name": "逾期第一天緩衝通知 (Day 1)",
                "template_type": "OVERDUE",
                "template_content": "哈囉您好：因恐您事務繁忙，以致尚未完成結帳。結帳緩衝期，超過結帳截止日三天內完成結帳，不會列入逾期未繳名單；若超過三天即視為逾期結帳。煩請盡速完成結帳及回覆表單。感謝您的理解與配合，謝謝您！"
            },
            {
                "template_name": "逾期第三/四天終極通知",
                "template_type": "OVERDUE",
                "template_content": "‼️最後結帳提醒，商品即將釋出‼️ 您好，您的訂單已超過結帳緩衝期尚未結帳。如今日未能完成結帳，將視為確定逾期結帳，商品釋出不保留，恕不再提供服務。以上告知。謝謝您！🙇‍♀️"
            },
            {
                "template_name": "線上客服自動歡迎回覆",
                "template_type": "CUSTOM",
                "template_content": "{{name}} 您好！歡迎光臨心童裝Heart Kids Wear。如果有任何問題請直接留言，我們會盡速回覆。💌 回覆順序由舊到新依序回覆，請勿重複留言，重複留言會讓順序往後推喔！謝謝！🙇🏻‍♀️"
            }
        ]

        for tpl in templates:
            existing = db.query(MessageTemplate).filter(MessageTemplate.template_name == tpl["template_name"]).first()
            if not existing:
                db.add(MessageTemplate(**tpl))
        db.commit()
        print("Message templates seeded.")

        # 4. Seed Admin & Demo Accounts
        admin_email = "admin@heartkidswear.com"
        admin = db.query(Member).filter(Member.email == admin_email).first()
        if not admin:
            admin = Member(
                member_id="2604001",
                email=admin_email,
                password_hash=hash_password("admin123456"),
                full_name="管理員 (Admin)",
                phone="0912345678",
                is_admin=True,
                agreed_to_rules=True,
                marketing_source="FB"
            )
            db.add(admin)
            db.commit()
            print("Admin account created: admin@heartkidswear.com")

        demo_user_email = "wai-san@heartkidswear.com"
        demo_user = db.query(Member).filter(Member.email == demo_user_email).first()
        if not demo_user:
            demo_user = Member(
                member_id="2604002",
                email=demo_user_email,
                password_hash=hash_password("password123"),
                full_name="黃慧珊 (Wai-San)",
                phone="0987654321",
                contact_address="台北市大安區信義路四段100號",
                ig_handle="wai_san_kids",
                fb_handle="WaiSan Huang",
                line_handle="waisan_line",
                marketing_source="IG",
                store_credits=Decimal("500.00"),
                is_admin=False,
                agreed_to_rules=True
            )
            db.add(demo_user)
            db.flush()

            # Add primary 7-11 address
            addr = ShippingAddress(
                member_id=demo_user.id,
                address_type="SEVEN_ELEVEN",
                store_name="鑫樂門市",
                store_number="123456",
                recipient_name="黃慧珊",
                recipient_phone="0987654321",
                is_primary=True
            )
            db.add(addr)

            # Add 60 point registration bonus card
            card = PointsCard(
                member_id=demo_user.id,
                amount=Decimal("60.00"),
                remaining=Decimal("60.00"),
                expiry_date=datetime.utcnow() + timedelta(days=90),
                issued_reason="註冊首次贈送60點"
            )
            db.add(card)
            db.commit()
            print("Demo member created: wai-san@heartkidswear.com / password123")

        # 5. Seed Demo Group Campaign & Products with Cloudflare R2 CDN URLs
        campaign = db.query(GroupCampaign).first()
        if not campaign:
            campaign = GroupCampaign(
                display_title="英國精選品牌童裝春季首發團 (Group Buy A)",
                promotional_copy="🇬🇧 英國直送高質感童裝，超柔軟純棉透氣舒適！限時預購開團中，把握優惠滿4,000折60元！",
                scheduled_publish_at=datetime.utcnow(),
                is_active=True
            )
            db.add(campaign)
            db.flush()

            cat_boys_23 = db.query(Category).filter(Category.name_zh == "2-3歲").first()
            cat_girls_34 = db.query(Category).filter(Category.name_zh == "3-4歲").first()

            products_data = [
                {
                    "name_zh": "英國品牌經典純棉童趣短袖上衣",
                    "name_en": "British Classic Cotton Graphic Tee",
                    "category_id": cat_boys_23.id if cat_boys_23 else None,
                    "campaign_id": campaign.id,
                    "supplier": "UK Brand Direct",
                    "cost_gbp": Decimal("12.50"),
                    "retail_price_twd": Decimal("680.00"),
                    "description": "100% 有機純棉，觸感細緻，不起毛球，適合台灣夏季悶熱氣候穿著。",
                    "size_chart_url": f"{R2_PUBLIC_DOMAIN}/products/size_chart_standard.jpg",
                    "is_listed": True,
                    "variants": [
                        {"sku": "TEE-BOY-2-3Y", "size_label": "2-3y", "color": "Navy Blue", "stock_quantity": 20},
                        {"sku": "TEE-BOY-3-4Y", "size_label": "3-4y", "color": "Navy Blue", "stock_quantity": 25},
                        {"sku": "TEE-BOY-4-5Y", "size_label": "4-5y", "color": "Navy Blue", "stock_quantity": 15},
                    ],
                    "image": f"{R2_PUBLIC_DOMAIN}/products/tee_boy_classic.jpg"
                },
                {
                    "name_zh": "英倫碎花荷葉邊純棉洋裝",
                    "name_en": "British Floral Ruffle Cotton Dress",
                    "category_id": cat_girls_34.id if cat_girls_34 else None,
                    "campaign_id": campaign.id,
                    "supplier": "London Boutique",
                    "cost_gbp": Decimal("18.00"),
                    "retail_price_twd": Decimal("980.00"),
                    "description": "經典優雅小碎花圖案，荷葉邊袖口設計，甜美氣質必備洋裝。",
                    "size_chart_url": f"{R2_PUBLIC_DOMAIN}/products/size_chart_standard.jpg",
                    "is_listed": True,
                    "variants": [
                        {"sku": "DRS-GIRL-2-3Y", "size_label": "2-3y", "color": "Rose Pink", "stock_quantity": 18},
                        {"sku": "DRS-GIRL-3-4Y", "size_label": "3-4y", "color": "Rose Pink", "stock_quantity": 22},
                        {"sku": "DRS-GIRL-4-5Y", "size_label": "4-5y", "color": "Rose Pink", "stock_quantity": 12},
                    ],
                    "image": f"{R2_PUBLIC_DOMAIN}/products/dress_girl_floral.jpg"
                },
                {
                    "name_zh": "舒適彈力休閒長褲 (2入組)",
                    "name_en": "Comfort Stretch Casual Joggers (2-Pack)",
                    "category_id": cat_boys_23.id if cat_boys_23 else None,
                    "campaign_id": campaign.id,
                    "supplier": "UK Brand Direct",
                    "cost_gbp": Decimal("15.00"),
                    "retail_price_twd": Decimal("820.00"),
                    "description": "耐磨透氣抽繩休閒長褲，活動自如，一套兩件超值組合。",
                    "size_chart_url": f"{R2_PUBLIC_DOMAIN}/products/size_chart_standard.jpg",
                    "is_listed": True,
                    "variants": [
                        {"sku": "PNT-BOY-2-3Y", "size_label": "2-3y", "color": "Grey/Khaki", "stock_quantity": 15},
                        {"sku": "PNT-BOY-3-4Y", "size_label": "3-4y", "color": "Grey/Khaki", "stock_quantity": 20},
                    ],
                    "image": f"{R2_PUBLIC_DOMAIN}/products/joggers_boy_casual.jpg"
                }
            ]

            for p_data in products_data:
                variants_list = p_data.pop("variants")
                img_url = p_data.pop("image")
                p = Product(**p_data)
                db.add(p)
                db.flush()

                db.add(ProductImage(product_id=p.id, image_url=img_url, is_primary=True, sort_order=1))

                for v_data in variants_list:
                    db.add(ProductVariant(product_id=p.id, **v_data))

            db.commit()
            print("Demo group campaign and products seeded with Cloudflare R2 image URLs.")

    except Exception as e:
        db.rollback()
        print(f"Error during db initialization: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
