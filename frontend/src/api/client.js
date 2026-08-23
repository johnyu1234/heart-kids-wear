import axios from "axios";

let rawBaseUrl = import.meta.env.VITE_API_URL || "/api";
if (rawBaseUrl.startsWith("http") && !rawBaseUrl.endsWith("/api")) {
  rawBaseUrl = `${rawBaseUrl.replace(/\/+$/, "")}/api`;
}

export const api = axios.create({
  baseURL: rawBaseUrl,
});

// Request interceptor: Attach JWT and strip Content-Type on GET requests (avoids CORS preflight)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.method?.toLowerCase() === "get") {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (window.location.pathname.startsWith("/member") || window.location.pathname.startsWith("/admin")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
