// client/src/hooks/useTransfers.js
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  getTransfersApi,
  getTransferByIdApi,
  raiseTransferApi,
  updateTransferApi,
  approveTransferApi,
  rejectTransferApi,
  deleteTransferApi,
} from "../api/transferApi";
import { getActiveLocationsApi } from "../api/locationApi";
import { getActiveDepartmentsApi } from "../api/departmentApi";
import { getActiveEmployeesApi } from "../api/employeeApi";
import { getAssetsApi } from "../api/assetApi";
import useAuthStore from "../store/authStore";

const INITIAL_FORM = {
  assetId: "",
  fromLocationId: "",
  fromDepartmentId: "",
  fromEmployeeId: "",
  toLocationId: "",
  toDepartmentId: "",
  toEmployeeId: "",
  reason: "",
};

const INITIAL_FILTERS = { status: "", assetId: "" };

export const useTransfers = () => {
  const { user } = useAuthStore();
  const role = user?.role || "";
  const canAdmin = ["SuperAdmin", "Admin"].includes(role);
  const canManage = ["SuperAdmin", "Admin", "AssetManager"].includes(role);

  // ── List state ────────────────────────────────────────────────────────────
  const [transfers, setTransfers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // ── Modal / drawer state ──────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null); // ← NEW
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  // ── Dropdowns ─────────────────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [toDepartments, setToDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const dropdownsFetched = useRef(false);

  // ── Fetch transfers ───────────────────────────────────────────────────────
  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      pageSize,
      ...(filters.status && { status: filters.status }),
      ...(filters.assetId && { assetId: filters.assetId }),
    };
    const res = await getTransfersApi(params);
    if (res.success) {
      setTransfers(res.data?.transfers || res.data || []);
      setTotalCount(res.data?.total || 0);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // ── Fetch dropdowns ───────────────────────────────────────────────────────
  const fetchDropdowns = useCallback(async (force = false) => {
    if (dropdownsFetched.current && !force) return;
    setDropdownsLoading(true);
    const [locRes, deptRes, empRes, assetRes] = await Promise.all([
      getActiveLocationsApi(),
      getActiveDepartmentsApi(),
      getActiveEmployeesApi(),
      getAssetsApi({ pageSize: 500, status: "Active" }),
    ]);
    if (locRes.success) setLocations(locRes.data || []);
    if (deptRes.success) setAllDepartments(deptRes.data || []);
    if (empRes.success) setEmployees(empRes.data || []);
    if (assetRes.success)
      setAssets(assetRes.data?.assets || assetRes.data || []);
    dropdownsFetched.current = true;
    setDropdownsLoading(false);
  }, []);

  // ── To-location → to-department cascade ──────────────────────────────────
  useEffect(() => {
    if (!allDepartments.length) return;
    if (form.toLocationId) {
      const depts = allDepartments.filter(
        (d) => String(d.location_id) === String(form.toLocationId),
      );
      setToDepartments(depts);
      const valid = depts.find(
        (d) => String(d.id) === String(form.toDepartmentId),
      );
      if (!valid) setForm((prev) => ({ ...prev, toDepartmentId: "" }));
    } else {
      setToDepartments([]);
      setForm((prev) => ({ ...prev, toDepartmentId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.toLocationId, allDepartments]);

  // ── When asset is selected, pre-fill FROM fields ──────────────────────────
  useEffect(() => {
    if (!form.assetId || !assets.length || editingTransfer) return; // skip in edit mode
    const asset = assets.find((a) => String(a.id) === String(form.assetId));
    if (asset) {
      setForm((prev) => ({
        ...prev,
        fromLocationId: String(asset.location_id || ""),
        fromDepartmentId: String(asset.department_id || ""),
        fromEmployeeId: String(asset.assigned_employee_id || ""),
      }));
    }
  }, [form.assetId, assets, editingTransfer]);

  // ── Filters ───────────────────────────────────────────────────────────────
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
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!editingTransfer && !form.assetId)
      errors.assetId = "Asset is required.";
    if (!form.toLocationId)
      errors.toLocationId = "Destination location is required.";
    if (!form.toDepartmentId)
      errors.toDepartmentId = "Destination department is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => ({
    assetId: Number(form.assetId),
    fromLocationId: form.fromLocationId ? Number(form.fromLocationId) : null,
    fromDepartmentId: form.fromDepartmentId
      ? Number(form.fromDepartmentId)
      : null,
    fromEmployeeId: form.fromEmployeeId ? Number(form.fromEmployeeId) : null,
    toLocationId: Number(form.toLocationId),
    toDepartmentId: Number(form.toDepartmentId),
    toEmployeeId: form.toEmployeeId ? Number(form.toEmployeeId) : null,
    reason: form.reason?.trim() || "",
  });

  // ── Open raise drawer ─────────────────────────────────────────────────────
  const openRaiseDrawer = () => {
    if (!canManage) {
      toast.error("You don't have permission to raise transfers.");
      return;
    }
    setEditingTransfer(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    fetchDropdowns(true);
    setDrawerOpen(true);
  };

  // ── Open edit drawer ──────────────────────────────────────────────────────
  const openEditDrawer = (transfer) => {
    if (!canManage) {
      toast.error("You don't have permission to edit transfers.");
      return;
    }
    setEditingTransfer(transfer);
    setForm({
      assetId: String(transfer.asset_id || ""),
      fromLocationId: String(transfer.from_location_id || ""),
      fromDepartmentId: String(transfer.from_department_id || ""),
      fromEmployeeId: String(transfer.from_employee_id || ""),
      toLocationId: String(transfer.to_location_id || ""),
      toDepartmentId: String(transfer.to_department_id || ""),
      toEmployeeId: String(transfer.to_employee_id || ""),
      reason: transfer.reason || "",
    });
    setFormErrors({});
    fetchDropdowns(true);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingTransfer(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
  };

  // ── Open view modal ───────────────────────────────────────────────────────
  const openViewModal = async (transfer) => {
    const res = await getTransferByIdApi(transfer.id);
    setSelectedTransfer(res.success ? res.data : transfer);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedTransfer(null);
  };

  // ── Open reject modal ─────────────────────────────────────────────────────
  const openRejectModal = (transfer) => {
    setSelectedTransfer(transfer);
    setRejectionReason("");
    setRejectModalOpen(true);
  };
  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedTransfer(null);
    setRejectionReason("");
  };

  // ── Submit raise or update ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    if (editingTransfer) {
      // ── EDIT MODE
      const payload = {
        toLocationId: Number(form.toLocationId),
        toDepartmentId: Number(form.toDepartmentId),
        toEmployeeId: form.toEmployeeId ? Number(form.toEmployeeId) : null,
        reason: form.reason?.trim() || "",
      };
      const res = await updateTransferApi(editingTransfer.id, payload);
      if (res.success) {
        toast.success("Transfer updated successfully.");
        closeDrawer();
        fetchTransfers();
      } else {
        toast.error(res.message);
      }
    } else {
      // ── RAISE MODE
      const res = await raiseTransferApi(buildPayload());
      if (res.success) {
        toast.success("Transfer raised successfully.");
        closeDrawer();
        fetchTransfers();
      } else {
        toast.error(res.message);
      }
    }
    setIsSubmitting(false);
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (transfer) => {
    if (!canAdmin) {
      toast.error("Only Admin can approve transfers.");
      return;
    }
    setIsSubmitting(true);
    const res = await approveTransferApi(transfer.id);
    if (res.success) {
      toast.success("Transfer approved — asset location updated.");
      closeViewModal();
      fetchTransfers();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedTransfer) return;
    setIsSubmitting(true);
    const res = await rejectTransferApi(selectedTransfer.id, rejectionReason);
    if (res.success) {
      toast.success("Transfer rejected.");
      closeRejectModal();
      closeViewModal();
      fetchTransfers();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (transfer) => {
    if (!canAdmin) {
      toast.error("Only Admin can delete transfers.");
      return;
    }
    const res = await deleteTransferApi(transfer.id);
    if (res.success) {
      toast.success("Transfer deleted.");
      fetchTransfers();
    } else {
      toast.error(res.message);
    }
  };

  const refresh = () => fetchTransfers();

  return {
    // list
    transfers,
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
    allDepartments,
    toDepartments,
    employees,
    assets,
    dropdownsLoading,
    // drawer
    drawerOpen,
    editingTransfer,
    openRaiseDrawer,
    openEditDrawer,
    closeDrawer,
    // view modal
    viewModalOpen,
    openViewModal,
    closeViewModal,
    // reject modal
    rejectModalOpen,
    openRejectModal,
    closeRejectModal,
    rejectionReason,
    setRejectionReason,
    // selected
    selectedTransfer,
    // form
    form,
    formErrors,
    handleFormChange,
    handleSubmit,
    // actions
    handleApprove,
    handleReject,
    handleDelete,
    isSubmitting,
    // permissions
    canAdmin,
    canManage,
    refresh,
  };
};
