// client/src/hooks/useVerification.js
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  getBatchesApi,
  getBatchByIdApi,
  createBatchApi,
  closeBatchApi,
  reopenBatchApi,
  deleteBatchApi,
  getBatchItemsApi,
  addItemToBatchApi,
  verifyItemApi,
  removeItemApi,
} from "../api/verificationApi";
import { getActiveLocationsApi } from "../api/locationApi";
import { getActiveDepartmentsApi } from "../api/departmentApi";
import { getAssetsApi } from "../api/assetApi";
import useAuthStore from "../store/authStore";

const INITIAL_BATCH_FORM = {
  title: "",
  locationId: "",
  departmentId: "",
  remarks: "",
};
const INITIAL_FILTERS = { status: "", locationId: "" };

export const useVerification = () => {
  const { user } = useAuthStore();
  const role = user?.role || "";
  const canAdmin = ["SuperAdmin", "Admin"].includes(role);
  const canManage = ["SuperAdmin", "Admin", "AssetManager"].includes(role);
  const canVerify = ["SuperAdmin", "Admin", "AssetManager", "Auditor"].includes(
    role,
  );

  // ── Batches list ──────────────────────────────────────────────────────────
  const [batches, setBatches] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // ── Batch form drawer ─────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [batchForm, setBatchForm] = useState(INITIAL_BATCH_FORM);
  const [batchFormErrors, setBatchFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Batch detail modal ────────────────────────────────────────────────────
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchItems, setBatchItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // ── Add asset to batch ────────────────────────────────────────────────────
  const [addAssetId, setAddAssetId] = useState("");
  const [addingAsset, setAddingAsset] = useState(false);

  // ── Verify item modal ─────────────────────────────────────────────────────
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    status: "Verified",
    conditionFound: "",
    remarks: "",
  });

  // ── Inline item loading state ─────────────────────────────────────────────
  const [loadingItemId, setLoadingItemId] = useState(null);

  // ── Dropdowns ─────────────────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const dropdownsFetched = useRef(false);

  // ── Fetch batches ─────────────────────────────────────────────────────────
  const fetchBatches = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      pageSize,
      ...(filters.status && { status: filters.status }),
      ...(filters.locationId && { locationId: filters.locationId }),
    };
    const res = await getBatchesApi(params);
    if (res.success) {
      setBatches(res.data?.batches || res.data || []);
      setTotalCount(res.data?.total || 0);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // ── Fetch dropdowns ───────────────────────────────────────────────────────
  const fetchDropdowns = useCallback(async (force = false) => {
    if (dropdownsFetched.current && !force) return;
    setDropdownsLoading(true);
    const [locRes, deptRes, assetRes] = await Promise.all([
      getActiveLocationsApi(),
      getActiveDepartmentsApi(),
      getAssetsApi({ pageSize: 500 }),
    ]);
    if (locRes.success) setLocations(locRes.data || []);
    if (deptRes.success) setDepartments(deptRes.data || []);
    if (assetRes.success)
      setAssets(assetRes.data?.assets || assetRes.data || []);
    dropdownsFetched.current = true;
    setDropdownsLoading(false);
  }, []);

  // ── Filters ───────────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  // ── Batch form ────────────────────────────────────────────────────────────
  const handleBatchFormChange = (key, value) => {
    setBatchForm((prev) => ({ ...prev, [key]: value }));
    if (batchFormErrors[key])
      setBatchFormErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const openCreateDrawer = () => {
    if (!canManage) {
      toast.error("You don't have permission to create batches.");
      return;
    }
    setBatchForm(INITIAL_BATCH_FORM);
    setBatchFormErrors({});
    fetchDropdowns();
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setBatchForm(INITIAL_BATCH_FORM);
    setBatchFormErrors({});
  };

  const handleCreateBatch = async () => {
    const errors = {};
    if (!batchForm.title?.trim()) errors.title = "Title is required.";
    if (Object.keys(errors).length) {
      setBatchFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: batchForm.title.trim(),
      locationId: batchForm.locationId ? Number(batchForm.locationId) : null,
      departmentId: batchForm.departmentId
        ? Number(batchForm.departmentId)
        : null,
      remarks: batchForm.remarks?.trim() || null,
    };
    const res = await createBatchApi(payload);
    if (res.success) {
      toast.success("Verification batch created.");
      closeDrawer();
      fetchBatches();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  // ── View batch detail + items ─────────────────────────────────────────────
  const openViewModal = async (batch) => {
    const res = await getBatchByIdApi(batch.id);
    setSelectedBatch(res.success ? res.data : batch);
    setViewModalOpen(true);
    fetchDropdowns();
    loadBatchItems(batch.id);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedBatch(null);
    setBatchItems([]);
    setAddAssetId("");
  };

  const loadBatchItems = async (batchId) => {
    setItemsLoading(true);
    const res = await getBatchItemsApi(batchId);
    if (res.success) setBatchItems(res.data || []);
    setItemsLoading(false);
  };

  // ── Add asset to batch ────────────────────────────────────────────────────
  const handleAddAsset = async () => {
    if (!addAssetId) {
      toast.error("Please select an asset.");
      return;
    }
    setAddingAsset(true);
    const res = await addItemToBatchApi(selectedBatch.id, Number(addAssetId));
    if (res.success) {
      toast.success("Asset added to batch.");
      setAddAssetId("");
      loadBatchItems(selectedBatch.id);
    } else {
      toast.error(res.message);
    }
    setAddingAsset(false);
  };

  // ── Remove item from batch ────────────────────────────────────────────────
  const handleRemoveItem = async (itemId) => {
    const res = await removeItemApi(itemId);
    if (res.success) {
      toast.success("Item removed.");
      loadBatchItems(selectedBatch.id);
    } else {
      toast.error(res.message);
    }
  };

  // ── Open verify modal ─────────────────────────────────────────────────────
  const openVerifyModal = (item) => {
    if (!canVerify) {
      toast.error("You don't have permission to verify items.");
      return;
    }
    setSelectedItem(item);
    setVerifyForm({
      status: "Verified",
      conditionFound: item.current_condition || "",
      remarks: "",
    });
    setVerifyModalOpen(true);
  };

  const closeVerifyModal = () => {
    setVerifyModalOpen(false);
    setSelectedItem(null);
  };

  const handleVerifyItem = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    const res = await verifyItemApi(selectedItem.id, {
      status: verifyForm.status,
      conditionFound: verifyForm.conditionFound || null,
      remarks: verifyForm.remarks?.trim() || null,
    });
    if (res.success) {
      toast.success(`Item marked as ${verifyForm.status}.`);
      closeVerifyModal();
      loadBatchItems(selectedBatch.id);
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  // ── Inline verify (Not Found — no modal) ─────────────────────────────────
  const handleVerifyInline = async (item, status, form) => {
    setLoadingItemId(item.id);
    const res = await verifyItemApi(item.id, {
      status,
      conditionFound: form.conditionFound || null,
      remarks: form.remarks?.trim() || null,
    });
    if (res.success) {
      toast.success(
        `Marked as ${status === "NotFound" ? "Not Found" : status}.`,
      );
      loadBatchItems(selectedBatch.id);
    } else {
      toast.error(res.message);
    }
    setLoadingItemId(null);
  };

  // ── Close batch ───────────────────────────────────────────────────────────
  const handleCloseBatch = async (batch) => {
    if (!canManage) {
      toast.error("You don't have permission to close batches.");
      return;
    }
    const res = await closeBatchApi(batch.id);
    if (res.success) {
      toast.success("Batch closed.");
      closeViewModal();
      fetchBatches();
    } else {
      toast.error(res.message);
    }
  };

  // ── Re-open batch (Admin only) ────────────────────────────────────────────
  const handleReopenBatch = async (batch) => {
    if (!canAdmin) {
      toast.error("Only Admin can re-open batches.");
      return;
    }
    const res = await reopenBatchApi(batch.id);
    if (res.success) {
      toast.success("Batch re-opened. You can continue verification.");
      // Refresh the selected batch state so modal updates immediately
      const updated = await getBatchByIdApi(batch.id);
      if (updated.success) setSelectedBatch(updated.data);
      fetchBatches();
    } else {
      toast.error(res.message);
    }
  };

  // ── Delete batch ──────────────────────────────────────────────────────────
  const handleDeleteBatch = async (batch) => {
    if (!canAdmin) {
      toast.error("Only Admin can delete batches.");
      return;
    }
    const res = await deleteBatchApi(batch.id);
    if (res.success) {
      toast.success("Batch deleted.");
      fetchBatches();
    } else {
      toast.error(res.message);
    }
  };

  const refresh = () => fetchBatches();

  return {
    // list
    batches,
    totalCount,
    loading,
    page,
    pageSize,
    setPage,
    // filters
    filters,
    handleFilterChange,
    handleClearFilters,
    // dropdowns
    locations,
    departments,
    assets,
    dropdownsLoading,
    // batch create drawer
    drawerOpen,
    openCreateDrawer,
    closeDrawer,
    batchForm,
    batchFormErrors,
    handleBatchFormChange,
    handleCreateBatch,
    // batch view modal
    viewModalOpen,
    openViewModal,
    closeViewModal,
    selectedBatch,
    batchItems,
    itemsLoading,
    // add asset to batch
    addAssetId,
    setAddAssetId,
    handleAddAsset,
    addingAsset,
    // remove item
    handleRemoveItem,
    // verify modal
    verifyModalOpen,
    openVerifyModal,
    closeVerifyModal,
    selectedItem,
    verifyForm,
    setVerifyForm,
    handleVerifyItem,
    // inline verify
    handleVerifyInline,
    loadingItemId,
    // batch actions
    handleCloseBatch,
    handleReopenBatch,
    handleDeleteBatch,
    isSubmitting,
    // permissions
    canAdmin,
    canManage,
    canVerify,
    refresh,
  };
};
