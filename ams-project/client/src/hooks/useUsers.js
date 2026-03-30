// client/src/hooks/useUsers.js

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  updateUserStatusApi,
  deleteUserApi,
  deleteUserPermanentApi,
} from "../api/userApi";
import { getActiveLocationsApi } from "../api/locationApi";
import { getActiveDepartmentsApi } from "../api/departmentApi";
import { EMPTY_FORM, validateUserForm } from "../utils/userHelpers";

const LIMIT = 10;

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isPermanent, setIsPermanent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Dropdown data ──────────────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  // allDepartments — full list for name lookup in view modal
  const [allDepartments, setAllDepartments] = useState([]);
  // departments — filtered by selected location for the form dropdown
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // Fetch active locations + ALL departments once on mount
  useEffect(() => {
    async function fetchMasterData() {
      const [locRes, deptRes] = await Promise.all([
        getActiveLocationsApi(),
        getActiveDepartmentsApi(), // no locationId = fetch all
      ]);
      if (locRes.success) setLocations(locRes.data ?? []);
      if (deptRes.success) setAllDepartments(deptRes.data ?? []);
    }
    fetchMasterData();
  }, []);

  // Fetch departments filtered by location whenever location_id changes in form
  useEffect(() => {
    async function fetchDepartments() {
      if (!form.location_id) {
        setDepartments([]);
        return;
      }
      setLoadingDepts(true);
      const res = await getActiveDepartmentsApi(form.location_id);
      if (res.success) setDepartments(res.data ?? []);
      setLoadingDepts(false);
    }
    fetchDepartments();
  }, [form.location_id]);

  // ── Users list ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === "active";
      const res = await getUsersApi(params);
      const data = res.data?.data ?? res.data;
      setUsers(data?.users ?? data ?? []);
      setTotalPages(data?.totalPages ?? 1);
      setTotal(data?.total ?? 0);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  // ── Drawer ─────────────────────────────────────────────────────────────────
  function openAddDrawer() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDepartments([]);
    setDrawerOpen(true);
  }

  function openEditDrawer(user) {
    if (user.role === "SuperAdmin") {
      toast.error("SuperAdmin accounts cannot be edited");
      return;
    }
    setEditingUser(user);
    setForm({
      fullName: user.full_name ?? "",
      email: user.email ?? "",
      password: "",
      confirmPassword: "",
      phone: user.phone ?? "",
      role: user.role ?? "Viewer",
      department_id: user.department_id ?? "",
      location_id: user.location_id ?? "",
    });
    setFormErrors({});
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDepartments([]);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    // Reset department when location changes
    if (name === "location_id") {
      setForm((prev) => ({ ...prev, location_id: value, department_id: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateUserForm(form, !!editingUser);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        await updateUserApi(editingUser.id, {
          fullName: form.fullName,
          phone: form.phone || null,
          role: form.role,
          department_id: form.department_id || null,
          location_id: form.location_id || null,
        });
        toast.success("User updated successfully");
      } else {
        await createUserApi({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          role: form.role,
          department_id: form.department_id || null,
          location_id: form.location_id || null,
        });
        toast.success("User created successfully");
      }
      closeDrawer();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Toggle status ──────────────────────────────────────────────────────────
  async function handleToggleStatus(user) {
    if (user.role === "SuperAdmin") {
      toast.error("SuperAdmin status cannot be changed");
      return;
    }
    try {
      await updateUserStatusApi(user.id, !user.is_active);
      toast.success(
        `User ${user.is_active ? "deactivated" : "activated"} successfully`,
      );
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function openDeleteModal(user, permanent = false) {
    if (user.role === "SuperAdmin") {
      toast.error("SuperAdmin accounts cannot be deleted");
      return;
    }
    setDeleteTarget(user);
    setIsPermanent(permanent);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
    setIsPermanent(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      if (isPermanent) {
        await deleteUserPermanentApi(deleteTarget.id);
        toast.success("User permanently deleted");
      } else {
        await deleteUserApi(deleteTarget.id);
        toast.success("User deleted successfully");
      }
      closeDeleteModal();
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
  }

  return {
    // List
    users,
    loading,
    total,
    totalPages,
    page,
    setPage,
    // Filters
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    clearFilters,
    // Drawer / form
    drawerOpen,
    editingUser,
    form,
    formErrors,
    setFormErrors,
    submitting,
    openAddDrawer,
    openEditDrawer,
    closeDrawer,
    handleFormChange,
    handleSubmit,
    // Dropdowns — locations + allDepartments for display, departments for form
    locations,
    allDepartments,
    departments,
    loadingDepts,
    // Status toggle
    handleToggleStatus,
    // Delete
    deleteTarget,
    isPermanent,
    deleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
  };
}
