import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Megaphone, Plus, Send, FileText, CheckCircle } from "lucide-react";

export function AdminBroadcastPage() {
  const [templates, setTemplates] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [sending, setSending] = useState(false);

  // New Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");

  const fetchTemplates = async () => {
    try {
      const [tplRes, memRes] = await Promise.all([
        api.get("/admin/messages/templates"),
        api.get("/admin/members")
      ]);
      setTemplates(tplRes.data);
      setMembers(memRes.data);
      if (tplRes.data.length > 0) {
        setSelectedTemplateId(tplRes.data[0].id);
        setCustomContent(tplRes.data[0].template_content);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateChange = (tplId) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find(t => t.id === parseInt(tplId));
    if (tpl) {
      setCustomContent(tpl.template_content);
    }
  };

  const handleSelectAllMembers = () => {
    if (selectedRecipientIds.length === members.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(members.map(m => m.id));
    }
  };

  const handleToggleMember = (id) => {
    if (selectedRecipientIds.includes(id)) {
      setSelectedRecipientIds(selectedRecipientIds.filter(i => i !== id));
    } else {
      setSelectedRecipientIds([...selectedRecipientIds, id]);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (selectedRecipientIds.length === 0) {
      alert("請至少勾選一位收件會員");
      return;
    }
    if (!customContent.trim()) {
      alert("請輸入訊息內容");
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/admin/messages/send-bulk", {
        recipient_ids: selectedRecipientIds,
        template_id: selectedTemplateId ? parseInt(selectedTemplateId) : undefined,
        custom_content: customContent
      });
      alert(`廣播推播發送成功！已派發給 ${res.data.dispatched_count} 位會員。`);
      setSelectedRecipientIds([]);
    } catch (err) {
      alert("發送廣播失敗");
    } finally {
      setSending(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/messages/templates/create", {
        template_name: newTemplateName,
        template_content: newTemplateContent,
        template_type: "CUSTOM"
      });
      alert("新範本儲存成功！");
      setIsTemplateModalOpen(false);
      setNewTemplateName("");
      setNewTemplateContent("");
      await fetchTemplates();
    } catch (err) {
      alert("新增範本失敗");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 className="heading-lg">範本管理與個人化廣播推播</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            支援變數動態替換：<code>{`{{name}}`}</code> 會員姓名、<code>{`{{tracking}}`}</code> 物流碼、<code>{`{{date}}`}</code>
          </p>
        </div>

        <button onClick={() => setIsTemplateModalOpen(true)} className="btn btn-secondary">
          <Plus size={18} /> 新增官方範本
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
        {/* Left Column: Editor & Template Selector */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>
            1. 選擇範本與編輯內容
          </h3>

          <div className="form-group">
            <label className="form-label">選擇訊息範本</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="form-control"
              style={{ fontWeight: "600" }}
            >
              <option value="">-- 自訂空白訊息 --</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  【{tpl.template_type}】{tpl.template_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">訊息廣播內文</label>
            <textarea
              rows={8}
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              className="form-control"
              style={{ lineHeight: "1.6", fontSize: "0.95rem" }}
            />
          </div>

          <div style={{ backgroundColor: "var(--bg-subtle)", padding: "14px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "20px" }}>
            💡 <strong>可用變數說明：</strong>
            <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
              <li><code>{`{{name}}`}</code>：自動代入買家真實中文姓名 (例: 王小美)</li>
              <li><code>{`{{tracking}}`}</code>：自動代入買家最新訂單之物流追蹤碼</li>
              <li><code>{`{{date}}`}</code>：當前發送日期</li>
            </ul>
          </div>

          <button
            onClick={handleSendBroadcast}
            disabled={sending || selectedRecipientIds.length === 0}
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
          >
            <Send size={18} /> {sending ? "推播派發中..." : `確認發送推播 (${selectedRecipientIds.length} 位會員)`}
          </button>
        </div>

        {/* Right Column: Member Picker */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
              2. 勾選接收會員 ({selectedRecipientIds.length}/{members.length})
            </h3>
            <button onClick={handleSelectAllMembers} className="btn btn-outline btn-sm">
              {selectedRecipientIds.length === members.length ? "取消全選" : "全選會員"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "480px", overflowY: "auto" }}>
            {members.map((m) => {
              const isChecked = selectedRecipientIds.includes(m.id);
              return (
                <label
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: isChecked ? "1.5px solid var(--primary-heart)" : "1px solid var(--border-light)",
                    backgroundColor: isChecked ? "var(--primary-heart-light)" : "#FFFFFF",
                    cursor: "pointer",
                    fontSize: "0.88rem"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleMember(m.id)}
                  />
                  <div style={{ flex: 1 }}>
                    <strong>{m.full_name}</strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                      {m.member_id || "無編號"} ｜ {m.phone}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Template Modal */}
      {isTemplateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTemplateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>新增官方推播範本</h3>
            <form onSubmit={handleCreateTemplate}>
              <div className="form-group">
                <label className="form-label">範本名稱 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：7-11 到店取貨簡訊通知"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">範本內容 *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="親愛的 {{name}} 您好，您的心童裝包裹..."
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={() => setIsTemplateModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  儲存範本
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
