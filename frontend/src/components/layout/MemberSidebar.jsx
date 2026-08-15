import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/I18nContext";
import { formatCurrency } from "../../utils/currency";
import { Package, User, Heart, MessageSquare, LogOut, Coins, Gift } from "lucide-react";

export function MemberSidebar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { to: "/member/orders", label: t("member.tab_orders"), icon: <Package size={18} /> },
    { to: "/member/account", label: t("member.tab_account"), icon: <User size={18} /> },
    { to: "/member/wishlist", label: t("member.tab_wishlist"), icon: <Heart size={18} /> },
    { to: "/member/messages", label: t("member.tab_messages"), icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="card" style={{ padding: "24px" }}>
      {/* Profile Header */}
      <div style={{ textAlign: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "20px", marginBottom: "20px" }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "var(--primary-heart-light)",
          color: "var(--primary-heart)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          fontWeight: "800",
          margin: "0 auto 10px"
        }}>
          {user?.full_name?.charAt(0) || "心"}
        </div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{user?.full_name}</h3>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
          {t("member.member_id")}：<strong style={{ color: "var(--primary-heart)" }}>{user?.member_id || "2604004"}</strong>
        </div>

        {/* Store Credits & Purchases */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "16px" }}>
          <div style={{ backgroundColor: "var(--bg-subtle)", padding: "8px", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
              <Coins size={12} style={{ color: "var(--accent-gold)" }} /> {t("member.credits_balance")}
            </div>
            <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--primary-heart)" }}>
              {formatCurrency(user?.store_credits)}
            </div>
          </div>
          <div style={{ backgroundColor: "var(--bg-subtle)", padding: "8px", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
              <Gift size={12} style={{ color: "var(--accent-mint)" }} /> {t("member.total_purchases")}
            </div>
            <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--text-main)" }}>
              {user?.total_purchases || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `btn btn-secondary ${isActive ? "active-nav" : ""}`}
            style={({ isActive }) => ({
              justifyContent: "flex-start",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: isActive ? "var(--primary-heart-light)" : "transparent",
              color: isActive ? "var(--primary-heart)" : "var(--text-main)",
              border: "none",
              fontWeight: isActive ? "700" : "500",
            })}
          >
            {item.icon} {item.label}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ justifyContent: "flex-start", padding: "10px 16px", color: "var(--text-muted)", border: "none", marginTop: "12px" }}
        >
          <LogOut size={18} /> {t("nav.logout")}
        </button>
      </div>
    </div>
  );
}
