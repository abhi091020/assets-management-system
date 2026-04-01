// src/pages/categories/CategoriesPage.jsx
import { useState, useRef } from "react";
import { useCategories } from "../../hooks/useCategories";
import useAuthStore from "../../store/authStore";
import CategoryTable from "../../components/categories/CategoryTable";
import CategoryForm from "../../components/categories/CategoryForm";
import CategoryViewModal from "../../components/categories/CategoryViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import { createCategoryApi, updateCategoryApi } from "../../api/categoryApi";
import { toast } from "react-toastify";

export default function CategoriesPage() {
  const { user } = useAuthStore();
  const canAdmin = ["SuperAdmin", "Admin"].includes(user?.role);

  const {
    categories,
    loading,
    total,
    page,
    totalPages,
    setPage,
    allCategories,
    // ✅ server-side search + filter
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
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
    refreshAll,
  } = useCategories();

  const [confirm, setConfirm] = useState(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const pendingPayloadRef = useRef(null);
  const closeConfirm = () => setConfirm(null);

  // ── Intercept form submit — show confirm modal first ──────────────────────
  function requestSubmit(e, payload) {
    e.preventDefault();
    pendingPayloadRef.current = payload;
    setPendingSubmit(true);
  }

  // ── Confirmed — run the right operation ───────────────────────────────────
  async function executeSubmit() {
    setPendingSubmit(false);
    const p = pendingPayloadRef.current;
    if (!p) return;

    setSubmitting(true);
    try {
      // ── Edit mode ──────────────────────────────────────────────────────────
      if (p.mode === "edit") {
        const res = await updateCategoryApi(editingCategory.id, {
          categoryName: p.catName,
          parentCategoryId: editingCategory.parent_category_id || null,
          assetType: p.assetType,
        });

        if (!res.success) {
          toast.error(res.message || "Failed to update category");
          setSubmitting(false);
          pendingPayloadRef.current = null;
          return;
        }

        // Optionally create a child under the edited category
        if (p.newSubName) {
          const subRes = await createCategoryApi({
            categoryName: p.newSubName,
            parentCategoryId: editingCategory.id,
            assetType: p.newSubType || null,
          });
          if (subRes.success) {
            toast.success(
              `Category updated & "${p.newSubName}" added`,
            );
          } else {
            toast.warning(
              `Category updated but child failed: ${subRes.message}`,
            );
          }
        } else {
          toast.success("Category updated successfully");
        }

        closeForm();
        refreshAll();
        pendingPayloadRef.current = null;
        setSubmitting(false);
        return;
      }

      // ── Create modes ───────────────────────────────────────────────────────
      let res;

      if (p.mode === "cat_only") {
        res = await createCategoryApi({
          categoryName: p.catName,
          parentCategoryId: null,
          assetType: null,
        });
        if (res.success) toast.success(`Category "${p.catName}" created`);
        else toast.error(res.message || "Failed to create category");
      } else if (p.mode === "cat_and_sub") {
        res = await createCategoryApi({
          categoryName: p.catName,
          parentCategoryId: null,
          assetType: null,
          subcategories: [{ name: p.subName, assetType: p.assetType }],
        });
        if (res.success)
          toast.success(`"${p.catName}" + subcategory "${p.subName}" created`);
        else toast.error(res.message || "Failed to create");
      } else if (p.mode === "sub_only") {
        res = await createCategoryApi({
          categoryName: p.subName,
          parentCategoryId: p.catId,
          assetType: p.assetType,
        });
        if (res.success)
          toast.success(`"${p.subName}" added under "${p.catName}"`);
        else toast.error(res.message || "Failed to create subcategory");
      }

      if (res?.success) {
        closeForm();
        refreshAll();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
      pendingPayloadRef.current = null;
    }
  }

  // ── Confirm modal details ──────────────────────────────────────────────────
  function getConfirmDetails(p) {
    if (!p) return { title: "", message: "", subText: "", label: "Confirm" };
    if (p.mode === "edit") {
      const hasNewSub = !!p.newSubName;
      return {
        title: hasNewSub ? "Update & Add Child?" : "Update Category?",
        message: hasNewSub
          ? `Save changes to "${p.catName}" and add "${p.newSubName}"?`
          : `Save changes to "${p.catName}"?`,
        subText:
          hasNewSub && p.newSubType ? `New child type: ${p.newSubType}` : "",
        label: "Update",
      };
    }
    if (p.mode === "cat_only")
      return {
        title: "Create Category?",
        message: `"${p.catName}" will be created as a new main category.`,
        subText: "",
        label: "Create",
      };
    if (p.mode === "cat_and_sub")
      return {
        title: "Create Category + Subcategory?",
        message: `"${p.catName}" and subcategory "${p.subName}" will be created.`,
        subText: p.assetType ? `Type: ${p.assetType}` : "",
        label: "Create",
      };
    if (p.mode === "sub_only")
      return {
        title: "Add Subcategory?",
        message: `"${p.subName}" will be added under "${p.catName}".`,
        subText: p.assetType ? `Type: ${p.assetType}` : "",
        label: "Add",
      };
    return { title: "", message: "", subText: "", label: "Confirm" };
  }

  // ── Status toggle confirm ──────────────────────────────────────────────────
  function confirmToggleStatus(cat) {
    // ✅ Handles SQL Server integers (1/0) and booleans
    const active = cat.is_active === true || cat.is_active === 1;
    setConfirm({
      title: active ? "Deactivate Category?" : "Activate Category?",
      message: active
        ? "This category will be marked inactive."
        : "This category will be marked active.",
      subText: cat.category_name,
      confirmLabel: active ? "Deactivate" : "Activate",
      confirmColor: active ? "orange" : "green",
      onConfirm: () => {
        closeConfirm();
        handleToggleStatus(cat);
      },
    });
  }

  // ── Delete confirm ─────────────────────────────────────────────────────────
  // ✅ passes cat directly — delete bug already fixed in useCategories
  function confirmDelete(cat) {
    setConfirm({
      title: "Delete Category?",
      message: "Category will be soft deleted. Linked assets remain intact.",
      subText: cat.category_name,
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDelete(cat);
      },
    });
  }

  const p = pendingPayloadRef.current;
  const cd = getConfirmDetails(p);

  return (
    <>
      <CategoryTable
        categories={categories}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        canAdmin={canAdmin}
        allCategories={allCategories}
        // ✅ server-side search + filter passed to table
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onAdd={canAdmin ? openAddForm : undefined}
        onView={(cat) => setViewingCategory(cat)}
        onEdit={openEditForm}
        onToggleStatus={confirmToggleStatus}
        onDelete={confirmDelete}
      />

      <CategoryForm
        open={formOpen}
        onClose={closeForm}
        editingCategory={editingCategory}
        form={form}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        onChange={handleChange}
        onSubmit={requestSubmit}
        submitting={submitting}
        allCategories={allCategories}
      />

      {/* Create / Edit confirmation */}
      <ConfirmModal
        open={pendingSubmit}
        title={cd.title}
        message={cd.message}
        subText={cd.subText}
        confirmLabel={cd.label}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => {
          setPendingSubmit(false);
          pendingPayloadRef.current = null;
        }}
        loading={submitting}
      />

      <CategoryViewModal
        category={viewingCategory}
        onClose={() => setViewingCategory(null)}
        allCategories={allCategories}
      />

      {/* Delete / Status confirmation */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        subText={confirm?.subText}
        confirmLabel={confirm?.confirmLabel}
        confirmColor={confirm?.confirmColor}
        onConfirm={confirm?.onConfirm}
        onCancel={() => {
          closeConfirm();
          setDeletingCategory(null);
        }}
        loading={deleting}
      />
    </>
  );
}