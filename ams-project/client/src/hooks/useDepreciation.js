// client/src/hooks/useDepreciation.js

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  getCurrentFYApi,
  getDepreciationSummaryApi,
  getDepreciationLedgerApi,
  runDepreciationForAssetApi,
  runDepreciationForAllApi,
} from "../api/depreciationApi";

const INITIAL_FILTERS = {
  fy: "",
  method: "",
  categoryId: "",
  locationId: "",
  departmentId: "",
  search: "",
};

const INITIAL_RUN_FORM = {
  method: "WDV",
  rate: "20",
  usefulLifeYears: "",
  fy: "",
};

export const useDepreciation = () => {
  // ── Summary state ─────────────────────────────────────────────────────────
  const [summary, setSummary] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // ── FY state ──────────────────────────────────────────────────────────────
  const [currentFY, setCurrentFY] = useState("");
  const fyFetchedRef = useRef(false);

  // ── Run modal state ───────────────────────────────────────────────────────
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [runMode, setRunMode] = useState("all"); // "all" | "single"
  const [runTargetAsset, setRunTargetAsset] = useState(null);
  const [runForm, setRunForm] = useState(INITIAL_RUN_FORM);
  const [runFormErrors, setRunFormErrors] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null); // last bulk run result

  // ── Ledger drawer state ───────────────────────────────────────────────────
  const [ledgerDrawerOpen, setLedgerDrawerOpen] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // ── Fetch current FY once ─────────────────────────────────────────────────
  const fetchCurrentFY = useCallback(async () => {
    if (fyFetchedRef.current) return;
    const res = await getCurrentFYApi();
    if (res.success) {
      const fy = res.data?.financialYear || "";
      setCurrentFY(fy);
      setFilters((prev) => ({ ...prev, fy }));
      setRunForm((prev) => ({ ...prev, fy }));
      fyFetchedRef.current = true;
    }
  }, []);

  useEffect(() => {
    fetchCurrentFY();
  }, [fetchCurrentFY]);

  // ── Fetch summary ─────────────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      pageSize,
      ...(filters.fy && { fy: filters.fy }),
      ...(filters.method && { method: filters.method }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.locationId && { locationId: filters.locationId }),
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.search && { search: filters.search }),
    };
    const res = await getDepreciationSummaryApi(params);
    if (res.success) {
      setSummary(res.data?.data || []);
      setTotalCount(res.data?.total || 0);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [page, pageSize, filters]);

  useEffect(() => {
    // Only fetch once FY is loaded
    if (!filters.fy) return;
    fetchSummary();
  }, [fetchSummary, filters.fy]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ ...INITIAL_FILTERS, fy: currentFY });
    setPage(1);
  };

  // ── Run Form ──────────────────────────────────────────────────────────────
  const handleRunFormChange = (key, value) => {
    setRunForm((prev) => ({ ...prev, [key]: value }));
    if (runFormErrors[key])
      setRunFormErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateRunForm = () => {
    const errors = {};
    if (!runForm.method) errors.method = "Method is required.";
    if (
      !runForm.rate ||
      isNaN(runForm.rate) ||
      Number(runForm.rate) <= 0 ||
      Number(runForm.rate) >= 100
    )
      errors.rate = "Rate must be between 0 and 100.";
    if (
      runForm.method === "SLM" &&
      (!runForm.usefulLifeYears || Number(runForm.usefulLifeYears) <= 0)
    )
      errors.usefulLifeYears = "Useful life years required for SLM.";
    if (!runForm.fy) errors.fy = "Financial year is required.";
    setRunFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Open run modal ────────────────────────────────────────────────────────
  const openRunModal = (mode = "all", asset = null) => {
    setRunMode(mode);
    setRunTargetAsset(asset);
    setRunForm({ ...INITIAL_RUN_FORM, fy: currentFY });
    setRunFormErrors({});
    setRunResult(null);
    setRunModalOpen(true);
  };

  const closeRunModal = () => {
    setRunModalOpen(false);
    setRunTargetAsset(null);
    setRunResult(null);
    setRunFormErrors({});
  };

  // ── Submit run ────────────────────────────────────────────────────────────
  const handleRunSubmit = async () => {
    if (!validateRunForm()) return;
    setIsRunning(true);

    const payload = {
      method: runForm.method,
      rate: Number(runForm.rate),
      fy: runForm.fy,
      ...(runForm.method === "SLM" && {
        usefulLifeYears: Number(runForm.usefulLifeYears),
      }),
    };

    if (runMode === "single" && runTargetAsset) {
      const res = await runDepreciationForAssetApi(
        runTargetAsset.asset_id,
        payload,
      );
      if (res.success) {
        toast.success(`Depreciation run for ${runTargetAsset.asset_code}.`);
        closeRunModal();
        fetchSummary();
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await runDepreciationForAllApi(payload);
      if (res.success) {
        setRunResult(res.data);
        toast.success(
          `Run complete — ${res.data.success} succeeded, ${res.data.failed} failed.`,
        );
        fetchSummary();
      } else {
        toast.error(res.message);
      }
    }

    setIsRunning(false);
  };

  // ── Open ledger drawer ────────────────────────────────────────────────────
  const openLedgerDrawer = async (assetId) => {
    setLedgerDrawerOpen(true);
    setLedgerData(null);
    setLedgerLoading(true);
    const res = await getDepreciationLedgerApi(assetId);
    if (res.success) {
      setLedgerData(res.data);
    } else {
      toast.error(res.message);
      setLedgerDrawerOpen(false);
    }
    setLedgerLoading(false);
  };

  const closeLedgerDrawer = () => {
    setLedgerDrawerOpen(false);
    setLedgerData(null);
  };

  const refresh = () => fetchSummary();

  return {
    // Summary
    summary,
    totalCount,
    loading,
    page,
    pageSize,
    setPage,
    filters,
    handleFilterChange,
    handleClearFilters,
    currentFY,
    refresh,

    // Run modal
    runModalOpen,
    runMode,
    runTargetAsset,
    runForm,
    runFormErrors,
    isRunning,
    runResult,
    openRunModal,
    closeRunModal,
    handleRunFormChange,
    handleRunSubmit,

    // Ledger drawer
    ledgerDrawerOpen,
    ledgerData,
    ledgerLoading,
    openLedgerDrawer,
    closeLedgerDrawer,
  };
};
