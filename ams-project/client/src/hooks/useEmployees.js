// client/src/hooks/useEmployees.js

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  getEmployeesApi,
  createEmployeeApi,
  updateEmployeeApi,
  updateEmployeeStatusApi,
  deleteEmployeeApi,
} from "../api/employeeApi";
import { getActiveLocationsApi } from "../api/locationApi";
import { getActiveDepartmentsApi } from "../api/departmentApi";

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  designation: "",
  location_id: "",
  department_id: "",
};

function validateForm(form) {
  const errors = {};
  const name = form.full_name?.trim();
  if (!name) errors.full_name = "Full name is required";
  else if (name.length < 2) errors.full_name = "Name too short";
  else if (name.length > 100) errors.full_name = "Name too long (max 100)";

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  }
  return errors;
}

export function useEmployees() {
  // ── List state ──────────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // ── Dropdowns ───────────────────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

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

  // ── Fetch locations once on mount ───────────────────────────────────────────
  useEffect(() => {
    async function fetchLocations() {
      const res = await getActiveLocationsApi();
      if (res.success) setLocations(res.data ?? []);
    }
    fetchLocations();
  }, []);

  // ── Fetch departments when form location changes ─────────────────────────────
  useEffect(() => {
    async function fetchDepts() {
      if (!form.location_id) {
        setDepartments([]);
        return;
      }
      setLoadingDepts(true);
      const res = await getActiveDepartmentsApi(form.location_id);
      if (res.success) setDepartments(res.data ?? []);
      setLoadingDepts(false);
    }
    fetchDepts();
  }, [form.location_id]);

  // ── Fetch employees ─────────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const params = { page, limit };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.isActive = statusFilter === "active";
    if (locationFilter) params.locationId = locationFilter;

    const res = await getEmployeesApi(params);
    if (res.success) {
      setEmployees(res.data?.employees ?? []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } else {
      toast.error(res.message ?? "Failed to load employees");
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter, locationFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ── Open Add ────────────────────────────────────────────────────────────────
  function openAddForm() {
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDepartments([]);
    setFormOpen(true);
  }

  // ── Open Edit ───────────────────────────────────────────────────────────────
  function openEditForm(emp) {
    setEditingEmployee(emp);
    setForm({
      full_name: emp.full_name ?? "",
      email: emp.email ?? "",
      phone: emp.phone ?? "",
      designation: emp.designation ?? "",
      location_id: emp.location_id ?? "",
      department_id: emp.department_id ?? "",
    });
    setFormErrors({});
    setFormOpen(true);
  }

  // ── Close form ──────────────────────────────────────────────────────────────
  function closeForm() {
    setFormOpen(false);
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDepartments([]);
  }

  // ── onChange ────────────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "location_id") {
      setForm((prev) => ({ ...prev, location_id: value, department_id: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
      fullName: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      designation: form.designation.trim() || null,
      locationId: form.location_id ? Number(form.location_id) : null,
      departmentId: form.department_id ? Number(form.department_id) : null,
    };

    if (editingEmployee) {
      const res = await updateEmployeeApi(editingEmployee.id, payload);
      if (res.success) {
        toast.success("Employee updated successfully");
        closeForm();
        fetchEmployees();
      } else {
        toast.error(res.message ?? "Failed to update employee");
      }
    } else {
      const res = await createEmployeeApi(payload);
      if (res.success) {
        toast.success("Employee created successfully");
        closeForm();
        fetchEmployees();
      } else {
        toast.error(res.message ?? "Failed to create employee");
      }
    }
    setSubmitting(false);
  }

  // ── Toggle status ───────────────────────────────────────────────────────────
  async function handleToggleStatus(emp) {
    const res = await updateEmployeeStatusApi(emp.id, !emp.is_active);
    if (res.success) {
      toast.success(`Employee ${emp.is_active ? "deactivated" : "activated"}`);
      fetchEmployees();
    } else {
      toast.error(res.message ?? "Failed to update status");
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  function openDeleteModal(emp) {
    setDeletingEmployee(emp);
  }

  // ✅ Fix: accepts empId directly — avoids stale closure on deletingEmployee
  async function handleDelete(empId) {
    const id = empId ?? deletingEmployee?.id;
    if (!id) return;
    setDeleting(true);
    const res = await deleteEmployeeApi(id);
    if (res.success) {
      toast.success("Employee deleted");
      setDeletingEmployee(null);
      fetchEmployees();
    } else {
      toast.error(res.message ?? "Failed to delete employee");
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
    employees,
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
    // dropdowns
    locations,
    departments,
    loadingDepts,
    // form
    formOpen,
    editingEmployee,
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
    viewingEmployee,
    setViewingEmployee,
    // delete
    deletingEmployee,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingEmployee,
    // toggle
    handleToggleStatus,
  };
}