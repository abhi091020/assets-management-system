// client/src/api/disposalApi.js
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
    return { code: "NOT_FOUND", message: msg || "Disposal not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

export const getDisposalsApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/disposals", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getDisposalByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/disposals/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const raiseDisposalApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/disposals", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// ── NEW ───────────────────────────────────────────────────────
export const updateDisposalApi = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/disposals/${id}`, payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const approveDisposalApi = async (id) => {
  try {
    const res = await axiosInstance.put(`/disposals/${id}/approve`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const rejectDisposalApi = async (id, rejectionReason) => {
  try {
    const res = await axiosInstance.put(`/disposals/${id}/reject`, {
      rejectionReason,
    });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteDisposalApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/disposals/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
