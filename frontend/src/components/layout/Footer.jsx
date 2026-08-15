import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer style={{
      backgroundColor: "#FFFFFF",
      borderTop: "1px solid var(--border-light)",
      padding: "48px 0 24px",
      marginTop: "60px"
    }}>
      <div className="container" style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: "40px",
        marginBottom: "40px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "1.6rem" }}>❤️</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: "800", fontSize: "1.25rem", color: "var(--primary-heart)" }}>
              Heart Kids Wear
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6", maxWidth: "340px" }}>
            心童裝專營英國各大精品與設計師童裝代購與限時預購。100% 英國原廠直送，為寶貝挑選最舒適耐穿的高質感服飾。
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "16px" }}>商品目錄</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <Link to="/products?category_id=1">男孩 (Boys)</Link>
            <Link to="/products?category_id=2">女孩 (Girls)</Link>
            <Link to="/products?category_id=3">男寶 (Baby Boys)</Link>
            <Link to="/products?category_id=4">女寶 (Baby Girls)</Link>
            <Link to="/products?category_id=5">配件與周邊 (Accessories)</Link>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "16px" }}>會員服務</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <Link to="/member/orders">預購進度查詢</Link>
            <Link to="/member/account">收件門市管理</Link>
            <Link to="/member/messages">客服訊息對話</Link>
            <Link to="/terms">購物與預購規則</Link>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "16px" }}>官方社群連結</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)", fontWeight: "600" }}
            >
              <span style={{ fontSize: "1.2rem" }}>📘</span> Facebook 專頁
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)", fontWeight: "600" }}
            >
              <span style={{ fontSize: "1.2rem" }}>📸</span> Instagram (@heartkidswear)
            </a>
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)", fontWeight: "600" }}
            >
              <span style={{ fontSize: "1.2rem" }}>💬</span> LINE 社群
            </a>
          </div>
        </div>
      </div>

      <div className="container" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "20px", textAlign: "center", fontSize: "0.8rem", color: "var(--text-light)" }}>
        © {new Date().getFullYear()} Heart Kids Wear (心童裝). All rights reserved. 7-11 交貨便 / 中華郵政宅配支援。
      </div>
    </footer>
  );
}
