import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/currency";
import { ShieldCheck, Truck, AlertTriangle, Sparkles, CheckCircle, ExternalLink } from "lucide-react";

export function CheckoutPage() {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [shippingType, setShippingType] = useState("SEVEN_ELEVEN");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useStoreCredits, setUseStoreCredits] = useState(true);
  const [pointsCards, setPointsCards] = useState([]);
  const [selectedPointsCardId, setSelectedPointsCardId] = useState("");
  const [travelNotes, setTravelNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Custom address input if not using saved
  const [customAddress, setCustomAddress] = useState({
    store_name: "",
    store_number: "",
    recipient_name: "",
    recipient_phone: "",
    full_address: ""
  });

  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function loadData() {
      try {
        const [pointsRes] = await Promise.all([
          api.get("/members/points")
        ]);
        setPointsCards(pointsRes.data);
        if (user.shipping_addresses?.length > 0) {
          setSelectedAddressId(user.shipping_addresses[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [user]);

  // Recalculate fees on discount / shipping change
  useEffect(() => {
    async function recalculate() {
      if (!user) return;
      try {
        setLoading(true);
        const res = await api.post("/checkout/calculate", {
          shipping_type: shippingType,
          use_store_credits: useStoreCredits,
          points_card_id: selectedPointsCardId ? parseInt(selectedPointsCardId) : null
        });
        setCalculation(res.data);
        if (res.data.is_shipping_locked_post && shippingType !== "POST_OFFICE") {
          setShippingType("POST_OFFICE");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    recalculate();
  }, [shippingType, useStoreCredits, selectedPointsCardId]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!agreedToTerms) {
      alert("請勾選同意心童裝預購條款以完成結帳");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/checkout/submit", {
        shipping_type: shippingType,
        shipping_address_id: selectedAddressId || undefined,
        store_name: !selectedAddressId ? customAddress.store_name : undefined,
        store_number: !selectedAddressId ? customAddress.store_number : undefined,
        recipient_name: !selectedAddressId ? customAddress.recipient_name : undefined,
        recipient_phone: !selectedAddressId ? customAddress.recipient_phone : undefined,
        full_address: !selectedAddressId ? customAddress.full_address : undefined,
        use_store_credits: useStoreCredits,
        points_card_id: selectedPointsCardId ? parseInt(selectedPointsCardId) : undefined,
        travel_notes: travelNotes || undefined,
        customer_notes: customerNotes || undefined,
        agreed_to_terms: true
      });
      setSubmittedOrder(res.data);
      await fetchCart();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "送出訂單失敗，請檢查資料");
    } finally {
      setSubmitting(false);
    }
  };

  // If order is completed, show confirmation view
  if (submittedOrder) {
    return (
      <div className="container-sm" style={{ padding: "60px 20px" }}>
        <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "var(--accent-mint-light)", color: "var(--accent-mint)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle size={44} />
          </div>

          <h1 className="heading-lg" style={{ marginBottom: "8px" }}>預購訂單已成功建立！</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", marginBottom: "24px" }}>
            訂單編號：<strong style={{ color: "var(--primary-heart)" }}>{submittedOrder.order_number}</strong>
          </p>

          <div style={{ backgroundColor: "var(--bg-subtle)", padding: "20px", borderRadius: "var(--radius-md)", textAlign: "left", marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>應付總金額：</span>
              <strong style={{ fontSize: "1.2rem", color: "var(--primary-heart)" }}>{formatCurrency(submittedOrder.total)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>付款期限：</span>
              <span>{submittedOrder.payment_deadline ? new Date(submittedOrder.payment_deadline).toLocaleDateString() : "3日內"}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "10px", marginTop: "10px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
              請依系統指示進行轉帳，並於匯款後至會員中心回填末 5 碼。商品抵台後將第一時間為您出貨！
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link to="/member/orders" className="btn btn-primary">
              前往我的訂單進度
            </Link>
            <Link to="/products" className="btn btn-secondary">
              繼續選購
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h1 className="heading-lg" style={{ marginBottom: "28px" }}>確認預購訂單與結帳</h1>

      {errorMsg && (
        <div style={{ backgroundColor: "var(--primary-heart-light)", color: "var(--primary-heart)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "24px", fontWeight: "600" }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "36px" }}>
        {/* Left Column: Shipping & Notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Section 1: Shipping Method */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Truck size={20} style={{ color: "var(--primary-heart)" }} /> 1. 配送方式選擇
            </h3>

            {/* 15 Item Lock Alert */}
            {calculation?.is_shipping_locked_post && (
              <div style={{ backgroundColor: "var(--accent-gold-light)", color: "#9A5B18", padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", fontWeight: "600" }}>
                <AlertTriangle size={18} />
                <span>您的購物車超過 15 件，已由系統自動轉為「中華郵政宅配」(NT$80)。</span>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <label style={{
                flex: 1,
                border: shippingType === "SEVEN_ELEVEN" ? "2px solid var(--primary-heart)" : "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                cursor: calculation?.is_shipping_locked_post ? "not-allowed" : "pointer",
                opacity: calculation?.is_shipping_locked_post ? 0.5 : 1,
                backgroundColor: shippingType === "SEVEN_ELEVEN" ? "var(--primary-heart-light)" : "#FFFFFF"
              }}>
                <input
                  type="radio"
                  name="shippingType"
                  value="SEVEN_ELEVEN"
                  disabled={calculation?.is_shipping_locked_post}
                  checked={shippingType === "SEVEN_ELEVEN"}
                  onChange={() => setShippingType("SEVEN_ELEVEN")}
                  style={{ marginRight: "8px" }}
                />
                <strong>7-11 店到店 (NT$60)</strong>
              </label>

              <label style={{
                flex: 1,
                border: shippingType === "POST_OFFICE" ? "2px solid var(--primary-heart)" : "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                cursor: "pointer",
                backgroundColor: shippingType === "POST_OFFICE" ? "var(--primary-heart-light)" : "#FFFFFF"
              }}>
                <input
                  type="radio"
                  name="shippingType"
                  value="POST_OFFICE"
                  checked={shippingType === "POST_OFFICE"}
                  onChange={() => setShippingType("POST_OFFICE")}
                  style={{ marginRight: "8px" }}
                />
                <strong>中華郵政宅配 (NT$80)</strong>
              </label>
            </div>

            {/* Saved Address Selection */}
            {user.shipping_addresses?.length > 0 && (
              <div>
                <label className="form-label">選擇常用收件門市 / 地址</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {user.shipping_addresses.map((addr) => (
                    <label
                      key={addr.id}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "var(--radius-md)",
                        border: selectedAddressId === addr.id ? "2px solid var(--primary-heart)" : "1px solid var(--border-light)",
                        backgroundColor: selectedAddressId === addr.id ? "var(--bg-subtle)" : "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="radio"
                        name="address_select"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                      <div style={{ fontSize: "0.9rem" }}>
                        <strong>{addr.store_name ? `7-11 ${addr.store_name} (${addr.store_number})` : addr.full_address}</strong>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          收件人：{addr.recipient_name} ｜ {addr.recipient_phone}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Travel Notes & Remarks */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>
              2. 出國請假與備註 (Travel Notes)
            </h3>
            <div className="form-group">
              <label className="form-label">預計出國/不在家日期 (若有請填寫，避免包裹退件)</label>
              <input
                type="text"
                placeholder="例如：預計 5/10 - 5/18 出國，請於 5/19 後再寄出"
                value={travelNotes}
                onChange={(e) => setTravelNotes(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">其他給管理員的備註</label>
              <textarea
                rows={2}
                placeholder="有任何特殊需求請在此註明..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Discounts & Payment Summary */}
        <div>
          <div className="card" style={{ padding: "24px", position: "sticky", top: "96px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
              訂單金額與折抵
            </h3>

            {/* Store Credit Discount */}
            <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={useStoreCredits}
                  onChange={(e) => setUseStoreCredits(e.target.checked)}
                />
                <div>
                  <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>
                    折抵購物金帳戶餘額 (現有: {formatCurrency(user.store_credits)})
                  </div>
                  {calculation?.credits_to_deduct > 0 && (
                    <div style={{ fontSize: "0.8rem", color: "var(--primary-heart)", fontWeight: "600" }}>
                      本次折抵：-{formatCurrency(calculation.credits_to_deduct)}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Points Card Selector */}
            {pointsCards.length > 0 && (
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={14} style={{ color: "var(--accent-gold)" }} /> 使用點數折抵卡
                </label>
                <select
                  value={selectedPointsCardId}
                  onChange={(e) => setSelectedPointsCardId(e.target.value)}
                  className="form-control"
                  style={{ fontSize: "0.88rem" }}
                >
                  <option value="">不使用點數卡</option>
                  {pointsCards.map((pc) => (
                    <option key={pc.id} value={pc.id}>
                      NT${parseInt(pc.remaining)} 點 ({pc.issued_reason || "點數卡"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Calculation Lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "20px 0", fontSize: "0.92rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>商品小計 ({calculation?.total_items || 0} 件)</span>
                <span style={{ fontWeight: "700" }}>{formatCurrency(calculation?.subtotal)}</span>
              </div>

              {calculation?.bulk_discount_applied > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-mint)", fontWeight: "600" }}>
                  <span>滿額折抵優惠</span>
                  <span>-{formatCurrency(calculation.bulk_discount_applied)}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>運費</span>
                <span>{formatCurrency(calculation?.shipping_fee)}</span>
              </div>

              {calculation?.credits_to_deduct > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--primary-heart)", fontWeight: "600" }}>
                  <span>購物金折抵</span>
                  <span>-{formatCurrency(calculation.credits_to_deduct)}</span>
                </div>
              )}

              {calculation?.points_to_deduct > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-gold)", fontWeight: "600" }}>
                  <span>點數卡折抵</span>
                  <span>-{formatCurrency(calculation.points_to_deduct)}</span>
                </div>
              )}

              <div style={{ borderTop: "1.5px solid var(--border-light)", paddingTop: "14px", display: "flex", justifyContent: "space-between", fontSize: "1.3rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                <span>應付總額</span>
                <span>{formatCurrency(calculation?.final_payable_amount)}</span>
              </div>
            </div>

            {/* Rules agreement checkbox */}
            <div style={{ marginBottom: "20px" }}>
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  我已閱讀並同意心童裝<strong>預購規範與退換貨說明</strong>（送出後即登記採購，無法取消修改）。
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
            >
              {submitting ? "建立訂單中..." : "確認送出預購訂單"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
