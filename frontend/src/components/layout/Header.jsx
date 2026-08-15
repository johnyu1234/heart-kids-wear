import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNotification } from "../../context/NotificationContext";
import { useTranslation } from "../../i18n/I18nContext";
import { CartDropdown } from "./CartDropdown";
import { Search, Heart, User, ShoppingBag, Globe, ShieldCheck } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const { cart, isDropdownOpen, setIsDropdownOpen } = useCart();
  const { unreadCount } = useNotification();
  const { lang, changeLanguage, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Top Header Row */}
        <div className="header-main-row">
          {/* Brand Logo */}
          <Link to="/" className="header-brand">
            <span className="brand-icon">❤️</span>
            <div className="brand-text-wrap">
              <div className="brand-title">
                {t("brand.title")}
              </div>
              <div className="brand-subtitle">
                {t("brand.subtitle")}
              </div>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="header-search-desktop">
            <form onSubmit={handleSearch} style={{ position: "relative" }}>
              <input
                type="text"
                placeholder={t("nav.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{
                  borderRadius: "var(--radius-full)",
                  paddingLeft: "38px",
                  paddingRight: "14px",
                  backgroundColor: "var(--bg-subtle)",
                  fontSize: "0.85rem",
                  height: "38px"
                }}
              />
              <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            </form>
          </div>

          {/* Actions & Language Switcher */}
          <div className="header-actions">
            {/* Language Switcher Button */}
            <div className="lang-switcher">
              <button
                onClick={() => changeLanguage("zh")}
                className={`lang-btn ${lang === "zh" ? "active" : ""}`}
              >
                中文
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className={`lang-btn ${lang === "en" ? "active" : ""}`}
              >
                EN
              </button>
            </div>

            {/* Wishlist Icon */}
            <Link
              to={user ? "/member/wishlist" : "/login"}
              className="header-icon-btn"
              title={t("nav.wishlist")}
            >
              <Heart size={20} />
            </Link>

            {/* User Profile / Admin Link (Hidden on mobile if bottom nav exists, or shown as badge) */}
            {user ? (
              <Link
                to={user.is_admin ? "/admin" : "/member/orders"}
                className="header-user-btn"
              >
                {user.is_admin ? (
                  <span className="badge" style={{ backgroundColor: "var(--accent-gold-light)", color: "var(--accent-gold)", gap: "4px", fontSize: "0.75rem", padding: "4px 8px" }}>
                    <ShieldCheck size={13} /> {t("nav.admin_panel")}
                  </span>
                ) : (
                  <>
                    <User size={18} />
                    <span className="user-name-text">
                      {user.full_name}
                    </span>
                  </>
                )}
                {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
              </Link>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm header-login-btn">
                <User size={14} /> <span>{t("nav.login_register")}</span>
              </Link>
            )}

            {/* Cart Icon & Dropdown */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="header-cart-btn"
              >
                <ShoppingBag size={19} style={{ color: "var(--primary-heart)" }} />
                <span className="cart-count-badge">{cart.total_items}</span>
              </button>

              {isDropdownOpen && <CartDropdown onClose={() => setIsDropdownOpen(false)} />}
            </div>
          </div>
        </div>

        {/* Mobile Search Row (Full-width underneath top row on small screens) */}
        <div className="header-mobile-search">
          <form onSubmit={handleSearch} style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder={t("nav.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{
                borderRadius: "var(--radius-full)",
                paddingLeft: "36px",
                paddingRight: "14px",
                backgroundColor: "var(--bg-subtle)",
                fontSize: "0.82rem",
                height: "36px",
                width: "100%"
              }}
            />
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          </form>
        </div>
      </div>
    </header>
  );
}
