import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/I18nContext";
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";

export function HomePage() {
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
              {t("home.badge")}
            </span>
            <h1 className="heading-xl" style={{ color: "var(--text-main)", marginBottom: "16px" }}>
              {t("home.hero_title")}
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "28px", lineHeight: "1.7" }}>
              {t("home.hero_subtitle")}
            </p>
            <div style={{ display: "flex", gap: "14px" }}>
              <Link to="/products" className="btn btn-primary btn-lg">
                {t("home.btn_browse")} <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                {t("home.btn_gift")}
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
                <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{t("home.store_pickup")}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t("home.discount_note")}</div>
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
              <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{t("home.feature_1_title")}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t("home.feature_1_desc")}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <Truck size={32} style={{ color: "var(--accent-gold)" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{t("home.feature_2_title")}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t("home.feature_2_desc")}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <RefreshCw size={32} style={{ color: "var(--accent-mint)" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{t("home.feature_3_title")}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t("home.feature_3_desc")}</div>
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
                {t("home.category_badge")}
              </span>
              <h2 className="heading-lg">{t("home.category_title")}</h2>
            </div>
            <Link to="/products" style={{ color: "var(--primary-heart)", fontWeight: "600", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}>
              {t("home.all_categories")} <ArrowRight size={16} />
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
                  <div style={{ fontWeight: "700", fontSize: "1rem" }}>
                    {lang === "en" ? cat.name_en : cat.name_zh}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
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
