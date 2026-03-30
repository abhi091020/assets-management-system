// server/src/controllers/employee.controller.js
import EmployeeModel from "../models/Employee.model.js";
import { success, error } from "../utils/responseHelper.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";

export const getEmployees = async (req, res) => {
  try {
    const { search, departmentId, locationId, isActive, page, limit } =
      req.query;
    const data = await EmployeeModel.findAll({
      search,
      departmentId,
      locationId,
      isActive,
      page,
      limit,
    });
    return success(res, data, "Employees fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getActiveEmployees = async (req, res) => {
  try {
    const data = await EmployeeModel.findAllActive();
    return success(res, data, "Active employees fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await EmployeeModel.findById(parseInt(req.params.id));
    if (!employee) return error(res, "Employee not found", 404);
    return success(res, employee, "Employee fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { fullName, email, phone, designation, departmentId, locationId } =
      req.body;
    if (!fullName) return error(res, "Full name is required", 400);

    const employee = await EmployeeModel.create({
      fullName,
      email,
      phone,
      designation,
      departmentId,
      locationId,
      createdBy: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Employee",
      entityId: employee.id,
      entityCode: employee.employee_code || fullName,
      newValue: { fullName, email, designation, departmentId, locationId },
      ipAddress,
      userAgent,
    });

    return success(res, employee, "Employee created successfully", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { fullName, email, phone, designation, departmentId, locationId } =
      req.body;
    if (!fullName) return error(res, "Full name is required", 400);

    const existing = await EmployeeModel.findById(parseInt(req.params.id));
    const employee = await EmployeeModel.update(parseInt(req.params.id), {
      fullName,
      email,
      phone,
      designation,
      departmentId,
      locationId,
      updatedBy: req.user.id,
    });
    if (!employee) return error(res, "Employee not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Employee",
      entityId: parseInt(req.params.id),
      entityCode: existing?.employee_code || fullName,
      oldValue: {
        fullName: existing?.full_name,
        designation: existing?.designation,
        departmentId: existing?.department_id,
      },
      newValue: { fullName, designation, departmentId, locationId },
      ipAddress,
      userAgent,
    });

    return success(res, employee, "Employee updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateEmployeeStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean")
      return error(res, "isActive (boolean) is required", 400);

    const existing = await EmployeeModel.findById(parseInt(req.params.id));
    const employee = await EmployeeModel.updateStatus(
      parseInt(req.params.id),
      isActive,
      req.user.id,
    );
    if (!employee) return error(res, "Employee not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Employee",
      entityId: parseInt(req.params.id),
      entityCode: existing?.employee_code || existing?.full_name,
      oldValue: { isActive: existing?.is_active },
      newValue: { isActive, status: isActive ? "Activated" : "Deactivated" },
      ipAddress,
      userAgent,
    });

    return success(
      res,
      employee,
      `Employee ${isActive ? "activated" : "deactivated"} successfully`,
    );
  } catch (err) {
    return error(res, err.message);
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const existing = await EmployeeModel.findById(parseInt(req.params.id));
    const result = await EmployeeModel.softDelete(
      parseInt(req.params.id),
      req.user.id,
    );
    if (!result) return error(res, "Employee not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Employee",
      entityId: parseInt(req.params.id),
      entityCode: existing?.employee_code || existing?.full_name,
      oldValue: {
        fullName: existing?.full_name,
        designation: existing?.designation,
      },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Employee deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
