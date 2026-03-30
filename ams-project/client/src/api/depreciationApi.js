// client/src/api/depreciationApi.js

import axiosInstance from "./axiosInstance";

function parseError(err) {
  if (!err.response) {
    return err.code === "ECONNABORTED" || err.message?.includes("timeout")
      ? { code: "TIMEOUT", message: "Request timed out. Please try again." }
      : { code: "NETWORK", message: "Cannot reach the server." };
  }
  const msg = err.response.data?.message || null;
  const s = err.response.status;
  if (s === 400)
    return { code: "BAD_REQUEST", message: msg || "Invalid request." };
  if (s === 401)
    return { code: "UNAUTHORIZED", message: msg || "Unauthorized." };
  if (s === 403) return { code: "FORBIDDEN", message: msg || "Access denied." };
  if (s === 404) return { code: "NOT_FOUND", message: msg || "Not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

// ── Get Current FY ────────────────────────────────────────────────────────────
export const getCurrentFYApi = async () => {
  try {
    const res = await axiosInstance.get("/depreciation/current-fy");
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── Get Summary (paginated) ───────────────────────────────────────────────────
export const getDepreciationSummaryApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/depreciation/summary", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── Get Ledger for One Asset ──────────────────────────────────────────────────
export const getDepreciationLedgerApi = async (assetId) => {
  try {
    const res = await axiosInstance.get(`/depreciation/ledger/${assetId}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── Run For Single Asset ──────────────────────────────────────────────────────
export const runDepreciationForAssetApi = async (assetId, payload) => {
  try {
    const res = await axiosInstance.post(
      `/depreciation/run/${assetId}`,
      payload,
    );
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── Run For All Assets ────────────────────────────────────────────────────────
export const runDepreciationForAllApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/depreciation/run", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
