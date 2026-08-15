import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useTranslation } from "../../i18n/I18nContext";

export function UIModal({
  isOpen,
  onClose,
  title,
  message,
  type = "warning",
  confirmText,
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle size={32} style={{ color: "#E63946" }} />;
      case "success":
        return <CheckCircle2 size={32} style={{ color: "var(--accent-mint)" }} />;
      case "info":
        return <Info size={32} style={{ color: "var(--accent-sky)" }} />;
      case "warning":
      default:
        return <AlertTriangle size={32} style={{ color: "var(--accent-gold)" }} />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case "error":
        return "#FDE8E8";
      case "success":
        return "var(--accent-mint-light)";
      case "info":
        return "var(--accent-sky-light)";
      case "warning":
      default:
        return "var(--accent-gold-light)";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "460px",
          textAlign: "center",
          padding: "32px 28px 24px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            color: "var(--text-muted)",
            padding: "4px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={20} />
        </button>

        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: getHeaderBg(),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          {getIcon()}
        </div>

        {title && (
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              color: "var(--text-main)",
              marginBottom: "12px",
            }}
          >
            {title}
          </h3>
        )}

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            lineHeight: "1.6",
            marginBottom: "24px",
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </p>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{
            width: "100%",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            fontWeight: "700",
            fontSize: "1rem",
          }}
        >
          {confirmText || t("member.cancel") === "取消" ? "我知道了 (OK)" : "OK"}
        </button>
      </div>
    </div>
  );
}
