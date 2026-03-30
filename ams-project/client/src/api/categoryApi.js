// client/src/api/categoryApi.js
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
    return { code: "NOT_FOUND", message: msg || "Category not found." };
  return { code: "SERVER_ERROR", message: msg || "Server error. Try again." };
}

export const getCategoriesApi = async (params = {}) => {
  try {
    const res = await axiosInstance.get("/categories", { params });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getActiveCategoriesApi = async () => {
  try {
    const res = await axiosInstance.get("/categories/active");
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const getCategoryByIdApi = async (id) => {
  try {
    const res = await axiosInstance.get(`/categories/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const createCategoryApi = async (payload) => {
  try {
    const res = await axiosInstance.post("/categories", payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateCategoryApi = async (id, payload) => {
  try {
    const res = await axiosInstance.put(`/categories/${id}`, payload);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const updateCategoryStatusApi = async (id, isActive) => {
  try {
    const res = await axiosInstance.put(`/categories/${id}/status`, {
      isActive,
    });
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};

export const deleteCategoryApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/categories/${id}`);
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, ...parseError(err) };
  }
};
