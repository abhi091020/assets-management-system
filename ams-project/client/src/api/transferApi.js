// client/src/api/transferApi.js
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
    return { code: "NOT_FOUND", message: msg || "Transfer not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

export const getTransfersApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/transfers", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getTransferByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/transfers/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const raiseTransferApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/transfers", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── NEW ───────────────────────────────────────────────────────
export const updateTransferApi = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/transfers/${id}`, payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const approveTransferApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/transfers/${id}/approve`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const rejectTransferApi = async (id, rejectionReason) => {
  try {
    const res = await axiosInstance.put(`/transfers/${id}/reject`, {
      rejectionReason,
    });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteTransferApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/transfers/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
