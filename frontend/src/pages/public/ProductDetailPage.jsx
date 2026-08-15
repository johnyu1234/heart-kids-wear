import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "../../i18n/I18nContext";
import { formatCurrency } from "../../utils/currency";
import { Heart, ShoppingBag, Truck, ShieldCheck, Tag, Ruler, ArrowLeft } from "lucide-react";

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { lang, t } = useTranslation();

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        if (res.data.variants?.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(selectedVariant.id, quantity);
  };

  if (loading) {
    return <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>{t("products.loading")}</div>;
  }

  if (!product) {
    return <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>{t("products.empty")}</div>;
  }

  const images = product.images?.length > 0 ? product.images : [{ image_url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800" }];

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "20px" }}>
        <Link to="/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
          <ArrowLeft size={16} /> {t("detail.back")}
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "48px" }}>
        {/* Left: Gallery */}
        <div>
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <img
              src={images[selectedImage]?.image_url}
              alt={product.name_zh}
              style={{ width: "100%", height: "460px", objectFit: "cover", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)" }}
            />
          </div>

          {images.length > 1 && (
            <div style={{ display: "flex", gap: "10px" }}>
              {images.map((img, idx) => (
                <img
                  key={img.id || idx}
                  src={img.image_url}
                  alt="Thumb"
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    border: selectedImage === idx ? "2px solid var(--primary-heart)" : "1px solid var(--border-light)"
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div>
          <div style={{ marginBottom: "8px" }}>
            <span className="badge" style={{ backgroundColor: "var(--primary-heart-light)", color: "var(--primary-heart)" }}>
              {t("detail.badge")}
            </span>
          </div>

          <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "6px", lineHeight: "1.3" }}>
            {lang === "en" && product.name_en ? product.name_en : product.name_zh}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "18px" }}>
            {lang === "en" ? product.name_zh : product.name_en}
          </p>

          {/* Price */}
          <div style={{ backgroundColor: "var(--bg-subtle)", padding: "16px 20px", borderRadius: "var(--radius-md)", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                {formatCurrency(product.retail_price_twd)}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--accent-mint)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                <Tag size={14} /> {t("home.bulk_discount_hint")}
              </span>
            </div>
          </div>

          {/* Size Chart Modal Trigger */}
          {product.size_chart_url && (
            <button
              onClick={() => setIsSizeChartOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--primary-heart)",
                fontSize: "0.9rem",
                fontWeight: "600",
                marginBottom: "20px"
              }}
            >
              <Ruler size={16} /> {t("detail.size_chart_btn")}
            </button>
          )}

          {/* Variant / Size Selector */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "10px" }}>
              {t("detail.select_spec")} <span style={{ color: "var(--primary-heart)" }}>{selectedVariant?.size_label}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {product.variants?.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "2px solid var(--primary-heart)" : "1px solid var(--border-light)",
                      backgroundColor: isSelected ? "var(--primary-heart-light)" : "#FFFFFF",
                      color: isSelected ? "var(--primary-heart)" : "var(--text-main)",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    {v.size_label} {v.color ? `(${v.color})` : ""}
                  </button>
                );
              })}
            </div>
            {selectedVariant && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "8px" }}>
                {t("detail.sku_label")} {selectedVariant.sku}
              </div>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-light)", borderRadius: "var(--radius-full)", backgroundColor: "#FFFFFF" }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: "10px 16px", fontSize: "1.1rem", fontWeight: "700" }}
              >
                -
              </button>
              <span style={{ minWidth: "36px", textAlign: "center", fontWeight: "700" }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: "10px 16px", fontSize: "1.1rem", fontWeight: "700" }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
            >
              <ShoppingBag size={20} /> {t("detail.add_to_cart")}
            </button>
          </div>

          {/* Notice Box */}
          <div style={{
            borderTop: "1px solid var(--border-light)",
            paddingTop: "20px",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Truck size={16} style={{ color: "var(--accent-gold)" }} />
              <span>{t("detail.notice_shipping")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} style={{ color: "var(--accent-mint)" }} />
              <span>{t("detail.notice_refund")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Tab */}
      {product.description && (
        <div className="card" style={{ marginTop: "48px", padding: "32px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "14px" }}>{t("detail.desc_title")}</h3>
          <p style={{ color: "var(--text-main)", lineHeight: "1.8", whiteSpace: "pre-line" }}>
            {product.description}
          </p>
        </div>
      )}

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="modal-overlay" onClick={() => setIsSizeChartOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "16px" }}>{t("detail.size_chart_title")}</h3>
            <img
              src={product.size_chart_url}
              alt="Size Chart"
              style={{ width: "100%", borderRadius: "var(--radius-md)", marginBottom: "16px" }}
            />
            <button onClick={() => setIsSizeChartOpen(false)} className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
              {t("detail.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
