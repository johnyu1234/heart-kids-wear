import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n/I18nContext";

export function Footer() {
  const { t } = useTranslation();

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
            {t("footer.desc")}
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "16px" }}>{t("footer.catalog")}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <Link to="/products?category_id=1">男孩 (Boys)</Link>
            <Link to="/products?category_id=2">女孩 (Girls)</Link>
            <Link to="/products?category_id=3">男寶 (Baby Boys)</Link>
            <Link to="/products?category_id=4">女寶 (Baby Girls)</Link>
            <Link to="/products?category_id=5">配件與周邊 (Accessories)</Link>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "16px" }}>{t("footer.member_service")}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <Link to="/member/orders">{t("member.tab_orders")}</Link>
            <Link to="/member/account">{t("member.tab_account")}</Link>
            <Link to="/member/messages">{t("member.tab_messages")}</Link>
            <Link to="/terms">購物與預購規則 (Terms)</Link>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "16px" }}>{t("footer.social")}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)", fontWeight: "600" }}
            >
              <span style={{ fontSize: "1.2rem" }}>📘</span> Facebook
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)", fontWeight: "600" }}
            >
              <span style={{ fontSize: "1.2rem" }}>📸</span> Instagram
            </a>
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)", fontWeight: "600" }}
            >
              <span style={{ fontSize: "1.2rem" }}>💬</span> LINE
            </a>
          </div>
        </div>
      </div>

      <div className="container" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "20px", textAlign: "center", fontSize: "0.8rem", color: "var(--text-light)" }}>
        {t("footer.rights")}
      </div>
    </footer>
  );
}
