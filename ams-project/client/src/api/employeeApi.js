// client/src/api/employeeApi.js
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
    return { code: "NOT_FOUND", message: msg || "Employee not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

export const getEmployeesApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/employees", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

// Active employees — for asset assignment dropdown
export const getActiveEmployeesApi = async () => {
  try {
    const res = await axiosInstance.get("/employees/active");
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getEmployeeByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/employees/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const createEmployeeApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/employees", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateEmployeeApi = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/employees/${id}`, payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateEmployeeStatusApi = async (id, isActive) => {
  try {
    const res = await axiosInstance.put(`/employees/${id}/status`, {
      isActive,
    });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteEmployeeApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/employees/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
