// client/src/hooks/useCategories.js

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  updateCategoryStatusApi,
  deleteCategoryApi,
  getActiveCategoriesApi,
} from "../api/categoryApi";

const EMPTY_FORM = {
  category_name: "",
  parent_category_id: "",
  asset_type: "",
};

function validateForm(form) {
  const errors = {};
  const name = form.category_name?.trim();
  if (!name) errors.category_name = "Category name is required";
  else if (name.length < 2) errors.category_name = "Name too short";
  else if (name.length > 100) errors.category_name = "Name too long (max 100)";
  return errors;
}

export function useCategories() {
  // ── List state ──────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // ── All categories for table subMap (active + inactive) ─────────────────────
  const [allCategories, setAllCategories] = useState([]);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

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

  // ── Fetch ALL categories (active + inactive) for subMap in table ────────────
  // FIX: was getActiveCategoriesApi() — inactive subcats were disappearing from
  // the table after deactivation because they were excluded from allCategories.
  // Now fetches all non-deleted categories so inactive subcats remain visible.
  const fetchAllCategories = useCallback(async () => {
    const res = await getCategoriesApi({ limit: 1000 });
    if (res.success) setAllCategories(res.data?.categories ?? []);
  }, []);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  // ── Fetch paginated list ────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const params = { page, limit };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.isActive = statusFilter === "active";

    const res = await getCategoriesApi(params);
    if (res.success) {
      setCategories(res.data?.categories ?? []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } else {
      toast.error(res.message ?? "Failed to load categories");
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── Refresh both list + allCategories ──────────────────────────────────────
  async function refreshAll() {
    await Promise.all([fetchCategories(), fetchAllCategories()]);
  }

  // ── Open Add ────────────────────────────────────────────────────────────────
  function openAddForm() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  }

  // ── Open Edit ───────────────────────────────────────────────────────────────
  function openEditForm(cat) {
    setEditingCategory(cat);
    setForm({
      category_name: cat.category_name ?? "",
      parent_category_id: cat.parent_category_id ?? "",
      asset_type: cat.asset_type ?? "",
    });
    setFormErrors({});
    setFormOpen(true);
  }

  // ── Close form ──────────────────────────────────────────────────────────────
  function closeForm() {
    setFormOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }

  // ── onChange ────────────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ── Submit (used only for edit mode — create is handled directly in Page) ───
  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    const payload = {
      categoryName: form.category_name.trim(),
      parentCategoryId: form.parent_category_id
        ? Number(form.parent_category_id)
        : null,
      assetType: form.asset_type || null,
    };

    if (editingCategory) {
      const res = await updateCategoryApi(editingCategory.id, payload);
      if (res.success) {
        toast.success("Category updated successfully");
        closeForm();
        refreshAll();
      } else {
        toast.error(res.message ?? "Failed to update category");
      }
    } else {
      const res = await createCategoryApi(payload);
      if (res.success) {
        toast.success("Category created successfully");
        closeForm();
        refreshAll();
      } else {
        toast.error(res.message ?? "Failed to create category");
      }
    }
    setSubmitting(false);
  }

  // ── Toggle status ───────────────────────────────────────────────────────────
  async function handleToggleStatus(cat) {
    const res = await updateCategoryStatusApi(cat.id, !cat.is_active);
    if (res.success) {
      toast.success(`Category ${cat.is_active ? "deactivated" : "activated"}`);
      refreshAll();
    } else {
      toast.error(res.message ?? "Failed to update status");
    }
  }

  // ── Delete — accepts cat directly to avoid async state timing bug ───────────
  function openDeleteModal(cat) {
    setDeletingCategory(cat);
  }

  async function handleDelete(cat) {
    const target = cat || deletingCategory;
    if (!target) return;
    setDeleting(true);
    const res = await deleteCategoryApi(target.id);
    if (res.success) {
      toast.success("Category deleted");
      setDeletingCategory(null);
      refreshAll();
    } else {
      toast.error(res.message ?? "Failed to delete category");
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
    categories,
    loading,
    total,
    page,
    totalPages,
    setPage,
    // all categories for table subMap (active + inactive)
    allCategories,
    // filters
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    clearFilters,
    // form
    formOpen,
    editingCategory,
    form,
    formErrors,
    setFormErrors,
    submitting,
    setSubmitting,
    openAddForm,
    openEditForm,
    closeForm,
    handleChange,
    handleSubmit,
    // view
    viewingCategory,
    setViewingCategory,
    // delete
    deletingCategory,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingCategory,
    // toggle
    handleToggleStatus,
    // refresh
    fetchCategories,
    fetchAllCategories,
    refreshAll,
  };
}
