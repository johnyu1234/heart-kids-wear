import React, { useEffect, useState, useRef } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { MemberSidebar } from "../../components/layout/MemberSidebar";
import { formatDateTime } from "../../utils/currency";
import { Send, Clock } from "lucide-react";

export function MessagesPage() {
  const { user } = useAuth();
  const { refreshUnread } = useNotification();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get("/messages");
      setMessages(res.data);
      await api.post("/messages/mark-read");
      refreshUnread();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText("");
    try {
      setLoading(true);
      await api.post("/messages/send", { content: text });
      await fetchMessages();
    } catch (err) {
      alert("發送訊息失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px" }}>
        <MemberSidebar />

        <div>
          <h1 className="heading-lg" style={{ marginBottom: "8px" }}>客服訊息對話</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "28px" }}>
            與心童裝管理員一對一即時聯繫，查詢採購、出貨或匯款問題
          </p>

          <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "600px" }}>
            {/* Header */}
            <div style={{ backgroundColor: "var(--primary-heart)", color: "#FFFFFF", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>心童裝 專屬客服小幫手</div>
              <div style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px", opacity: 0.9 }}>
                <Clock size={14} /> 依留言順序回覆中
              </div>
            </div>

            {/* Message Thread */}
            <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", backgroundColor: "var(--bg-subtle)" }}>
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start"
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "12px 18px",
                        borderRadius: "16px",
                        fontSize: "0.92rem",
                        lineHeight: "1.5",
                        backgroundColor: isMe ? "var(--primary-heart)" : "#FFFFFF",
                        color: isMe ? "#FFFFFF" : "var(--text-main)",
                        border: isMe ? "none" : "1px solid var(--border-light)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        borderBottomRightRadius: isMe ? "2px" : "16px",
                        borderBottomLeftRadius: !isMe ? "2px" : "16px",
                        whiteSpace: "pre-line"
                      }}
                    >
                      {msg.content}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-light)", marginTop: "4px" }}>
                      {formatDateTime(msg.created_at)}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} style={{ padding: "16px 20px", backgroundColor: "#FFFFFF", borderTop: "1px solid var(--border-light)", display: "flex", gap: "12px" }}>
              <input
                type="text"
                placeholder="輸入您的詢問內容..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="form-control"
                style={{ borderRadius: "var(--radius-full)" }}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="btn btn-primary"
                style={{ borderRadius: "var(--radius-full)", padding: "10px 24px" }}
              >
                <Send size={18} /> 發送
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
