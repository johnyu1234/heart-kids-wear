import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ExternalLink, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    date_of_birth: "",
    phone: "",
    contact_address: "",
    store_name: "",
    store_number: "",
    recipient_name: "",
    recipient_phone: "",
    marketing_source: "FB",
    fb_handle: "",
    ig_handle: "",
    line_handle: "",
    agreed_to_rules: false
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("兩次輸入的密碼不一致");
      return;
    }

    if (!formData.agreed_to_rules) {
      setIsRulesModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth || null,
        phone: formData.phone,
        contact_address: formData.contact_address,
        store_name: formData.store_name,
        store_number: formData.store_number,
        recipient_name: formData.recipient_name || formData.full_name,
        recipient_phone: formData.recipient_phone || formData.phone,
        marketing_source: formData.marketing_source,
        fb_handle: formData.fb_handle,
        ig_handle: formData.ig_handle,
        line_handle: formData.line_handle,
        agreed_to_rules: formData.agreed_to_rules
      });
      navigate("/member/orders");
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "註冊失敗，請檢查資料");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="card" style={{ maxWidth: "680px", margin: "0 auto", padding: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "2.2rem" }}>❤️</span>
          <h1 className="heading-lg" style={{ marginTop: "8px" }}>註冊心童裝會員</h1>
          <div className="badge" style={{ backgroundColor: "var(--accent-gold-light)", color: "var(--accent-gold)", marginTop: "8px", fontSize: "0.85rem" }}>
            <Sparkles size={14} /> 註冊即贈送 60 點 (= 7-11 免運費折抵)
          </div>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: "var(--primary-heart-light)",
            color: "var(--primary-heart)",
            padding: "12px",
            borderRadius: "var(--radius-md)",
            fontSize: "0.88rem",
            marginBottom: "20px",
            fontWeight: "600"
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <h3 style={{ fontSize: "1.05rem", fontWeight: "700", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", marginBottom: "16px" }}>
            1. 基本會員資料
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">真實中文姓名 (需與證件相符) *</label>
              <input
                type="text"
                required
                name="full_name"
                placeholder="例如：王小美"
                value={formData.full_name}
                onChange={handleChange}
                className="form-control"
              />
              <span className="text-xs text-muted">註冊後無法自行修改</span>
            </div>

            <div className="form-group">
              <label className="form-label">出生年月日 (西元)</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">電子信箱 (Email) *</label>
              <input
                type="email"
                required
                name="email"
                placeholder="user@example.com (不分大小寫)"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">手機號碼 (Phone) *</label>
              <input
                type="tel"
                required
                name="phone"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">設定密碼 (至少6碼) *</label>
              <input
                type="password"
                required
                name="password"
                placeholder="請輸入密碼"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">確認密碼 *</label>
              <input
                type="password"
                required
                name="confirmPassword"
                placeholder="再次輸入密碼"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">聯絡通訊地址 (備用)</label>
            <input
              type="text"
              name="contact_address"
              placeholder="例如：台北市信義區..."
              value={formData.contact_address}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          {/* Section 2: 7-11 Store Info */}
          <div style={{ marginTop: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "700" }}>
                2. 預設 7-11 取件門市
              </h3>
              <a
                href="https://emap.pcsc.com.tw/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.85rem", color: "var(--primary-heart)", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}
              >
                查詢 7-11 門市代號 <ExternalLink size={14} />
              </a>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">7-11 門市名稱 *</label>
                <input
                  type="text"
                  required
                  name="store_name"
                  placeholder="例如：鑫樂門市"
                  value={formData.store_name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">7-11 門市店號 (6位數字) *</label>
                <input
                  type="text"
                  required
                  name="store_number"
                  placeholder="例如：123456"
                  value={formData.store_number}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">收件人姓名 (同證件姓名) *</label>
                <input
                  type="text"
                  name="recipient_name"
                  placeholder="若同真實姓名可不填"
                  value={formData.recipient_name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">收件人手機 (接收7-11簡訊) *</label>
                <input
                  type="tel"
                  name="recipient_phone"
                  placeholder="若同手機可不填"
                  value={formData.recipient_phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Marketing Survey */}
          <div style={{ marginTop: "28px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "700", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", marginBottom: "16px" }}>
              3. 社群管道調查
            </h3>

            <div className="form-group">
              <label className="form-label">您最初是從哪個管道得知心童裝？</label>
              <select
                name="marketing_source"
                value={formData.marketing_source}
                onChange={handleChange}
                className="form-control"
              >
                <option value="FB">Facebook (FB 粉絲專頁/社團)</option>
                <option value="IG">Instagram (@heartkidswear)</option>
                <option value="LINE">LINE 官方社群 / 群組</option>
                <option value="FRIEND">親友推薦</option>
                <option value="OTHER">其他</option>
              </select>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">FB 帳號名稱 (選填)</label>
                <input
                  type="text"
                  name="fb_handle"
                  placeholder="您的 FB 顯示名稱"
                  value={formData.fb_handle}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">IG 帳號 (選填)</label>
                <input
                  type="text"
                  name="ig_handle"
                  placeholder="@帳號名稱"
                  value={formData.ig_handle}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">LINE 暱稱 (選填)</label>
                <input
                  type="text"
                  name="line_handle"
                  placeholder="LINE 顯示暱稱"
                  value={formData.line_handle}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Rules Agreement */}
          <div style={{
            backgroundColor: "var(--bg-subtle)",
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            margin: "24px 0"
          }}>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                name="agreed_to_rules"
                checked={formData.agreed_to_rules}
                onChange={handleChange}
              />
              <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                我同意且會配合心童裝的購物規則（預購採購確認後無法取消或更改，斷貨全額退購物金，拆封請全程錄影）
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", padding: "14px" }}
          >
            {loading ? "註冊中..." : "確認送出並領取 60 點"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem" }}>
          已有帳號？{" "}
          <Link to="/login" style={{ color: "var(--primary-heart)", fontWeight: "700" }}>
            直接登入
          </Link>
        </div>
      </div>

      {/* Rules Modal prompt if not checked */}
      {isRulesModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRulesModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <AlertCircle size={44} style={{ color: "var(--primary-heart)", margin: "0 auto" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginTop: "8px" }}>請確認購物規則</h3>
            </div>
            <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: "1.7", marginBottom: "20px" }}>
              請勾選「<strong>我同意且會配合心童裝的購物規則</strong>」以完成註冊流程。心童裝採 100% 英國原廠預購機制，送出訂單後即啟動國際採購。
            </p>
            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, agreed_to_rules: true }));
                setIsRulesModalOpen(false);
              }}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              我瞭解並同意勾選
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
