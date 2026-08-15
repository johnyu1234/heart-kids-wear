import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/I18nContext";
import {
  Package,
  Boxes,
  SplitSquareVertical,
  Users,
  Megaphone,
  Receipt,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ShoppingCart
} from "lucide-react";

export function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get("/admin/finance/summary");
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const workflows = [
    { title: t("admin.nav_2"), desc: "建立尺寸 SKU、設定英鎊成本 £、一鍵重新開團", to: "/admin/products", icon: <Package size={24} />, color: "#E05D5D" },
    { title: t("admin.nav_3"), desc: "未訂購 / 未到貨 / 未出貨 / 處理中 4 大分頁", to: "/admin/orders", icon: <Boxes size={24} />, color: "#F4A261" },
    { title: t("admin.nav_4"), desc: "左側彙整需求，右側依下單時間排序撮合買家", to: "/admin/allocation", icon: <SplitSquareVertical size={24} />, color: "#2A9D8F" },
    { title: t("admin.nav_5"), desc: "LINE / IG 私訊買家代下預購單", to: "/admin/proxy-order", icon: <ShoppingCart size={24} />, color: "#6366F1" },
    { title: t("admin.nav_6"), desc: "買家代號查詢、標註行為（例：愛遲繳）、黑名單", to: "/admin/members", icon: <Users size={24} />, color: "#8B5CF6" },
    { title: t("admin.nav_7"), desc: "官方範本管理、{{name}} / {{tracking}} 變數推播", to: "/admin/broadcast", icon: <Megaphone size={24} />, color: "#EC4899" },
    { title: t("admin.nav_8"), desc: "末 5 碼對帳核銷、國際空運材積公式記帳", to: "/admin/finance", icon: <Receipt size={24} />, color: "#10B981" },
    { title: t("admin.nav_9"), desc: "含運/不含運營業額、採購成本、期內淨利報表", to: "/admin/reports", icon: <BarChart3 size={24} />, color: "#3B82F6" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg" style={{ marginBottom: "6px" }}>{t("admin.dashboard_title")}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          心童裝 9 步標準化營運流程快速入口與數據儀表板
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "36px" }}>
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "6px" }}>{t("admin.gross_revenue")}</div>
          <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "var(--text-main)" }}>
            {formatCurrency(summary?.gross_revenue_with_shipping || 0)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-light)", marginTop: "4px" }}>
            不含運：{formatCurrency(summary?.gross_revenue_without_shipping || 0)}
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "6px" }}>{t("admin.net_profit")}</div>
          <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "var(--accent-mint)" }}>
            {formatCurrency(summary?.net_profit || 0)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--accent-mint)", marginTop: "4px", display: "flex", alignItems: "center", gap: "2px" }}>
            <TrendingUp size={12} /> 扣除採購與運費支出
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "6px" }}>{t("admin.aov")}</div>
          <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "var(--accent-gold)" }}>
            {formatCurrency(summary?.aov || 0)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-light)", marginTop: "4px" }}>
            總訂單數：{summary?.total_orders || 0} 筆
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "6px" }}>{t("admin.pending_orders")}</div>
          <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "var(--primary-heart)" }}>
            {summary?.pending_orders_count || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-light)", marginTop: "4px" }}>
            待英國採購或待發貨
          </div>
        </div>
      </div>

      {/* 9-Step Operating Workflow Links */}
      <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "18px" }}>9 步標準化營運作業控制台</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {workflows.map((wf, idx) => (
          <Link
            key={idx}
            to={wf.to}
            className="card"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              textDecoration: "none",
              transition: "transform 0.15s ease, box-shadow 0.15s ease"
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              backgroundColor: `${wf.color}15`,
              color: wf.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {wf.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "700", fontSize: "1.05rem", color: "var(--text-main)", marginBottom: "2px" }}>
                {wf.title}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                {wf.desc}
              </div>
            </div>

            <ArrowRight size={18} style={{ color: "var(--text-light)" }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
