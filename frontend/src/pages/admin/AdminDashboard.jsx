import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  Boxes,
  Users,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [reportRes, ordersRes] = await Promise.all([
          api.get("/admin/finance/reports"),
          api.get("/admin/orders")
        ]);
        setReport(reportRes.data);
        const pending = ordersRes.data.filter(o => o.status === "PENDING_PAYMENT" || o.status === "PAID").length;
        setPendingOrdersCount(pending);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="heading-lg">管理後台總覽 (Dashboard)</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          即時營運指標、預購採購進度與快速工作流入口
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: "32px" }}>
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>全站總營業額 (含運)</span>
            <DollarSign size={20} style={{ color: "var(--primary-heart)" }} />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--primary-heart)" }}>
            {formatCurrency(report?.gross_revenue_with_shipping || 0)}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            純商品營收：{formatCurrency(report?.gross_revenue_without_shipping || 0)}
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>預估純利潤 (TWD)</span>
            <TrendingUp size={20} style={{ color: "var(--accent-mint)" }} />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--accent-mint)" }}>
            {formatCurrency(report?.net_profit_twd || 0)}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            扣除採購原價 & 營運運費
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>平均客單價 (AOV)</span>
            <ShoppingBag size={20} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)" }}>
            {formatCurrency(report?.average_order_value_aov || 0)}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            累計有效訂單：{report?.total_orders_count || 0} 筆
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>待處理/採購訂單</span>
            <Clock size={20} style={{ color: "#E63946" }} />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#E63946" }}>
            {pendingOrdersCount} 筆
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            包含待付款與待採購訂單
          </div>
        </div>
      </div>

      {/* Quick Flow Shortcuts */}
      <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "16px" }}>9 步驟標準作業流程</h3>
      <div className="grid-3" style={{ marginBottom: "36px" }}>
        <Link to="/admin/orders" className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", backgroundColor: "var(--primary-heart-light)", color: "var(--primary-heart)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Boxes size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", fontSize: "1rem" }}>採購與出貨 4 大分頁</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>未訂購 / 未到貨 / 未出貨 / 處理中</div>
          </div>
          <ArrowRight size={18} style={{ color: "var(--text-light)" }} />
        </Link>

        <Link to="/admin/allocation" className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-mint-light)", color: "var(--accent-mint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShoppingBag size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", fontSize: "1rem" }}>左右分屏配貨分貨</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>依下單精準時間撮合買家配貨</div>
          </div>
          <ArrowRight size={18} style={{ color: "var(--text-light)" }} />
        </Link>

        <Link to="/admin/finance" className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-gold-light)", color: "var(--accent-gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", fontSize: "1rem" }}>末5碼核帳與運費記帳</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>長寬高材積公式與收支帳本</div>
          </div>
          <ArrowRight size={18} style={{ color: "var(--text-light)" }} />
        </Link>
      </div>
    </div>
  );
}
