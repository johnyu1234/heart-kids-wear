import time
import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_categories_endpoint():
    response = client.get("/api/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 4
    boys = next(c for c in categories if c["name_zh"] == "男孩")
    assert len(boys["children"]) > 0

def test_products_endpoint():
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0

def test_auth_login_case_insensitive():
    response = client.post("/api/auth/login", json={
        "email": "ADMIN@HEARTKIDSWEAR.COM",
        "password": "admin123456"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_admin"] is True
    assert "access_token" in data

def test_auth_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "admin@heartkidswear.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 400
    assert "登入錯誤" in response.json()["detail"]

def test_auth_register_and_profile():
    unique_email = f"test_buyer_{int(time.time()*1000)}@heartkidswear.com"
    reg_response = client.post("/api/auth/register", json={
        "email": unique_email,
        "password": "buyerpassword123",
        "full_name": "王小美",
        "phone": "0911223344",
        "store_name": "新興門市",
        "store_number": "654321",
        "marketing_source": "IG",
        "agreed_to_rules": True
    })
    assert reg_response.status_code == 200
    token = reg_response.json()["access_token"]

    # Fetch profile
    prof_response = client.get("/api/members/profile", headers={"Authorization": f"Bearer {token}"})
    assert prof_response.status_code == 200
    prof = prof_response.json()
    assert prof["full_name"] == "王小美"
    assert len(prof["shipping_addresses"]) == 1
    assert prof["shipping_addresses"][0]["store_name"] == "新興門市"

    # Fetch points (should have 60 pts registration bonus)
    points_response = client.get("/api/members/points", headers={"Authorization": f"Bearer {token}"})
    assert points_response.status_code == 200
    points = points_response.json()
    assert len(points) == 1
    assert float(points[0]["amount"]) == 60.0

def test_cart_and_checkout_flow():
    # Login demo user
    login_res = client.post("/api/auth/login", json={
        "email": "wai-san@heartkidswear.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get products to get a variant ID
    prods = client.get("/api/products").json()
    variant_id = prods[0]["id"]  # Let's get variant from admin or product detail
    prod_detail = client.get(f"/api/products/{prods[0]['id']}").json()
    # Find variant id from database / admin products
    admin_login = client.post("/api/auth/login", json={"email": "admin@heartkidswear.com", "password": "admin123456"}).json()
    admin_prods = client.get("/api/admin/products", headers={"Authorization": f"Bearer {admin_login['access_token']}"}).json()
    v_id = admin_prods[0]["variants"][0]["id"]

    # 2. Add to cart
    add_res = client.post("/api/cart/add", json={"variant_id": v_id, "quantity": 2}, headers=headers)
    assert add_res.status_code == 200

    # 3. Get cart summary
    cart_res = client.get("/api/cart", headers=headers)
    assert cart_res.status_code == 200
    assert cart_res.json()["total_items"] >= 2

    # 4. Calculate checkout
    calc_res = client.post("/api/checkout/calculate", json={"shipping_type": "SEVEN_ELEVEN"}, headers=headers)
    assert calc_res.status_code == 200
    calc_data = calc_res.json()
    assert calc_data["shipping_type"] == "SEVEN_ELEVEN"
    assert float(calc_data["shipping_fee"]) == 60.0

    # 5. Submit Pre-Order
    submit_res = client.post("/api/checkout/submit", json={
        "shipping_type": "SEVEN_ELEVEN",
        "travel_notes": "預計 5/10 - 5/15 出國不在家",
        "agreed_to_terms": True
    }, headers=headers)
    assert submit_res.status_code == 200
    order = submit_res.json()
    assert order["order_number"].startswith("26")
    assert order["travel_notes"] == "預計 5/10 - 5/15 出國不在家"
    assert len(order["items"]) > 0

    # 6. Verify cart is cleared
    cart_after = client.get("/api/cart", headers=headers).json()
    assert cart_after["total_items"] == 0
