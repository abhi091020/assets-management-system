import sql from "mssql";
import { getPool } from "../config/db.js";
import { success, error } from "../utils/responseHelper.js";
import { generateExcel } from "../utils/excelExporter.js";
import { generatePdf } from "../utils/pdfExporter.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a SQL WHERE clause fragment + collect params from common filter keys.
 * Supported keys: status, categoryId, locationId, departmentId,
 *                 employeeId, assetId, method, dateFrom, dateTo (on purchase_date or created_at)
 * dateField: the column to apply dateFrom/dateTo against (default 'a.created_at')
 */
function buildFilters(query, mapping = {}) {
  const conditions = [];
  const inputs = [];

  const add = (col, paramName, type, val) => {
    conditions.push(`${col} = @${paramName}`);
    inputs.push({ name: paramName, type, value: val });
  };

  if (query.status && mapping.status) {
    add(mapping.status, "status", sql.NVarChar, query.status);
  }
  if (query.categoryId && mapping.categoryId) {
    add(mapping.categoryId, "categoryId", sql.Int, parseInt(query.categoryId));
  }
  if (query.locationId && mapping.locationId) {
    add(mapping.locationId, "locationId", sql.Int, parseInt(query.locationId));
  }
  if (query.departmentId && mapping.departmentId) {
    add(
      mapping.departmentId,
      "departmentId",
      sql.Int,
      parseInt(query.departmentId),
    );
  }
  if (query.employeeId && mapping.employeeId) {
    add(mapping.employeeId, "employeeId", sql.Int, parseInt(query.employeeId));
  }
  if (query.assetId && mapping.assetId) {
    add(mapping.assetId, "assetId", sql.Int, parseInt(query.assetId));
  }
  if (query.method && mapping.method) {
    add(mapping.method, "method", sql.NVarChar, query.method);
  }

  const dateField = mapping.dateField || "a.created_at";
  if (query.dateFrom) {
    conditions.push(`${dateField} >= @dateFrom`);
    inputs.push({
      name: "dateFrom",
      type: sql.DateTime,
      value: new Date(query.dateFrom),
    });
  }
  if (query.dateTo) {
    // include full day
    const to = new Date(query.dateTo);
    to.setHours(23, 59, 59, 999);
    conditions.push(`${dateField} <= @dateTo`);
    inputs.push({ name: "dateTo", type: sql.DateTime, value: to });
  }

  return { conditions, inputs };
}

function applyInputs(request, inputs) {
  inputs.forEach(({ name, type, value }) => request.input(name, type, value));
}

function buildWhere(conditions, prefix = "WHERE") {
  return conditions.length ? `${prefix} ${conditions.join(" AND ")}` : "";
}

// Pagination defaults
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function getPagination(query) {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(
    500,
    Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT),
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

async function runExport(format, data, columns, title, res) {
  if (format === "pdf") {
    const buffer = await generatePdf(title, columns, data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
    return res.send(buffer);
  }
  // default excel
  const buffer = await generateExcel(title, columns, data);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", `attachment; filename="${title}.xlsx"`);
  return res.send(buffer);
}

// ─── REPORT COLUMN DEFINITIONS (for export) ───────────────────────────────────

const COLUMNS = {
  assetRegister: [
    { header: "Asset Code", key: "asset_code" },
    { header: "Asset Name", key: "asset_name" },
    { header: "Category", key: "category_name" },
    { header: "Location", key: "location_name" },
    { header: "Department", key: "dept_name" },
    { header: "Assigned Employee", key: "employee_name" },
    { header: "Status", key: "status" },
    { header: "Condition", key: "condition" },
    { header: "Purchase Date", key: "purchase_date" },
    { header: "Purchase Cost", key: "purchase_cost" },
    { header: "Vendor", key: "vendor" },
    { header: "Serial No", key: "serial_number" },
    { header: "Created At", key: "created_at" },
  ],
  byCategory: [
    { header: "Category", key: "category_name" },
    { header: "Parent Category", key: "parent_category_name" },
    { header: "Total Assets", key: "total" },
    { header: "Active", key: "active" },
    { header: "In Repair", key: "in_repair" },
    { header: "Disposed", key: "disposed" },
    { header: "Total Cost", key: "total_cost" },
  ],
  byLocation: [
    { header: "Location", key: "location_name" },
    { header: "City", key: "city" },
    { header: "Total Assets", key: "total" },
    { header: "Active", key: "active" },
    { header: "In Repair", key: "in_repair" },
    { header: "Disposed", key: "disposed" },
    { header: "Total Cost", key: "total_cost" },
  ],
  byDepartment: [
    { header: "Department", key: "dept_name" },
    { header: "Cost Center", key: "cost_center" },
    { header: "Location", key: "location_name" },
    { header: "Total Assets", key: "total" },
    { header: "Active", key: "active" },
    { header: "In Repair", key: "in_repair" },
    { header: "Disposed", key: "disposed" },
    { header: "Total Cost", key: "total_cost" },
  ],
  byStatus: [
    { header: "Status", key: "status" },
    { header: "Total Assets", key: "total" },
    { header: "Total Cost", key: "total_cost" },
  ],
  assignedEmployees: [
    { header: "Employee Code", key: "employee_code" },
    { header: "Employee Name", key: "employee_name" },
    { header: "Designation", key: "designation" },
    { header: "Department", key: "dept_name" },
    { header: "Location", key: "location_name" },
    { header: "Asset Code", key: "asset_code" },
    { header: "Asset Name", key: "asset_name" },
    { header: "Category", key: "category_name" },
    { header: "Status", key: "status" },
    { header: "Purchase Cost", key: "purchase_cost" },
  ],
  assetAge: [
    { header: "Asset Code", key: "asset_code" },
    { header: "Asset Name", key: "asset_name" },
    { header: "Category", key: "category_name" },
    { header: "Location", key: "location_name" },
    { header: "Department", key: "dept_name" },
    { header: "Purchase Date", key: "purchase_date" },
    { header: "Age (Years)", key: "age_years" },
    { header: "Age (Months)", key: "age_months" },
    { header: "Status", key: "status" },
    { header: "Purchase Cost", key: "purchase_cost" },
  ],
  transfers: [
    { header: "Transfer Code", key: "transfer_code" },
    { header: "Asset Code", key: "asset_code" },
    { header: "Asset Name", key: "asset_name" },
    { header: "From Location", key: "from_location" },
    { header: "From Department", key: "from_department" },
    { header: "To Location", key: "to_location" },
    { header: "To Department", key: "to_department" },
    { header: "To Employee", key: "to_employee" },
    { header: "Reason", key: "reason" },
    { header: "Status", key: "status" },
    { header: "Raised By", key: "raised_by_name" },
    { header: "Approved By", key: "approved_by_name" },
    { header: "Approved At", key: "approved_at" },
    { header: "Created At", key: "created_at" },
  ],
  disposals: [
    { header: "Disposal Code", key: "disposal_code" },
    { header: "Asset Code", key: "asset_code" },
    { header: "Asset Name", key: "asset_name" },
    { header: "Category", key: "category_name" },
    { header: "Disposal Method", key: "disposal_method" },
    { header: "Reason", key: "reason" },
    { header: "Sale Amount", key: "sale_amount" },
    { header: "Disposal Date", key: "disposal_date" },
    { header: "Buyer Details", key: "buyer_details" },
    { header: "Status", key: "status" },
    { header: "Raised By", key: "raised_by_name" },
    { header: "Approved By", key: "approved_by_name" },
    { header: "Created At", key: "created_at" },
  ],
  verification: [
    { header: "Batch Code", key: "batch_code" },
    { header: "Title", key: "title" },
    { header: "Location", key: "location_name" },
    { header: "Department", key: "dept_name" },
    { header: "Status", key: "status" },
    { header: "Total Items", key: "total_items" },
    { header: "Verified", key: "verified" },
    { header: "Not Found", key: "not_found" },
    { header: "Pending", key: "pending" },
    { header: "Opened By", key: "opened_by_name" },
    { header: "Opened At", key: "opened_at" },
    { header: "Closed At", key: "closed_at" },
  ],
};

// ─── 1. ASSET REGISTER ────────────────────────────────────────────────────────

async function fetchAssetRegister(query) {
  const pool = await getPool();
  const { conditions, inputs } = buildFilters(query, {
    status: "a.status",
    categoryId: "a.category_id",
    locationId: "a.location_id",
    departmentId: "a.department_id",
    dateField: "a.purchase_date",
  });

  conditions.push("a.is_deleted = 0");
  const where = buildWhere(conditions);

  const { page, limit, offset } = getPagination(query);
  const request = pool.request();
  applyInputs(request, inputs);
  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const countReq = pool.request();
  applyInputs(countReq, inputs);

  const countResult = await countReq.query(`
    SELECT COUNT(*) AS total
    FROM Assets a
    LEFT JOIN Categories c ON a.category_id = c.id
    LEFT JOIN Locations l  ON a.location_id  = l.id
    LEFT JOIN Departments d ON a.department_id = d.id
    LEFT JOIN Employees e  ON a.assigned_employee_id = e.id
    ${where}
  `);
  const total = countResult.recordset[0].total;

  const result = await request.query(`
    SELECT
      a.id, a.asset_code, a.asset_name,
      c.category_name,
      l.location_name,
      d.dept_name,
      ISNULL(e.full_name, '—') AS employee_name,
      a.status, a.condition,
      CONVERT(VARCHAR(10), a.purchase_date, 120) AS purchase_date,
      a.purchase_cost, a.vendor, a.serial_number,
      CONVERT(VARCHAR(19), a.created_at, 120) AS created_at
    FROM Assets a
    LEFT JOIN Categories c  ON a.category_id = c.id
    LEFT JOIN Locations l   ON a.location_id  = l.id
    LEFT JOIN Departments d ON a.department_id = d.id
    LEFT JOIN Employees e   ON a.assigned_employee_id = e.id
    ${where}
    ORDER BY a.asset_code
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return { data: result.recordset, total, page, limit };
}

export async function assetRegister(req, res) {
  try {
    const result = await fetchAssetRegister(req.query);
    return success(res, result, "Asset register fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function assetRegisterExport(req, res) {
  try {
    const { data } = await fetchAssetRegister({
      ...req.query,
      page: 1,
      limit: 500,
    });
    await runExport(
      req.query.format,
      data,
      COLUMNS.assetRegister,
      "Asset Register",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}

// ─── 2. ASSETS BY CATEGORY ────────────────────────────────────────────────────

async function fetchByCategory(query) {
  const pool = await getPool();
  const conditions = ["a.is_deleted = 0", "c.is_deleted = 0"];
  const inputs = [];

  if (query.categoryId) {
    conditions.push("a.category_id = @categoryId");
    inputs.push({
      name: "categoryId",
      type: sql.Int,
      value: parseInt(query.categoryId),
    });
  }

  const where = buildWhere(conditions);
  const request = pool.request();
  applyInputs(request, inputs);

  const result = await request.query(`
    SELECT
      c.id AS category_id,
      c.category_name,
      pc.category_name AS parent_category_name,
      COUNT(a.id) AS total,
      SUM(CASE WHEN a.status = 'Active'   THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN a.status = 'In Repair' THEN 1 ELSE 0 END) AS in_repair,
      SUM(CASE WHEN a.status = 'Disposed' THEN 1 ELSE 0 END) AS disposed,
      ISNULL(SUM(a.purchase_cost), 0) AS total_cost
    FROM Assets a
    INNER JOIN Categories c  ON a.category_id = c.id
    LEFT JOIN  Categories pc ON c.parent_category_id = pc.id
    ${where}
    GROUP BY c.id, c.category_name, pc.category_name
    ORDER BY total DESC
  `);

  return result.recordset;
}

export async function assetsByCategory(req, res) {
  try {
    const data = await fetchByCategory(req.query);
    return success(
      res,
      { data, total: data.length },
      "Assets by category fetched",
    );
  } catch (err) {
    return error(res, err.message);
  }
}

export async function assetsByCategoryExport(req, res) {
  try {
    const data = await fetchByCategory(req.query);
    await runExport(
      req.query.format,
      data,
      COLUMNS.byCategory,
      "Assets by Category",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}

// ─── 3. ASSETS BY LOCATION ────────────────────────────────────────────────────

async function fetchByLocation(query) {
  const pool = await getPool();
  const conditions = ["a.is_deleted = 0", "l.is_deleted = 0"];
  const inputs = [];

  if (query.locationId) {
    conditions.push("a.location_id = @locationId");
    inputs.push({
      name: "locationId",
      type: sql.Int,
      value: parseInt(query.locationId),
    });
  }

  const where = buildWhere(conditions);
  const request = pool.request();
  applyInputs(request, inputs);

  const result = await request.query(`
    SELECT
      l.id AS location_id,
      l.location_name, l.city,
      COUNT(a.id) AS total,
      SUM(CASE WHEN a.status = 'Active'    THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN a.status = 'In Repair' THEN 1 ELSE 0 END) AS in_repair,
      SUM(CASE WHEN a.status = 'Disposed'  THEN 1 ELSE 0 END) AS disposed,
      ISNULL(SUM(a.purchase_cost), 0) AS total_cost
    FROM Assets a
    INNER JOIN Locations l ON a.location_id = l.id
    ${where}
    GROUP BY l.id, l.location_name, l.city
    ORDER BY total DESC
  `);

  return result.recordset;
}

export async function assetsByLocation(req, res) {
  try {
    const data = await fetchByLocation(req.query);
    return success(
      res,
      { data, total: data.length },
      "Assets by location fetched",
    );
  } catch (err) {
    return error(res, err.message);
  }
}

export async function assetsByLocationExport(req, res) {
  try {
    const data = await fetchByLocation(req.query);
    await runExport(
      req.query.format,
      data,
      COLUMNS.byLocation,
      "Assets by Location",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}

// ─── 4. ASSETS BY DEPARTMENT ──────────────────────────────────────────────────

async function fetchByDepartment(query) {
  const pool = await getPool();
  const conditions = ["a.is_deleted = 0", "d.is_deleted = 0"];
  const inputs = [];

  if (query.departmentId) {
    conditions.push("a.department_id = @departmentId");
    inputs.push({
      name: "departmentId",
      type: sql.Int,
      value: parseInt(query.departmentId),
    });
  }
  if (query.locationId) {
    conditions.push("d.location_id = @locationId");
    inputs.push({
      name: "locationId",
      type: sql.Int,
      value: parseInt(query.locationId),
    });
  }

  const where = buildWhere(conditions);
  const request = pool.request();
  applyInputs(request, inputs);

  const result = await request.query(`
    SELECT
      d.id AS department_id,
      d.dept_name, d.cost_center,
      l.location_name,
      COUNT(a.id) AS total,
      SUM(CASE WHEN a.status = 'Active'    THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN a.status = 'In Repair' THEN 1 ELSE 0 END) AS in_repair,
      SUM(CASE WHEN a.status = 'Disposed'  THEN 1 ELSE 0 END) AS disposed,
      ISNULL(SUM(a.purchase_cost), 0) AS total_cost
    FROM Assets a
    INNER JOIN Departments d ON a.department_id = d.id
    LEFT JOIN  Locations l   ON d.location_id   = l.id
    ${where}
    GROUP BY d.id, d.dept_name, d.cost_center, l.location_name
    ORDER BY total DESC
  `);

  return result.recordset;
}

export async function assetsByDepartment(req, res) {
  try {
    const data = await fetchByDepartment(req.query);
    return success(
      res,
      { data, total: data.length },
      "Assets by department fetched",
    );
  } catch (err) {
    return error(res, err.message);
  }
}

export async function assetsByDepartmentExport(req, res) {
  try {
    const data = await fetchByDepartment(req.query);
    await runExport(
      req.query.format,
      data,
      COLUMNS.byDepartment,
      "Assets by Department",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}

// ─── 5. ASSETS BY STATUS SUMMARY ─────────────────────────────────────────────

async function fetchByStatus(query) {
  const pool = await getPool();
  const conditions = ["is_deleted = 0"];
  const inputs = [];

  if (query.categoryId) {
    conditions.push("category_id = @categoryId");
    inputs.push({
      name: "categoryId",
      type: sql.Int,
      value: parseInt(query.categoryId),
    });
  }
  if (query.locationId) {
    conditions.push("location_id = @locationId");
    inputs.push({
      name: "locationId",
      type: sql.Int,
      value: parseInt(query.locationId),
    });
  }

  const where = buildWhere(conditions);
  const request = pool.request();
  applyInputs(request, inputs);

  const result = await request.query(`
    SELECT
      status,
      COUNT(*) AS total,
      ISNULL(SUM(purchase_cost), 0) AS total_cost
    FROM Assets
    ${where}
    GROUP BY status
    ORDER BY total DESC
  `);

  return result.recordset;
}

export async function assetsByStatus(req, res) {
  try {
    const data = await fetchByStatus(req.query);
    return success(
      res,
      { data, total: data.length },
      "Assets by status fetched",
    );
  } catch (err) {
    return error(res, err.message);
  }
}

export async function assetsByStatusExport(req, res) {
  try {
    const data = await fetchByStatus(req.query);
    await runExport(
      req.query.format,
      data,
      COLUMNS.byStatus,
      "Assets by Status",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}

// ─── 6. ASSETS ASSIGNED TO EMPLOYEES ─────────────────────────────────────────

async function fetchAssignedEmployees(query) {
  const pool = await getPool();
  const { conditions, inputs } = buildFilters(query, {
    status: "a.status",
    locationId: "a.location_id",
    departmentId: "a.department_id",
    employeeId: "a.assigned_employee_id",
  });

  conditions.push("a.is_deleted = 0");
  conditions.push("e.is_deleted = 0");
  conditions.push("a.assigned_employee_id IS NOT NULL");

  const where = buildWhere(conditions);
  const { page, limit, offset } = getPagination(query);

  const request = pool.request();
  applyInputs(request, inputs);
  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const countReq = pool.request();
  applyInputs(countReq, inputs);
  const countResult = await countReq.query(`
    SELECT COUNT(*) AS total
    FROM Assets a
    INNER JOIN Employees e  ON a.assigned_employee_id = e.id
    LEFT JOIN  Departments d ON a.department_id = d.id
    LEFT JOIN  Locations l   ON a.location_id   = l.id
    LEFT JOIN  Categories c  ON a.category_id   = c.id
    ${where}
  `);
  const total = countResult.recordset[0].total;

  const result = await request.query(`
    SELECT
      e.employee_code, e.full_name AS employee_name, e.designation,
      d.dept_name, l.location_name,
      a.asset_code, a.asset_name,
      c.category_name,
      a.status,
      a.purchase_cost
    FROM Assets a
    INNER JOIN Employees e   ON a.assigned_employee_id = e.id
    LEFT JOIN  Departments d  ON a.department_id        = d.id
    LEFT JOIN  Locations l    ON a.location_id          = l.id
    LEFT JOIN  Categories c   ON a.category_id          = c.id
    ${where}
    ORDER BY e.full_name, a.asset_code
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return { data: result.recordset, total, page, limit };
}

export async function assetsAssignedEmployees(req, res) {
  try {
    const result = await fetchAssignedEmployees(req.query);
    return success(res, result, "Assigned employees report fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function assetsAssignedEmployeesExport(req, res) {
  try {
    const { data } = await fetchAssignedEmployees({
      ...req.query,
      page: 1,
      limit: 500,
    });
    await runExport(
      req.query.format,
      data,
      COLUMNS.assignedEmployees,
      "Assets Assigned to Employees",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}

// ─── 7. ASSET AGE REPORT ──────────────────────────────────────────────────────

async function fetchAssetAge(query) {
  const pool = await getPool();
  const { conditions, inputs } = buildFilters(query, {
    status: "a.status",
    categoryId: "a.category_id",
    locationId: "a.location_id",
    departmentId: "a.department_id",
  });

  conditions.push("a.is_deleted = 0");
  conditions.push("a.purchase_date IS NOT NULL");

  // ageMin / ageMax — filter by age in years
  if (query.ageMin) {
    conditions.push(
      `DATEDIFF(MONTH, a.purchase_date, GETDATE()) / 12 >= @ageMin`,
    );
    inputs.push({
      name: "ageMin",
      type: sql.Int,
      value: parseInt(query.ageMin),
    });
  }
  if (query.ageMax) {
    conditions.push(
      `DATEDIFF(MONTH, a.purchase_date, GETDATE()) / 12 <= @ageMax`,
    );
    inputs.push({
      name: "ageMax",
      type: sql.Int,
      value: parseInt(query.ageMax),
    });
  }

  const where = buildWhere(conditions);
  const { page, limit, offset } = getPagination(query);

  const request = pool.request();
  applyInputs(request, inputs);
  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const countReq = pool.request();
  applyInputs(countReq, inputs);
  const countResult = await countReq.query(`
    SELECT COUNT(*) AS total
    FROM Assets a
    LEFT JOIN Categories c  ON a.category_id  = c.id
    LEFT JOIN Locations l   ON a.location_id   = l.id
    LEFT JOIN Departments d ON a.department_id = d.id
    ${where}
  `);
  const total = countResult.recordset[0].total;

  const result = await request.query(`
    SELECT
      a.asset_code, a.asset_name,
      c.category_name, l.location_name, d.dept_name,
      CONVERT(VARCHAR(10), a.purchase_date, 120) AS purchase_date,
      DATEDIFF(MONTH, a.purchase_date, GETDATE()) / 12  AS age_years,
      DATEDIFF(MONTH, a.purchase_date, GETDATE())       AS age_months,
      a.status, a.purchase_cost
    FROM Assets a
    LEFT JOIN Categories c  ON a.category_id  = c.id
    LEFT JOIN Locations l   ON a.location_id   = l.id
    LEFT JOIN Departments d ON a.department_id = d.id
    ${where}
    ORDER BY a.purchase_date ASC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return { data: result.recordset, total, page, limit };
}

export async function assetAge(req, res) {
  try {
    const result = await fetchAssetAge(req.query);
    return success(res, result, "Asset age report fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function assetAgeExport(req, res) {
  try {
    const { data } = await fetchAssetAge({ ...req.query, page: 1, limit: 500 });
    await runExport(
      req.query.format,
      data,
      COLUMNS.assetAge,
      "Asset Age Report",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}

// ─── 8. TRANSFER HISTORY ──────────────────────────────────────────────────────

async function fetchTransfers(query) {
  const pool = await getPool();
  const { conditions, inputs } = buildFilters(query, {
    status: "t.status",
    assetId: "t.asset_id",
    dateField: "t.created_at",
  });

  conditions.push("t.is_deleted = 0");
  const where = buildWhere(conditions);
  const { page, limit, offset } = getPagination(query);

  const request = pool.request();
  applyInputs(request, inputs);
  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const countReq = pool.request();
  applyInputs(countReq, inputs);
  const countResult = await countReq.query(`
    SELECT COUNT(*) AS total FROM Transfers t ${where}
  `);
  const total = countResult.recordset[0].total;

  const result = await request.query(`
    SELECT
      t.transfer_code,
      a.asset_code, a.asset_name,
      fl.location_name  AS from_location,
      fd.dept_name      AS from_department,
      tl.location_name  AS to_location,
      td.dept_name      AS to_department,
      ISNULL(te.full_name, '—') AS to_employee,
      t.reason, t.status,
      rb.full_name      AS raised_by_name,
      ab.full_name      AS approved_by_name,
      CONVERT(VARCHAR(19), t.approved_at, 120) AS approved_at,
      CONVERT(VARCHAR(19), t.created_at,  120) AS created_at
    FROM Transfers t
    INNER JOIN Assets      a   ON t.asset_id           = a.id
    LEFT JOIN  Locations   fl  ON t.from_location_id   = fl.id
    LEFT JOIN  Departments fd  ON t.from_department_id = fd.id
    LEFT JOIN  Locations   tl  ON t.to_location_id     = tl.id
    LEFT JOIN  Departments td  ON t.to_department_id   = td.id
    LEFT JOIN  Employees   te  ON t.to_employee_id     = te.id
    LEFT JOIN  Users       rb  ON t.raised_by          = rb.id
    LEFT JOIN  Users       ab  ON t.approved_by        = ab.id
    ${where}
    ORDER BY t.created_at DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return { data: result.recordset, total, page, limit };
}

export async function transferHistory(req, res) {
  try {
    const result = await fetchTransfers(req.query);
    return success(res, result, "Transfer history fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function transferHistoryExport(req, res) {
  try {
    const { data } = await fetchTransfers({
      ...req.query,
      page: 1,
      limit: 500,
    });
    await runExport(
      req.query.format,
      data,
      COLUMNS.transfers,
      "Transfer History",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}

// ─── 9. DISPOSAL REPORT ───────────────────────────────────────────────────────

async function fetchDisposals(query) {
  const pool = await getPool();
  const { conditions, inputs } = buildFilters(query, {
    status: "d.status",
    assetId: "d.asset_id",
    method: "d.disposal_method",
    dateField: "d.created_at",
  });

  conditions.push("d.is_deleted = 0");
  const where = buildWhere(conditions);
  const { page, limit, offset } = getPagination(query);

  const request = pool.request();
  applyInputs(request, inputs);
  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const countReq = pool.request();
  applyInputs(countReq, inputs);
  const countResult = await countReq.query(`
    SELECT COUNT(*) AS total FROM Disposals d ${where}
  `);
  const total = countResult.recordset[0].total;

  const result = await request.query(`
    SELECT
      d.disposal_code,
      a.asset_code, a.asset_name,
      c.category_name,
      d.disposal_method, d.reason,
      d.sale_amount,
      CONVERT(VARCHAR(10), d.disposal_date, 120) AS disposal_date,
      d.buyer_details, d.status,
      rb.full_name AS raised_by_name,
      ab.full_name AS approved_by_name,
      CONVERT(VARCHAR(19), d.created_at, 120) AS created_at
    FROM Disposals d
    INNER JOIN Assets      a  ON d.asset_id    = a.id
    LEFT JOIN  Categories  c  ON a.category_id = c.id
    LEFT JOIN  Users       rb ON d.raised_by   = rb.id
    LEFT JOIN  Users       ab ON d.approved_by = ab.id
    ${where}
    ORDER BY d.created_at DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return { data: result.recordset, total, page, limit };
}

export async function disposalReport(req, res) {
  try {
    const result = await fetchDisposals(req.query);
    return success(res, result, "Disposal report fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function disposalReportExport(req, res) {
  try {
    const { data } = await fetchDisposals({
      ...req.query,
      page: 1,
      limit: 500,
    });
    await runExport(
      req.query.format,
      data,
      COLUMNS.disposals,
      "Disposal Report",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}

// ─── 10. VERIFICATION SUMMARY ─────────────────────────────────────────────────

async function fetchVerification(query) {
  const pool = await getPool();
  const { conditions, inputs } = buildFilters(query, {
    status: "vb.status",
    locationId: "vb.location_id",
    departmentId: "vb.department_id",
    dateField: "vb.opened_at",
  });

  conditions.push("vb.is_deleted = 0");
  const where = buildWhere(conditions);
  const { page, limit, offset } = getPagination(query);

  const request = pool.request();
  applyInputs(request, inputs);
  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const countReq = pool.request();
  applyInputs(countReq, inputs);
  const countResult = await countReq.query(`
    SELECT COUNT(*) AS total FROM VerificationBatches vb ${where}
  `);
  const total = countResult.recordset[0].total;

  const result = await request.query(`
    SELECT
      vb.batch_code, vb.title,
      l.location_name, d.dept_name,
      vb.status,
      COUNT(vi.id)                                            AS total_items,
      SUM(CASE WHEN vi.status = 'Verified'  THEN 1 ELSE 0 END) AS verified,
      SUM(CASE WHEN vi.status = 'NotFound'  THEN 1 ELSE 0 END) AS not_found,
      SUM(CASE WHEN vi.status = 'Pending'   THEN 1 ELSE 0 END) AS pending,
      u.full_name AS opened_by_name,
      CONVERT(VARCHAR(19), vb.opened_at,  120) AS opened_at,
      CONVERT(VARCHAR(19), vb.closed_at,  120) AS closed_at
    FROM VerificationBatches vb
    LEFT JOIN Locations  l  ON vb.location_id   = l.id
    LEFT JOIN Departments d ON vb.department_id = d.id
    LEFT JOIN Users u       ON vb.opened_by     = u.id
    LEFT JOIN VerificationItems vi ON vi.batch_id = vb.id AND vi.is_deleted = 0
    ${where}
    GROUP BY
      vb.id, vb.batch_code, vb.title, l.location_name, d.dept_name,
      vb.status, u.full_name, vb.opened_at, vb.closed_at
    ORDER BY vb.opened_at DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return { data: result.recordset, total, page, limit };
}

export async function verificationSummary(req, res) {
  try {
    const result = await fetchVerification(req.query);
    return success(res, result, "Verification summary fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function verificationSummaryExport(req, res) {
  try {
    const { data } = await fetchVerification({
      ...req.query,
      page: 1,
      limit: 500,
    });
    await runExport(
      req.query.format,
      data,
      COLUMNS.verification,
      "Verification Summary",
      res,
    );
  } catch (err) {
    return error(res, err.message);
  }
}
