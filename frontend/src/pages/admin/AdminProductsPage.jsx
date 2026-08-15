import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { Plus, Archive, RefreshCw, Edit, Tag, Eye, EyeOff, Layers } from "lucide-react";

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // New Product Form State
  const [formData, setFormData] = useState({
    name_zh: "",
    name_en: "",
    category_id: "",
    supplier: "Next UK",
    cost_gbp: "",
    retail_price_twd: "",
    description: "",
    size_chart_url: "",
    images: "",
    variants: [
      { size_label: "2-3y", color: "常規", stock_quantity: 0 },
      { size_label: "3-4y", color: "常規", stock_quantity: 0 },
      { size_label: "4-5y", color: "常規", stock_quantity: 0 },
      { size_label: "5-6y", color: "常規", stock_quantity: 0 },
    ]
  });

  // New Category Form State
  const [newCatNameZh, setNewCatNameZh] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatParentId, setNewCatParentId] = useState("");

  const fetchProducts = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/admin/products"),
        api.get("/categories")
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleArchiveToggle = async (product) => {
    try {
      if (product.is_archived) {
        await api.post("/admin/products/relaunch", { product_id: product.id });
        alert(`商品「${product.name_zh}」已一鍵重新開團上架！`);
      } else {
        await api.post("/admin/products/archive", { product_id: product.id });
        alert(`商品「${product.name_zh}」已封存！`);
      }
      await fetchProducts();
    } catch (err) {
      alert("操作失敗");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const imageList = formData.images
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      await api.post("/admin/products/import", {
        name_zh: formData.name_zh,
        name_en: formData.name_en || null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        supplier: formData.supplier || null,
        cost_gbp: formData.cost_gbp ? parseFloat(formData.cost_gbp) : null,
        retail_price_twd: parseFloat(formData.retail_price_twd),
        description: formData.description || null,
        size_chart_url: formData.size_chart_url || null,
        images: imageList.length > 0 ? imageList : ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800"],
        variants: formData.variants
      });
      alert("商品建立成功，已自動生成各尺寸專屬貨號 SKU！");
      setIsImportModalOpen(false);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || "新增商品失敗");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/products/categories/create", {
        name_zh: newCatNameZh,
        name_en: newCatNameEn,
        tier_type: newCatParentId ? "AGE_GROUP" : "GENDER_TYPE",
        parent_id: newCatParentId ? parseInt(newCatParentId) : null
      });
      alert("分類新增成功！");
      setIsCategoryModalOpen(false);
      setNewCatNameZh("");
      setNewCatNameEn("");
      await fetchProducts();
    } catch (err) {
      alert("新增分類失敗");
    }
  };

  return (
    <div>
      {/* Top Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">商品與規格管理 (Catalog & SKUs)</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            管理英國直送商品目錄、獨立尺寸 SKU 貨號、英鎊原價與一鍵重啟開團
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-secondary">
            <Layers size={18} /> 新增分類
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> 新增商品 / 開團匯入
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border-light)" }}>
              <th style={{ padding: "14px 18px" }}>商品主圖 / 名稱</th>
              <th style={{ padding: "14px 18px" }}>原廠供應商</th>
              <th style={{ padding: "14px 18px" }}>原價 (GBP)</th>
              <th style={{ padding: "14px 18px" }}>預購售價 (NT$)</th>
              <th style={{ padding: "14px 18px" }}>規格 SKU 列表</th>
              <th style={{ padding: "14px 18px" }}>開團狀態</th>
              <th style={{ padding: "14px 18px", textAlign: "right" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={prod.images?.[0]?.image_url || "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=100"}
                    alt={prod.name_zh}
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                  />
                  <div>
                    <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{prod.name_zh}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{prod.name_en}</div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px", color: "var(--text-muted)" }}>
                  {prod.supplier || "英國代購"}
                </td>
                <td style={{ padding: "14px 18px", fontWeight: "600" }}>
                  £{prod.cost_gbp || "0.00"}
                </td>
                <td style={{ padding: "14px 18px", fontWeight: "800", color: "var(--primary-heart)" }}>
                  {formatCurrency(prod.retail_price_twd)}
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "260px" }}>
                    {prod.variants?.map((v) => (
                      <span key={v.id} style={{ fontSize: "0.72rem", backgroundColor: "var(--bg-subtle)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-light)" }}>
                        {v.size_label} ({v.sku})
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  {prod.is_archived ? (
                    <span className="badge badge-abandoned">已封存</span>
                  ) : (
                    <span className="badge badge-registered">開團預購中</span>
                  )}
                </td>
                <td style={{ padding: "14px 18px", textAlign: "right" }}>
                  <button
                    onClick={() => handleArchiveToggle(prod)}
                    className={`btn btn-sm ${prod.is_archived ? "btn-primary" : "btn-secondary"}`}
                  >
                    {prod.is_archived ? (
                      <>
                        <RefreshCw size={14} /> 一鍵重新開團
                      </>
                    ) : (
                      <>
                        <Archive size={14} /> 封存商品
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Import Product Modal */}
      {isImportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "18px" }}>新增商品 / 預購開團</h3>

            <form onSubmit={handleCreateProduct}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">商品中文名稱 *</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：英倫恐龍印花純棉連身衣"
                    value={formData.name_zh}
                    onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">英文名稱 (選填)</label>
                  <input
                    type="text"
                    placeholder="Dino Cotton Sleepsuit"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">分類</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="form-control"
                  >
                    <option value="">選擇分類</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_zh}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">原廠成本 (GBP £)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="12.50"
                    value={formData.cost_gbp}
                    onChange={(e) => setFormData({ ...formData, cost_gbp: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">預購售價 (NT$) *</label>
                  <input
                    type="number"
                    required
                    placeholder="890"
                    value={formData.retail_price_twd}
                    onChange={(e) => setFormData({ ...formData, retail_price_twd: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">商品圖片網址 (每行一個網址)</label>
                <textarea
                  rows={2}
                  placeholder="https://...jpg"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">尺寸與規格設定 (系統將自動生成專屬 SKU)</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {formData.variants.map((v, i) => (
                    <div key={i} style={{ backgroundColor: "var(--bg-subtle)", padding: "6px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", fontWeight: "600" }}>
                      {v.size_label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button type="button" onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  確認建立商品與 SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {isCategoryModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>新增分類</h3>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label className="form-label">中文分類名稱 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：外套與風衣"
                  value={newCatNameZh}
                  onChange={(e) => setNewCatNameZh(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">英文分類名稱</label>
                <input
                  type="text"
                  placeholder="Jackets & Coats"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">上層分類 (若為頂層請留空)</label>
                <select
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value)}
                  className="form-control"
                >
                  <option value="">(無上層分類 - 頂層分類)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_zh}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
