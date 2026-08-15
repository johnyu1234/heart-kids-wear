import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCurrency, formatDate } from "../../utils/currency";
import {
  Receipt,
  Plus,
  CheckCircle,
  Calculator,
  DollarSign,
  TrendingDown,
  Clock
} from "lucide-react";

export function AdminFinancePage() {
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("PAYMENTS"); // PAYMENTS / EXPENSES
  const [loading, setLoading] = useState(true);

  // Manual Confirmation Modal State
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [manual5Digits, setManual5Digits] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Expense Modal State with Volumetric Freight Formula
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState("INTERNATIONAL_FREIGHT");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expAmountTwd, setExpAmountTwd] = useState("");
  const [expAmountGbp, setExpAmountGbp] = useState("");
  const [expRemarks, setExpRemarks] = useState("");

  // Freight Formula Helper: L * W * H / 5000 * rate
  const [boxLength, setBoxLength] = useState("");
  const [boxWidth, setBoxWidth] = useState("");
  const [boxHeight, setBoxHeight] = useState("");
  const [ratePerKg, setRatePerKg] = useState("250"); // NT$250/kg

  const fetchFinanceData = async () => {
    try {
      const [payRes, expRes] = await Promise.all([
        api.get("/admin/finance/payments"),
        api.get("/admin/finance/expenses")
      ]);
      setPayments(payRes.data);
      setExpenses(expRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Calculate volumetric weight when dimensions change
  useEffect(() => {
    const l = parseFloat(boxLength);
    const w = parseFloat(boxWidth);
    const h = parseFloat(boxHeight);
    const rate = parseFloat(ratePerKg);

    if (l > 0 && w > 0 && h > 0 && rate > 0) {
      const volWeight = (l * w * h) / 5000;
      const calcFee = Math.round(volWeight * rate);
      setExpAmountTwd(String(calcFee));
      setExpRemarks(`材積重算式: (${l}×${w}×${h})/5000 = ${volWeight.toFixed(2)}kg @ NT$${rate}/kg`);
    }
  }, [boxLength, boxWidth, boxHeight, ratePerKg]);

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setConfirming(true);
    try {
      await api.post("/admin/finance/payments/confirm", {
        order_id: confirmOrder.order_id,
        last_5_digits: manual5Digits || confirmOrder.last_5_digits || "手動核銷",
        payment_method: "MANUAL_TRANSFER"
      });
      alert(`訂單款項已確認入帳，訂單狀態已自動更新為 PAID！`);
      setConfirmOrder(null);
      await fetchFinanceData();
    } catch (err) {
      alert("確認失敗");
    } finally {
      setConfirming(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/finance/expenses/add", {
        entry_date: expDate,
        category: expCategory,
        amount_twd: expAmountTwd ? parseFloat(expAmountTwd) : 0,
        amount_gbp: expAmountGbp ? parseFloat(expAmountGbp) : 0,
        remarks: expRemarks || null
      });
      alert("支出記帳已成功儲存！");
      setIsExpenseModalOpen(false);
      setExpAmountTwd("");
      setExpAmountGbp("");
      setExpRemarks("");
      await fetchFinanceData();
    } catch (err) {
      alert("新增支出失敗");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="heading-lg">對帳核銷與運費公式記帳</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            末 5 碼入帳核銷、國際空運材積公式計算（長×寬×高/5000）與國內超商郵局運費帳本
          </p>
        </div>

        <button onClick={() => setIsExpenseModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> 新增支出 / 國際運費記帳
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
        <button
          onClick={() => setActiveSubTab("PAYMENTS")}
          className="btn btn-sm"
          style={{
            backgroundColor: activeSubTab === "PAYMENTS" ? "var(--primary-heart)" : "var(--bg-subtle)",
            color: activeSubTab === "PAYMENTS" ? "#FFFFFF" : "var(--text-main)",
            fontWeight: "700"
          }}
        >
          買家匯款對帳清單 ({payments.length})
        </button>
        <button
          onClick={() => setActiveSubTab("EXPENSES")}
          className="btn btn-sm"
          style={{
            backgroundColor: activeSubTab === "EXPENSES" ? "var(--primary-heart)" : "var(--bg-subtle)",
            color: activeSubTab === "EXPENSES" ? "#FFFFFF" : "var(--text-main)",
            fontWeight: "700"
          }}
        >
          營運支出與運費帳本 ({expenses.length})
        </button>
      </div>

      {/* SubTab 1: Payments Reconciliation */}
      {activeSubTab === "PAYMENTS" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 18px" }}>訂單編號 / 下單時間</th>
                <th style={{ padding: "14px 18px" }}>應付金額 (NT$)</th>
                <th style={{ padding: "14px 18px" }}>付款方式</th>
                <th style={{ padding: "14px 18px" }}>回報末 5 碼</th>
                <th style={{ padding: "14px 18px" }}>核帳狀態</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: "700" }}>訂單 #{p.order_id}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {formatDate(p.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", fontWeight: "800", color: "var(--primary-heart)", fontSize: "1.05rem" }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span className="badge" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-main)" }}>
                      {p.payment_method === "MANUAL_TRANSFER" ? "銀行虛擬/手動轉帳" : p.payment_method}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    {p.last_5_digits ? (
                      <span style={{ fontWeight: "800", fontSize: "1.1rem", letterSpacing: "2px", color: "var(--text-main)" }}>
                        {p.last_5_digits}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-light)" }}>尚未回填</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    {p.status === "CONFIRMED" ? (
                      <span className="badge badge-paid">已確認入帳</span>
                    ) : (
                      <span className="badge badge-pending">待核帳</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    {p.status !== "CONFIRMED" ? (
                      <button
                        onClick={() => { setConfirmOrder(p); setManual5Digits(p.last_5_digits || ""); }}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={14} /> 一鍵核帳
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-mint)", fontWeight: "600" }}>
                        ✓ 核銷完成
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SubTab 2: Expense Ledger */}
      {activeSubTab === "EXPENSES" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "14px 18px" }}>記帳日期</th>
                <th style={{ padding: "14px 18px" }}>支出類別</th>
                <th style={{ padding: "14px 18px" }}>台幣金額 (NT$)</th>
                <th style={{ padding: "14px 18px" }}>英鎊金額 (GBP £)</th>
                <th style={{ padding: "14px 18px" }}>公式備註 / 說明</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "14px 18px", fontWeight: "600" }}>
                    {formatDate(e.entry_date)}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span className="badge" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-main)" }}>
                      {e.category}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px", fontWeight: "800", color: "#E63946" }}>
                    {e.amount_twd > 0 ? `-${formatCurrency(e.amount_twd)}` : "-"}
                  </td>
                  <td style={{ padding: "14px 18px", fontWeight: "600" }}>
                    {e.amount_gbp > 0 ? `£${e.amount_gbp}` : "-"}
                  </td>
                  <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {e.remarks || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Confirm Modal */}
      {confirmOrder && (
        <div className="modal-overlay" onClick={() => setConfirmOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "14px" }}>
              確認買家匯款入帳
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              訂單編號：<strong>#{confirmOrder.order_id}</strong> ｜ 金額：<strong style={{ color: "var(--primary-heart)" }}>{formatCurrency(confirmOrder.amount)}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">核對末 5 碼 (可手動修改確認)</label>
              <input
                type="text"
                placeholder="例如：12345"
                value={manual5Digits}
                onChange={(e) => setManual5Digits(e.target.value)}
                className="form-control"
                style={{ fontSize: "1.2rem", textAlign: "center", letterSpacing: "4px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setConfirmOrder(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                取消
              </button>
              <button onClick={handleConfirmPayment} disabled={confirming} className="btn btn-primary" style={{ flex: 1 }}>
                {confirming ? "確認中..." : "確認入帳"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal with Volumetric Calculator */}
      {isExpenseModalOpen && (
        <div className="modal-overlay" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>新增支出 / 運費記帳</h3>
            <form onSubmit={handleAddExpense}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">支出類別</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="form-control"
                  >
                    <option value="INTERNATIONAL_FREIGHT">國際空運費 (英國→台灣)</option>
                    <option value="LOCAL_SHIPPING">國內宅配/7-11運費</option>
                    <option value="PROCUREMENT_GBP">英國官網採購支出 (GBP)</option>
                    <option value="PACKAGING">包裝耗材/紙箱</option>
                    <option value="OTHER">其他營運雜支</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">記帳日期</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Volumetric Freight Calculator Box */}
              {expCategory === "INTERNATIONAL_FREIGHT" && (
                <div style={{ backgroundColor: "var(--bg-subtle)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", color: "var(--primary-heart)" }}>
                    <Calculator size={16} /> 國際空運材積重計算機 (長×寬×高 / 5000)
                  </div>
                  <div className="grid-4" style={{ gap: "8px" }}>
                    <div>
                      <label className="text-xs">長 (cm)</label>
                      <input type="number" placeholder="40" value={boxLength} onChange={(e) => setBoxLength(e.target.value)} className="form-control" />
                    </div>
                    <div>
                      <label className="text-xs">寬 (cm)</label>
                      <input type="number" placeholder="30" value={boxWidth} onChange={(e) => setBoxWidth(e.target.value)} className="form-control" />
                    </div>
                    <div>
                      <label className="text-xs">高 (cm)</label>
                      <input type="number" placeholder="30" value={boxHeight} onChange={(e) => setBoxHeight(e.target.value)} className="form-control" />
                    </div>
                    <div>
                      <label className="text-xs">每公斤費率</label>
                      <input type="number" value={ratePerKg} onChange={(e) => setRatePerKg(e.target.value)} className="form-control" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">支出台幣金額 (NT$)</label>
                  <input
                    type="number"
                    required
                    placeholder="例如：1800"
                    value={expAmountTwd}
                    onChange={(e) => setExpAmountTwd(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">支出英鎊金額 (GBP £)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="若無請填 0"
                    value={expAmountGbp}
                    onChange={(e) => setExpAmountGbp(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">備註說明</label>
                <input
                  type="text"
                  placeholder="例如：英國 DHL 提單號 #887219"
                  value={expRemarks}
                  onChange={(e) => setExpRemarks(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  儲存支出
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
