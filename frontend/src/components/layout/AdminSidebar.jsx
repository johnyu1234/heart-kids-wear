import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/I18nContext";
import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  SplitSquareVertical,
  Users,
  Megaphone,
  Receipt,
  BarChart3,
  ShoppingCart,
  LogOut,
  Globe,
  ArrowLeft,
  Store
} from "lucide-react";

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const { lang, changeLanguage, t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/admin", end: true, label: t("admin.nav_1"), icon: <LayoutDashboard size={18} /> },
    { to: "/admin/products", label: t("admin.nav_2"), icon: <PackagePlus size={18} /> },
    { to: "/admin/orders", label: t("admin.nav_3"), icon: <Boxes size={18} /> },
    { to: "/admin/allocation", label: t("admin.nav_4"), icon: <SplitSquareVertical size={18} /> },
    { to: "/admin/proxy-order", label: t("admin.nav_5"), icon: <ShoppingCart size={18} /> },
    { to: "/admin/members", label: t("admin.nav_6"), icon: <Users size={18} /> },
    { to: "/admin/broadcast", label: t("admin.nav_7"), icon: <Megaphone size={18} /> },
    { to: "/admin/finance", label: t("admin.nav_8"), icon: <Receipt size={18} /> },
    { to: "/admin/reports", label: t("admin.nav_9"), icon: <BarChart3 size={18} /> },
  ];

  return (
    <div style={{
      width: "260px",
      backgroundColor: "#FFFFFF",
      borderRight: "1px solid var(--border-light)",
      minHeight: "100vh",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Brand Header with Clickable Heart to return to user view */}
      <div style={{ padding: "0 8px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              cursor: "pointer",
            }}
            title={`${t("admin.back_to_store")} (Storefront)`}
          >
            <span style={{ fontSize: "1.5rem", transition: "transform 0.2s ease" }}>❤️</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: "800", fontSize: "1.15rem", color: "var(--primary-heart)" }}>
              Heart Admin
            </span>
          </Link>

          {/* Language Switcher */}
          <button
            onClick={() => changeLanguage(lang === "zh" ? "en" : "zh")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.75rem",
              fontWeight: "700",
              color: "var(--primary-heart)",
              backgroundColor: "var(--primary-heart-light)",
              padding: "4px 8px",
              borderRadius: "var(--radius-full)",
              border: "none",
              cursor: "pointer"
            }}
            title="Switch Language"
          >
            <Globe size={12} /> {lang === "zh" ? "EN" : "中文"}
          </button>
        </div>

        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", paddingLeft: "4px" }}>
          心童裝 ｜ 管理後台系統
        </div>

        {/* Dedicated Back to Storefront Link */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "0.8rem",
            fontWeight: "700",
            color: "var(--primary-heart)",
            backgroundColor: "var(--primary-heart-light)",
            border: "1px solid rgba(230, 57, 70, 0.2)",
            padding: "6px 12px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            marginTop: "12px",
            transition: "all 0.15s ease",
          }}
          title="返回顧客前台商店瀏覽商品"
        >
          <ArrowLeft size={14} />
          <span>{t("admin.back_to_store")}</span>
        </Link>
      </div>

      {/* Nav Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9rem",
              fontWeight: isActive ? "700" : "500",
              backgroundColor: isActive ? "var(--primary-heart-light)" : "transparent",
              color: isActive ? "var(--primary-heart)" : "var(--text-main)",
              transition: "all 0.15s ease",
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer / Logout */}
      <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px", paddingLeft: "8px", paddingRight: "8px" }}>
        <div style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
          {user?.full_name} (Admin)
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px" }}>
          {user?.email}
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <LogOut size={16} /> {t("admin.logout")}
        </button>
      </div>
    </div>
  );
}
