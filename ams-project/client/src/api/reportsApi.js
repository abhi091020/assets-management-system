// src/api/reportsApi.js
import axiosInstance from "./axiosInstance";

const BASE = "/reports";

// ─── Helper: build query string from params object ────────────────────────────
function toParams(filters = {}) {
  const params = {};
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== "" && v !== null && v !== undefined) params[k] = v;
  });
  return params;
}

// ─── 1. Asset Register ────────────────────────────────────────────────────────
export const getAssetRegisterApi = (filters) =>
  axiosInstance.get(`${BASE}/asset-register`, { params: toParams(filters) });
export const exportAssetRegisterApi = (filters) =>
  axiosInstance.get(`${BASE}/asset-register/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── 2. By Category ───────────────────────────────────────────────────────────
export const getAssetsByCategoryApi = (filters) =>
  axiosInstance.get(`${BASE}/by-category`, { params: toParams(filters) });
export const exportAssetsByCategoryApi = (filters) =>
  axiosInstance.get(`${BASE}/by-category/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── 3. By Location ───────────────────────────────────────────────────────────
export const getAssetsByLocationApi = (filters) =>
  axiosInstance.get(`${BASE}/by-location`, { params: toParams(filters) });
export const exportAssetsByLocationApi = (filters) =>
  axiosInstance.get(`${BASE}/by-location/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── 4. By Department ─────────────────────────────────────────────────────────
export const getAssetsByDepartmentApi = (filters) =>
  axiosInstance.get(`${BASE}/by-department`, { params: toParams(filters) });
export const exportAssetsByDepartmentApi = (filters) =>
  axiosInstance.get(`${BASE}/by-department/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── 5. By Status ─────────────────────────────────────────────────────────────
export const getAssetsByStatusApi = (filters) =>
  axiosInstance.get(`${BASE}/by-status`, { params: toParams(filters) });
export const exportAssetsByStatusApi = (filters) =>
  axiosInstance.get(`${BASE}/by-status/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── 6. Assigned Employees ────────────────────────────────────────────────────
export const getAssignedEmployeesApi = (filters) =>
  axiosInstance.get(`${BASE}/assigned-employees`, {
    params: toParams(filters),
  });
export const exportAssignedEmployeesApi = (filters) =>
  axiosInstance.get(`${BASE}/assigned-employees/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── 7. Asset Age ─────────────────────────────────────────────────────────────
export const getAssetAgeApi = (filters) =>
  axiosInstance.get(`${BASE}/asset-age`, { params: toParams(filters) });
export const exportAssetAgeApi = (filters) =>
  axiosInstance.get(`${BASE}/asset-age/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── 8. Transfer History ──────────────────────────────────────────────────────
export const getTransferHistoryApi = (filters) =>
  axiosInstance.get(`${BASE}/transfers`, { params: toParams(filters) });
export const exportTransferHistoryApi = (filters) =>
  axiosInstance.get(`${BASE}/transfers/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── 9. Disposal Report ───────────────────────────────────────────────────────
export const getDisposalReportApi = (filters) =>
  axiosInstance.get(`${BASE}/disposals`, { params: toParams(filters) });
export const exportDisposalReportApi = (filters) =>
  axiosInstance.get(`${BASE}/disposals/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── 10. Verification Summary ─────────────────────────────────────────────────
export const getVerificationSummaryApi = (filters) =>
  axiosInstance.get(`${BASE}/verification`, { params: toParams(filters) });
export const exportVerificationSummaryApi = (filters) =>
  axiosInstance.get(`${BASE}/verification/export`, {
    params: toParams(filters),
    responseType: "blob",
  });

// ─── Trigger file download from blob response ─────────────────────────────────
export function downloadBlob(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
