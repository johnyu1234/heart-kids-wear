import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { ShoppingCart, Plus, Trash2, User, Search, CheckCircle } from "lucide-react";

export function AdminProxyOrderPage() {
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [shippingType, setShippingType] = useState("SEVEN_ELEVEN");
  const [customerNotes, setCustomerNotes] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [memRes, prodRes] = await Promise.all([
          api.get("/admin/members"),
          api.get("/admin/products")
        ]);
        setMembers(memRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleAddItem = (variantId) => {
    const existing = orderItems.find(it => it.variant_id === variantId);
    if (existing) {
      setOrderItems(orderItems.map(it => it.variant_id === variantId ? { ...it, quantity: it.quantity + 1 } : it));
    } else {
      setOrderItems([...orderItems, { variant_id: variantId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (variantId) => {
    setOrderItems(orderItems.filter(it => it.variant_id !== variantId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) {
      alert("請選擇買家會員");
      return;
    }
    if (orderItems.length === 0) {
      alert("請至少加入一項商品規格");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/admin/orders/create-for-customer", {
        member_id: parseInt(selectedMemberId),
        shipping_type: shippingType,
        customer_notes: customerNotes || "管理員手動代客登記下單",
        items: orderItems
      });
      setSuccessOrder(res.data);
      setOrderItems([]);
      alert(`代客下單成功！訂單編號：${res.data.order_number}`);
    } catch (err) {
      alert(err.response?.data?.detail || "下單失敗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="heading-lg">手動代客下單 (Proxy Order Placement)</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          管理員為透過 LINE / IG 留言的買家快速代為建立預購訂單與指定規格
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "32px" }}>
        {/* Left Column: Select Member & Browse Catalog */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Member Selection */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={18} style={{ color: "var(--primary-heart)" }} /> 1. 選擇買家帳號
            </h3>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="form-control"
              style={{ fontSize: "0.95rem", fontWeight: "600" }}
            >
              <option value="">-- 請選擇會員 (姓名 / 會員編號 / 信箱) --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_id || "未有編號"}) ｜ {m.email} ｜ 購物金: NT${parseInt(m.store_credits)}
                </option>
              ))}
            </select>
          </div>

          {/* Product Catalog Picker */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "14px" }}>
              2. 選擇開團商品與尺寸加入
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "460px", overflowY: "auto" }}>
              {products.map((prod) => (
                <div key={prod.id} style={{ display: "flex", gap: "14px", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", alignItems: "center" }}>
                  <img
                    src={prod.images?.[0]?.image_url || "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=100"}
                    alt={prod.name_zh}
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{prod.name_zh}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--primary-heart)", fontWeight: "800" }}>
                      {formatCurrency(prod.retail_price_twd)}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                      {prod.variants?.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleAddItem(v.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                        >
                          + {v.size_label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Submit */}
        <div>
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
              已選代購項目清單 ({orderItems.reduce((acc, it) => acc + it.quantity, 0)} 件)
            </h3>

            {orderItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                請從左側點選「+ 尺寸」加入商品
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {orderItems.map((item) => {
                  let variantObj = null;
                  for (const p of products) {
                    const match = p.variants?.find(v => v.id === item.variant_id);
                    if (match) {
                      variantObj = { ...match, product: p };
                      break;
                    }
                  }
                  return (
                    <div key={item.variant_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-subtle)", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>
                          {variantObj?.product?.name_zh}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          尺寸: {variantObj?.size_label} ｜ 數量: {item.quantity} 件
                        </div>
                      </div>
                      <button onClick={() => handleRemoveItem(item.variant_id)} style={{ color: "var(--text-light)", padding: "4px" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">配送方式</label>
              <select
                value={shippingType}
                onChange={(e) => setShippingType(e.target.value)}
                className="form-control"
              >
                <option value="SEVEN_ELEVEN">7-11 店到店 (NT$60)</option>
                <option value="POST_OFFICE">中華郵政宅配 (NT$80)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">訂單內部備註</label>
              <input
                type="text"
                placeholder="例如：買家於 LINE 私訊要求追加"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="form-control"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || orderItems.length === 0}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "12px" }}
            >
              {submitting ? "建立訂單中..." : "建立代客預購訂單"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
