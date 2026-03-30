// server/src/controllers/department.controller.js
import DepartmentModel from "../models/Department.model.js";
import { success, error } from "../utils/responseHelper.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";

export const getDepartments = async (req, res) => {
  try {
    const { search, locationId, isActive, page, limit } = req.query;
    const data = await DepartmentModel.findAll({
      search,
      locationId,
      isActive,
      page,
      limit,
    });
    return success(res, data, "Departments fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getActiveDepartments = async (req, res) => {
  try {
    const { locationId } = req.query;
    const data = await DepartmentModel.findAllActive(locationId);
    return success(res, data, "Active departments fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await DepartmentModel.findById(parseInt(req.params.id));
    if (!dept) return error(res, "Department not found", 404);
    return success(res, dept, "Department fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { deptName, costCenter, locationId } = req.body;
    if (!deptName) return error(res, "Department name is required", 400);
    if (!locationId) return error(res, "Location is required", 400);

    const dept = await DepartmentModel.create({
      deptName,
      costCenter,
      locationId,
      createdBy: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Department",
      entityId: dept.id,
      entityCode: dept.dept_name || deptName,
      newValue: { deptName, costCenter, locationId },
      ipAddress,
      userAgent,
    });

    return success(res, dept, "Department created successfully", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { deptName, costCenter, locationId } = req.body;
    if (!deptName) return error(res, "Department name is required", 400);
    if (!locationId) return error(res, "Location is required", 400);

    const existing = await DepartmentModel.findById(parseInt(req.params.id));
    const dept = await DepartmentModel.update(parseInt(req.params.id), {
      deptName,
      costCenter,
      locationId,
      updatedBy: req.user.id,
    });
    if (!dept) return error(res, "Department not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Department",
      entityId: parseInt(req.params.id),
      entityCode: deptName,
      oldValue: {
        deptName: existing?.dept_name,
        costCenter: existing?.cost_center,
        locationId: existing?.location_id,
      },
      newValue: { deptName, costCenter, locationId },
      ipAddress,
      userAgent,
    });

    return success(res, dept, "Department updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateDepartmentStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean")
      return error(res, "isActive (boolean) is required", 400);

    const existing = await DepartmentModel.findById(parseInt(req.params.id));
    const dept = await DepartmentModel.updateStatus(
      parseInt(req.params.id),
      isActive,
      req.user.id,
    );
    if (!dept) return error(res, "Department not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Department",
      entityId: parseInt(req.params.id),
      entityCode: existing?.dept_name,
      oldValue: { isActive: existing?.is_active },
      newValue: { isActive, status: isActive ? "Activated" : "Deactivated" },
      ipAddress,
      userAgent,
    });

    return success(
      res,
      dept,
      `Department ${isActive ? "activated" : "deactivated"} successfully`,
    );
  } catch (err) {
    return error(res, err.message);
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const existing = await DepartmentModel.findById(parseInt(req.params.id));
    const result = await DepartmentModel.softDelete(
      parseInt(req.params.id),
      req.user.id,
    );
    if (!result) return error(res, "Department not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Department",
      entityId: parseInt(req.params.id),
      entityCode: existing?.dept_name,
      oldValue: {
        deptName: existing?.dept_name,
        locationId: existing?.location_id,
      },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Department deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
