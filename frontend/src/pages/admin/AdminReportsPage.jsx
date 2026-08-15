import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCurrency, formatDate } from "../../utils/currency";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Package, Calendar } from "lucide-react";

export function AdminReportsPage() {
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/finance/reports", {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="heading-lg">財務與銷售數據報表 (Analytics)</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            包含商品總營收（含運/不含運）、原廠採購成本、營運支出、預估淨利與平均客單價 (AOV)
          </p>
        </div>

        {/* Date Filter */}
        <form onSubmit={handleFilter} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control"
            style={{ fontSize: "0.85rem", padding: "6px 10px" }}
          />
          <span style={{ color: "var(--text-muted)" }}>至</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control"
            style={{ fontSize: "0.85rem", padding: "6px 10px" }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            篩選統計
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          計算報表數據中...
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid-3" style={{ marginBottom: "32px" }}>
            <div className="card" style={{ padding: "24px", borderLeft: "4px solid var(--primary-heart)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>全站總營業額 (含運費)</div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--primary-heart)", margin: "8px 0" }}>
                {formatCurrency(report?.gross_revenue_with_shipping || 0)}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                純商品營收：<strong>{formatCurrency(report?.gross_revenue_without_shipping || 0)}</strong>
              </div>
            </div>

            <div className="card" style={{ padding: "24px", borderLeft: "4px solid var(--accent-mint)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>預估純利潤 (Net Profit)</div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--accent-mint)", margin: "8px 0" }}>
                {formatCurrency(report?.net_profit_twd || 0)}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                扣除採購成本與所有營運支出
              </div>
            </div>

            <div className="card" style={{ padding: "24px", borderLeft: "4px solid var(--accent-gold)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>平均客單價 (AOV)</div>
              <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "var(--text-main)", margin: "8px 0" }}>
                {formatCurrency(report?.average_order_value_aov || 0)}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                累計銷售件數：<strong>{report?.total_items_sold || 0} 件</strong>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "20px" }}>
              財務收支結構明細
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "0.95rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
                <span>有效訂單總筆數</span>
                <strong>{report?.total_orders_count || 0} 筆</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
                <span>商品預購總銷量 (件數)</span>
                <strong>{report?.total_items_sold || 0} 件</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
                <span>英國原廠商品採購成本 (折合 TWD)</span>
                <strong style={{ color: "#E63946" }}>-{formatCurrency(report?.total_procurement_cost_twd || 0)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
                <span>國際空運與營運支出總額 (TWD)</span>
                <strong style={{ color: "#E63946" }}>-{formatCurrency(report?.total_operational_expenses_twd || 0)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", fontSize: "1.25rem", fontWeight: "800", color: "var(--accent-mint)" }}>
                <span>期內結算淨利</span>
                <span>{formatCurrency(report?.net_profit_twd || 0)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
