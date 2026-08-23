import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/I18nContext";
import { useCategories } from "../../context/CategoriesContext";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const { categories } = useCategories();
  const [loading, setLoading] = useState(true);
  const { lang, t } = useTranslation();

  const currentCategory = searchParams.get("category_id") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentSearch = searchParams.get("search") || "";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const prodRes = await api.get("/products", {
          params: {
            category_id: currentCategory || undefined,
            sort: currentSort || undefined,
            search: currentSearch || undefined,
          },
        });
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
          {currentSearch ? t("products.title_search", { query: currentSearch }) : t("products.title_all")}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          {t("products.subtitle")}
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
            {t("products.all_items")}
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
                {lang === "en" ? cat.name_en : cat.name_zh}
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
            <option value="">{t("products.sort_latest")}</option>
            <option value="price_asc">{t("products.sort_price_asc")}</option>
            <option value="price_desc">{t("products.sort_price_desc")}</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          {t("products.loading")}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", backgroundColor: "#FFFFFF", borderRadius: "var(--radius-lg)" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-muted)" }}>{t("products.empty")}</p>
          <button onClick={() => setSearchParams({})} className="btn btn-primary btn-sm" style={{ marginTop: "14px" }}>
            {t("products.clear_filter")}
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
                  {t("home.preorder")}
                </span>
              </Link>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Link to={`/products/${prod.id}`} style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)", display: "block", marginBottom: "4px" }}>
                    {lang === "en" && prod.name_en ? prod.name_en : prod.name_zh}
                  </Link>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                    {lang === "en" ? prod.name_zh : prod.name_en}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--border-light)" }}>
                  <div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary-heart)" }}>
                      {formatCurrency(prod.retail_price_twd)}
                    </div>
                  </div>
                  <Link to={`/products/${prod.id}`} className="btn btn-outline btn-sm">
                    {t("home.btn_select_spec")}
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
