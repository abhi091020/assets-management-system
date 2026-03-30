// client/src/hooks/useAMC.js

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getExpiringAMCApi, getExpiringInsuranceApi } from "../api/amcApi";

export const useAMC = () => {
  // ── Tab state — "amc" | "insurance" ──────────────────────────────────────
  const [activeTab, setActiveTab] = useState("amc");

  // ── AMC state ─────────────────────────────────────────────────────────────
  const [amcAssets, setAmcAssets] = useState([]);
  const [amcTotal, setAmcTotal] = useState(0);
  const [amcLoading, setAmcLoading] = useState(false);
  const [amcPage, setAmcPage] = useState(1);
  const [amcDays, setAmcDays] = useState(30);

  // ── Insurance state ───────────────────────────────────────────────────────
  const [insuranceAssets, setInsuranceAssets] = useState([]);
  const [insuranceTotal, setInsuranceTotal] = useState(0);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insurancePage, setInsurancePage] = useState(1);
  const [insuranceDays, setInsuranceDays] = useState(30);

  const [pageSize] = useState(20);

  // ── Fetch AMC ─────────────────────────────────────────────────────────────
  const fetchAMC = useCallback(async () => {
    setAmcLoading(true);
    const res = await getExpiringAMCApi({
      days: amcDays,
      page: amcPage,
      pageSize,
    });
    if (res.success) {
      setAmcAssets(res.data?.data || []);
      setAmcTotal(res.data?.total || 0);
    } else {
      toast.error(res.message);
    }
    setAmcLoading(false);
  }, [amcDays, amcPage, pageSize]);

  // ── Fetch Insurance ───────────────────────────────────────────────────────
  const fetchInsurance = useCallback(async () => {
    setInsuranceLoading(true);
    const res = await getExpiringInsuranceApi({
      days: insuranceDays,
      page: insurancePage,
      pageSize,
    });
    if (res.success) {
      setInsuranceAssets(res.data?.data || []);
      setInsuranceTotal(res.data?.total || 0);
    } else {
      toast.error(res.message);
    }
    setInsuranceLoading(false);
  }, [insuranceDays, insurancePage, pageSize]);

  useEffect(() => {
    fetchAMC();
  }, [fetchAMC]);

  useEffect(() => {
    fetchInsurance();
  }, [fetchInsurance]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAmcDaysChange = (days) => {
    setAmcDays(days);
    setAmcPage(1);
  };

  const handleInsuranceDaysChange = (days) => {
    setInsuranceDays(days);
    setInsurancePage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const refreshAMC = () => fetchAMC();
  const refreshInsurance = () => fetchInsurance();

  return {
    // Tab
    activeTab,
    handleTabChange,

    // AMC
    amcAssets,
    amcTotal,
    amcLoading,
    amcPage,
    setAmcPage,
    amcDays,
    handleAmcDaysChange,
    refreshAMC,

    // Insurance
    insuranceAssets,
    insuranceTotal,
    insuranceLoading,
    insurancePage,
    setInsurancePage,
    insuranceDays,
    handleInsuranceDaysChange,
    refreshInsurance,

    pageSize,
  };
};
