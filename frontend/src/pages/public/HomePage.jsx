import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/I18nContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, Heart, User } from "lucide-react";

export function HomePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { lang, t } = useTranslation();

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
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="badge" style={{ backgroundColor: "var(--primary-heart-light)", color: "var(--primary-heart)", marginBottom: "14px" }}>
              {t("home.badge")}
            </span>
            <h1 className="heading-xl hero-title" style={{ color: "var(--text-main)", marginBottom: "14px" }}>
              {t("home.hero_title")}
            </h1>
            <p className="hero-subtitle" style={{ fontSize: "1.05rem", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
              {t("home.hero_subtitle")}
            </p>
            <div className="hero-buttons" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link to="/products" className="btn btn-primary btn-lg" style={{ whiteSpace: "nowrap" }}>
                {t("home.btn_browse")} <ArrowRight size={18} />
              </Link>
              {user ? (
                <Link to="/member/account" className="btn btn-secondary btn-lg" style={{ whiteSpace: "nowrap" }}>
                  <User size={18} /> {t("home.btn_account")}
                </Link>
              ) : (
                <Link to="/register" className="btn btn-secondary btn-lg" style={{ whiteSpace: "nowrap" }}>
                  {t("home.btn_gift")}
                </Link>
              )}
            </div>
          </div>

          <div className="hero-image-container">
            <img
              src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800"
              alt="Heart Kids Wear Banner"
              className="hero-image"
            />
            <div className="hero-trust-badge">
              <span style={{ fontSize: "1.5rem" }}>📦</span>
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.88rem" }}>{t("home.store_pickup")}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t("home.discount_note")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-section">
        <div className="container features-grid">
          <div className="feature-item">
            <ShieldCheck size={28} style={{ color: "var(--primary-heart)", flexShrink: 0 }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "700", fontSize: "0.92rem" }}>{t("home.feature_1_title")}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t("home.feature_1_desc")}</div>
            </div>
          </div>
          <div className="feature-item">
            <Truck size={28} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "700", fontSize: "0.92rem" }}>{t("home.feature_2_title")}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t("home.feature_2_desc")}</div>
            </div>
          </div>
          <div className="feature-item">
            <RefreshCw size={28} style={{ color: "var(--accent-mint)", flexShrink: 0 }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "700", fontSize: "0.92rem" }}>{t("home.feature_3_title")}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t("home.feature_3_desc")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Cards */}
      <section style={{ padding: "48px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
            <div>
              <span className="badge" style={{ backgroundColor: "var(--accent-gold-light)", color: "var(--accent-gold)", marginBottom: "6px" }}>
                {t("home.category_badge")}
              </span>
              <h2 className="heading-lg" style={{ fontSize: "1.45rem" }}>{t("home.category_title")}</h2>
            </div>
            <Link to="/products" style={{ color: "var(--primary-heart)", fontWeight: "600", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
              {t("home.all_categories")} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="category-grid">
            {categories.slice(0, 5).map((cat, idx) => {
              const icons = ["👦", "👧", "👶", "🎀", "🧸"];
              return (
                <Link
                  key={cat.id}
                  to={`/products?category_id=${cat.id}`}
                  className="card category-card"
                >
                  <span className="category-icon">{icons[idx] || "👕"}</span>
                  <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                    {lang === "en" ? cat.name_en : cat.name_zh}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {lang === "en" ? cat.name_zh : cat.name_en}
                  </div>
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
                {t("home.featured_badge")}
              </span>
              <h2 className="heading-lg">{t("home.featured_title")}</h2>
            </div>
            <Link to="/products" style={{ color: "var(--primary-heart)", fontWeight: "600", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}>
              {t("home.btn_browse")} <ArrowRight size={16} />
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
                    {t("home.preorder")}
                  </span>
                </Link>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <Link to={`/products/${prod.id}`} style={{ fontWeight: "700", fontSize: "1.05rem", color: "var(--text-main)", display: "block", marginBottom: "6px" }}>
                      {lang === "en" && prod.name_en ? prod.name_en : prod.name_zh}
                    </Link>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      {lang === "en" ? prod.name_zh : prod.name_en}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
                    <div>
                      <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                        {formatCurrency(prod.retail_price_twd)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>{t("home.bulk_discount_hint")}</div>
                    </div>
                    <Link to={`/products/${prod.id}`} className="btn btn-outline btn-sm">
                      {t("home.btn_select_spec")}
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
