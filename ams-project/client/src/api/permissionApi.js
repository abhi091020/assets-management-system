// client/src/api/permissionApi.js
import api from "./axiosInstance.js";

// ─────────────────────────────────────────────────────────────
//  PERMISSIONS MATRIX
// ─────────────────────────────────────────────────────────────

// Full matrix — SuperAdmin only
export const getAllPermissionsApi = () => api.get("/permissions");

// Current user's own permissions
export const getMyPermissionsApi = () => api.get("/permissions/my");

// Toggle single cell — { roleId, moduleId, action, value }
export const togglePermissionApi = (payload) =>
  api.put("/permissions/toggle", payload);

// Bulk update entire role's permissions
// payload: { roleId, permissions: [{ moduleId, can_view, ... }] }
export const bulkUpdatePermissionsApi = (payload) =>
  api.put("/permissions/bulk", payload);

// ─────────────────────────────────────────────────────────────
//  ROLES
// ─────────────────────────────────────────────────────────────

export const getRolesApi = () => api.get("/permissions/roles");

// payload: { roleName, displayName, description }
export const createRoleApi = (payload) =>
  api.post("/permissions/roles", payload);

// payload: { displayName, description, isActive }
export const updateRoleApi = (id, payload) =>
  api.put(`/permissions/roles/${id}`, payload);

export const deleteRoleApi = (id) => api.delete(`/permissions/roles/${id}`);

// ─────────────────────────────────────────────────────────────
//  MODULES
// ─────────────────────────────────────────────────────────────

export const getModulesApi = () => api.get("/permissions/modules");

// payload: { moduleKey, displayName, description, icon, sortOrder }
export const createModuleApi = (payload) =>
  api.post("/permissions/modules", payload);

// payload: { displayName, description, icon, sortOrder, isActive }
export const updateModuleApi = (id, payload) =>
  api.put(`/permissions/modules/${id}`, payload);

export const deleteModuleApi = (id) => api.delete(`/permissions/modules/${id}`);
