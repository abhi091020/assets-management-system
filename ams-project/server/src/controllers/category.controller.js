// server/src/controllers/category.controller.js
import CategoryModel from "../models/Category.model.js";
import { success, error } from "../utils/responseHelper.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";

export const getCategories = async (req, res) => {
  try {
    const { search, isActive, page, limit } = req.query;
    const data = await CategoryModel.findAll({ search, isActive, page, limit });
    return success(res, data, "Categories fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getActiveCategories = async (req, res) => {
  try {
    const data = await CategoryModel.findAllActive();
    return success(res, data, "Active categories fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await CategoryModel.findById(parseInt(req.params.id));
    if (!category) return error(res, "Category not found", 404);
    return success(res, category, "Category fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Create — supports optional subcategories array ────────────────────────────
// Body: { categoryName, parentCategoryId, assetType, subcategories? }
// subcategories: [{ name, assetType }]  — each with their own movement type
export const createCategory = async (req, res) => {
  try {
    const { categoryName, parentCategoryId, assetType, subcategories } =
      req.body;

    if (!categoryName?.trim())
      return error(res, "Category name is required", 400);

    const validTypes = ["Movable", "Static"];
    if (assetType && !validTypes.includes(assetType))
      return error(res, "assetType must be Movable or Static", 400);

    // ── 1. Create the parent / main category ────────────────────────────────
    const category = await CategoryModel.create({
      categoryName: categoryName.trim(),
      parentCategoryId: parentCategoryId || null,
      assetType: assetType || null, // ← was: assetType || "Movable"
      createdBy: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Category",
      entityId: category.id,
      entityCode: categoryName,
      newValue: {
        categoryName,
        assetType: assetType || null,
        parentCategoryId: parentCategoryId || null,
      },
      ipAddress,
      userAgent,
    });

    // ── 2. Bulk create subcategories (if provided) ───────────────────────────
    let createdSubs = [];
    if (
      !parentCategoryId &&
      Array.isArray(subcategories) &&
      subcategories.length > 0
    ) {
      const validSubs = subcategories.filter((s) => s.name?.trim());
      if (validSubs.length > 0) {
        createdSubs = await CategoryModel.bulkCreate(
          validSubs.map((s) => ({
            categoryName: s.name.trim(),
            assetType: validTypes.includes(s.assetType) ? s.assetType : null, // ← was: s.assetType : "Movable"
          })),
          category.id,
          req.user.id,
        );

        await logAudit({
          userId: req.user.id,
          userName: req.user.full_name || req.user.email,
          userRole: req.user.role,
          action: "CREATE",
          entity: "Category",
          entityId: category.id,
          entityCode: categoryName,
          newValue: {
            action: "bulk_subcategories",
            parent: categoryName,
            subcategories: validSubs.map((s) => ({
              name: s.name,
              assetType: s.assetType || null,
            })),
          },
          ipAddress,
          userAgent,
        });
      }
    }

    return success(
      res,
      { category, subcategories: createdSubs },
      createdSubs.length > 0
        ? `Category created with ${createdSubs.length} subcategories`
        : "Category created successfully",
      201,
    );
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Update ────────────────────────────────────────────────────────────────────
export const updateCategory = async (req, res) => {
  try {
    const { categoryName, parentCategoryId, assetType } = req.body;

    if (!categoryName?.trim())
      return error(res, "Category name is required", 400);

    const validTypes = ["Movable", "Static"];
    if (assetType && !validTypes.includes(assetType))
      return error(res, "assetType must be Movable or Static", 400);

    const existing = await CategoryModel.findById(parseInt(req.params.id));
    if (!existing) return error(res, "Category not found", 404);

    const category = await CategoryModel.update(parseInt(req.params.id), {
      categoryName: categoryName.trim(),
      parentCategoryId: parentCategoryId || null,
      assetType: assetType || null, // ← was: assetType || "Movable"
      updatedBy: req.user.id,
    });
    if (!category) return error(res, "Category not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Category",
      entityId: parseInt(req.params.id),
      entityCode: categoryName,
      oldValue: {
        categoryName: existing?.category_name,
        assetType: existing?.asset_type,
      },
      newValue: { categoryName, assetType: assetType || null },
      ipAddress,
      userAgent,
    });

    return success(res, category, "Category updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateCategoryStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean")
      return error(res, "isActive (boolean) is required", 400);

    const existing = await CategoryModel.findById(parseInt(req.params.id));
    const category = await CategoryModel.updateStatus(
      parseInt(req.params.id),
      isActive,
      req.user.id,
    );
    if (!category) return error(res, "Category not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Category",
      entityId: parseInt(req.params.id),
      entityCode: existing?.category_name,
      oldValue: { isActive: existing?.is_active },
      newValue: { isActive, status: isActive ? "Activated" : "Deactivated" },
      ipAddress,
      userAgent,
    });

    return success(
      res,
      category,
      `Category ${isActive ? "activated" : "deactivated"} successfully`,
    );
  } catch (err) {
    return error(res, err.message);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const existing = await CategoryModel.findById(parseInt(req.params.id));
    const result = await CategoryModel.softDelete(
      parseInt(req.params.id),
      req.user.id,
    );
    if (!result) return error(res, "Category not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Category",
      entityId: parseInt(req.params.id),
      entityCode: existing?.category_name,
      oldValue: { categoryName: existing?.category_name },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Category deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
