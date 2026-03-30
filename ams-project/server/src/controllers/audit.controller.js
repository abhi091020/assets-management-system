// server/src/controllers/audit.controller.js
import { getPool, sql } from "../config/db.js";
import { success, error } from "../utils/responseHelper.js";

export const getAuditLogs = async (req, res) => {
  try {
    const pool = getPool();
    const {
      userId,
      entity,
      action,
      dateFrom,
      dateTo,
      search,
      page = 1,
      pageSize = 20,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let filters = `WHERE 1=1`;
    const request = pool.request();

    if (userId) {
      filters += ` AND al.user_id = @userId`;
      request.input("userId", sql.Int, parseInt(userId));
    }
    if (entity) {
      filters += ` AND al.entity = @entity`;
      request.input("entity", sql.NVarChar(50), entity);
    }
    if (action) {
      filters += ` AND al.action = @action`;
      request.input("action", sql.NVarChar(50), action);
    }
    if (dateFrom) {
      filters += ` AND al.created_at >= @dateFrom`;
      request.input("dateFrom", sql.DateTime, new Date(dateFrom));
    }
    if (dateTo) {
      filters += ` AND al.created_at < DATEADD(day, 1, @dateTo)`;
      request.input("dateTo", sql.DateTime, new Date(dateTo));
    }
    if (search) {
      filters += ` AND (al.user_name LIKE @search OR al.entity_code LIKE @search OR al.entity LIKE @search)`;
      request.input("search", sql.NVarChar(100), `%${search}%`);
    }

    request.input("pageSize", sql.Int, parseInt(pageSize));
    request.input("offset", sql.Int, offset);

    const result = await request.query(`
      SELECT al.id, al.user_id, al.user_name, al.user_role, al.action,
             al.entity, al.entity_id, al.entity_code, al.old_value,
             al.new_value, al.ip_address, al.user_agent, al.created_at
      FROM AuditLogs al
      ${filters}
      ORDER BY al.created_at DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

      SELECT COUNT(*) AS total FROM AuditLogs al ${filters};
    `);

    const logs = result.recordsets[0];
    const total = result.recordsets[1][0].total;

    return success(res, {
      logs,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / parseInt(pageSize)),
    });
  } catch (err) {
    console.error("[getAuditLogs]", err.message);
    return error(res, "Failed to fetch audit logs");
  }
};
