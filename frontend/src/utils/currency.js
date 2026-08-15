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

export function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateTime(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
