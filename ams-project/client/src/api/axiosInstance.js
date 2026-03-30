// src/api/axiosInstance.js
import axios from "axios";

// NOTE: We import the store directly (not via hook) so interceptors work outside React.
// This is the correct Zustand pattern for use outside components.
let _getAuthStore = null;
export const setAuthStoreRef = (fn) => {
  _getAuthStore = fn;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ──────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // Read token from store if available, else fall back to localStorage
    const token = _getAuthStore?.()?.token ?? localStorage.getItem("ams_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — auto-logout on 401 ────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRoute = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRoute) {
      // Use store logout if available, else manual clear + redirect
      if (_getAuthStore) {
        _getAuthStore().logout();
      } else {
        localStorage.removeItem("ams_token");
        localStorage.removeItem("ams_user");
      }
      // Hard redirect — works outside React tree
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
