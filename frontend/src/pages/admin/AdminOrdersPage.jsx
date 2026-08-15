import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCurrency, formatDateTime } from "../../utils/currency";
import {
  Boxes,
  Truck,
  Edit,
  Tag,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Search,
  Calendar,
  Layers
} from "lucide-react";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL / UNORDERED / UNDELIVERED / UNSHIPPED / IN_PROGRESS
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit Milestone Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    preorder_status: "IN_PROGRESS",
    customer_remarks: "",
    admin_remarks: "",
    ordered_date_text: "",
    arrival_date_text: "",
    defect_description: "",
    box_color_tag: "",
    tracking_code: ""
  });
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders", {
        params: {
          search: search || undefined,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const handleOpenEdit = (item, order) => {
    setEditingItem({ item, order });
    setEditForm({
      preorder_status: item.preorder_status,
      customer_remarks: item.customer_remarks || "",
      admin_remarks: item.admin_remarks || "",
      ordered_date_text: item.ordered_date_text || "",
      arrival_date_text: item.arrival_date_text || "",
      defect_description: item.defect_description || "",
      box_color_tag: item.box_color_tag || "",
      tracking_code: order.tracking_code || ""
    });
  };

  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/orders/items/update-logistics", {
        item_id: editingItem.item.id,
        preorder_status: editForm.preorder_status,
        customer_remarks: editForm.customer_remarks || null,
        admin_remarks: editForm.admin_remarks || null,
        ordered_date_text: editForm.ordered_date_text || null,
        arrival_date_text: editForm.arrival_date_text || null,
        defect_description: editForm.defect_description || null,
        box_color_tag: editForm.box_color_tag || null,
        tracking_code: editForm.tracking_code || null
      });
      alert("物流節點與備註更新成功！");
      setEditingItem(null);
      await fetchOrders();
    } catch (err) {
      alert("更新失敗");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="heading-lg">採購進度與出貨管理 (4 大分頁)</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            管理英國下單日、集貨倉到貨、瑕疵註記、箱號顏色標籤與雙軌備註
          </p>
        </div>

        <div style={{ width: "320px" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="搜尋訂單號、會員姓名、代號或追蹤碼..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: "36px", fontSize: "0.85rem" }}
            />
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          </div>
        </div>
      </div>

      {/* 4 Tabs Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
        {[
          { key: "ALL", label: "全部訂單" },
          { key: "UNORDERED", label: "分頁 1：未訂購 (待向英國下單)" },
          { key: "UNDELIVERED", label: "分頁 2：未到貨 (英國運送中)" },
          { key: "UNSHIPPED", label: "分頁 3：未出貨 (抵台理貨中)" },
          { key: "IN_PROGRESS", label: "分頁 4：處理中 (瑕疵/斷貨處理)" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === tab.key ? "var(--primary-heart)" : "var(--bg-subtle)",
              color: activeTab === tab.key ? "#FFFFFF" : "var(--text-main)",
              fontWeight: "700"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List & Logistics Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {orders.map((ord) => (
          <div key={ord.id} className="card" style={{ padding: "20px" }}>
            {/* Order Meta Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "14px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)" }}>
                  訂單：{ord.order_number}
                </span>
                <span className="badge" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-main)" }}>
                  買家：{ord.member?.full_name} ({ord.member?.member_id || "新買家"})
                </span>
                <span className="badge" style={{ backgroundColor: ord.status === "PAID" ? "var(--accent-mint-light)" : "var(--accent-gold-light)", color: ord.status === "PAID" ? "var(--accent-mint)" : "var(--accent-gold)" }}>
                  狀態：{ord.status}
                </span>
                {ord.shipping_type === "POST_OFFICE" && (
                  <span className="badge" style={{ backgroundColor: "#E8F0FE", color: "#1967D2" }}>
                    中華郵政宅配
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ fontWeight: "800", color: "var(--primary-heart)", fontSize: "1.15rem" }}>
                  {formatCurrency(ord.total)}
                </div>
                {ord.tracking_code && (
                  <span className="badge" style={{ backgroundColor: "var(--accent-mint-light)", color: "var(--accent-mint)" }}>
                    追蹤碼: {ord.tracking_code}
                  </span>
                )}
              </div>
            </div>

            {/* Travel Notes if present */}
            {ord.travel_notes && (
              <div style={{ backgroundColor: "#FFF8E1", padding: "8px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.82rem", marginBottom: "14px", color: "#8D6E63" }}>
                ✈️ <strong>買家出國請假：</strong> {ord.travel_notes}
              </div>
            )}

            {/* Items Table with custom open-text dates & tags */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border-light)" }}>
                    <th style={{ padding: "8px 12px" }}>商品 / 規格 SKU</th>
                    <th style={{ padding: "8px 12px" }}>數量</th>
                    <th style={{ padding: "8px 12px" }}>預購狀態</th>
                    <th style={{ padding: "8px 12px" }}>英國下單日 (例: 2026/06/07(1))</th>
                    <th style={{ padding: "8px 12px" }}>英國到貨日</th>
                    <th style={{ padding: "8px 12px" }}>箱號顏色標籤</th>
                    <th style={{ padding: "8px 12px" }}>雙軌備註 (買家 / 內部)</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {ord.items?.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <img
                          src={item.variant?.product?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=80"}
                          alt="item"
                          style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                        />
                        <div>
                          <div style={{ fontWeight: "700" }}>{item.variant?.product?.name_zh}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {item.variant?.size_label} ｜ {item.variant?.sku}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: "700" }}>{item.quantity} 件</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span className={`badge ${item.preorder_status === "OUT_OF_STOCK" ? "badge-out-of-stock" : "badge-in-progress"}`}>
                          {item.preorder_status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {item.ordered_date_text || <span style={{ color: "var(--text-light)" }}>-</span>}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {item.arrival_date_text || <span style={{ color: "var(--text-light)" }}>-</span>}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {item.box_color_tag ? (
                          <span className="badge" style={{ backgroundColor: "#E3F2FD", color: "#1565C0" }}>
                            {item.box_color_tag}
                          </span>
                        ) : <span style={{ color: "var(--text-light)" }}>-</span>}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: "0.78rem" }}>
                          {item.customer_remarks && <div style={{ color: "var(--primary-heart)" }}>買家看得到：{item.customer_remarks}</div>}
                          {item.admin_remarks && <div style={{ color: "var(--text-muted)" }}>內部專用：{item.admin_remarks}</div>}
                          {!item.customer_remarks && !item.admin_remarks && <span style={{ color: "var(--text-light)" }}>-</span>}
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <button
                          onClick={() => handleOpenEdit(item, ord)}
                          className="btn btn-secondary btn-sm"
                          title="編輯物流節點與備註"
                        >
                          <Edit size={14} /> 編輯節點
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Milestone Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "14px" }}>
              編輯商品物流節點與備註
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "18px" }}>
              {editingItem.item.variant?.product?.name_zh} ({editingItem.item.variant?.size_label})
            </p>

            <form onSubmit={handleSaveMilestone}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">預購狀態</label>
                  <select
                    value={editForm.preorder_status}
                    onChange={(e) => setEditForm({ ...editForm, preorder_status: e.target.value })}
                    className="form-control"
                  >
                    <option value="IN_PROGRESS">處理中 / 採購中 (IN_PROGRESS)</option>
                    <option value="REGISTERED">已登記下單 (REGISTERED)</option>
                    <option value="DEFECTIVE">瑕疵待補購 (DEFECTIVE)</option>
                    <option value="OUT_OF_STOCK">原廠斷貨 (觸發100%全額退購物金)</option>
                    <option value="SHIPPED">已出貨 (SHIPPED)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">箱號顏色標籤 (例: 紅色箱 1號)</label>
                  <input
                    type="text"
                    placeholder="例如：紅箱-01"
                    value={editForm.box_color_tag}
                    onChange={(e) => setEditForm({ ...editForm, box_color_tag: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">英國下單日 (自由格式 YYYY/MM/DD(n))</label>
                  <input
                    type="text"
                    placeholder="例如：2026/06/07(1)"
                    value={editForm.ordered_date_text}
                    onChange={(e) => setEditForm({ ...editForm, ordered_date_text: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">英國到貨日</label>
                  <input
                    type="text"
                    placeholder="例如：2026/06/15"
                    value={editForm.arrival_date_text}
                    onChange={(e) => setEditForm({ ...editForm, arrival_date_text: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">物流單號 (訂單整體追蹤碼)</label>
                <input
                  type="text"
                  placeholder="例如：7-11 寄件碼 / 郵局掛號號碼"
                  value={editForm.tracking_code}
                  onChange={(e) => setEditForm({ ...editForm, tracking_code: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "var(--primary-heart)" }}>
                  買家可見備註 (Customer Remarks)
                </label>
                <input
                  type="text"
                  placeholder="例如：商品預計下週一抵台立即出貨"
                  value={editForm.customer_remarks}
                  onChange={(e) => setEditForm({ ...editForm, customer_remarks: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">管理員內部專用備註 (Admin Remarks - 買家不可見)</label>
                <textarea
                  rows={2}
                  placeholder="例如：向 Next 客服追蹤補寄件..."
                  value={editForm.admin_remarks}
                  onChange={(e) => setEditForm({ ...editForm, admin_remarks: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button type="button" onClick={() => setEditingItem(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                  取消
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                  {saving ? "儲存中..." : "確認更新"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
