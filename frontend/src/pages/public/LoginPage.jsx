import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await login(email, password, rememberMe);
      if (data.is_admin) {
        navigate("/admin");
      } else {
        navigate("/member/orders");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "登入錯誤請再嘗試一次。(Login error, please try again.)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-sm" style={{ padding: "60px 20px" }}>
      <div className="card" style={{ maxWidth: "460px", margin: "0 auto", padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: "2.2rem" }}>❤️</span>
          <h1 className="heading-lg" style={{ marginTop: "8px" }}>會員登入</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
            登入以查看您的預購進度與訂單明細
          </p>
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
          <div className="form-group">
            <label className="form-label">電子信箱 (Email)</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                required
                placeholder="user@example.com (不分大小寫)"
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
              <label className="form-label" style={{ marginBottom: 0 }}>密碼 (Password)</label>
              <Link to="/forgot-password" style={{ fontSize: "0.82rem", color: "var(--primary-heart)" }}>
                忘記密碼？
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: "38px", paddingRight: "38px" }}
              />
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>記住我的登入資訊 (Remember Me)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px", fontSize: "1rem" }}
          >
            {loading ? "登入中..." : "登入"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-light)", fontSize: "0.9rem" }}>
          還沒有心童裝帳號？{" "}
          <Link to="/register" style={{ color: "var(--primary-heart)", fontWeight: "700" }}>
            立即免費註冊 <ArrowRight size={14} style={{ display: "inline" }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
