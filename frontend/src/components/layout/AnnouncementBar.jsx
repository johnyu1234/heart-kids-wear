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
      padding: "8px 16px",
      fontSize: "0.85rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      letterSpacing: "0.5px"
    }}>
      <Sparkles size={16} />
      <span>{t("announcement.text")}</span>
    </div>
  );
}
