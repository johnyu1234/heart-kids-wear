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
    <header style={{
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid var(--border-light)",
      position: "sticky",
      top: 0,
      zIndex: 800
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "72px"
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.8rem" }}>❤️</span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: "800", fontSize: "1.25rem", color: "var(--primary-heart)", letterSpacing: "-0.5px" }}>
              {t("brand.title")}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "-2px" }}>
              {t("brand.subtitle")}
            </div>
          </div>
        </Link>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: "380px", margin: "0 20px" }}>
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
                fontSize: "0.85rem"
              }}
            />
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          </form>
        </div>

        {/* Actions & Language Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Language Switcher Button */}
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-full)", padding: "3px 6px" }}>
            <Globe size={16} style={{ color: "var(--primary-heart)", marginLeft: "4px", marginRight: "4px" }} />
            <button
              onClick={() => changeLanguage("zh")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: lang === "zh" ? "800" : "500",
                color: lang === "zh" ? "#FFFFFF" : "var(--text-muted)",
                backgroundColor: lang === "zh" ? "var(--primary-heart)" : "transparent",
                borderRadius: "var(--radius-full)",
                transition: "all 0.15s ease"
              }}
            >
              中文
            </button>
            <button
              onClick={() => changeLanguage("en")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: lang === "en" ? "800" : "500",
                color: lang === "en" ? "#FFFFFF" : "var(--text-muted)",
                backgroundColor: lang === "en" ? "var(--primary-heart)" : "transparent",
                borderRadius: "var(--radius-full)",
                transition: "all 0.15s ease"
              }}
            >
              EN
            </button>
          </div>

          {/* Wishlist Icon */}
          <Link
            to={user ? "/member/wishlist" : "/login"}
            style={{ position: "relative", color: "var(--text-main)", padding: "6px" }}
            title={t("nav.wishlist")}
          >
            <Heart size={22} />
          </Link>

          {/* User Profile / Admin Link */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link
                to={user.is_admin ? "/admin" : "/member/orders"}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontWeight: "600", fontSize: "0.9rem" }}
              >
                {user.is_admin ? (
                  <span className="badge" style={{ backgroundColor: "var(--accent-gold-light)", color: "var(--accent-gold)", gap: "4px" }}>
                    <ShieldCheck size={14} /> {t("nav.admin_panel")}
                  </span>
                ) : (
                  <>
                    <User size={22} />
                    <span style={{ maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.full_name}
                    </span>
                  </>
                )}
                {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
              </Link>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">
              <User size={16} /> {t("nav.login_register")}
            </Link>
          )}

          {/* Cart Icon & Dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                position: "relative",
                padding: "8px 12px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-subtle)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-main)"
              }}
            >
              <ShoppingBag size={20} style={{ color: "var(--primary-heart)" }} />
              <span style={{ fontWeight: "700", fontSize: "0.85rem" }}>{cart.total_items}</span>
            </button>

            {isDropdownOpen && <CartDropdown onClose={() => setIsDropdownOpen(false)} />}
          </div>
        </div>
      </div>
    </header>
  );
}
