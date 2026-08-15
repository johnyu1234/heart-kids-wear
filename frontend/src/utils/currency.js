/**
 * Formats a number or decimal string to Taiwanese Dollars NT$ format.
 * Example: 1000 -> "NT$1,000"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "NT$0";
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return "NT$0";
  return `NT$${Math.round(num).toLocaleString("en-US")}`;
}

/**
 * Formats date to Taiwan timezone (Asia/Taipei, UTC+8) in YYYY/MM/DD format.
 */
export function formatDate(dateString) {
  if (!dateString) return "";
  let s = String(dateString);
  if (!s.endsWith("Z") && !s.includes("+") && !s.includes("-", 10)) {
    s += "Z";
  }
  const d = new Date(s);
  if (isNaN(d.getTime())) return dateString;

  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Formats datetime to Taiwan timezone (Asia/Taipei, UTC+8) in YYYY/MM/DD HH:mm format.
 */
export function formatDateTime(dateString, includeSeconds = false) {
  if (!dateString) return "";
  let s = String(dateString);
  if (!s.endsWith("Z") && !s.includes("+") && !s.includes("-", 10)) {
    s += "Z";
  }
  const d = new Date(s);
  if (isNaN(d.getTime())) return dateString;

  const options = {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  if (includeSeconds) {
    options.second = "2-digit";
  }

  return new Intl.DateTimeFormat("zh-TW", options).format(d);
}
