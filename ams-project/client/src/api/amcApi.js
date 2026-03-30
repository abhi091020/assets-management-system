// client/src/api/amcApi.js

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

// ── Get Expiring AMC ──────────────────────────────────────────────────────────
export const getExpiringAMCApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/assets/expiring-amc", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── Get Expiring Insurance ────────────────────────────────────────────────────
export const getExpiringInsuranceApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/assets/expiring-insurance", {
      params,
    });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
