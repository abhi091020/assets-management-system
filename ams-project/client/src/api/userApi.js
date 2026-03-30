// client/src/api/userApi.js

import axiosInstance from "./axiosInstance";

// ── GET all users with optional filters + pagination ─────────────────────────
export const getUsersApi = (params = {}) => {
  return axiosInstance.get("/users", { params });
};

// ── GET single user by ID ─────────────────────────────────────────────────────
export const getUserByIdApi = (id) => {
  return axiosInstance.get(`/users/${id}`);
};

// ── CREATE user (uses /auth/signup endpoint) ──────────────────────────────────
export const createUserApi = (data) => {
  return axiosInstance.post("/auth/signup", data);
};

// ── UPDATE user details ───────────────────────────────────────────────────────
export const updateUserApi = (id, data) => {
  return axiosInstance.put(`/users/${id}`, data);
};

// ── ACTIVATE / DEACTIVATE user ────────────────────────────────────────────────
export const updateUserStatusApi = (id, isActive) => {
  return axiosInstance.put(`/users/${id}/status`, { is_active: isActive });
};

// ── CHANGE password (self only) ───────────────────────────────────────────────
export const changePasswordApi = (id, data) => {
  return axiosInstance.put(`/users/${id}/password`, data);
};

// ── SOFT DELETE user (Admin+) ─────────────────────────────────────────────────
export const deleteUserApi = (id) => {
  return axiosInstance.delete(`/users/${id}`);
};

// ── HARD / PERMANENT DELETE (SuperAdmin only) ─────────────────────────────────
export const deleteUserPermanentApi = (id) => {
  return axiosInstance.delete(`/users/${id}/permanent`);
};
