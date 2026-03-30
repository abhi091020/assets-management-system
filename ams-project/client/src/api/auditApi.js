// client/src/api/auditApi.js
import axiosInstance from "./axiosInstance";

/**
 * GET /api/audit
 * Filters: userId, entity, action, dateFrom, dateTo, search, page, pageSize
 */
export const getAuditLogsApi = async (params = {}) => {
  const { data } = await axiosInstance.get("/audit", { params });
  return data;
};
