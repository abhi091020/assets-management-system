// client/src/api/verificationApi.js
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
  if (s === 404)
    return { code: "NOT_FOUND", message: msg || "Batch not found." };
  if (s === 409)
    return { code: "CONFLICT", message: msg || "Asset already in batch." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

// ── Batches ───────────────────────────────────────────────────────────────────

export const getBatchesApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/verification/batches", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getBatchByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/verification/batches/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const createBatchApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/verification/batches", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const closeBatchApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/verification/batches/${id}/close`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── Re-open a closed batch (Admin only) ──────────────────────────────────────
export const reopenBatchApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/verification/batches/${id}/reopen`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteBatchApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/verification/batches/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── Items ─────────────────────────────────────────────────────────────────────

export const getBatchItemsApi = async (batchId) => {
  try {
    const res = await axiosInstance.get(
      `/verification/batches/${batchId}/items`,
    );
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const addItemToBatchApi = async (batchId, assetId) => {
  try {
    const res = await axiosInstance.post(
      `/verification/batches/${batchId}/items`,
      { assetId },
    );
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const verifyItemApi = async (itemId, payload) => {
  try {
    const res = await axiosInstance.put(
      `/verification/items/${itemId}/verify`,
      payload,
    );
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const removeItemApi = async (itemId) => {
  try {
    const res = await axiosInstance.delete(`/verification/items/${itemId}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
