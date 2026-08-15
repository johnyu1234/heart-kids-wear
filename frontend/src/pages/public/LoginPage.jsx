import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/I18nContext";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const [initialUser] = useState(user);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (initialUser) {
      navigate(redirect === "/login" || redirect === "/register" ? "/" : redirect, { replace: true });
    }
  }, [initialUser, navigate, redirect]);

  if (initialUser) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.detail || "登入失敗，請檢查帳號密碼");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "60px 20px", maxWidth: "480px" }}>
      <div className="card" style={{ padding: "36px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>❤️</div>
          <h1 className="heading-lg" style={{ marginBottom: "6px" }}>{t("auth.login_title")}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {t("auth.login_subtitle")}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="form-group">
            <label className="form-label">{t("auth.email")}</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                required
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: "38px" }}
              />
              <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label className="form-label" style={{ margin: 0 }}>{t("auth.password")}</label>
              <Link to="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--primary-heart)" }}>
                {t("auth.forgot_password")}
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: "38px", paddingRight: "38px" }}
              />
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", padding: "2px" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" style={{ color: "var(--text-muted)", cursor: "pointer" }}>
              {t("auth.remember_me")}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "6px" }}
          >
            {loading ? "登入中..." : t("auth.btn_login")} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ borderTop: "1px solid var(--border-light)", marginTop: "28px", paddingTop: "20px", textAlign: "center", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          {t("auth.no_account")}{" "}
          <Link to="/register" style={{ color: "var(--primary-heart)", fontWeight: "700" }}>
            {t("auth.btn_register_now")}
          </Link>
        </div>
      </div>
    </div>
  );
}
