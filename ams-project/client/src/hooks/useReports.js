// src/hooks/useReports.js
import { useState, useCallback } from "react";
import {
  getAssetRegisterApi,
  exportAssetRegisterApi,
  getAssetsByCategoryApi,
  exportAssetsByCategoryApi,
  getAssetsByLocationApi,
  exportAssetsByLocationApi,
  getAssetsByDepartmentApi,
  exportAssetsByDepartmentApi,
  getAssetsByStatusApi,
  exportAssetsByStatusApi,
  getAssignedEmployeesApi,
  exportAssignedEmployeesApi,
  getAssetAgeApi,
  exportAssetAgeApi,
  getTransferHistoryApi,
  exportTransferHistoryApi,
  getDisposalReportApi,
  exportDisposalReportApi,
  getVerificationSummaryApi,
  exportVerificationSummaryApi,
  downloadBlob,
} from "../api/reportsApi";

// ─── Report config registry ───────────────────────────────────────────────────
export const REPORT_LIST = [
  {
    key: "asset-register",
    label: "Asset Register",
    description: "Full asset list with category, location, department and cost",
    icon: "register",
    fetchFn: getAssetRegisterApi,
    exportFn: exportAssetRegisterApi,
    paginated: true,
    filters: [
      "status",
      "categoryId",
      "locationId",
      "departmentId",
      "dateFrom",
      "dateTo",
    ],
  },
  {
    key: "by-category",
    label: "Assets by Category",
    description: "Asset count and value grouped by category",
    icon: "category",
    fetchFn: getAssetsByCategoryApi,
    exportFn: exportAssetsByCategoryApi,
    paginated: false,
    filters: ["categoryId", "dateFrom", "dateTo"],
  },
  {
    key: "by-location",
    label: "Assets by Location",
    description: "Asset count and value grouped by location",
    icon: "location",
    fetchFn: getAssetsByLocationApi,
    exportFn: exportAssetsByLocationApi,
    paginated: false,
    filters: ["locationId", "dateFrom", "dateTo"],
  },
  {
    key: "by-department",
    label: "Assets by Department",
    description: "Asset count and value grouped by department",
    icon: "department",
    fetchFn: getAssetsByDepartmentApi,
    exportFn: exportAssetsByDepartmentApi,
    paginated: false,
    filters: ["departmentId", "locationId", "dateFrom", "dateTo"],
  },
  {
    key: "by-status",
    label: "Assets by Status",
    description: "Summary counts per asset status",
    icon: "status",
    fetchFn: getAssetsByStatusApi,
    exportFn: exportAssetsByStatusApi,
    paginated: false,
    filters: ["categoryId", "locationId", "dateFrom", "dateTo"],
  },
  {
    key: "assigned-employees",
    label: "Assigned to Employees",
    description: "All assets currently assigned to an employee",
    icon: "employee",
    fetchFn: getAssignedEmployeesApi,
    exportFn: exportAssignedEmployeesApi,
    paginated: true,
    filters: [
      "status",
      "locationId",
      "departmentId",
      "employeeId",
      "dateFrom",
      "dateTo",
    ],
  },
  {
    key: "asset-age",
    label: "Asset Age Report",
    description: "Asset age in years from purchase date",
    icon: "age",
    fetchFn: getAssetAgeApi,
    exportFn: exportAssetAgeApi,
    paginated: true,
    filters: [
      "status",
      "categoryId",
      "locationId",
      "ageMin",
      "ageMax",
      "dateFrom",
      "dateTo",
    ],
  },
  {
    key: "transfers",
    label: "Transfer History",
    description: "All transfer requests with approval status",
    icon: "transfer",
    fetchFn: getTransferHistoryApi,
    exportFn: exportTransferHistoryApi,
    paginated: true,
    filters: ["status", "dateFrom", "dateTo"],
  },
  {
    key: "disposals",
    label: "Disposal Report",
    description: "All disposal requests with method and sale amount",
    icon: "disposal",
    fetchFn: getDisposalReportApi,
    exportFn: exportDisposalReportApi,
    paginated: true,
    filters: ["status", "method", "dateFrom", "dateTo"],
  },
  {
    key: "verification",
    label: "Verification Summary",
    description: "Verification batch progress and item counts",
    icon: "verification",
    fetchFn: getVerificationSummaryApi,
    exportFn: exportVerificationSummaryApi,
    paginated: true,
    filters: ["status", "locationId", "departmentId", "dateFrom", "dateTo"],
  },
];

const DEFAULT_FILTERS = {
  status: "",
  categoryId: "",
  locationId: "",
  departmentId: "",
  employeeId: "",
  method: "",
  dateFrom: "",
  dateTo: "",
  ageMin: "",
  ageMax: "",
  page: 1,
  limit: 50,
};

export function useReports() {
  const [activeReport, setActiveReport] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [hasRun, setHasRun] = useState(false);

  const selectReport = useCallback((reportKey) => {
    const found = REPORT_LIST.find((r) => r.key === reportKey);
    setActiveReport(found || null);
    setFilters(DEFAULT_FILTERS);
    setData([]);
    setTotal(0);
    setPage(1);
    setError(null);
    setHasRun(false);
  }, []);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const runReport = useCallback(
    async (overridePage = 1) => {
      if (!activeReport) return;
      setLoading(true);
      setError(null);
      try {
        const res = await activeReport.fetchFn({
          ...filters,
          page: overridePage,
          limit: filters.limit,
        });
        const payload = res.data?.data;
        if (activeReport.paginated) {
          setData(payload?.data || []);
          setTotal(payload?.total || 0);
          setPage(payload?.page || overridePage);
        } else {
          setData(payload?.data || payload || []);
          setTotal((payload?.data || payload || []).length);
          setPage(1);
        }
        setHasRun(true);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    },
    [activeReport, filters],
  );

  const changePage = useCallback(
    (newPage) => {
      setFilters((prev) => ({ ...prev, page: newPage }));
      runReport(newPage);
    },
    [runReport],
  );

  const exportReport = useCallback(
    async (format = "excel") => {
      if (!activeReport) return;
      setExporting(true);
      try {
        const res = await activeReport.exportFn({ ...filters, format });
        const ext = format === "pdf" ? "pdf" : "xlsx";
        downloadBlob(res.data, `${activeReport.label}.${ext}`);
      } catch (err) {
        setError("Export failed");
      } finally {
        setExporting(false);
      }
    },
    [activeReport, filters],
  );

  return {
    activeReport,
    selectReport,
    filters,
    updateFilter,
    data,
    total,
    page,
    loading,
    exporting,
    error,
    hasRun,
    runReport,
    changePage,
    exportReport,
  };
}
