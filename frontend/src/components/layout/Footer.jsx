import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n/I18nContext";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "1.6rem" }}>❤️</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: "800", fontSize: "1.25rem", color: "var(--primary-heart)" }}>
              Heart Kids Wear
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: "1.6", maxWidth: "340px" }}>
            {t("footer.desc")}
          </p>
        </div>

        <div className="footer-col">
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "14px", color: "var(--text-main)" }}>
            {t("footer.catalog")}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <Link to="/products?category_id=1">男孩 (Boys)</Link>
            <Link to="/products?category_id=2">女孩 (Girls)</Link>
            <Link to="/products?category_id=3">男寶 (Baby Boys)</Link>
            <Link to="/products?category_id=4">女寶 (Baby Girls)</Link>
            <Link to="/products?category_id=5">配件與周邊 (Accessories)</Link>
          </div>
        </div>

        <div className="footer-col">
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "14px", color: "var(--text-main)" }}>
            {t("footer.member_service")}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <Link to="/member/orders">{t("member.tab_orders")}</Link>
            <Link to="/member/account">{t("member.tab_account")}</Link>
            <Link to="/member/messages">{t("member.tab_messages")}</Link>
            <Link to="/terms">購物與預購規則 (Terms)</Link>
          </div>
        </div>

        <div className="footer-col footer-social-col">
          <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "14px", color: "var(--text-main)" }}>
            {t("footer.social")}
          </h4>
          <div className="footer-social-links">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-fb"
            >
              <span style={{ fontSize: "1.2rem" }}>📘</span> Facebook
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-ig"
            >
              <span style={{ fontSize: "1.2rem" }}>📸</span> Instagram
            </a>
            <a
              href="https://line.me"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-line"
            >
              <span style={{ fontSize: "1.2rem" }}>💬</span> LINE 官方客服
            </a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        {t("footer.rights")}
      </div>
    </footer>
  );
}
