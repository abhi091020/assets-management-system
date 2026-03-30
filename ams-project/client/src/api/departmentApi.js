// client/src/api/departmentApi.js
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
    return { code: "NOT_FOUND", message: msg || "Department not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

export const getDepartmentsApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/departments", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// Active departments — supports ?locationId= for cascading dropdown
export const getActiveDepartmentsApi = async (locationId = null) => {
  try {
    const params = locationId ? { locationId } : {};
    const res = await axiosInstance.get("/departments/active", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getDepartmentByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/departments/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const createDepartmentApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/departments", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateDepartmentApi = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/departments/${id}`, payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateDepartmentStatusApi = async (id, isActive) => {
  try {
    const res = await axiosInstance.put(`/departments/${id}/status`, {
      isActive,
    });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteDepartmentApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/departments/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
