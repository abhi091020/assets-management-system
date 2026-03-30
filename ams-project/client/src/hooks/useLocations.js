// client/src/hooks/useLocations.js

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  getLocationsApi,
  createLocationApi,
  updateLocationApi,
  updateLocationStatusApi,
  deleteLocationApi,
} from "../api/locationApi";

const EMPTY_FORM = {
  location_name: "",
  address: "",
  city: "",
  state: "",
  pin_code: "",
};

function validateForm(form) {
  const errors = {};
  const name = form.location_name?.trim();
  if (!name) errors.location_name = "Location name is required";
  else if (name.length < 2) errors.location_name = "Name too short";
  else if (name.length > 100) errors.location_name = "Name too long (max 100)";
  if (form.pin_code && !/^\d{6}$/.test(form.pin_code.trim())) {
    errors.pin_code = "Enter a valid 6-digit PIN code";
  }
  return errors;
}

export function useLocations() {
  // ── List state ──────────────────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [viewingLocation, setViewingLocation] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);

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

  // ── Fetch locations ─────────────────────────────────────────────────────────
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    const params = { page, limit };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.isActive = statusFilter === "active";

    const res = await getLocationsApi(params);
    if (res.success) {
      setLocations(res.data?.locations ?? []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } else {
      toast.error(res.message ?? "Failed to load locations");
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // ── Open Add ────────────────────────────────────────────────────────────────
  function openAddForm() {
    setEditingLocation(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  }

  // ── Open Edit ───────────────────────────────────────────────────────────────
  function openEditForm(loc) {
    setEditingLocation(loc);
    setForm({
      location_name: loc.location_name ?? "",
      address: loc.address ?? "",
      city: loc.city ?? "",
      state: loc.state ?? "",
      pin_code: loc.pin_code ?? "",
    });
    setFormErrors({});
    setFormOpen(true);
  }

  // ── Close form ──────────────────────────────────────────────────────────────
  function closeForm() {
    setFormOpen(false);
    setEditingLocation(null);
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
      locationName: form.location_name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pinCode: form.pin_code.trim(),
    };

    if (editingLocation) {
      const res = await updateLocationApi(editingLocation.id, payload);
      if (res.success) {
        toast.success("Location updated successfully");
        closeForm();
        fetchLocations();
      } else {
        toast.error(res.message ?? "Failed to update location");
      }
    } else {
      const res = await createLocationApi(payload);
      if (res.success) {
        toast.success("Location created successfully");
        closeForm();
        fetchLocations();
      } else {
        toast.error(res.message ?? "Failed to create location");
      }
    }
    setSubmitting(false);
  }

  // ── Toggle status ───────────────────────────────────────────────────────────
  async function handleToggleStatus(loc) {
    const res = await updateLocationStatusApi(loc.id, !loc.is_active);
    if (res.success) {
      toast.success(`Location ${loc.is_active ? "deactivated" : "activated"}`);
      fetchLocations();
    } else {
      toast.error(res.message ?? "Failed to update status");
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  function openDeleteModal(loc) {
    setDeletingLocation(loc);
  }

  async function handleDelete() {
    if (!deletingLocation) return;
    setDeleting(true);
    const res = await deleteLocationApi(deletingLocation.id);
    if (res.success) {
      toast.success("Location deleted");
      setDeletingLocation(null);
      fetchLocations();
    } else {
      toast.error(res.message ?? "Failed to delete location");
    }
    setDeleting(false);
  }

  // ── Clear filters ───────────────────────────────────────────────────────────
  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setPage(1);
  }

  return {
    // list
    locations,
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
    clearFilters,
    // form
    formOpen,
    editingLocation,
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
    viewingLocation,
    setViewingLocation,
    // delete
    deletingLocation,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingLocation,
    // toggle
    handleToggleStatus,
  };
}
