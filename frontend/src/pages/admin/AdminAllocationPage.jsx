import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatDateTime } from "../../utils/currency";
import { SplitSquareVertical, User, Clock, CheckCircle, Package, Search } from "lucide-react";

export function AdminAllocationPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [allocationData, setAllocationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get("/admin/products");
        setProducts(res.data);
        if (res.data.length > 0) {
          setSelectedProductId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function loadAllocation() {
      if (!selectedProductId) return;
      setLoading(true);
      try {
        const res = await api.get(`/admin/orders/allocation/${selectedProductId}`);
        setAllocationData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAllocation();
  }, [selectedProductId]);

  const filteredProducts = products.filter(p =>
    p.name_zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.name_en && p.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="heading-lg">配貨與分貨管理 (Split-Screen Allocation)</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          左側選擇開團商品與尺寸規格，右側依買家送出預購精準時間 (preorder_submitted_at) 依序撮合分貨
        </p>
      </div>

      {/* Product Selection Bar */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "24px", alignItems: "center" }}>
        <div style={{ position: "relative", width: "280px" }}>
          <input
            type="text"
            placeholder="搜尋商品名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: "34px", fontSize: "0.85rem" }}
          />
          <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>

        <select
          value={selectedProductId || ""}
          onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
          className="form-control"
          style={{ flex: 1, fontWeight: "700", fontSize: "0.95rem" }}
        >
          {filteredProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name_zh} ({p.supplier || "英國代購"}) — NT${p.retail_price_twd}
            </option>
          ))}
        </select>
      </div>

      {/* Split Screen Layout */}
      {allocationData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "28px", alignItems: "start" }}>
          {/* Left Column: Variants & Demand Quantities */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
              左側：商品規格與需求量彙整
            </h3>

            <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary-heart)", marginBottom: "4px" }}>
              {allocationData.name_zh}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              原廠供應商：{allocationData.supplier || "英國原廠"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {allocationData.variants?.map((v) => (
                <div
                  key={v.variant_id}
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    padding: "14px 18px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-light)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", fontSize: "1rem" }}>
                      尺寸：{v.size_label}
                    </span>
                    <span className="badge" style={{ backgroundColor: "#FFFFFF", color: "var(--text-main)" }}>
                      貨號 SKU: {v.sku}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginTop: "8px" }}>
                    <span>買家預購總需求：</span>
                    <strong style={{ color: "var(--primary-heart)", fontSize: "1rem" }}>{v.total_ordered_quantity} 件</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    <span>已配貨完成買家數：</span>
                    <span>{v.buyers?.length || 0} 位</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Prioritized Matched Buyers */}
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
              右側：下單時間撮合買家清單 (Prioritized Queue)
            </h3>

            {allocationData.variants?.map((v) => (
              <div key={v.variant_id} style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span className="badge" style={{ backgroundColor: "var(--primary-heart)", color: "#FFFFFF", fontWeight: "700" }}>
                    {v.size_label}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    共 {v.buyers?.length || 0} 筆買家排隊配貨
                  </span>
                </div>

                {v.buyers?.length === 0 ? (
                  <div style={{ fontSize: "0.85rem", color: "var(--text-light)", padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                    此尺寸目前無買家下單
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {v.buyers?.map((buyer, idx) => (
                      <div
                        key={buyer.order_item_id}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-md)",
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: idx === 0 ? "var(--primary-heart)" : "var(--bg-subtle)",
                            color: idx === 0 ? "#FFFFFF" : "var(--text-main)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "800"
                          }}>
                            {idx + 1}
                          </span>

                          <div>
                            <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                              {buyer.member_name} ({buyer.member_code || "新會員"})
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                              <Clock size={12} /> 下單時間：{formatDateTime(buyer.preorder_submitted_at)}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: "800", color: "var(--primary-heart)", fontSize: "0.95rem" }}>
                            {buyer.quantity} 件
                          </div>
                          <span className={`badge ${buyer.payment_status === "PAID" ? "badge-paid" : "badge-pending"}`} style={{ marginTop: "4px" }}>
                            {buyer.payment_status === "PAID" ? "已付款" : "待付款"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
