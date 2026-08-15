import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCurrency, formatDateTime } from "../../utils/currency";
import { MemberSidebar } from "../../components/layout/MemberSidebar";
import { Package, Truck, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";

export function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportingOrderId, setReportingOrderId] = useState(null);
  const [last5Digits, setLast5Digits] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchOrders = async () => {
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
    fetchOrders();
  }, []);

  const handleReportPayment = async (orderId) => {
    if (!last5Digits || last5Digits.length < 4) {
      alert("請輸入匯款末 5 碼");
      return;
    }
    setSubmittingPayment(true);
    try {
      // Send customer message to report payment
      await api.post("/messages/send", {
        content: `【匯款回填通知】訂單 ${reportingOrderId.order_number} 已完成轉帳，帳號末 5 碼：${last5Digits}`
      });
      alert("匯款末 5 碼回填成功！管理員確認後將為您更新訂單狀態。");
      setReportingOrderId(null);
      setLast5Digits("");
    } catch (err) {
      alert("回報失敗，請重試");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return <span className="badge badge-pending">待付款 (3日內)</span>;
      case "PAID":
        return <span className="badge badge-paid">已完成付款</span>;
      case "PROCESSING":
        return <span className="badge badge-in-progress">英國採購與集運中</span>;
      case "SHIPPED_TO_TW":
        return <span className="badge badge-in-progress">國際航班運往台灣</span>;
      case "DELIVERED":
        return <span className="badge badge-registered">已寄出</span>;
      case "ABANDONED":
        return <span className="badge badge-abandoned">逾期棄單已取消</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px" }}>
        {/* Left Sidebar */}
        <MemberSidebar />

        {/* Right Content */}
        <div>
          <h1 className="heading-lg" style={{ marginBottom: "8px" }}>預購進度查詢</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "28px" }}>
            即時追蹤每一筆預購訂單的英國採購、到貨與出貨進度
          </p>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              載入訂單紀錄中...
            </div>
          ) : orders.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <Package size={48} style={{ color: "var(--border-light)", margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>目前沒有預購訂單</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>前往商品目錄挑選喜歡的童裝吧！</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {orders.map((ord) => (
                <div key={ord.id} className="card" style={{ padding: "24px" }}>
                  {/* Order Header */}
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px", marginBottom: "20px", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)" }}>
                          訂單編號：{ord.order_number}
                        </span>
                        {getStatusBadge(ord.status)}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        下單時間：{formatDateTime(ord.created_at)} ｜ 配送方式：{ord.shipping_type === "SEVEN_ELEVEN" ? "7-11 店到店" : "中華郵政宅配"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                        {formatCurrency(ord.total)}
                      </div>
                      {ord.status === "PENDING_PAYMENT" && (
                        <button
                          onClick={() => setReportingOrderId(ord)}
                          className="btn btn-outline btn-sm"
                          style={{ marginTop: "6px" }}
                        >
                          回報匯款末 5 碼
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Travel Notes if Present */}
                  {ord.travel_notes && (
                    <div style={{ backgroundColor: "var(--bg-subtle)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "16px", color: "var(--text-main)" }}>
                      ✈️ <strong>出國請假備註：</strong> {ord.travel_notes}
                    </div>
                  )}

                  {/* Tracking Code if Shipped */}
                  {ord.tracking_code && (
                    <div style={{ backgroundColor: "var(--accent-mint-light)", color: "var(--accent-mint)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.88rem", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Truck size={18} />
                      <span>包裹已出貨！物流追蹤代碼：<strong>{ord.tracking_code}</strong></span>
                    </div>
                  )}

                  {/* Order Items & Milestones */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {ord.items?.map((item) => (
                      <div key={item.id} style={{ display: "flex", gap: "16px", padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                        <img
                          src={item.variant?.product?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=120"}
                          alt={item.variant?.product?.name_zh}
                          style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                        />

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                            {item.variant?.product?.name_zh}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            規格：{item.variant?.size_label} ｜ 數量：{item.quantity} 件 ｜ 單價：{formatCurrency(item.unit_price)}
                          </div>

                          {/* Customer-Visible Milestones */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px", fontSize: "0.8rem" }}>
                            {item.ordered_date_text && (
                              <span className="badge" style={{ backgroundColor: "#FFFFFF", color: "var(--text-main)", border: "1px solid var(--border-light)" }}>
                                英國已下單：{item.ordered_date_text}
                              </span>
                            )}
                            {item.arrival_date_text && (
                              <span className="badge" style={{ backgroundColor: "var(--accent-mint-light)", color: "var(--accent-mint)" }}>
                                英國集貨倉到貨：{item.arrival_date_text}
                              </span>
                            )}
                            {item.preorder_status === "OUT_OF_STOCK" && (
                              <span className="badge badge-out-of-stock">
                                原廠已斷貨 (已全額自動退購物金)
                              </span>
                            )}
                          </div>

                          {/* Customer-Visible Remarks */}
                          {item.customer_remarks && (
                            <div style={{ fontSize: "0.8rem", color: "var(--primary-heart)", marginTop: "6px" }}>
                              💬 管理員備註：{item.customer_remarks}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Reporting Modal */}
      {reportingOrderId && (
        <div className="modal-overlay" onClick={() => setReportingOrderId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>
              回報匯款末 5 碼
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              訂單編號：<strong>{reportingOrderId.order_number}</strong> ｜ 金額：{formatCurrency(reportingOrderId.total)}
            </p>

            <div className="form-group">
              <label className="form-label">您匯款帳號的末 5 碼數字 *</label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="例如：12345"
                value={last5Digits}
                onChange={(e) => setLast5Digits(e.target.value)}
                className="form-control"
                style={{ fontSize: "1.2rem", letterSpacing: "4px", textAlign: "center" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setReportingOrderId(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                取消
              </button>
              <button
                onClick={() => handleReportPayment(reportingOrderId.id)}
                disabled={submittingPayment}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {submittingPayment ? "送出中..." : "確認回傳末 5 碼"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
