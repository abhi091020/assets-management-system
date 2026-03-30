// client/src/api/scanApi.js

import axios from "axios";

// Public axios instance — no JWT interceptor, no auth header
// Used only for the public /scan/:token route
const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

/**
 * getAssetByToken
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches public asset info by QR token — no login required.
 * Called from PublicAssetViewPage (/scan/:token).
 *
 * @param {string} token — UUID v4 from QR code
 * @returns {{ success: boolean, data?: object, message?: string }}
 */
export const getAssetByToken = async (token) => {
  try {
    const res = await publicAxios.get(`/scan/${token}`);
    return { success: true, data: res.data.data };
  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to fetch asset details.";
    return { success: false, message };
  }
};
