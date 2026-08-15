import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "../../i18n/I18nContext";
import { formatCurrency } from "../../utils/currency";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export function CartDropdown({ onClose }) {
  const { cart, removeItem } = useCart();
  const { t } = useTranslation();

  return (
    <div style={{
      position: "absolute",
      top: "100%",
      right: "0",
      width: "min(340px, calc(100vw - 28px))",
      maxWidth: "calc(100vw - 24px)",
      backgroundColor: "#FFFFFF",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      border: "1px solid var(--border-light)",
      padding: "16px",
      zIndex: 1000,
      marginTop: "10px",
      boxSizing: "border-box"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
        <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>{t("cart.title")} ({cart.total_items})</h4>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t("home.bulk_discount_hint")}</span>
      </div>

      {cart.items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
          <ShoppingBag size={36} style={{ color: "var(--border-light)", marginBottom: "8px" }} />
          <p style={{ fontSize: "0.9rem" }}>{t("cart.empty")}</p>
        </div>
      ) : (
        <>
          <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <img
                  src={item.variant?.product?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=120"}
                  alt={item.variant?.product?.name_zh}
                  style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.variant?.product?.name_zh}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {item.variant?.size_label} | {item.variant?.color || "Standard"} × {item.quantity}
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary-heart)" }}>
                    {formatCurrency(item.variant?.product?.retail_price_twd * item.quantity)}
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ color: "var(--text-light)", padding: "4px" }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: "600", marginBottom: "4px" }}>
              <span>{t("cart.subtotal")}</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            {cart.bulk_discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--accent-mint)", marginBottom: "4px" }}>
                <span>{t("cart.bulk_discount")}</span>
                <span>-{formatCurrency(cart.bulk_discount)}</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link to="/cart" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: "8px" }}>
              {t("cart.view_cart")}
            </Link>
            <Link to="/checkout" onClick={onClose} className="btn btn-primary" style={{ flex: 1, padding: "8px" }}>
              {t("cart.checkout")} <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
