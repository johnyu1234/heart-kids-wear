import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";

export function TermsPage() {
  return (
    <div className="container-sm" style={{ padding: "40px 20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
          <ArrowLeft size={16} /> 返回首頁
        </Link>
      </div>

      <div className="card" style={{ padding: "40px" }}>
        <h1 className="heading-lg" style={{ marginBottom: "20px", color: "var(--primary-heart)" }}>
          Heart Kids Wear (心童裝) 購物與預購規則
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", lineHeight: "1.8", color: "var(--text-main)" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", color: "var(--primary-heart)", marginBottom: "8px" }}>
              <ShieldCheck size={20} /> 1. 預購與採購機制
            </h3>
            <p>
              心童裝所有商品皆為 100% 英國原廠直送。當您送出預購訂單並完成款項登記後，我們即會於英國官網向原廠下單採購。由於國際代購性質，<strong>訂單一旦送出即無法取消或更改款式/尺寸</strong>。
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-mint)", marginBottom: "8px" }}>
              <RefreshCw size={20} /> 2. 斷貨退款說明 (100% 退至購物金)
            </h3>
            <p>
              英國官網庫存變動快速，若採購時遇原廠缺貨或斷貨，系統會於第一時間將該斷貨商品的<strong>全部已付金額自動 100% 全額轉入您的心童裝購物金帳戶（永久有效）</strong>，並發送系統通知。您可於下次結帳時直接全額折抵。
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-gold)", marginBottom: "8px" }}>
              <Truck size={20} /> 3. 運費與出國請假備註
            </h3>
            <p>
              7-11 店到店運費為 NT$60，中華郵政宅配為 NT$80。若單筆訂單商品總件數<strong>超過 15 件</strong>，為避免超商包裹體積超材，系統將自動鎖定為中華郵政宅配。若您預計出國，請務必於結帳時填寫「<strong>出國請假日期備註</strong>」，我們將為您協調出貨時間，避免包裹逾期退回。
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", color: "#E63946", marginBottom: "8px" }}>
              <AlertTriangle size={20} /> 4. 拆封錄影與售後瑕疵
            </h3>
            <p>
              為保障雙方權益，<strong>收件拆箱時請務必全程錄影</strong>。如商品遇有重大瑕疵，請於收件後 3 日內透過線上客服聯繫並提供開箱錄影檔案，我們將全力為您處理補購或退款事宜。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
