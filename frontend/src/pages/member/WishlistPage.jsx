import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { MemberSidebar } from "../../components/layout/MemberSidebar";
import { Heart, Trash2, ShoppingBag } from "lucide-react";

export function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      setWishlist(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.post("/wishlist/remove", { product_id: productId });
      await fetchWishlist();
    } catch (err) {
      alert("移除願望清單失敗");
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px" }}>
        <MemberSidebar />

        <div>
          <h1 className="heading-lg" style={{ marginBottom: "8px" }}>願望清單</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "28px" }}>
            已收藏的心儀款式，開團時可一鍵快速加入預購購物車
          </p>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              載入願望清單中...
            </div>
          ) : wishlist.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <Heart size={48} style={{ color: "var(--border-light)", margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>目前沒有收藏任何商品</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>點擊商品卡片上的愛心即可加入願望清單！</p>
            </div>
          ) : (
            <div className="grid-3">
              {wishlist.map((item) => (
                <div key={item.id} className="card" style={{ padding: "14px", display: "flex", flexDirection: "column" }}>
                  <Link to={`/products/${item.product.id}`} style={{ position: "relative", display: "block", marginBottom: "10px" }}>
                    <img
                      src={item.product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"}
                      alt={item.product.name_zh}
                      style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                    />
                  </Link>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <Link to={`/products/${item.product.id}`} style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)", display: "block", marginBottom: "4px" }}>
                        {item.product.name_zh}
                      </Link>
                      <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--primary-heart)", marginBottom: "12px" }}>
                        {formatCurrency(item.product.retail_price_twd)}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link to={`/products/${item.product.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        <ShoppingBag size={14} /> 選擇規格
                      </Link>
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: "var(--text-muted)" }}
                        title="移除收藏"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
