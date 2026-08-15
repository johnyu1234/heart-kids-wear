import React, { useState, useEffect, useRef } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { MessageCircle, X, Send, Clock, Sparkles } from "lucide-react";
import { formatDateTime } from "../../utils/currency";

export function ChatWidget() {
  const { user } = useAuth();
  const { unreadCount, refreshUnread } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const res = await api.get("/messages");
      setMessages(res.data);
      refreshUnread();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
      api.post("/messages/mark-read");
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

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
    <>
      {/* Floating Circular Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-chat-btn"
        title="線上客服"
        aria-label="Chat with us"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
        {!isOpen && unreadCount > 0 && (
          <span className="notification-dot" style={{ top: "0", right: "0" }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "28px",
          width: "360px",
          height: "520px",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border-light)",
          display: "flex",
          flexDirection: "column",
          zIndex: 950,
          overflow: "hidden",
          animation: "modalScale 0.2s ease"
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: "var(--primary-heart)",
            color: "#FFFFFF",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.4rem" }}>❤️</span>
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>心童裝 線上客服</h4>
                <div style={{ fontSize: "0.75rem", opacity: 0.9, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} /> 依留言順序回覆中
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: "#FFFFFF" }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            padding: "16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            backgroundColor: "var(--bg-subtle)"
          }}>
            {!user ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <p style={{ marginBottom: "12px" }}>請先登入會員以開始客服對話與查詢進度</p>
                <a href="/login" className="btn btn-primary btn-sm">立即登入</a>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <Sparkles size={32} style={{ color: "var(--primary-heart)", margin: "0 auto 10px" }} />
                <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>歡迎來到心童裝客服！</p>
                <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>請輸入您的詢問內容，我們會盡速為您服務。</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user.id;
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
                        maxWidth: "80%",
                        padding: "10px 14px",
                        borderRadius: "14px",
                        fontSize: "0.88rem",
                        lineHeight: "1.4",
                        backgroundColor: isMe ? "var(--primary-heart)" : "#FFFFFF",
                        color: isMe ? "#FFFFFF" : "var(--text-main)",
                        border: isMe ? "none" : "1px solid var(--border-light)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        borderBottomRightRadius: isMe ? "2px" : "14px",
                        borderBottomLeftRadius: !isMe ? "2px" : "14px",
                      }}
                    >
                      {msg.content}
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-light)", marginTop: "4px" }}>
                      {formatDateTime(msg.created_at)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          {user && (
            <form onSubmit={handleSend} style={{
              padding: "12px 16px",
              backgroundColor: "#FFFFFF",
              borderTop: "1px solid var(--border-light)",
              display: "flex",
              gap: "8px"
            }}>
              <input
                type="text"
                placeholder="輸入訊息..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="form-control"
                style={{ borderRadius: "var(--radius-full)", fontSize: "0.85rem", padding: "8px 14px" }}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: "50%", width: "36px", height: "36px", padding: 0 }}
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
