import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get("category_id") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentSearch = searchParams.get("search") || "";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products", {
            params: {
              category_id: currentCategory || undefined,
              sort: currentSort || undefined,
              search: currentSearch || undefined,
            },
          }),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentCategory, currentSort, currentSearch]);

  const handleCategoryClick = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (currentCategory === String(catId)) {
      params.delete("category_id");
    } else {
      params.set("category_id", catId);
    }
    setSearchParams(params);
  };

  const handleSortChange = (sortVal) => {
    const params = new URLSearchParams(searchParams);
    if (!sortVal) {
      params.delete("sort");
    } else {
      params.set("sort", sortVal);
    }
    setSearchParams(params);
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      {/* Page Title & Search Term */}
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg" style={{ marginBottom: "8px" }}>
          {currentSearch ? `搜尋「${currentSearch}」的結果` : "全館童裝預購商品"}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          英國原廠精選直送，所有商品皆享滿 NT$4,000 折 NT$60 優惠
        </p>
      </div>

      {/* Filter & Sort Bar */}
      <div style={{
        backgroundColor: "#FFFFFF",
        padding: "16px 20px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-light)",
        marginBottom: "32px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px"
      }}>
        {/* Category Filter Pills (2-Tier) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => handleCategoryClick("")}
            className="btn btn-sm"
            style={{
              backgroundColor: !currentCategory ? "var(--primary-heart)" : "var(--bg-subtle)",
              color: !currentCategory ? "#FFFFFF" : "var(--text-main)",
            }}
          >
            全部商品
          </button>
          {categories.map((cat) => {
            const isSelected = currentCategory === String(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="btn btn-sm"
                style={{
                  backgroundColor: isSelected ? "var(--primary-heart)" : "var(--bg-subtle)",
                  color: isSelected ? "#FFFFFF" : "var(--text-main)",
                }}
              >
                {cat.name_zh}
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ArrowUpDown size={16} style={{ color: "var(--text-muted)" }} />
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="form-control"
            style={{ width: "auto", padding: "6px 12px", fontSize: "0.85rem", borderRadius: "var(--radius-full)" }}
          >
            <option value="">最新上架排序</option>
            <option value="price_asc">價格：由低到高 (NT$)</option>
            <option value="price_desc">價格：由高到低 (NT$)</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          商品載入中...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", backgroundColor: "#FFFFFF", borderRadius: "var(--radius-lg)" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-muted)" }}>查無符合條件的商品</p>
          <button onClick={() => setSearchParams({})} className="btn btn-primary btn-sm" style={{ marginTop: "14px" }}>
            清除篩選條件
          </button>
        </div>
      ) : (
        <div className="grid-4">
          {products.map((prod) => (
            <div key={prod.id} className="card" style={{ padding: "14px", display: "flex", flexDirection: "column" }}>
              <Link to={`/products/${prod.id}`} style={{ position: "relative", display: "block", marginBottom: "12px" }}>
                <img
                  src={prod.images?.[0]?.image_url || "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600"}
                  alt={prod.name_zh}
                  style={{ width: "100%", height: "230px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                />
                <span className="badge" style={{ position: "absolute", top: "8px", left: "8px", backgroundColor: "#FFFFFF" }}>
                  預購
                </span>
              </Link>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Link to={`/products/${prod.id}`} style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)", display: "block", marginBottom: "4px" }}>
                    {prod.name_zh}
                  </Link>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                    {prod.name_en}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--border-light)" }}>
                  <div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                      {formatCurrency(prod.retail_price_twd)}
                    </div>
                  </div>
                  <Link to={`/products/${prod.id}`} className="btn btn-outline btn-sm">
                    選規格
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
