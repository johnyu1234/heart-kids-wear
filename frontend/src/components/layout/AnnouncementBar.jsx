import React from "react";
import { Sparkles } from "lucide-react";

export function AnnouncementBar() {
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
      <span>🎉 註冊首次送 60 點 = 7-11 免運費！快來註冊看更多商品 🛍️</span>
    </div>
  );
}
