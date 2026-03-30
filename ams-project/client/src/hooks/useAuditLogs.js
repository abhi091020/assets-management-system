// client/src/hooks/useAuditLogs.js
import { useState, useCallback } from "react";
import { getAuditLogsApi } from "../api/auditApi";
import { toast } from "react-toastify";

const DEFAULT_FILTERS = {
  search: "",
  entity: "",
  action: "",
  dateFrom: "",
  dateTo: "",
};

export function useAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const PAGE_SIZE = 20;

  const fetchLogs = useCallback(
    async (overrideFilters = filters, overridePage = page) => {
      setLoading(true);
      try {
        // Strip empty strings so backend doesn't receive blank filter params
        const params = { page: overridePage, pageSize: PAGE_SIZE };
        Object.entries(overrideFilters).forEach(([k, v]) => {
          if (v !== "" && v !== null && v !== undefined) params[k] = v;
        });

        const res = await getAuditLogsApi(params);
        if (res.success) {
          setLogs(res.data.logs);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to fetch audit logs",
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, page],
  );

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setPage(1);
    fetchLogs(updated, 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchLogs(filters, newPage);
  };

  const handleSearch = (value) => {
    handleFilterChange("search", value);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    fetchLogs(DEFAULT_FILTERS, 1);
  };

  return {
    logs,
    total,
    totalPages,
    page,
    loading,
    filters,
    fetchLogs,
    handleFilterChange,
    handlePageChange,
    handleSearch,
    resetFilters,
  };
}
