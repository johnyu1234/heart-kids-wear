import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "../../i18n/I18nContext";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { Truck, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export function CheckoutPage() {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { lang, t } = useTranslation();
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState("711");
  const [useCredits, setUseCredits] = useState(false);
  const [selectedPointsCard, setSelectedPointsCard] = useState("");
  const [travelNotes, setTravelNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [calculation, setCalculation] = useState(null);
  const [pointsCards, setPointsCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    async function loadData() {
      try {
        const ptsRes = await api.get("/members/points");
        setPointsCards(ptsRes.data.filter((p) => !p.is_used));
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [user]);

  // Recalculate fees dynamically
  useEffect(() => {
    async function calculate() {
      try {
        const res = await api.post("/checkout/calculate", {
          shipping_type: shippingMethod === "POST_OFFICE" ? "POST_OFFICE" : "SEVEN_ELEVEN",
          use_store_credits: useCredits,
          points_card_id: selectedPointsCard ? parseInt(selectedPointsCard) : null,
        });
        setCalculation(res.data);
        if (res.data.is_locked_to_post) {
          setShippingMethod("POST_OFFICE");
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (cart.items.length > 0) {
      calculate();
    }
  }, [cart, shippingMethod, useCredits, selectedPointsCard]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("請勾選同意預購規則說明");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/checkout/submit", {
        shipping_type: calculation?.is_locked_to_post ? "POST_OFFICE" : (shippingMethod === "POST_OFFICE" ? "POST_OFFICE" : "SEVEN_ELEVEN"),
        store_name: user?.addresses?.[0]?.store_name || user?.addresses?.[0]?.store_name_711 || "示範門市",
        store_number: user?.addresses?.[0]?.store_number || user?.addresses?.[0]?.store_number_711 || "123456",
        full_address: user?.addresses?.[0]?.contact_address || user?.addresses?.[0]?.postal_address || "台北市大安區信義路二段1號",
        recipient_name: user?.full_name,
        recipient_phone: user?.phone,
        use_store_credits: useCredits,
        points_card_id: selectedPointsCard ? parseInt(selectedPointsCard) : null,
        travel_notes: travelNotes,
        customer_notes: customerNotes,
        agreed_to_terms: true,
      });

      setOrderResult(res.data);
      await clearCart();
    } catch (err) {
      alert(err.response?.data?.detail || "下單失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    return (
      <div className="container" style={{ padding: "80px 20px", maxWidth: "600px", textAlign: "center" }}>
        <CheckCircle2 size={64} style={{ color: "var(--accent-mint)", margin: "0 auto 16px" }} />
        <h1 className="heading-lg" style={{ marginBottom: "8px" }}>{t("checkout.success_title")}</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          {t("checkout.order_number")} <strong style={{ color: "var(--primary-heart)", fontSize: "1.2rem" }}>{orderResult.order_number}</strong>
        </p>

        <div className="card" style={{ padding: "24px", textAlign: "left", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "var(--text-muted)" }}>{t("checkout.payable_amount")}</span>
            <span style={{ fontWeight: "800", fontSize: "1.2rem", color: "var(--primary-heart)" }}>
              {formatCurrency(orderResult.total || orderResult.final_payable_amount || calculation?.final_payable_amount)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ color: "var(--text-muted)" }}>{t("checkout.payment_deadline")}</span>
            <span style={{ fontWeight: "700", color: "var(--accent-gold)" }}>
              {orderResult.payment_deadline ? new Date(orderResult.payment_deadline).toLocaleString() : "結帳後 48 小時內"}
            </span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", backgroundColor: "var(--bg-subtle)", padding: "12px", borderRadius: "var(--radius-sm)", lineHeight: "1.6" }}>
            💡 {t("checkout.payment_instructions")}
          </div>
        </div>

        <Link to="/member/orders" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
          {t("checkout.btn_my_orders")} <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2 className="heading-lg">{t("cart.empty")}</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: "16px" }}>
          {t("home.btn_browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "900px" }}>
      <h1 className="heading-lg" style={{ marginBottom: "28px" }}>{t("checkout.title")}</h1>

      <form onSubmit={handleSubmitOrder} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Shipping Method */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>
              {t("checkout.shipping_title")}
            </h3>

            {calculation?.is_locked_to_post && (
              <div style={{ backgroundColor: "var(--accent-gold-light)", color: "var(--accent-gold)", padding: "12px 14px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                <AlertTriangle size={18} />
                <span>{t("checkout.lock_warning")}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                border: !calculation?.is_locked_to_post && shippingMethod === "711" ? "2px solid var(--primary-heart)" : "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)",
                cursor: calculation?.is_locked_to_post ? "not-allowed" : "pointer",
                opacity: calculation?.is_locked_to_post ? 0.5 : 1
              }}>
                <input
                  type="radio"
                  name="shipping"
                  value="711"
                  disabled={calculation?.is_locked_to_post}
                  checked={shippingMethod === "711" && !calculation?.is_locked_to_post}
                  onChange={() => setShippingMethod("711")}
                />
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{t("checkout.shipping_711")}</div>
                </div>
              </label>

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                border: shippingMethod === "POST_OFFICE" || calculation?.is_locked_to_post ? "2px solid var(--primary-heart)" : "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer"
              }}>
                <input
                  type="radio"
                  name="shipping"
                  value="POST_OFFICE"
                  checked={shippingMethod === "POST_OFFICE" || calculation?.is_locked_to_post}
                  onChange={() => setShippingMethod("POST_OFFICE")}
                />
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{t("checkout.shipping_post")}</div>
                </div>
              </label>
            </div>

            {/* Recipient Details */}
            <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem" }}>
              <div><strong>{t("checkout.recipient")}：</strong>{user?.full_name} ({user?.phone})</div>
              <div style={{ marginTop: "4px" }}>
                <strong>{t("checkout.select_address")}：</strong>
                {shippingMethod === "711" && !calculation?.is_locked_to_post
                  ? `${user?.addresses?.[0]?.store_name_711 || "未設定"} (店號: ${user?.addresses?.[0]?.store_number_711 || "未填"})`
                  : user?.addresses?.[0]?.postal_address || "台北市大安區信義路二段1號"}
              </div>
            </div>
          </div>

          {/* Travel Notes & Remarks */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "14px" }}>
              {t("checkout.travel_notes_title")}
            </h3>
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">{t("checkout.travel_notes_label")}</label>
              <input
                type="text"
                placeholder={t("checkout.travel_notes_placeholder")}
                value={travelNotes}
                onChange={(e) => setTravelNotes(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t("checkout.notes_label")}</label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Calculation & Submit Box */}
        <div>
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
              {t("checkout.summary_title")}
            </h3>

            {/* Store Credit Toggle */}
            {user?.store_credits > 0 && (
              <div style={{ padding: "12px", backgroundColor: "var(--primary-heart-light)", borderRadius: "var(--radius-sm)", marginBottom: "14px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem", fontWeight: "600", color: "var(--primary-heart)" }}>
                  <input
                    type="checkbox"
                    checked={useCredits}
                    onChange={(e) => setUseCredits(e.target.checked)}
                  />
                  {t("checkout.use_store_credits", { amount: formatCurrency(user.store_credits) })}
                </label>
              </div>
            )}

            {/* Points Card Selector */}
            {pointsCards.length > 0 && (
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">{t("checkout.points_card")}</label>
                <select
                  value={selectedPointsCard}
                  onChange={(e) => setSelectedPointsCard(e.target.value)}
                  className="form-control"
                  style={{ fontSize: "0.85rem" }}
                >
                  <option value="">{t("checkout.points_none")}</option>
                  {pointsCards.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.card_name} ({p.points_value} 點 = {formatCurrency(p.points_value)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Line Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>{t("cart.subtotal")}</span>
                <span>{formatCurrency(calculation?.subtotal || cart.subtotal)}</span>
              </div>

              {calculation?.bulk_discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-mint)" }}>
                  <span>{t("cart.bulk_discount")}</span>
                  <span>-{formatCurrency(calculation.bulk_discount)}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>{t("cart.estimated_shipping")}</span>
                <span>{formatCurrency(calculation?.shipping_fee ?? 60)}</span>
              </div>

              {calculation?.store_credits_deducted > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--primary-heart)" }}>
                  <span>{t("checkout.credits_deducted", { amount: formatCurrency(calculation.store_credits_deducted) })}</span>
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                <span>{t("checkout.final_payable")}</span>
                <span>{formatCurrency(calculation?.payable_amount || cart.estimated_total)}</span>
              </div>
            </div>

            {/* Agreement & Submit */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "flex", gap: "8px", fontSize: "0.78rem", color: "var(--text-muted)", cursor: "pointer", lineHeight: "1.5" }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>{t("checkout.terms_agree")}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeTerms}
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
            >
              {loading ? t("checkout.submitting") : t("checkout.btn_submit")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
