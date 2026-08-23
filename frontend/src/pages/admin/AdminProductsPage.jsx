import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useCategories } from "../../context/CategoriesContext";
import { formatCurrency } from "../../utils/currency";
import { Plus, Archive, RefreshCw, Layers, Upload, Image as ImageIcon, X, CheckCircle2, FileImage, Trash2, Edit3, Loader2, Tag } from "lucide-react";

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const { categories, refreshCategories } = useCategories();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingSizeChart, setUploadingSizeChart] = useState(false);

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
      { size_label: "2-3y", color: "常規", stock_quantity: 10 },
      { size_label: "3-4y", color: "常規", stock_quantity: 10 },
      { size_label: "4-5y", color: "常規", stock_quantity: 10 },
      { size_label: "5-6y", color: "常規", stock_quantity: 10 },
    ]
  });

  // Edit Product Form State
  const [editFormData, setEditFormData] = useState({
    product_id: null,
    name_zh: "",
    name_en: "",
    category_id: "",
    supplier: "Next UK",
    cost_gbp: "",
    retail_price_twd: "",
    description: "",
    size_chart_url: "",
    images: "",
    is_listed: true,
    variants: []
  });

  // Helper inputs for adding a single variant
  const [newSizeLabel, setNewSizeLabel] = useState("");
  const [newColor, setNewColor] = useState("常規");
  const [editNewSizeLabel, setEditNewSizeLabel] = useState("");
  const [editNewColor, setEditNewColor] = useState("常規");

  // New Category Form State
  const [newCatNameZh, setNewCatNameZh] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatParentId, setNewCatParentId] = useState("");

  const fetchProducts = async () => {
    try {
      const prodRes = await api.get("/admin/products");
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEditModal = (product) => {
    const imageUrls = (product.images || []).map(img => img.image_url).join("\n");
    const variantsList = (product.variants || []).map(v => ({
      sku: v.sku || "",
      size_label: v.size_label || "",
      color: v.color || "常規",
      stock_quantity: v.stock_quantity || 0
    }));

    setEditFormData({
      product_id: product.id,
      name_zh: product.name_zh || "",
      name_en: product.name_en || "",
      category_id: product.category_id || "",
      supplier: product.supplier || "",
      cost_gbp: product.cost_gbp || "",
      retail_price_twd: product.retail_price_twd || "",
      description: product.description || "",
      size_chart_url: product.size_chart_url || "",
      images: imageUrls,
      is_listed: product.is_listed !== false,
      variants: variantsList
    });
    setIsEditModalOpen(true);
  };

  const handleFileUpload = async (e, fieldType = "images", isEditMode = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fieldType === "images") setUploadingImage(true);
    else setUploadingSizeChart(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const res = await api.post("/admin/products/upload-image", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        const cdnUrl = res.data.url;
        if (isEditMode) {
          if (fieldType === "images") {
            setEditFormData(prev => ({
              ...prev,
              images: prev.images ? `${prev.images}\n${cdnUrl}` : cdnUrl
            }));
          } else {
            setEditFormData(prev => ({
              ...prev,
              size_chart_url: cdnUrl
            }));
          }
        } else {
          if (fieldType === "images") {
            setFormData(prev => ({
              ...prev,
              images: prev.images ? `${prev.images}\n${cdnUrl}` : cdnUrl
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              size_chart_url: cdnUrl
            }));
          }
        }
      }
    } catch (err) {
      alert("圖片上傳至 Cloudflare R2 失敗，請檢查網路或 Render 設定。");
    } finally {
      setUploadingImage(false);
      setUploadingSizeChart(false);
      e.target.value = "";
    }
  };

  const removeImageUrl = async (urlToRemove, isEditMode = false) => {
    try {
      await api.post("/admin/products/delete-image", { image_url: urlToRemove });
    } catch (e) {
      console.warn("Failed to delete from Cloudflare R2:", e);
    }

    if (isEditMode) {
      const list = editFormData.images
        .split("\n")
        .map(u => u.trim())
        .filter(u => u.length > 0 && u !== urlToRemove);
      setEditFormData({ ...editFormData, images: list.join("\n") });
    } else {
      const list = formData.images
        .split("\n")
        .map(u => u.trim())
        .filter(u => u.length > 0 && u !== urlToRemove);
      setFormData({ ...formData, images: list.join("\n") });
    }
  };

  // Variant management helpers
  const addVariantToCreate = () => {
    if (!newSizeLabel.trim()) return;
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size_label: newSizeLabel.trim(), color: newColor.trim() || "常規", stock_quantity: 0 }]
    }));
    setNewSizeLabel("");
  };

  const removeVariantFromCreate = (idx) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const addVariantToEdit = () => {
    if (!editNewSizeLabel.trim()) return;
    setEditFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size_label: editNewSizeLabel.trim(), color: editNewColor.trim() || "常規", stock_quantity: 0, sku: "" }]
    }));
    setEditNewSizeLabel("");
  };

  const removeVariantFromEdit = (idx) => {
    setEditFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const updateEditVariant = (idx, field, value) => {
    setEditFormData(prev => {
      const updated = [...prev.variants];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, variants: updated };
    });
  };

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

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`確定要永久刪除商品「${product.name_zh}」嗎？此動作將連同其規格貨號一併刪除。`)) {
      return;
    }
    try {
      await api.post("/admin/products/delete", { product_id: product.id });
      alert(`商品「${product.name_zh}」已成功刪除！`);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || "刪除商品失敗");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (formData.variants.length === 0) {
      alert("請至少新增一個尺寸規格！");
      return;
    }

    setIsSubmitting(true);
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
        images: imageList.length > 0 ? imageList : ["https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev/products/tee_boy_classic.jpg"],
        variants: formData.variants
      });
      alert("商品建立成功，已自動生成各尺寸專屬貨號 SKU！");
      setIsImportModalOpen(false);
      setFormData({
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
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || "新增商品失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (editFormData.variants.length === 0) {
      alert("商品必須保留至少一個規格尺寸！");
      return;
    }

    setIsSubmitting(true);
    try {
      const imageList = editFormData.images
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      await api.post("/admin/products/update", {
        product_id: editFormData.product_id,
        name_zh: editFormData.name_zh,
        name_en: editFormData.name_en || null,
        category_id: editFormData.category_id ? parseInt(editFormData.category_id) : null,
        supplier: editFormData.supplier || null,
        cost_gbp: editFormData.cost_gbp ? parseFloat(editFormData.cost_gbp) : null,
        retail_price_twd: parseFloat(editFormData.retail_price_twd),
        description: editFormData.description || null,
        size_chart_url: editFormData.size_chart_url || null,
        is_listed: editFormData.is_listed,
        images: imageList,
        variants: editFormData.variants
      });
      alert("商品與規格 SKU 列表修改儲存成功！");
      setIsEditModalOpen(false);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || "修改商品失敗");
    } finally {
      setIsSubmitting(false);
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
      await refreshCategories();
      await fetchProducts();
    } catch (err) {
      alert("新增分類失敗");
    }
  };

  const imageListPreviews = formData.images
    .split("\n")
    .map(u => u.trim())
    .filter(u => u.length > 0);

  const editImageListPreviews = editFormData.images
    .split("\n")
    .map(u => u.trim())
    .filter(u => u.length > 0);

  return (
    <div>
      {/* Top Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 className="heading-lg">商品與規格管理 (Catalog & SKUs)</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            管理英國直送商品目錄、獨立尺寸 SKU 貨號、英鎊原價、規格增修與一鍵重啟開團
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
                    src={prod.images?.[0]?.image_url || "https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev/products/tee_boy_classic.jpg"}
                    alt={prod.name_zh}
                    style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
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
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "280px" }}>
                    {prod.variants?.map((v) => (
                      <span key={v.id} style={{ fontSize: "0.72rem", backgroundColor: "var(--bg-subtle)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-light)" }}>
                        {v.size_label} ({v.sku})
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  {prod.is_archived ? (
                    <span className="badge" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>已封存</span>
                  ) : (
                    <span className="badge badge-success">開團熱賣中</span>
                  )}
                </td>
                <td style={{ padding: "14px 18px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => openEditModal(prod)}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: "0.8rem", padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
                      title="編輯修改商品與規格"
                    >
                      <Edit3 size={14} /> 修改
                    </button>
                    <button
                      onClick={() => handleArchiveToggle(prod)}
                      className={`btn btn-sm ${prod.is_archived ? "btn-outline" : "btn-secondary"}`}
                      style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                      title={prod.is_archived ? "一鍵重啟" : "封存歸檔"}
                    >
                      {prod.is_archived ? (
                        <><RefreshCw size={14} /> 一鍵重啟</>
                      ) : (
                        <><Archive size={14} /> 封存歸檔</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod)}
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: "0.8rem", padding: "6px 10px", color: "#DC2626", borderColor: "#FCA5A5" }}
                      title="永久刪除此商品"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✏️</span> 修改商品與規格貨號 (Edit Product & SKUs)
              </h3>
              <button disabled={isSubmitting} onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: "700" }}>商品中文名稱 *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name_zh}
                    onChange={(e) => setEditFormData({ ...editFormData, name_zh: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: "700" }}>英文名稱 (選填)</label>
                  <input
                    type="text"
                    value={editFormData.name_en}
                    onChange={(e) => setEditFormData({ ...editFormData, name_en: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: "700" }}>分類</label>
                  <select
                    value={editFormData.category_id}
                    onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
                    className="form-control"
                  >
                    <option value="">選擇分類</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_zh}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: "700" }}>原廠成本 (GBP £)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.cost_gbp}
                    onChange={(e) => setEditFormData({ ...editFormData, cost_gbp: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: "700" }}>預購售價 (NT$) *</label>
                  <input
                    type="number"
                    required
                    value={editFormData.retail_price_twd}
                    onChange={(e) => setEditFormData({ ...editFormData, retail_price_twd: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>供應商名稱</label>
                <input
                  type="text"
                  value={editFormData.supplier}
                  onChange={(e) => setEditFormData({ ...editFormData, supplier: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>商品文案說明</label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="form-control"
                />
              </div>

              {/* 🏷️ Dynamic Variant & SKU Editor */}
              <div className="form-group" style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", marginBottom: "20px" }}>
                <label className="form-label" style={{ fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                  <Tag size={16} style={{ color: "var(--primary-heart)" }} />
                  <span>規格與 SKU 列表管理 (可新增、刪除或修改尺寸規格)</span>
                </label>

                {/* Existing Variants Table */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                  {editFormData.variants.map((v, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", backgroundColor: "#FFFFFF", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                      <div style={{ flex: "1" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>尺寸標籤</span>
                        <input
                          type="text"
                          value={v.size_label}
                          onChange={(e) => updateEditVariant(idx, "size_label", e.target.value)}
                          placeholder="例如: 2-3y"
                          className="form-control"
                          style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div style={{ flex: "1" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>顏色/款式</span>
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => updateEditVariant(idx, "color", e.target.value)}
                          placeholder="常規"
                          className="form-control"
                          style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div style={{ width: "90px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>庫存量</span>
                        <input
                          type="number"
                          value={v.stock_quantity}
                          onChange={(e) => updateEditVariant(idx, "stock_quantity", parseInt(e.target.value) || 0)}
                          className="form-control"
                          style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div style={{ flex: "1.2" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>專屬 SKU 貨號</span>
                        <div style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--primary-heart)", fontWeight: "700", paddingTop: "6px" }}>
                          {v.sku || "(儲存時自動生成)"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariantFromEdit(idx)}
                        className="btn btn-sm btn-outline"
                        style={{ color: "#DC2626", borderColor: "#FCA5A5", padding: "6px 8px", marginTop: "14px" }}
                        title="移除此規格"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Variant Inline Form */}
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", backgroundColor: "#EEF2F6", padding: "10px 12px", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>新增尺寸</span>
                    <input
                      type="text"
                      placeholder="例: 6-7y 或 12-18m"
                      value={editNewSizeLabel}
                      onChange={(e) => setEditNewSizeLabel(e.target.value)}
                      className="form-control"
                      style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>顏色/款式</span>
                    <input
                      type="text"
                      placeholder="常規"
                      value={editNewColor}
                      onChange={(e) => setEditNewColor(e.target.value)}
                      className="form-control"
                      style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addVariantToEdit}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: "7px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Plus size={14} /> 新增此規格
                  </button>
                </div>
              </div>

              {/* Edit Cloudflare R2 Upload Box */}
              <div className="form-group" style={{ backgroundColor: "#FAF8F5", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileImage size={17} style={{ color: "var(--primary-heart)" }} />
                    <span>商品主圖與照片 (Cloudflare R2 直傳)</span>
                  </label>
                  <label
                    className="btn btn-sm btn-primary"
                    style={{ cursor: "pointer", fontSize: "0.82rem", padding: "6px 14px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Upload size={14} /> {uploadingImage ? "正在上傳至 Cloudflare..." : "📤 上傳本機圖檔至 Cloudflare"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      disabled={uploadingImage || isSubmitting}
                      onChange={(e) => handleFileUpload(e, "images", true)}
                    />
                  </label>
                </div>

                {/* Uploaded Thumbnail Gallery */}
                {editImageListPreviews.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {editImageListPreviews.map((url, idx) => (
                      <div key={idx} style={{ position: "relative", width: "70px", height: "70px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "2px solid var(--primary-heart)" }}>
                        <img src={url} alt={`upload-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(url, true)}
                          style={{
                            position: "absolute",
                            top: "2px",
                            right: "2px",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                          }}
                          title="移除此圖片"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  rows={2}
                  value={editFormData.images}
                  onChange={(e) => setEditFormData({ ...editFormData, images: e.target.value })}
                  className="form-control"
                  style={{ fontSize: "0.82rem", fontFamily: "monospace" }}
                />
              </div>

              {/* Edit Size Chart Cloudflare R2 Upload Box */}
              <div className="form-group" style={{ backgroundColor: "#FAF8F5", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: "800", color: "var(--text-main)" }}>
                    尺寸對照表圖檔 (Size Chart)
                  </label>
                  <label
                    className="btn btn-sm btn-outline"
                    style={{ cursor: "pointer", fontSize: "0.82rem", padding: "5px 12px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Upload size={13} /> {uploadingSizeChart ? "上傳中..." : "📤 上傳尺寸表至 Cloudflare"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={uploadingSizeChart || isSubmitting}
                      onChange={(e) => handleFileUpload(e, "size_chart", true)}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={editFormData.size_chart_url}
                  onChange={(e) => setEditFormData({ ...editFormData, size_chart_url: e.target.value })}
                  className="form-control"
                  style={{ fontSize: "0.82rem", fontFamily: "monospace" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" disabled={isSubmitting} onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage || uploadingSizeChart}
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>正在儲存修改...</span>
                    </>
                  ) : (
                    <span>儲存商品與規格修改</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import / Create Product Modal */}
      {isImportModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsImportModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✨</span> 新增商品 / 預購開團
              </h3>
              <button disabled={isSubmitting} onClick={() => setIsImportModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProduct}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: "700" }}>商品中文名稱 *</label>
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
                  <label className="form-label" style={{ fontWeight: "700" }}>英文名稱 (選填)</label>
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
                  <label className="form-label" style={{ fontWeight: "700" }}>分類</label>
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
                  <label className="form-label" style={{ fontWeight: "700" }}>原廠成本 (GBP £)</label>
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
                  <label className="form-label" style={{ fontWeight: "700" }}>預購售價 (NT$) *</label>
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

              {/* Dynamic Variant Manager in Create Modal */}
              <div className="form-group" style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", marginBottom: "20px" }}>
                <label className="form-label" style={{ fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                  <Tag size={16} style={{ color: "var(--primary-heart)" }} />
                  <span>尺寸規格設定 (系統將自動生成專屬 SKU)</span>
                </label>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {formData.variants.map((v, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#FFFFFF", padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", fontSize: "0.85rem", fontWeight: "600" }}>
                      <span>{v.size_label}</span>
                      <button
                        type="button"
                        onClick={() => removeVariantFromCreate(idx)}
                        style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: "0 2px" }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="新增尺寸 (如 6-7y, 12-18m)"
                    value={newSizeLabel}
                    onChange={(e) => setNewSizeLabel(e.target.value)}
                    className="form-control"
                    style={{ maxWidth: "200px", padding: "6px 10px", fontSize: "0.85rem" }}
                  />
                  <button
                    type="button"
                    onClick={addVariantToCreate}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                  >
                    <Plus size={14} /> 加入規格
                  </button>
                </div>
              </div>

              {/* Enhanced Cloudflare R2 Upload Box */}
              <div className="form-group" style={{ backgroundColor: "#FAF8F5", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileImage size={17} style={{ color: "var(--primary-heart)" }} />
                    <span>商品主圖與照片 (Cloudflare R2 直傳)</span>
                  </label>
                  <label
                    className="btn btn-sm btn-primary"
                    style={{ cursor: "pointer", fontSize: "0.82rem", padding: "6px 14px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Upload size={14} /> {uploadingImage ? "正在上傳至 Cloudflare..." : "📤 上傳本機圖檔至 Cloudflare"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      disabled={uploadingImage || isSubmitting}
                      onChange={(e) => handleFileUpload(e, "images", false)}
                    />
                  </label>
                </div>

                {/* Uploaded Thumbnail Gallery */}
                {imageListPreviews.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {imageListPreviews.map((url, idx) => (
                      <div key={idx} style={{ position: "relative", width: "70px", height: "70px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "2px solid var(--primary-heart)" }}>
                        <img src={url} alt={`upload-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => removeImageUrl(url, false)}
                          style={{
                            position: "absolute",
                            top: "2px",
                            right: "2px",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                          }}
                          title="移除此圖片"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  rows={2}
                  placeholder="https://pub-70b8f69ff37f46a4999b9caaabaa9281.r2.dev/... (可點擊右上角直接上傳本機圖檔，或手動貼上網址)"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="form-control"
                  style={{ fontSize: "0.82rem", fontFamily: "monospace" }}
                />
              </div>

              {/* Size Chart Cloudflare R2 Upload Box */}
              <div className="form-group" style={{ backgroundColor: "#FAF8F5", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: "800", color: "var(--text-main)" }}>
                    尺寸對照表圖檔 (Size Chart)
                  </label>
                  <label
                    className="btn btn-sm btn-outline"
                    style={{ cursor: "pointer", fontSize: "0.82rem", padding: "5px 12px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Upload size={13} /> {uploadingSizeChart ? "上傳中..." : "📤 上傳尺寸表至 Cloudflare"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={uploadingSizeChart || isSubmitting}
                      onChange={(e) => handleFileUpload(e, "size_chart", false)}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="https://pub-.../size_chart.jpg (尺寸表圖片網址)"
                  value={formData.size_chart_url}
                  onChange={(e) => setFormData({ ...formData, size_chart_url: e.target.value })}
                  className="form-control"
                  style={{ fontSize: "0.82rem", fontFamily: "monospace" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" disabled={isSubmitting} onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImage || uploadingSizeChart}
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>正在建立商品與 SKU...</span>
                    </>
                  ) : (
                    <span>確認建立商品與 SKU</span>
                  )}
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
