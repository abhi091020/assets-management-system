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
    viewingCategory,
    setViewingCategory,
    deletingCategory,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingCategory,
    handleToggleStatus,
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
        // 1. Update the category name / type
        const res = await updateCategoryApi(editingCategory.id, {
          categoryName: p.catName,
          parentCategoryId: editingCategory.parent_category_id || null,
          assetType: p.assetType, // null is valid — saves NULL in DB
        });

        if (!res.success) {
          toast.error(res.message || "Failed to update category");
          setSubmitting(false);
          pendingPayloadRef.current = null;
          return;
        }

        // 2. If a new subcategory was also provided (main cat edit only), create it
        if (p.newSubName) {
          const subRes = await createCategoryApi({
            categoryName: p.newSubName,
            parentCategoryId: editingCategory.id,
            assetType: p.newSubType || null,
          });
          if (subRes.success) {
            toast.success(
              `Category updated & subcategory "${p.newSubName}" added`,
            );
          } else {
            toast.warning(
              `Category updated but subcategory failed: ${subRes.message}`,
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
          assetType: null, // main cats always null
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
          toast.success(
            `Subcategory "${p.subName}" added under "${p.catName}"`,
          );
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

  // ── Confirmation modal details ─────────────────────────────────────────────
  function getConfirmDetails(p) {
    if (!p) return { title: "", message: "", subText: "", label: "Confirm" };
    if (p.mode === "edit") {
      const hasNewSub = !!p.newSubName;
      return {
        title: hasNewSub ? "Update & Add Subcategory?" : "Update Category?",
        message: hasNewSub
          ? `Save changes to "${p.catName}" and add subcategory "${p.newSubName}"?`
          : `Save changes to "${p.catName}"?`,
        subText:
          hasNewSub && p.newSubType
            ? `New subcategory type: ${p.newSubType}`
            : "",
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
    const active = cat.is_active;
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
  function confirmDelete(cat) {
    openDeleteModal(cat);
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
