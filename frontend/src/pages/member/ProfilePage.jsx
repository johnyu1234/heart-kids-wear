import React, { useState, useEffect } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { MemberSidebar } from "../../components/layout/MemberSidebar";
import { formatCurrency, formatDate } from "../../utils/currency";
import { Sparkles, Coins, MapPin, Plus, ExternalLink, Save } from "lucide-react";

export function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [pointsCards, setPointsCards] = useState([]);
  const [formData, setFormData] = useState({
    phone: "",
    contact_address: "",
    fb_handle: "",
    ig_handle: "",
    line_handle: "",
    new_password: ""
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || "",
        contact_address: user.contact_address || "",
        fb_handle: user.fb_handle || "",
        ig_handle: user.ig_handle || "",
        line_handle: user.line_handle || "",
        new_password: ""
      });
    }

    async function loadPoints() {
      try {
        const res = await api.get("/members/points");
        setPointsCards(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadPoints();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      await api.post("/members/profile/update", {
        phone: formData.phone,
        contact_address: formData.contact_address,
        fb_handle: formData.fb_handle,
        ig_handle: formData.ig_handle,
        line_handle: formData.line_handle,
        new_password: formData.new_password || undefined
      });
      await refreshProfile();
      setSuccessMsg("個人資料已成功更新！");
    } catch (err) {
      alert(err.response?.data?.detail || "更新失敗");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px" }}>
        <MemberSidebar />

        <div>
          <h1 className="heading-lg" style={{ marginBottom: "8px" }}>帳號與收件門市管理</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "28px" }}>
            管理您的個人聯絡資料、社群帳號與 7-11 取件門市
          </p>

          {successMsg && (
            <div style={{ backgroundColor: "var(--accent-mint-light)", color: "var(--accent-mint)", padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "20px", fontWeight: "600" }}>
              {successMsg}
            </div>
          )}

          {/* Member ID & Store Credits / Points Banner */}
          <div className="card" style={{ padding: "24px", marginBottom: "28px", backgroundColor: "var(--bg-subtle)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>專屬會員編號</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--primary-heart)", marginTop: "4px" }}>
                  {user?.member_id || "首次下單後產生 (例: 2604004)"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>購物金帳戶餘額 (永久有效)</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
                  {formatCurrency(user?.store_credits)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>有效點數卡張數</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--accent-gold)", marginTop: "4px" }}>
                  {pointsCards.filter(p => !p.is_used).length} 張
                </div>
              </div>
            </div>
          </div>

          {/* Points Card Details if any */}
          {pointsCards.length > 0 && (
            <div className="card" style={{ padding: "24px", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={18} style={{ color: "var(--accent-gold)" }} /> 點數折抵卡明細
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pointsCards.map((pc) => (
                  <div key={pc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                        NT${parseInt(pc.amount)} 點 — {pc.issued_reason || "活動贈點"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        有效期限至：{pc.expiry_date ? formatDate(pc.expiry_date) : "永久有效"} ｜ 剩餘：NT${parseInt(pc.remaining)}
                      </div>
                    </div>
                    <div>
                      {pc.is_used ? (
                        <span className="badge badge-abandoned">已使用完畢</span>
                      ) : (
                        <span className="badge badge-registered">可使用</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Profile Form */}
          <div className="card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "20px" }}>編輯基本資料</h3>

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">真實姓名 (註冊後無法自行修改)</label>
                  <input
                    type="text"
                    disabled
                    value={user?.full_name || ""}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">電子信箱 (帳號)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">手機號碼</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">修改密碼 (若不修改請留空)</label>
                  <input
                    type="password"
                    placeholder="輸入新密碼"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">通訊地址</label>
                <input
                  type="text"
                  value={formData.contact_address}
                  onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="grid-3" style={{ marginTop: "16px" }}>
                <div className="form-group">
                  <label className="form-label">FB 名稱</label>
                  <input
                    type="text"
                    value={formData.fb_handle}
                    onChange={(e) => setFormData({ ...formData, fb_handle: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IG 帳號</label>
                  <input
                    type="text"
                    value={formData.ig_handle}
                    onChange={(e) => setFormData({ ...formData, ig_handle: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LINE 暱稱</label>
                  <input
                    type="text"
                    value={formData.line_handle}
                    onChange={(e) => setFormData({ ...formData, line_handle: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: "12px" }}>
                <Save size={16} /> {saving ? "儲存中..." : "儲存資料變更"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
