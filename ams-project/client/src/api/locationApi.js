// client/src/api/locationApi.js
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
    return { code: "NOT_FOUND", message: msg || "Location not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

// All locations with pagination + filters (Admin page)
export const getLocationsApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/locations", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// Active locations only — for dropdowns
export const getActiveLocationsApi = async () => {
  try {
    const res = await axiosInstance.get("/locations/active");
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getLocationByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/locations/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const createLocationApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/locations", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateLocationApi = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/locations/${id}`, payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateLocationStatusApi = async (id, isActive) => {
  try {
    const res = await axiosInstance.put(`/locations/${id}/status`, {
      isActive,
    });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteLocationApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/locations/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
