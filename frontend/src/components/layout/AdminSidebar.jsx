import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  LogOut
} from "lucide-react";

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/admin", end: true, label: "1. 儀表板總覽", icon: <LayoutDashboard size={18} /> },
    { to: "/admin/products", label: "2. 商品與規格管理", icon: <PackagePlus size={18} /> },
    { to: "/admin/orders", label: "3. 採購出貨 (4分頁)", icon: <Boxes size={18} /> },
    { to: "/admin/allocation", label: "4. 配貨分貨 (左右分屏)", icon: <SplitSquareVertical size={18} /> },
    { to: "/admin/proxy-order", label: "5. 手動代客下單", icon: <ShoppingCart size={18} /> },
    { to: "/admin/members", label: "6. 會員 CRM 與標籤", icon: <Users size={18} /> },
    { to: "/admin/broadcast", label: "7. 範本群發與推播", icon: <Megaphone size={18} /> },
    { to: "/admin/finance", label: "8. 對帳與運費公式記帳", icon: <Receipt size={18} /> },
    { to: "/admin/reports", label: "9. 財務與銷售報表", icon: <BarChart3 size={18} /> },
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
      {/* Brand Header */}
      <div style={{ padding: "0 12px", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.5rem" }}>❤️</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: "800", fontSize: "1.15rem", color: "var(--primary-heart)" }}>
            Heart Admin
          </span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
          心童裝 ｜ 管理後台系統
        </div>
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
          {user?.full_name} (管理員)
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px" }}>
          {user?.email}
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <LogOut size={16} /> 登出後台
        </button>
      </div>
    </div>
  );
}
