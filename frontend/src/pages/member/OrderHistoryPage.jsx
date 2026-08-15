import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/I18nContext";
import { Package, Clock, CheckCircle2, AlertCircle, Plane, Truck, DollarSign, Calendar } from "lucide-react";

export function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [last5Digits, setLast5Digits] = useState("");
  const [reporting, setReporting] = useState(false);
  const { lang, t } = useTranslation();

  const loadOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleReportPayment = async (e) => {
    e.preventDefault();
    if (!last5Digits || last5Digits.length !== 5) {
      alert("請輸入精準 5 碼數字");
      return;
    }

    setReporting(true);
    try {
      await api.post(`/orders/${selectedOrderForPayment.order_number}/report-payment`, {
        last_5_digits: last5Digits,
      });
      alert("末 5 碼已成功回傳，管理員核帳後將更新付款狀態！");
      setSelectedOrderForPayment(null);
      setLast5Digits("");
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.detail || "回報失敗，請稍後再試");
    } finally {
      setReporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ORDER_SUBMITTED":
        return <span className="badge" style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}>預購已送出 (Pending Payment)</span>;
      case "PAYMENT_REPORTED":
        return <span className="badge" style={{ backgroundColor: "var(--accent-gold-light)", color: "var(--accent-gold)" }}>已回報末5碼 (Auditing)</span>;
      case "PAYMENT_CONFIRMED":
        return <span className="badge" style={{ backgroundColor: "var(--primary-heart-light)", color: "var(--primary-heart)" }}>已付款確認 (Paid)</span>;
      case "ORDERED_UK":
        return <span className="badge" style={{ backgroundColor: "#F3E8FF", color: "#7E22CE" }}>🇬🇧 英國已下單 (UK Ordered)</span>;
      case "UK_HUB_ARRIVED":
        return <span className="badge" style={{ backgroundColor: "#E0E7FF", color: "#3730A3" }}>英國集貨倉到貨 (UK Hub)</span>;
      case "SHIPPED_INTL":
        return <span className="badge" style={{ backgroundColor: "#CFFAFE", color: "#0891B2" }}>✈️ 國際空運中 (Intl Transit)</span>;
      case "TW_CUSTOMS_CLEARED":
        return <span className="badge" style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>台灣已清關 (Customs Cleared)</span>;
      case "DOMESTIC_DISPATCHED":
        return <span className="badge" style={{ backgroundColor: "var(--accent-mint-light)", color: "var(--accent-mint)" }}>📦 台灣已寄出 (Dispatched)</span>;
      case "DELIVERED":
        return <span className="badge" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-main)" }}>✅ 買家已收件 (Completed)</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>載入訂單資料中...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: "700" }}>{t("member.tab_orders")}</h2>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>共 {orders.length} 筆預購單</span>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <Package size={48} style={{ color: "var(--border-light)", margin: "0 auto 12px" }} />
          <p>您目前尚無預購訂單記錄</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: "24px" }}>
              {/* Order Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-light)", paddingBottom: "14px", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--primary-heart)" }}>
                      #{order.order_number}
                    </span>
                    {getStatusBadge(order.order_status)}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    下單時間：{new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)" }}>
                    {formatCurrency(order.payable_amount)}
                  </div>
                  {order.payment_status === "UNPAID" && (
                    <button
                      onClick={() => setSelectedOrderForPayment(order)}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: "6px" }}
                    >
                      <DollarSign size={14} /> {t("member.report_payment")}
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                    <div>
                      <span style={{ fontWeight: "600" }}>{lang === "en" && item.product_name_en ? item.product_name_en : item.product_name_zh}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                        ({item.size_label} | {item.color || "Standard"} × {item.quantity})
                      </span>
                    </div>
                    <div style={{ fontWeight: "700" }}>
                      {formatCurrency(item.unit_price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Logistics & Milestones Progress Bar */}
              <div style={{ backgroundColor: "var(--bg-subtle)", padding: "14px 18px", borderRadius: "var(--radius-md)", fontSize: "0.82rem", display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between" }}>
                <div>
                  <strong>配送門市/地址：</strong>
                  {order.shipping_method === "711"
                    ? `7-11 ${order.store_name_711 || ""} (店號: ${order.store_number_711 || ""})`
                    : `中華郵政宅配 (${order.postal_address || ""})`}
                </div>
                {order.tracking_number && (
                  <div>
                    <strong>台灣寄出包裹單號：</strong>
                    <span style={{ color: "var(--primary-heart)", fontWeight: "700" }}>{order.tracking_number}</span>
                  </div>
                )}
                {order.travel_notes && (
                  <div style={{ width: "100%", color: "var(--accent-gold)", fontWeight: "600" }}>
                    ✈️ 出國請假備註：{order.travel_notes}
                  </div>
                )}
                {order.customer_remarks && (
                  <div style={{ width: "100%", color: "var(--text-muted)" }}>
                    💬 買家留言：{order.customer_remarks}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Payment Modal */}
      {selectedOrderForPayment && (
        <div className="modal-overlay" onClick={() => setSelectedOrderForPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>{t("member.report_title")}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              訂單編號：<strong>#{selectedOrderForPayment.order_number}</strong> ｜ 應付：<strong>{formatCurrency(selectedOrderForPayment.payable_amount)}</strong>
            </p>

            <form onSubmit={handleReportPayment}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">{t("member.last_5_label")}</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="例：12345"
                  value={last5Digits}
                  onChange={(e) => setLast5Digits(e.target.value)}
                  className="form-control"
                  style={{ fontSize: "1.2rem", letterSpacing: "4px", textAlign: "center" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPayment(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  {t("member.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {reporting ? "送出中..." : t("member.btn_report_confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
