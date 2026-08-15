import React from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "../../i18n/I18nContext";

export function AnnouncementBar() {
  const { t } = useTranslation();

  return (
    <div style={{
      backgroundColor: "var(--primary-heart)",
      color: "#FFFFFF",
      textAlign: "center",
      padding: "6px 12px",
      fontSize: "0.8rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      letterSpacing: "0.2px",
      lineHeight: "1.4"
    }}>
      <Sparkles size={14} style={{ flexShrink: 0 }} />
      <span>{t("announcement.text")}</span>
    </div>
  );
}
