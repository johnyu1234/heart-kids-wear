import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "../../i18n/I18nContext";
import { formatCurrency } from "../../utils/currency";
import { Trash2, ArrowRight, ShoppingBag, Tag, ArrowLeft } from "lucide-react";

export function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();
  const { lang, t } = useTranslation();

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <ShoppingBag size={54} style={{ color: "var(--border-light)", margin: "0 auto 16px" }} />
        <h2 className="heading-lg" style={{ marginBottom: "8px" }}>{t("cart.empty")}</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>{t("home.btn_browse")}</p>
        <Link to="/products" className="btn btn-primary">
          {t("home.btn_browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link to="/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
          <ArrowLeft size={16} /> {t("cart.btn_continue")}
        </Link>
      </div>

      <h1 className="heading-lg" style={{ marginBottom: "24px" }}>
        {t("cart.title")} ({cart.total_items} {t("cart.total_items")})
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
        {/* Cart Item Table / Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {cart.items.map((item) => (
            <div key={item.id} className="card" style={{ display: "flex", gap: "18px", padding: "18px", alignItems: "center" }}>
              <img
                src={item.variant?.product?.images?.[0]?.image_url || "https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev/products/tee_boy_classic.jpg"}
                alt={item.variant?.product?.name_zh}
                style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}
              />

              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.variant?.product?.id}`} style={{ fontWeight: "700", fontSize: "1.05rem", color: "var(--text-main)", display: "block", marginBottom: "4px" }}>
                  {lang === "en" && item.variant?.product?.name_en ? item.variant?.product?.name_en : item.variant?.product?.name_zh}
                </Link>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                  {item.variant?.size_label} ｜ {item.variant?.color || "Standard"} ｜ SKU: {item.variant?.sku}
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                  {formatCurrency(item.variant?.product?.retail_price_twd)}
                </div>
              </div>

              {/* Quantity Changer */}
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-light)", borderRadius: "var(--radius-full)" }}>
                <button
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  style={{ padding: "6px 12px", fontWeight: "700" }}
                >
                  -
                </button>
                <span style={{ minWidth: "28px", textAlign: "center", fontWeight: "700", fontSize: "0.9rem" }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ padding: "6px 12px", fontWeight: "700" }}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                style={{ color: "var(--text-light)", padding: "8px" }}
                title="Remove"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div>
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
              {t("checkout.summary_title")}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", fontSize: "0.95rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>{t("cart.total_items")}</span>
                <span style={{ fontWeight: "700" }}>{cart.total_items}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>{t("cart.subtotal")}</span>
                <span style={{ fontWeight: "700" }}>{formatCurrency(cart.subtotal)}</span>
              </div>

              {cart.bulk_discount > 0 ? (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-mint)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Tag size={14} /> {t("cart.bulk_discount")}
                  </span>
                  <span style={{ fontWeight: "700" }}>-{formatCurrency(cart.bulk_discount)}</span>
                </div>
              ) : (
                <div style={{ fontSize: "0.8rem", color: "var(--text-light)", backgroundColor: "var(--bg-subtle)", padding: "8px 10px", borderRadius: "var(--radius-sm)" }}>
                  {t("cart.bulk_threshold_tip", { amount: formatCurrency(Math.max(0, 4000 - cart.subtotal)) })}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>{t("cart.estimated_shipping")}</span>
                <span>{formatCurrency(cart.estimated_shipping)}</span>
              </div>

              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                <span>{t("cart.estimated_total")}</span>
                <span>{formatCurrency(cart.estimated_total)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              {t("cart.btn_proceed_checkout")} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
