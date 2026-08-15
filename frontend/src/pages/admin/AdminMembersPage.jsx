import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { formatCurrency, formatDate } from "../../utils/currency";
import {
  Users,
  Search,
  Tag,
  ShieldAlert,
  Gift,
  Plus,
  Calendar,
  Clock,
  Coins
} from "lucide-react";

export function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Issue Points Modal
  const [selectedMember, setSelectedMember] = useState(null);
  const [pointsAmount, setPointsAmount] = useState("60");
  const [pointsReason, setPointsReason] = useState("特別補償/活動贈送");
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

  // Edit Remarks / Tagging Modal
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await api.get("/admin/members", {
        params: { search: search || undefined }
      });
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const handleOpenRemarks = (m) => {
    setSelectedMember(m);
    setAdminRemarks(m.admin_remarks || "");
    setIsBlacklisted(m.is_blacklisted || false);
    setIsRemarksModalOpen(true);
  };

  const handleSaveRemarks = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/members/update-remarks", {
        member_id: selectedMember.id,
        admin_remarks: adminRemarks,
        is_blacklisted: isBlacklisted
      });
      alert("會員標籤與黑名單狀態已更新！");
      setIsRemarksModalOpen(false);
      await fetchMembers();
    } catch (err) {
      alert("更新失敗");
    }
  };

  const handleIssuePoints = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/members/issue-points", {
        member_id: selectedMember.id,
        amount: parseFloat(pointsAmount),
        reason: pointsReason
      });
      alert(`已成功發放 NT$${pointsAmount} 點數卡給 ${selectedMember.full_name}！`);
      setIsPointsModalOpen(false);
      await fetchMembers();
    } catch (err) {
      alert("發放點數失敗");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="heading-lg">會員 CRM 與行為標籤管理</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            查詢買家代號（例: 2604004）、購物金餘額、逾期次數、行為註記與手動贈點
          </p>
        </div>

        <div style={{ width: "320px" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="搜尋姓名、會員編號 (2604004) 或手機..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: "36px", fontSize: "0.85rem" }}
            />
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border-light)" }}>
              <th style={{ padding: "14px 18px" }}>會員姓名 / 代號</th>
              <th style={{ padding: "14px 18px" }}>聯絡電話 / 信箱</th>
              <th style={{ padding: "14px 18px" }}>常用 7-11 門市</th>
              <th style={{ padding: "14px 18px" }}>購物金餘額</th>
              <th style={{ padding: "14px 18px" }}>逾期/棄單次數</th>
              <th style={{ padding: "14px 18px" }}>管理員行為標籤 (Remarks)</th>
              <th style={{ padding: "14px 18px", textAlign: "right" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontWeight: "700", color: "var(--text-main)" }}>
                    {m.full_name} {m.is_blacklisted && <span className="badge badge-out-of-stock">黑名單</span>}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--primary-heart)", fontWeight: "700" }}>
                    ID: {m.member_id || "未生成"}
                  </div>
                </td>
                <td style={{ padding: "14px 18px", fontSize: "0.85rem" }}>
                  <div>{m.phone}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{m.email}</div>
                </td>
                <td style={{ padding: "14px 18px", fontSize: "0.85rem" }}>
                  {m.shipping_addresses?.[0] ? (
                    <div>7-11 {m.shipping_addresses[0].store_name} ({m.shipping_addresses[0].store_number})</div>
                  ) : <span style={{ color: "var(--text-light)" }}>-</span>}
                </td>
                <td style={{ padding: "14px 18px", fontWeight: "800", color: "var(--primary-heart)" }}>
                  {formatCurrency(m.store_credits)}
                </td>
                <td style={{ padding: "14px 18px" }}>
                  {m.overdue_count > 0 ? (
                    <span className="badge badge-out-of-stock">{m.overdue_count} 次逾期</span>
                  ) : (
                    <span className="badge badge-registered">良好 (0次)</span>
                  )}
                </td>
                <td style={{ padding: "14px 18px" }}>
                  {m.admin_remarks ? (
                    <span className="badge" style={{ backgroundColor: "#FFF3E0", color: "#E65100", fontWeight: "700" }}>
                      🏷️ {m.admin_remarks}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-light)", fontSize: "0.8rem" }}>無標籤</span>
                  )}
                </td>
                <td style={{ padding: "14px 18px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleOpenRemarks(m)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Tag size={14} /> 標籤/狀態
                    </button>
                    <button
                      onClick={() => { setSelectedMember(m); setIsPointsModalOpen(true); }}
                      className="btn btn-outline btn-sm"
                    >
                      <Gift size={14} /> 發點數卡
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Remarks / Blacklist Modal */}
      {isRemarksModalOpen && selectedMember && (
        <div className="modal-overlay" onClick={() => setIsRemarksModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "14px" }}>
              編輯會員標籤 — {selectedMember.full_name}
            </h3>
            <form onSubmit={handleSaveRemarks}>
              <div className="form-group">
                <label className="form-label">管理員備註 / 行為標籤 (例如：愛遲繳、VIP老顧客、指定郵局)</label>
                <input
                  type="text"
                  placeholder="輸入行為標籤..."
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isBlacklisted}
                    onChange={(e) => setIsBlacklisted(e.target.checked)}
                  />
                  <span style={{ color: "#E63946", fontWeight: "700" }}>
                    加入黑名單 (多次惡意棄單限制下單)
                  </span>
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button type="button" onClick={() => setIsRemarksModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  儲存標籤
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Points Modal */}
      {isPointsModalOpen && selectedMember && (
        <div className="modal-overlay" onClick={() => setIsPointsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "14px" }}>
              發放專屬點數卡 — {selectedMember.full_name}
            </h3>
            <form onSubmit={handleIssuePoints}>
              <div className="form-group">
                <label className="form-label">點數面額 (點數 NT$)</label>
                <input
                  type="number"
                  required
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">發放事由</label>
                <input
                  type="text"
                  required
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button type="button" onClick={() => setIsPointsModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  確認贈送點數
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
