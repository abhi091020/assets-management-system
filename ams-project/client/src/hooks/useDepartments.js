// client/src/hooks/useDepartments.js

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  getDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  updateDepartmentStatusApi,
  deleteDepartmentApi,
} from "../api/departmentApi";
import { getActiveLocationsApi } from "../api/locationApi";

const EMPTY_FORM = {
  dept_name: "",
  cost_center: "",
  location_id: "",
};

function validateForm(form) {
  const errors = {};
  const name = form.dept_name?.trim();
  if (!name) errors.dept_name = "Department name is required";
  else if (name.length < 2) errors.dept_name = "Name too short";
  else if (name.length > 100) errors.dept_name = "Name too long (max 100)";
  if (!form.location_id) errors.location_id = "Location is required";
  return errors;
}

export function useDepartments() {
  // ── List state ──────────────────────────────────────────────────────────────
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // ── Locations for dropdowns ─────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [deletingDepartment, setDeletingDepartment] = useState(null);

  // ── Form ────────────────────────────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Debounce search ─────────────────────────────────────────────────────────
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // ── Fetch active locations for dropdowns (once on mount) ────────────────────
  useEffect(() => {
    async function fetchLocations() {
      const res = await getActiveLocationsApi();
      if (res.success) setLocations(res.data ?? []);
    }
    fetchLocations();
  }, []);

  // ── Fetch departments ───────────────────────────────────────────────────────
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    const params = { page, limit };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.isActive = statusFilter === "active";
    if (locationFilter) params.locationId = locationFilter;

    const res = await getDepartmentsApi(params);
    if (res.success) {
      setDepartments(res.data?.departments ?? []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } else {
      toast.error(res.message ?? "Failed to load departments");
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter, locationFilter]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // ── Open Add ────────────────────────────────────────────────────────────────
  function openAddForm() {
    setEditingDepartment(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  }

  // ── Open Edit ───────────────────────────────────────────────────────────────
  function openEditForm(dept) {
    setEditingDepartment(dept);
    setForm({
      dept_name: dept.dept_name ?? "",
      cost_center: dept.cost_center ?? "",
      location_id: dept.location_id ?? "",
    });
    setFormErrors({});
    setFormOpen(true);
  }

  // ── Close form ──────────────────────────────────────────────────────────────
  function closeForm() {
    setFormOpen(false);
    setEditingDepartment(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }

  // ── onChange ────────────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    const payload = {
      deptName: form.dept_name.trim(),
      costCenter: form.cost_center.trim(),
      locationId: Number(form.location_id),
    };

    if (editingDepartment) {
      const res = await updateDepartmentApi(editingDepartment.id, payload);
      if (res.success) {
        toast.success("Department updated successfully");
        closeForm();
        fetchDepartments();
      } else {
        toast.error(res.message ?? "Failed to update department");
      }
    } else {
      const res = await createDepartmentApi(payload);
      if (res.success) {
        toast.success("Department created successfully");
        closeForm();
        fetchDepartments();
      } else {
        toast.error(res.message ?? "Failed to create department");
      }
    }
    setSubmitting(false);
  }

  // ── Toggle status ───────────────────────────────────────────────────────────
  async function handleToggleStatus(dept) {
    const res = await updateDepartmentStatusApi(dept.id, !dept.is_active);
    if (res.success) {
      toast.success(
        `Department ${dept.is_active ? "deactivated" : "activated"}`,
      );
      fetchDepartments();
    } else {
      toast.error(res.message ?? "Failed to update status");
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  function openDeleteModal(dept) {
    setDeletingDepartment(dept);
  }

  // ✅ Fix: accepts deptId directly — avoids stale closure on deletingDepartment
  async function handleDelete(deptId) {
    const id = deptId ?? deletingDepartment?.id;
    if (!id) return;
    setDeleting(true);
    const res = await deleteDepartmentApi(id);
    if (res.success) {
      toast.success("Department deleted");
      setDeletingDepartment(null);
      fetchDepartments();
    } else {
      toast.error(res.message ?? "Failed to delete department");
    }
    setDeleting(false);
  }

  // ── Clear filters ───────────────────────────────────────────────────────────
  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setLocationFilter("");
    setPage(1);
  }

  return {
    // list
    departments,
    loading,
    total,
    page,
    totalPages,
    setPage,
    // filters
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
    clearFilters,
    // locations for dropdowns
    locations,
    // form
    formOpen,
    editingDepartment,
    form,
    formErrors,
    setFormErrors,
    submitting,
    openAddForm,
    openEditForm,
    closeForm,
    handleChange,
    handleSubmit,
    // view
    viewingDepartment,
    setViewingDepartment,
    // delete
    deletingDepartment,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingDepartment,
    // toggle
    handleToggleStatus,
  };
}