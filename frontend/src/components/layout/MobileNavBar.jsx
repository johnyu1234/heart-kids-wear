import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, Package, MessageCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNotification } from "../../context/NotificationContext";
import { useTranslation } from "../../i18n/I18nContext";

export function MobileNavBar() {
  const { totalCount } = useCart();
  const { unreadCount } = useNotification();
  const { lang, t } = useTranslation();
  const location = useLocation();

  // Hide mobile bottom nav inside admin panel routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { to: "/", icon: <Home size={20} />, label_zh: "首頁", label_en: "Home", end: true },
    { to: "/products", icon: <ShoppingBag size={20} />, label_zh: "選購", label_en: "Shop" },
    {
      to: "/cart",
      icon: <ShoppingCart size={20} />,
      label_zh: "購物車",
      label_en: "Cart",
      badge: totalCount > 0 ? totalCount : null
    },
    { to: "/member/orders", icon: <Package size={20} />, label_zh: "進度", label_en: "Orders" },
    {
      to: "/member/messages",
      icon: <MessageCircle size={20} />,
      label_zh: "客服",
      label_en: "Chat",
      badge: unreadCount > 0 ? unreadCount : null
    }
  ];

  return (
    <nav className="mobile-nav-bar">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? "active" : ""}`
          }
        >
          <div className="mobile-nav-icon-wrap">
            {item.icon}
            {item.badge !== null && item.badge !== undefined && (
              <span className="mobile-nav-badge">{item.badge}</span>
            )}
          </div>
          <span className="mobile-nav-label">
            {lang === "en" ? item.label_en : item.label_zh}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
