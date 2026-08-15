import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { Mail, KeyRound, ArrowLeft, CheckCircle } from "lucide-react";

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: request code, 2: verify and reset
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "驗證碼已發送至您的信箱");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "發送驗證碼失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-code", { email, code, new_password: newPassword });
      alert("密碼重設成功，請使用新密碼登入！");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "驗證碼錯誤或過期");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-sm" style={{ padding: "60px 20px" }}>
      <div className="card" style={{ maxWidth: "460px", margin: "0 auto", padding: "36px" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
            <ArrowLeft size={16} /> 返回登入
          </Link>
        </div>

        <h1 className="heading-lg" style={{ marginBottom: "8px" }}>重設密碼</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
          請輸入您註冊時的電子信箱以接收重設密碼驗證碼
        </p>

        {error && (
          <div style={{ backgroundColor: "var(--primary-heart-light)", color: "var(--primary-heart)", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "0.88rem", marginBottom: "16px", fontWeight: "600" }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ backgroundColor: "var(--accent-mint-light)", color: "var(--accent-mint)", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "0.88rem", marginBottom: "16px", fontWeight: "600" }}>
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode}>
            <div className="form-group">
              <label className="form-label">註冊電子信箱 (Email)</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: "38px" }}
                />
                <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
              {loading ? "發送中..." : "取得 6 位數驗證碼"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">輸入 6 位數驗證碼</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="例如：123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="form-control"
                style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "4px" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">設定新密碼 (至少6碼)</label>
              <input
                type="password"
                required
                placeholder="請輸入新密碼"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
              {loading ? "重設中..." : "確認重設密碼"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
