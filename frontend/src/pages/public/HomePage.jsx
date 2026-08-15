import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";

export function HomePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products")
        ]);
        setCategories(catRes.data);
        setFeaturedProducts(prodRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Hero Banner — Group Buying Campaign */}
      <section style={{
        background: "linear-gradient(135deg, #FFF5F5 0%, #FFF0EB 50%, #FDFBF7 100%)",
        padding: "64px 0",
        borderBottom: "1px solid var(--border-light)"
      }}>
        <div className="container" style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "48px",
          alignItems: "center"
        }}>
          <div>
            <span className="badge" style={{ backgroundColor: "var(--primary-heart-light)", color: "var(--primary-heart)", marginBottom: "16px" }}>
              🇬🇧 2026 英國春季直送首發團
            </span>
            <h1 className="heading-xl" style={{ color: "var(--text-main)", marginBottom: "16px" }}>
              為寶貝挑選最高質感的純棉英倫童裝
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "28px", lineHeight: "1.7" }}>
              100% 英國原廠直送！手感極致親膚，限時預購開團中。單筆預購滿 <strong style={{ color: "var(--primary-heart)" }}>NT$4,000 折 60 元</strong>！
            </p>
            <div style={{ display: "flex", gap: "14px" }}>
              <Link to="/products" className="btn btn-primary btn-lg">
                逛逛全館商品 <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                領取 60 點免運禮
              </Link>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <img
              src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800"
              alt="Heart Kids Wear Banner"
              style={{
                width: "100%",
                height: "380px",
                objectFit: "cover",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)"
              }}
            />
            <div style={{
              position: "absolute",
              bottom: "-16px",
              left: "-16px",
              backgroundColor: "#FFFFFF",
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{ fontSize: "1.5rem" }}>📦</span>
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>7-11 店到店</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>滿額自動折抵運費</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ padding: "36px 0", borderBottom: "1px solid var(--border-light)", backgroundColor: "#FFFFFF" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <ShieldCheck size={32} style={{ color: "var(--primary-heart)" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>100% 英國正品直送</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>原廠官網親自採購</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <Truck size={32} style={{ color: "var(--accent-gold)" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>7-11 / 郵局宅配</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>包裹進度全程透明</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <RefreshCw size={32} style={{ color: "var(--accent-mint)" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>斷貨 100% 退購物金</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>永久有效自動折抵</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Cards */}
      <section style={{ padding: "60px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
            <div>
              <span className="badge" style={{ backgroundColor: "var(--accent-gold-light)", color: "var(--accent-gold)", marginBottom: "8px" }}>
                選購分類
              </span>
              <h2 className="heading-lg">依款式與性別挑選</h2>
            </div>
            <Link to="/products" style={{ color: "var(--primary-heart)", fontWeight: "600", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}>
              查看全部分類 <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
            {categories.slice(0, 5).map((cat, idx) => {
              const icons = ["👦", "👧", "👶", "🎀", "🧸"];
              return (
                <Link
                  key={cat.id}
                  to={`/products?category_id=${cat.id}`}
                  className="card"
                  style={{
                    textAlign: "center",
                    padding: "24px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    borderRadius: "var(--radius-lg)"
                  }}
                >
                  <span style={{ fontSize: "2.5rem" }}>{icons[idx] || "👕"}</span>
                  <div style={{ fontWeight: "700", fontSize: "1rem" }}>{cat.name_zh}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{cat.name_en}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section style={{ padding: "0 0 60px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
            <div>
              <span className="badge" style={{ backgroundColor: "var(--primary-heart-light)", color: "var(--primary-heart)", marginBottom: "8px" }}>
                人氣預購
              </span>
              <h2 className="heading-lg">本期開團精選推薦</h2>
            </div>
            <Link to="/products" style={{ color: "var(--primary-heart)", fontWeight: "600", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}>
              瀏覽更多商品 <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-3">
            {featuredProducts.slice(0, 6).map((prod) => (
              <div key={prod.id} className="card" style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
                <Link to={`/products/${prod.id}`} style={{ position: "relative", display: "block", marginBottom: "14px" }}>
                  <img
                    src={prod.images?.[0]?.image_url || "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600"}
                    alt={prod.name_zh}
                    style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                  />
                  <span className="badge" style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "#FFFFFF", color: "var(--text-main)" }}>
                    預購中
                  </span>
                </Link>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <Link to={`/products/${prod.id}`} style={{ fontWeight: "700", fontSize: "1.05rem", color: "var(--text-main)", display: "block", marginBottom: "6px" }}>
                      {prod.name_zh}
                    </Link>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      {prod.name_en}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
                    <div>
                      <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                        {formatCurrency(prod.retail_price_twd)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>滿4,000折60元</div>
                    </div>
                    <Link to={`/products/${prod.id}`} className="btn btn-outline btn-sm">
                      選規格
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
