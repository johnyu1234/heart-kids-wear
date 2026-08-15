import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCurrency, formatDateTime } from "../../utils/currency";
import { useTranslation } from "../../i18n/I18nContext";
import { UIModal } from "../../components/common/UIModal";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plane,
  Truck,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageCircle,
  HelpCircle,
  ShoppingBag,
  ShieldCheck,
  Building2,
  Sparkles,
} from "lucide-react";

const MILESTONE_STEPS = [
  {
    key: "ORDER_SUBMITTED",
    label_zh: "預購已建立",
    label_en: "Order Placed",
    desc_zh: "系統已登記預購明細，待完成付款對帳",
    desc_en: "Pre-order created, awaiting payment verification",
    icon: "📝",
  },
  {
    key: "PAYMENT_CONFIRMED",
    label_zh: "付款確認與對帳",
    label_en: "Payment Confirmed",
    desc_zh: "款項核對無誤，已排入當期英國採購排程",
    desc_en: "Payment reconciled and queued for UK buying",
    icon: "💳",
  },
  {
    key: "ORDERED_UK",
    label_zh: "英國原廠下單",
    label_en: "UK Procured",
    desc_zh: "已向英國品牌專櫃原廠完成下單採購",
    desc_en: "Bulk items purchased from official UK brand",
    icon: "🇬🇧",
  },
  {
    key: "UK_HUB_ARRIVED",
    label_zh: "英國集貨倉到貨",
    label_en: "Arrived at UK Hub",
    desc_zh: "英國集運倉到貨檢驗、點數與裝箱打包",
    desc_en: "Inspected and packed at UK consolidation center",
    icon: "🏢",
  },
  {
    key: "SHIPPED_INTL",
    label_zh: "國際空運直飛",
    label_en: "Intl Air Transit",
    desc_zh: "搭乘國際直飛航班飛往台灣",
    desc_en: "Dispatched via direct air freight to Taiwan",
    icon: "✈️",
  },
  {
    key: "TW_CUSTOMS_CLEARED",
    label_zh: "台灣海關清關",
    label_en: "Customs Cleared",
    desc_zh: "海關順利查驗放行，移交在地物流分裝",
    desc_en: "Import duties and inspection released",
    icon: "🛃",
  },
  {
    key: "DOMESTIC_DISPATCHED",
    label_zh: "台灣在地出貨",
    label_en: "Domestic Dispatched",
    desc_zh: "已交由 7-11 交貨便或中華郵政派送中",
    desc_en: "Handed over to 7-11 or Taiwan Post for delivery",
    icon: "📦",
  },
  {
    key: "DELIVERED",
    label_zh: "買家取件完成",
    label_en: "Order Completed",
    desc_zh: "買家已順利取件，本次預購圓滿完成！",
    desc_en: "Parcel delivered and picked up successfully",
    icon: "🎉",
  },
];

function getStepIndex(status) {
  switch (status) {
    case "ORDER_SUBMITTED":
    case "PAYMENT_REPORTED":
      return 0;
    case "PAYMENT_CONFIRMED":
      return 1;
    case "ORDERED_UK":
      return 2;
    case "UK_HUB_ARRIVED":
      return 3;
    case "SHIPPED_INTL":
      return 4;
    case "TW_CUSTOMS_CLEARED":
      return 5;
    case "DOMESTIC_DISPATCHED":
      return 6;
    case "DELIVERED":
      return 7;
    default:
      return 0;
  }
}

export function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMilestones, setExpandedMilestones] = useState({});
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [last5Digits, setLast5Digits] = useState("");
  const [reporting, setReporting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
  });
  const { lang, t } = useTranslation();

  const loadOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
      if (res.data && res.data.length > 0) {
        setExpandedMilestones((prev) => ({
          ...prev,
          [res.data[0].id]: true,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleMilestone = (orderId) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleReportPayment = async (e) => {
    e.preventDefault();
    if (!last5Digits || last5Digits.trim().length !== 5) {
      setModalConfig({
        isOpen: true,
        title: t("common.notice"),
        message: "請輸入精準 5 位數銀行帳號末 5 碼",
        type: "warning",
      });
      return;
    }

    setReporting(true);
    try {
      await api.post(`/orders/${selectedOrderForPayment.order_number}/report-payment`, {
        last_5_digits: last5Digits.trim(),
      });
      setSelectedOrderForPayment(null);
      setLast5Digits("");
      setModalConfig({
        isOpen: true,
        title: "🎉 回報成功",
        message: "末 5 碼已成功回傳！管理員核帳入帳後將即時為您更新訂單進度。",
        type: "success",
      });
      loadOrders();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: t("common.error_title"),
        message: err.response?.data?.detail || "回報失敗，請稍後再試",
        type: "error",
      });
    } finally {
      setReporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ORDER_SUBMITTED":
        return <span className="badge" style={{ backgroundColor: "#EFF6FF", color: "#2563EB", fontWeight: "700" }}>📝 預購已送出 (Pending Payment)</span>;
      case "PAYMENT_REPORTED":
        return <span className="badge" style={{ backgroundColor: "var(--accent-gold-light)", color: "var(--accent-gold)", fontWeight: "700" }}>⏳ 已回報末5碼 (Auditing)</span>;
      case "PAYMENT_CONFIRMED":
        return <span className="badge" style={{ backgroundColor: "var(--primary-heart-light)", color: "var(--primary-heart)", fontWeight: "700" }}>💳 已付款確認 (Paid)</span>;
      case "ORDERED_UK":
        return <span className="badge" style={{ backgroundColor: "#F3E8FF", color: "#7E22CE", fontWeight: "700" }}>🇬🇧 英國已下單 (UK Ordered)</span>;
      case "UK_HUB_ARRIVED":
        return <span className="badge" style={{ backgroundColor: "#E0E7FF", color: "#3730A3", fontWeight: "700" }}>🏢 英國集運倉到貨 (UK Hub)</span>;
      case "SHIPPED_INTL":
        return <span className="badge" style={{ backgroundColor: "#CFFAFE", color: "#0891B2", fontWeight: "700" }}>✈️ 國際空運中 (Intl Transit)</span>;
      case "TW_CUSTOMS_CLEARED":
        return <span className="badge" style={{ backgroundColor: "#DCFCE7", color: "#166534", fontWeight: "700" }}>🛃 台灣已清關 (Customs Cleared)</span>;
      case "DOMESTIC_DISPATCHED":
        return <span className="badge" style={{ backgroundColor: "var(--accent-mint-light)", color: "var(--accent-mint)", fontWeight: "700" }}>📦 台灣已寄出 (Dispatched)</span>;
      case "DELIVERED":
        return <span className="badge" style={{ backgroundColor: "#F1F5F9", color: "#334155", fontWeight: "700" }}>🎉 買家已取件 (Completed)</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "1rem" }}>載入訂單進度資料中...</div>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>📦</span> {t("member.tab_orders")}
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
            即時追蹤英國專櫃採購、集運倉整單、國際空運直飛與台灣在地出貨狀態
          </p>
        </div>
        <span className="badge" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-main)", fontSize: "0.85rem", padding: "6px 14px" }}>
          共 {orders.length} 筆預購單
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <Package size={56} style={{ color: "var(--border-light)", margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-main)" }}>您目前尚無預購訂單記錄</h3>
          <p style={{ fontSize: "0.9rem", marginBottom: "24px" }}>挑選喜愛的英國有機純棉與設計師童裝，享受單筆滿 NT$4,000 折 60 元優惠！</p>
          <Link to="/products" className="btn btn-primary">
            <ShoppingBag size={18} /> 前往選購童裝
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {orders.map((order) => {
            const currentStepIdx = getStepIndex(order.order_status);
            const isExpanded = !!expandedMilestones[order.id];

            return (
              <div
                key={order.id}
                className="card"
                style={{
                  padding: "0",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                {/* Order Top Ribbon */}
                <div
                  style={{
                    backgroundColor: "#FAF8F5",
                    borderBottom: "1px solid var(--border-light)",
                    padding: "16px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "800", fontSize: "1.25rem", color: "var(--primary-heart)", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                      #{order.order_number}
                    </span>
                    {getStatusBadge(order.order_status)}
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      下單時間：{formatDateTime(order.created_at)}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleMilestone(order.id)}
                    className="btn btn-sm btn-outline"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      padding: "6px 12px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: isExpanded ? "var(--primary-heart-light)" : "#FFFFFF",
                      color: isExpanded ? "var(--primary-heart)" : "var(--text-main)",
                      borderColor: isExpanded ? "var(--primary-heart)" : "var(--border-light)",
                    }}
                  >
                    <span>{isExpanded ? t("member.hide_milestones") : t("member.view_milestones")}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* 2-Column Responsive Layout: Left Skewed Items & Details + Right Summary */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "0",
                  }}
                >
                  {/* Left Section: Ordered Items Table & Recipient Details */}
                  <div style={{ padding: "24px", borderRight: "1px solid var(--border-light)", flex: "1" }}>
                    {/* Items List Table */}
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <ShoppingBag size={16} style={{ color: "var(--primary-heart)" }} />
                        預購商品明細 (Items)
                      </h4>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 14px",
                              backgroundColor: "var(--bg-subtle)",
                              borderRadius: "var(--radius-md)",
                              fontSize: "0.88rem",
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span style={{ fontWeight: "700", color: "var(--text-main)" }}>
                                {lang === "en" && item.product_name_en ? item.product_name_en : item.product_name_zh}
                              </span>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                <span className="badge" style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-light)", padding: "2px 8px" }}>
                                  尺寸：{item.size_label}
                                </span>
                                <span>顏色/樣式：{item.color || "Standard"}</span>
                                <span>數量：× {item.quantity}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: "800", color: "var(--text-main)", fontSize: "0.95rem" }}>
                                {formatCurrency(item.unit_price * item.quantity)}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {formatCurrency(item.unit_price)} / 件
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Recipient Details */}
                    <div style={{ backgroundColor: "#FAF8F5", borderRadius: "var(--radius-md)", padding: "14px 16px", fontSize: "0.84rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "var(--text-main)" }}>
                        <MapPin size={15} style={{ color: "var(--primary-heart)" }} />
                        <span>{t("member.shipping_destination")}：</span>
                        <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                          {order.shipping_method === "711"
                            ? `7-11 ${order.store_name_711 || ""} (店號: ${order.store_number_711 || ""})`
                            : `中華郵政宅配 (${order.postal_address || ""})`}
                        </span>
                      </div>

                      {order.tracking_number && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)" }}>
                          <Truck size={15} style={{ color: "var(--accent-mint)" }} />
                          <span>{t("member.package_tracking")}：</span>
                          <span style={{ color: "var(--primary-heart)", fontWeight: "800", fontFamily: "monospace" }}>
                            {order.tracking_number}
                          </span>
                        </div>
                      )}

                      {order.travel_notes && (
                        <div style={{ color: "var(--accent-gold)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>✈️</span>
                          <span>{t("member.travel_notes_label")}：{order.travel_notes}</span>
                        </div>
                      )}

                      {order.customer_remarks && (
                        <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>💬</span>
                          <span>{t("member.customer_notes_label")}：{order.customer_remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Order Financial Summary & Quick Action Card */}
                  <div
                    style={{
                      padding: "24px",
                      backgroundColor: "#FCFBF9",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minWidth: "300px",
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "16px", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
                        {t("member.order_summary_title")}
                      </h4>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.86rem", marginBottom: "18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                          <span>{t("member.items_subtotal")}</span>
                          <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                            {formatCurrency(order.items?.reduce((sum, it) => sum + it.unit_price * it.quantity, 0) || order.payable_amount)}
                          </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                          <span>{t("member.shipping_fee")}</span>
                          <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                            {order.shipping_fee ? formatCurrency(order.shipping_fee) : "免運費 (Free)"}
                          </span>
                        </div>

                        {order.points_card_id && (
                          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-mint)", fontWeight: "600" }}>
                            <span>{t("member.points_deduction")}</span>
                            <span>-NT$60</span>
                          </div>
                        )}

                        <div style={{ borderTop: "1px dashed var(--border-light)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)" }}>{t("member.final_payable")}</span>
                          <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                            {formatCurrency(order.payable_amount)}
                          </span>
                        </div>
                      </div>

                      {/* Payment Status & Action Button */}
                      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "14px", marginBottom: "16px" }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>付款狀況：</div>
                        {order.payment_status === "UNPAID" ? (
                          <div>
                            <div style={{ color: "#DC2626", fontWeight: "700", fontSize: "0.88rem", marginBottom: "8px" }}>
                              ⚠️ 尚未確認付款 (Pending ATM)
                            </div>
                            <button
                              onClick={() => setSelectedOrderForPayment(order)}
                              className="btn btn-primary btn-sm"
                              style={{ width: "100%", justifyContent: "center", fontWeight: "700" }}
                            >
                              <DollarSign size={15} /> {t("member.report_payment")}
                            </button>
                          </div>
                        ) : order.payment_status === "AUDITING" ? (
                          <div style={{ color: "var(--accent-gold)", fontWeight: "700", fontSize: "0.88rem" }}>
                            ⏳ 末 5 碼對帳中 ({order.last_5_digits || "已回報"})
                          </div>
                        ) : (
                          <div style={{ color: "var(--accent-mint)", fontWeight: "700", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px" }}>
                            <CheckCircle2 size={16} /> 款項已確認入帳 (Paid)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Support Quick Link */}
                    <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", textAlign: "center" }}>
                      <Link
                        to="/member/messages"
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: "600",
                        }}
                      >
                        <MessageCircle size={14} style={{ color: "var(--primary-heart)" }} />
                        <span>{t("member.need_help")} {t("member.chat_with_us")}</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Collapsible Dropdown Milestone Stepper (8 Procurement Stages) */}
                {isExpanded && (
                  <div
                    style={{
                      backgroundColor: "#FAF9F6",
                      borderTop: "1px solid var(--border-light)",
                      padding: "24px",
                      animation: "fadeIn 0.25s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                      <Clock size={18} style={{ color: "var(--primary-heart)" }} />
                      <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                        {t("member.milestones_title")}
                      </h4>
                    </div>

                    {/* Horizontal / Vertical Adaptive Stepper */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "14px",
                      }}
                    >
                      {MILESTONE_STEPS.map((step, idx) => {
                        const isPassed = currentStepIdx >= idx;
                        const isCurrent = currentStepIdx === idx;

                        return (
                          <div
                            key={step.key}
                            style={{
                              backgroundColor: isCurrent ? "var(--primary-heart-light)" : isPassed ? "#FFFFFF" : "#F8FAFC",
                              border: isCurrent
                                ? "2px solid var(--primary-heart)"
                                : isPassed
                                ? "1px solid #CBD5E1"
                                : "1px dashed #E2E8F0",
                              borderRadius: "var(--radius-md)",
                              padding: "14px 12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                              opacity: isPassed ? 1 : 0.6,
                              transition: "all 0.2s ease",
                              boxShadow: isCurrent ? "0 4px 12px rgba(230, 57, 70, 0.15)" : "none",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "1.2rem" }}>{step.icon}</span>
                              {isPassed ? (
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    fontWeight: "800",
                                    backgroundColor: isCurrent ? "var(--primary-heart)" : "#10B981",
                                    color: "#FFFFFF",
                                    padding: "2px 8px",
                                    borderRadius: "var(--radius-full)",
                                  }}
                                >
                                  {isCurrent ? "即時進度中" : "已完成"}
                                </span>
                              ) : (
                                <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>待進行</span>
                              )}
                            </div>

                            <div style={{ fontWeight: "700", fontSize: "0.85rem", color: isCurrent ? "var(--primary-heart)" : "var(--text-main)" }}>
                              {lang === "en" ? step.label_en : step.label_zh}
                            </div>

                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                              {lang === "en" ? step.desc_en : step.desc_zh}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Report Last 5 Digits In-App Modal Dialog */}
      {selectedOrderForPayment && (
        <div className="modal-overlay" onClick={() => setSelectedOrderForPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "8px", color: "var(--text-main)" }}>
              {t("member.report_title")}
            </h3>
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              訂單編號：<strong>#{selectedOrderForPayment.order_number}</strong> ｜ 應付金額：<strong style={{ color: "var(--primary-heart)" }}>{formatCurrency(selectedOrderForPayment.payable_amount)}</strong>
            </p>

            <form onSubmit={handleReportPayment}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label" style={{ fontWeight: "700" }}>{t("member.last_5_label")}</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="例：12345"
                  value={last5Digits}
                  onChange={(e) => setLast5Digits(e.target.value)}
                  className="form-control"
                  style={{ fontSize: "1.3rem", letterSpacing: "6px", textAlign: "center", fontWeight: "700" }}
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

      {/* In-App UI Pop Up Modal */}
      <UIModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
