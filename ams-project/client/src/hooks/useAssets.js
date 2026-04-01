// client/src/hooks/useAssets.js

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  getAssetsApi,
  getAssetByIdApi,
  createAssetApi,
  updateAssetApi,
  updateAssetStatusApi,
  deleteAssetApi,
} from "../api/assetApi";
import { getActiveLocationsApi } from "../api/locationApi";
import { getActiveDepartmentsApi } from "../api/departmentApi";
import { getActiveCategoriesApi } from "../api/categoryApi";
import { getActiveEmployeesApi } from "../api/employeeApi";
import useAuthStore from "../store/authStore";

const INITIAL_FORM = {
  asset_name: "",
  description: "",
  category_id: "",
  asset_type: "",
  location_id: "",
  department_id: "",
  assigned_employee_id: "",
  purchase_date: "",
  purchase_cost: "",
  depreciation_method: "",
  useful_life_years: "",
  vendor: "",
  invoice_number: "",
  invoice_date: "",
  scrap_value: "",
  warranty_expiry: "",
  serial_number: "",
  model_number: "",
  brand: "",
  color: "",
  condition: "New",
  status: "Active",
  insurance_policy_no: "",
  insurance_company: "",
  insurance_expiry_date: "",
  amc_vendor: "",
  amc_expiry_date: "",
};

const INITIAL_FILTERS = {
  search: "",
  status: "",
  categoryId: "",
  locationId: "",
  departmentId: "",
  condition: "",
};

// ── Helper: map a full asset record → form state ──────────────────────────────
function assetToForm(asset) {
  return {
    asset_name: asset.asset_name || "",
    description: asset.description || "",
    category_id: asset.category_id || "",
    asset_type: asset.asset_type || "",
    location_id: asset.location_id || "",
    department_id: asset.department_id || "",
    assigned_employee_id: asset.assigned_employee_id || "",
    purchase_date: asset.purchase_date?.split("T")[0] || "",
    purchase_cost: asset.purchase_cost ?? "",
    depreciation_method: asset.depreciation_method || "",
    useful_life_years: asset.useful_life_years ?? "",
    vendor: asset.vendor || "",
    invoice_number: asset.invoice_number || "",
    invoice_date: asset.invoice_date?.split("T")[0] || "",
    scrap_value: asset.scrap_value ?? "",
    warranty_expiry: asset.warranty_expiry?.split("T")[0] || "",
    serial_number: asset.serial_number || "",
    model_number: asset.model_number || "",
    brand: asset.brand || "",
    color: asset.color || "",
    condition: asset.condition || "New",
    status: asset.status || "Active",
    insurance_policy_no: asset.insurance_policy_no || "",
    insurance_company: asset.insurance_company || "",
    insurance_expiry_date: asset.insurance_expiry_date?.split("T")[0] || "",
    amc_vendor: asset.amc_vendor || "",
    amc_expiry_date: asset.amc_expiry_date?.split("T")[0] || "",
  };
}

// ── Build ancestor path [ rootId, …, leafId ] from a flat category list ───────
function buildCategoryPath(categories, leafId) {
  if (!leafId || !categories.length) return [];
  const map = {};
  categories.forEach((c) => (map[c.id] = c));
  const path = [];
  let cur = map[Number(leafId)];
  while (cur) {
    path.unshift(cur.id);
    cur = cur.parent_category_id ? map[cur.parent_category_id] : null;
  }
  return path;
}

export const useAssets = () => {
  const { user } = useAuthStore();
  const role = user?.role || "";
  const canAdmin = ["SuperAdmin", "Admin"].includes(role);
  const canManage = ["SuperAdmin", "Admin", "AssetManager"].includes(role);

  const [assets, setAssets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const debounceRef = useRef(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  // ── Category cascade path ─────────────────────────────────────────────────
  const [categoryPath, setCategoryPath] = useState([]);

  const [locations, setLocations] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const dropdownsFetchedRef = useRef(false);

  const [filterDepartments, setFilterDepartments] = useState([]);

  // ── Fetch assets ──────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      pageSize,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.locationId && { locationId: filters.locationId }),
      ...(filters.departmentId && { departmentId: filters.departmentId }),
      ...(filters.condition && { condition: filters.condition }),
    };
    const res = await getAssetsApi(params);
    if (res.success) {
      setAssets(res.data?.assets || res.data || []);
      setTotalCount(res.data?.total || 0);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // ── Fetch dropdowns — cached ──────────────────────────────────────────────
  const fetchDropdowns = useCallback(async (force = false) => {
    if (dropdownsFetchedRef.current && !force) return;
    setDropdownsLoading(true);
    const [locRes, deptRes, catRes, empRes] = await Promise.all([
      getActiveLocationsApi(),
      getActiveDepartmentsApi(),
      getActiveCategoriesApi(),
      getActiveEmployeesApi(),
    ]);
    if (locRes.success) setLocations(locRes.data || []);
    if (deptRes.success) setAllDepartments(deptRes.data || []);
    if (catRes.success) setCategories(catRes.data || []);
    if (empRes.success) setAllEmployees(empRes.data || []);
    dropdownsFetchedRef.current = true;
    setDropdownsLoading(false);
  }, []);

  // ── When editing: rebuild categoryPath once categories are loaded ─────────
  useEffect(() => {
    if (editingAsset && categories.length > 0) {
      setCategoryPath(buildCategoryPath(categories, editingAsset.category_id));
    }
  }, [editingAsset, categories]);

  // ── Form location → department cascade ────────────────────────────────────
  useEffect(() => {
    if (!allDepartments.length) return;
    if (form.location_id) {
      const depts = allDepartments.filter(
        (d) => String(d.location_id) === String(form.location_id),
      );
      setFilteredDepartments(depts);
      const valid = depts.find((d) => String(d.id) === String(form.department_id));
      if (!valid) setForm((prev) => ({ ...prev, department_id: "" }));
    } else {
      setFilteredDepartments([]);
      setForm((prev) => ({ ...prev, department_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.location_id, allDepartments]);

  // ── Form department → employee cascade ────────────────────────────────────
  useEffect(() => {
    if (!allEmployees.length) return;
    if (form.department_id) {
      const emps = allEmployees.filter(
        (e) => String(e.department_id) === String(form.department_id),
      );
      setFilteredEmployees(emps);
      // Clear assigned employee if they don't belong to the new department
      const valid = emps.find(
        (e) => String(e.id) === String(form.assigned_employee_id),
      );
      if (!valid && form.assigned_employee_id) {
        setForm((prev) => ({ ...prev, assigned_employee_id: "" }));
      }
    } else {
      setFilteredEmployees([]);
      setForm((prev) => ({ ...prev, assigned_employee_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.department_id, allEmployees]);

  // ── Filter location → department cascade ─────────────────────────────────
  useEffect(() => {
    if (!allDepartments.length) return;
    if (filters.locationId) {
      const depts = allDepartments.filter(
        (d) => String(d.location_id) === String(filters.locationId),
      );
      setFilterDepartments(depts);
      if (filters.departmentId) {
        const valid = depts.find((d) => String(d.id) === String(filters.departmentId));
        if (!valid) setFilters((prev) => ({ ...prev, departmentId: "" }));
      }
    } else {
      setFilterDepartments([]);
      setFilters((prev) => ({ ...prev, departmentId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.locationId, allDepartments]);

  const handleSearchChange = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPage(1);
    }, 400);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // ── Category cascade handler ──────────────────────────────────────────────
  const handleCategoryChange = (path) => {
    setCategoryPath(path);
    const leafId = path.length > 0 ? path[path.length - 1] : "";
    setForm((prev) => ({ ...prev, category_id: leafId }));
    if (formErrors.category_id)
      setFormErrors((prev) => ({ ...prev, category_id: "" }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.asset_name?.trim()) errors.asset_name = "Asset name is required.";
    if (!form.category_id) errors.category_id = "Category is required.";
    if (!form.asset_type) errors.asset_type = "Asset type is required.";

    if (!form.location_id) errors.location_id = "Location is required.";
    if (!form.department_id) errors.department_id = "Department is required.";

    if (!form.purchase_date) errors.purchase_date = "Purchase date is required.";
    if (!form.purchase_cost && form.purchase_cost !== 0)
      errors.purchase_cost = "Purchase cost is required.";
    else if (isNaN(Number(form.purchase_cost)) || Number(form.purchase_cost) < 0)
      errors.purchase_cost = "Enter a valid purchase cost.";

    if (!form.depreciation_method)
      errors.depreciation_method = "Depreciation method is required.";
    if (!form.useful_life_years && form.useful_life_years !== 0)
      errors.useful_life_years = "Useful life is required.";
    else if (
      form.useful_life_years !== "" &&
      (isNaN(Number(form.useful_life_years)) ||
        Number(form.useful_life_years) < 1 ||
        Number(form.useful_life_years) > 99)
    )
      errors.useful_life_years = "Enter a valid number (1–99).";

    if (
      form.scrap_value !== "" &&
      (isNaN(Number(form.scrap_value)) || Number(form.scrap_value) < 0)
    )
      errors.scrap_value = "Enter a valid scrap value.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => ({
    assetName: form.asset_name.trim(),
    description: form.description?.trim() || "",
    categoryId: Number(form.category_id),
    assetType: form.asset_type,
    locationId: Number(form.location_id),
    departmentId: Number(form.department_id),
    assignedEmployeeId: form.assigned_employee_id
      ? Number(form.assigned_employee_id)
      : null,
    purchaseDate: form.purchase_date,
    purchaseCost: Number(form.purchase_cost),
    depreciationMethod: form.depreciation_method,
    usefulLifeYears: Number(form.useful_life_years),
    vendor: form.vendor?.trim() || "",
    invoiceNumber: form.invoice_number?.trim() || "",
    invoiceDate: form.invoice_date || null,
    scrapValue: form.scrap_value !== "" ? Number(form.scrap_value) : null,
    warrantyExpiry: form.warranty_expiry || null,
    serialNumber: form.serial_number?.trim() || "",
    modelNumber: form.model_number?.trim() || "",
    brand: form.brand?.trim() || "",
    color: form.color?.trim() || "",
    condition: form.condition,
    status: form.status,
    insurancePolicyNo: form.insurance_policy_no?.trim() || "",
    insuranceCompany: form.insurance_company?.trim() || "",
    insuranceExpiryDate: form.insurance_expiry_date || null,
    amcVendor: form.amc_vendor?.trim() || "",
    amcExpiryDate: form.amc_expiry_date || null,
  });

  // ── Open add drawer ───────────────────────────────────────────────────────
  const openAddDrawer = () => {
    if (!canManage) {
      toast.error("You don't have permission to add assets.");
      return;
    }
    setEditingAsset(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setCategoryPath([]);
    setFilteredDepartments([]);
    setFilteredEmployees([]);
    fetchDropdowns();
    setDrawerOpen(true);
  };

  // ── Open edit drawer ──────────────────────────────────────────────────────
  const openEditDrawer = async (asset) => {
    if (!canManage) {
      toast.error("You don't have permission to edit assets.");
      return;
    }
    setEditingAsset(asset);
    setForm(assetToForm(asset));
    setFormErrors({});
    setCategoryPath(buildCategoryPath(categories, asset.category_id));
    setDrawerOpen(true);
    fetchDropdowns();

    // Fetch full detail and silently update
    const res = await getAssetByIdApi(asset.id);
    if (res.success) {
      setEditingAsset(res.data);
      setForm(assetToForm(res.data));
      setCategoryPath(buildCategoryPath(categories, res.data.category_id));
    }
  };

  // ── Open view modal ───────────────────────────────────────────────────────
  const openViewModal = async (asset) => {
    const res = await getAssetByIdApi(asset.id);
    setSelectedAsset(res.success ? res.data : asset);
    setViewModalOpen(true);
  };

  // ── Open delete modal ─────────────────────────────────────────────────────
  const openDeleteModal = (asset) => {
    if (!canAdmin) {
      toast.error("You don't have permission to delete assets.");
      return;
    }
    setSelectedAsset(asset);
    setDeleteModalOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingAsset(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setCategoryPath([]);
    setFilteredDepartments([]);
    setFilteredEmployees([]);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedAsset(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedAsset(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const payload = buildPayload();
    if (editingAsset) {
      const res = await updateAssetApi(editingAsset.id, payload);
      if (res.success) {
        toast.success("Asset updated successfully.");
        closeDrawer();
        fetchAssets();
      } else toast.error(res.message);
    } else {
      const res = await createAssetApi(payload);
      if (res.success) {
        toast.success("Asset created successfully.");
        closeDrawer();
        fetchAssets();
      } else toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (asset, newStatus) => {
    if (!canManage) {
      toast.error("You don't have permission to update asset status.");
      return;
    }
    const res = await updateAssetStatusApi(asset.id, newStatus);
    if (res.success) {
      toast.success(`Asset marked as ${newStatus}.`);
      fetchAssets();
    } else toast.error(res.message);
  };

  const handleDelete = async (asset) => {
    const target = asset || selectedAsset;
    if (!target) return;
    setIsSubmitting(true);
    const res = await deleteAssetApi(target.id);
    if (res.success) {
      toast.success("Asset deleted successfully.");
      closeDeleteModal();
      fetchAssets();
    } else toast.error(res.message);
    setIsSubmitting(false);
  };

  const refresh = () => fetchAssets();

  return {
    assets,
    totalCount,
    loading,
    page,
    pageSize,
    setPage,
    filters,
    handleSearchChange,
    handleFilterChange,
    handleClearFilters,
    filterDepartments,
    drawerOpen,
    viewModalOpen,
    deleteModalOpen,
    selectedAsset,
    editingAsset,
    isSubmitting,
    form,
    formErrors,
    handleFormChange,
    handleSubmit,
    // ── Category cascade ──────────────────────────────────────────────────
    categoryPath,
    handleCategoryChange,
    // ─────────────────────────────────────────────────────────────────────
    locations,
    allDepartments,
    filteredDepartments,
    filteredEmployees,          // ← department-scoped employee list for the form
    categories,
    dropdownsLoading,
    openAddDrawer,
    openEditDrawer,
    openViewModal,
    openDeleteModal,
    closeDrawer,
    closeViewModal,
    closeDeleteModal,
    handleToggleStatus,
    handleDelete,
    refresh,
    canAdmin,
    canManage,
  };
};