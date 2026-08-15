import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/I18nContext";
import { Gift, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";
import { UIModal } from "../../components/common/UIModal";

export function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    birth_date: "",
    phone: "",
    store_name_711: "",
    store_number_711: "",
    postal_address: "",
    marketing_source: "Instagram",
    agree_terms: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onCloseCallback: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      const msg = "兩次輸入的密碼不相符，請重新確認";
      setError(msg);
      setModalConfig({
        isOpen: true,
        title: t("common.notice"),
        message: msg,
        type: "warning",
        onCloseCallback: null,
      });
      return;
    }
    if (!formData.agree_terms) {
      const msg = t("auth.agree_terms_required") || "請勾選並同意心童裝購物規則說明才能完成註冊";
      setError(msg);
      setModalConfig({
        isOpen: true,
        title: t("common.rules_check"),
        message: msg,
        type: "warning",
        onCloseCallback: null,
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        date_of_birth: formData.birth_date || null,
        phone: formData.phone,
        store_name: formData.store_name_711 || null,
        store_number: formData.store_number_711 || null,
        contact_address: formData.postal_address || null,
        marketing_source: formData.marketing_source,
        agreed_to_rules: formData.agree_terms,
      });

      setModalConfig({
        isOpen: true,
        title: "🎉 註冊成功",
        message: "恭喜您！系統已為您存入 60 點首購免運禮物卡！",
        type: "success",
        onCloseCallback: () => navigate("/products"),
      });
    } catch (err) {
      const errorDetail = err.response?.data?.detail || "註冊失敗，請確認資料是否填寫完整";
      setError(errorDetail);
      setModalConfig({
        isOpen: true,
        title: t("common.error_title"),
        message: errorDetail,
        type: "error",
        onCloseCallback: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "620px" }}>
      <div className="card" style={{ padding: "36px 32px" }}>
        {/* Header with 60 pts promo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "var(--primary-heart-light)",
            color: "var(--primary-heart)",
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: "700",
            marginBottom: "12px"
          }}>
            <Gift size={16} /> {t("auth.register_bonus")}
          </div>
          <h1 className="heading-lg" style={{ marginBottom: "6px" }}>{t("auth.register_title")}</h1>
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Basic Info */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "12px", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px" }}>
              1. 帳號與真實基本資料
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div className="form-group">
                <label className="form-label">{t("auth.full_name")} *</label>
                <input
                  type="text"
                  required
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="例：王小明"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("auth.dob")}</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div className="form-group">
                <label className="form-label">{t("auth.email")} *</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("auth.phone")} *</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">{t("auth.password")} *</label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="至少 6 位字元"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("auth.confirm_password")} *</label>
                <input
                  type="password"
                  required
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="再次輸入密碼"
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* 7-11 Default Store */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", margin: 0 }}>{t("auth.section_store")}</h3>
              <a
                href="https://emap.pcsc.com.tw/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.8rem", color: "var(--primary-heart)", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <ExternalLink size={14} /> {t("auth.store_query")}
              </a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div className="form-group">
                <label className="form-label">{t("auth.store_name")}</label>
                <input
                  type="text"
                  name="store_name_711"
                  value={formData.store_name_711}
                  onChange={handleChange}
                  placeholder="例：興隆門市"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("auth.store_number")}</label>
                <input
                  type="text"
                  name="store_number_711"
                  value={formData.store_number_711}
                  onChange={handleChange}
                  placeholder="例：123456"
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t("auth.contact_address")}</label>
              <input
                type="text"
                name="postal_address"
                value={formData.postal_address}
                onChange={handleChange}
                placeholder="例：台北市大安區信義路二段1號"
                className="form-control"
              />
            </div>
          </div>

          {/* Marketing Survey */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px" }}>
              {t("auth.section_survey")}
            </h3>
            <div className="form-group">
              <label className="form-label">{t("auth.survey_label")}</label>
              <select
                name="marketing_source"
                value={formData.marketing_source}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Instagram">Instagram (官方粉專/貼文)</option>
                <option value="Facebook">Facebook (臉書社團/粉專)</option>
                <option value="LINE">LINE 官方帳號 / 社群好友推薦</option>
                <option value="Friend">親朋好友介紹</option>
                <option value="Google">Google 搜尋</option>
              </select>
            </div>
          </div>

          {/* Shopping Rules Checkbox */}
          <div style={{
            backgroundColor: !formData.agree_terms && error === (t("auth.agree_terms_required") || "請勾選並同意心童裝購物規則說明才能完成註冊") ? "#FEF2F2" : "var(--bg-subtle)",
            border: !formData.agree_terms && error === (t("auth.agree_terms_required") || "請勾選並同意心童裝購物規則說明才能完成註冊") ? "2px solid #EF4444" : "1px solid transparent",
            padding: "14px",
            borderRadius: "var(--radius-md)",
            transition: "all 0.2s ease"
          }}>
            <label style={{ display: "flex", gap: "10px", fontSize: "0.82rem", color: "var(--text-main)", cursor: "pointer", lineHeight: "1.6" }}>
              <input
                type="checkbox"
                name="agree_terms"
                checked={formData.agree_terms}
                onChange={handleChange}
                style={{ marginTop: "3px" }}
              />
              <span>{t("auth.rules_agreement")}</span>
            </label>
            {!formData.agree_terms && error === (t("auth.agree_terms_required") || "請勾選並同意心童裝購物規則說明才能完成註冊") && (
              <div style={{ color: "#DC2626", fontSize: "0.8rem", fontWeight: "700", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                ⚠️ {t("auth.agree_terms_required")}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
          >
            {loading ? "註冊中..." : t("auth.btn_register_submit")} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ borderTop: "1px solid var(--border-light)", marginTop: "24px", paddingTop: "16px", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          <Link to="/login" style={{ color: "var(--primary-heart)", fontWeight: "600" }}>
            {t("auth.have_account")}
          </Link>
        </div>
      </div>

      {/* In-App UI Pop Up Modal */}
      <UIModal
        isOpen={modalConfig.isOpen}
        onClose={() => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          if (modalConfig.onCloseCallback) {
            modalConfig.onCloseCallback();
          }
        }}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
