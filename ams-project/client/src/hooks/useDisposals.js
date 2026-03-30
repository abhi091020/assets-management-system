// client/src/hooks/useDisposals.js
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  getDisposalsApi,
  getDisposalByIdApi,
  raiseDisposalApi,
  updateDisposalApi,
  approveDisposalApi,
  rejectDisposalApi,
  deleteDisposalApi,
} from "../api/disposalApi";
import { getAssetsApi } from "../api/assetApi";
import { getLocationsApi } from "../api/locationApi";
import { getDepartmentsApi } from "../api/departmentApi";
import useAuthStore from "../store/authStore";

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

const INITIAL_FORM = {
  locationId: "",
  departmentId: "",
  assetId: "",
  reason: "",
  disposalMethod: "",
  saleAmount: "",
  scrapValue: "",
  disposalDate: getTodayISO(),
  buyerDetails: "",
};

const INITIAL_FILTERS = { status: "" };

export const useDisposals = () => {
  const { user } = useAuthStore();
  const role = user?.role || "";
  const canAdmin = ["SuperAdmin", "Admin"].includes(role);
  const canManage = ["SuperAdmin", "Admin", "AssetManager"].includes(role);

  const [disposals, setDisposals] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const [pendingAssetIds, setPendingAssetIds] = useState(new Set());

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDisposal, setEditingDisposal] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDisposal, setSelectedDisposal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const dropdownsFetched = useRef(false);

  // ── Fetch disposals ───────────────────────────────────────────────────────
  const fetchDisposals = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      pageSize,
      ...(filters.status && { status: filters.status }),
    };
    const res = await getDisposalsApi(params);
    if (res.success) {
      setDisposals(res.data?.disposals || res.data || []);
      setTotalCount(res.data?.total || 0);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchDisposals();
  }, [fetchDisposals]);

  // ── Fetch ALL pending disposals for pendingAssetIds ───────────────────────
  const fetchPendingAssetIds = useCallback(async () => {
    const res = await getDisposalsApi({ status: "Pending", pageSize: 500 });
    if (res.success) {
      const list = res.data?.disposals || res.data || [];
      setPendingAssetIds(new Set(list.map((d) => String(d.asset_id))));
    }
  }, []);

  useEffect(() => {
    fetchPendingAssetIds();
  }, [fetchPendingAssetIds]);

  // ── Fetch dropdowns ───────────────────────────────────────────────────────
  const fetchDropdowns = useCallback(async (force = false) => {
    if (dropdownsFetched.current && !force) return;
    setDropdownsLoading(true);
    const [assetsRes, locRes, deptRes] = await Promise.all([
      getAssetsApi({ pageSize: 500, status: "Active" }),
      getLocationsApi({ pageSize: 500, status: "Active" }),
      getDepartmentsApi({ pageSize: 500, status: "Active" }),
    ]);
    if (assetsRes.success)
      setAssets(assetsRes.data?.assets || assetsRes.data || []);
    if (locRes.success)
      setLocations(locRes.data?.locations || locRes.data || []);
    if (deptRes.success)
      setDepartments(deptRes.data?.departments || deptRes.data || []);
    dropdownsFetched.current = true;
    setDropdownsLoading(false);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  // ── Form ──────────────────────────────────────────────────────────────────
  const handleFormChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "locationId") {
        next.departmentId = "";
        next.assetId = "";
      }
      if (key === "departmentId") {
        next.assetId = "";
      }
      if (key === "assetId" && value) {
        const selectedAsset = assets.find(
          (a) => String(a.id) === String(value),
        );
        if (selectedAsset?.department_id) {
          next.departmentId = String(selectedAsset.department_id);
        }
      }
      return next;
    });
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!editingDisposal && !form.locationId)
      errors.locationId = "Location is required.";
    if (!editingDisposal && !form.departmentId)
      errors.departmentId = "Department is required.";
    if (!editingDisposal && !form.assetId)
      errors.assetId = "Asset is required.";
    if (!form.reason?.trim()) errors.reason = "Reason is required.";
    if (!form.disposalMethod)
      errors.disposalMethod = "Disposal method is required.";
    if (!form.disposalDate) errors.disposalDate = "Disposal date is required.";
    if (form.disposalMethod === "Sold" && !form.saleAmount)
      errors.saleAmount = "Sale amount is required for Sold disposal.";
    if (form.saleAmount && isNaN(Number(form.saleAmount)))
      errors.saleAmount = "Sale amount must be a number.";
    if (form.scrapValue && isNaN(Number(form.scrapValue)))
      errors.scrapValue = "Scrap value must be a number.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => ({
    assetId: Number(form.assetId),
    reason: form.reason.trim(),
    disposalMethod: form.disposalMethod,
    saleAmount: form.saleAmount ? Number(form.saleAmount) : null,
    scrapValue: form.scrapValue ? Number(form.scrapValue) : null,
    disposalDate: form.disposalDate || null,
    buyerDetails: form.buyerDetails?.trim() || null,
  });

  const openRaiseDrawer = () => {
    if (!canManage) {
      toast.error("You don't have permission to raise disposals.");
      return;
    }
    setEditingDisposal(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    fetchDropdowns(true);
    fetchPendingAssetIds();
    setDrawerOpen(true);
  };

  const openEditDrawer = (disposal) => {
    if (!canManage) {
      toast.error("You don't have permission to edit disposals.");
      return;
    }
    setEditingDisposal(disposal);
    setForm({
      locationId: String(disposal.location_id || ""),
      departmentId: String(disposal.department_id || ""),
      assetId: String(disposal.asset_id || ""),
      reason: disposal.reason || "",
      disposalMethod: disposal.disposal_method || "",
      saleAmount: disposal.sale_amount ? String(disposal.sale_amount) : "",
      scrapValue: disposal.scrap_value ? String(disposal.scrap_value) : "",
      disposalDate: disposal.disposal_date
        ? disposal.disposal_date.split("T")[0]
        : getTodayISO(),
      buyerDetails: disposal.buyer_details || "",
    });
    setFormErrors({});
    fetchDropdowns(true);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingDisposal(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
  };

  const openViewModal = async (disposal) => {
    const res = await getDisposalByIdApi(disposal.id);
    setSelectedDisposal(res.success ? res.data : disposal);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedDisposal(null);
  };

  const openRejectModal = (disposal) => {
    setSelectedDisposal(disposal);
    setRejectionReason("");
    setRejectModalOpen(true);
  };
  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedDisposal(null);
    setRejectionReason("");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    if (editingDisposal) {
      const payload = {
        reason: form.reason.trim(),
        disposalMethod: form.disposalMethod,
        saleAmount: form.saleAmount ? Number(form.saleAmount) : null,
        scrapValue: form.scrapValue ? Number(form.scrapValue) : null,
        disposalDate: form.disposalDate || null,
        buyerDetails: form.buyerDetails?.trim() || null,
      };
      const res = await updateDisposalApi(editingDisposal.id, payload);
      if (res.success) {
        toast.success("Disposal updated successfully.");
        closeDrawer();
        fetchDisposals();
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await raiseDisposalApi(buildPayload());
      if (res.success) {
        toast.success("Disposal raised successfully.");
        closeDrawer();
        fetchDisposals();
        fetchPendingAssetIds();
      } else {
        toast.error(res.message);
      }
    }
    setIsSubmitting(false);
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (disposal) => {
    if (!canAdmin) {
      toast.error("Only Admin can approve disposals.");
      return;
    }
    setIsSubmitting(true);
    const res = await approveDisposalApi(disposal.id);
    if (res.success) {
      toast.success(
        `${disposal.disposal_code} approved — ${disposal.asset_name} marked as Disposed.`,
      );
      closeViewModal();
      fetchDisposals();
      fetchPendingAssetIds();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedDisposal) return;
    setIsSubmitting(true);
    const wasApproved = selectedDisposal.status === "Approved";
    const res = await rejectDisposalApi(selectedDisposal.id, rejectionReason);
    if (res.success) {
      toast.success(
        wasApproved
          ? `${selectedDisposal.disposal_code} rejected — ${selectedDisposal.asset_name} restored to Active.`
          : `${selectedDisposal.disposal_code} rejected.`,
      );
      closeRejectModal();
      closeViewModal();
      fetchDisposals();
      fetchPendingAssetIds();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (disposal) => {
    if (!canAdmin) {
      toast.error("Only Admin can delete disposals.");
      return;
    }
    const wasApproved = disposal.status === "Approved";
    const res = await deleteDisposalApi(disposal.id);
    if (res.success) {
      toast.success(
        wasApproved
          ? `${disposal.disposal_code} deleted — ${disposal.asset_name} restored to Active.`
          : `${disposal.disposal_code} deleted.`,
      );
      fetchDisposals();
      fetchPendingAssetIds();
    } else {
      toast.error(res.message);
    }
  };

  const refresh = () => {
    fetchDisposals();
    fetchPendingAssetIds();
  };

  return {
    disposals,
    totalCount,
    loading,
    page,
    pageSize,
    setPage,
    filters,
    handleFilterChange,
    handleClearFilters,
    assets,
    locations,
    departments,
    dropdownsLoading,
    pendingAssetIds,
    drawerOpen,
    editingDisposal,
    openRaiseDrawer,
    openEditDrawer,
    closeDrawer,
    viewModalOpen,
    openViewModal,
    closeViewModal,
    rejectModalOpen,
    openRejectModal,
    closeRejectModal,
    rejectionReason,
    setRejectionReason,
    selectedDisposal,
    form,
    formErrors,
    handleFormChange,
    handleSubmit,
    handleApprove,
    handleReject,
    handleDelete,
    isSubmitting,
    canAdmin,
    canManage,
    refresh,
  };
};
