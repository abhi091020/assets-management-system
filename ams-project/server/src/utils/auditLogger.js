// server/src/utils/auditLogger.js
import sql from "mssql";
import { getPool } from "../config/db.js";

/**
 * logAudit — call inside controllers after successful operations
 * Never throws — audit failure must never break the main operation
 */
export async function logAudit({
  userId = null,
  userName = "System",
  userRole = "System",
  action,
  entity,
  entityId = null,
  entityCode = null,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null,
}) {
  console.log("[AuditLogger] Called:", action, entity, "by", userName);
  try {
    const pool = getPool(); // ← NOT async, no await
    await pool
      .request()
      .input("user_id", sql.Int, userId)
      .input("user_name", sql.NVarChar(150), userName)
      .input("user_role", sql.NVarChar(50), userRole)
      .input("action", sql.NVarChar(50), action)
      .input("entity", sql.NVarChar(50), entity)
      .input("entity_id", sql.Int, entityId)
      .input("entity_code", sql.NVarChar(50), entityCode)
      .input(
        "old_value",
        sql.NVarChar(sql.MAX),
        oldValue ? JSON.stringify(oldValue) : null,
      )
      .input(
        "new_value",
        sql.NVarChar(sql.MAX),
        newValue ? JSON.stringify(newValue) : null,
      )
      .input("ip_address", sql.NVarChar(50), ipAddress)
      .input("user_agent", sql.NVarChar(500), userAgent).query(`
        INSERT INTO AuditLogs
          (user_id, user_name, user_role, action, entity,
           entity_id, entity_code, old_value, new_value,
           ip_address, user_agent)
        VALUES
          (@user_id, @user_name, @user_role, @action, @entity,
           @entity_id, @entity_code, @old_value, @new_value,
           @ip_address, @user_agent)
      `);
    console.log("[AuditLogger] ✅ Inserted:", action, entity);
  } catch (err) {
    console.error("[AuditLogger Error]", err.message);
  }
}

/**
 * Helper to extract request meta from Express req object
 */
export function getRequestMeta(req) {
  return {
    ipAddress:
      req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
    userAgent: req.headers["user-agent"] || null,
  };
}
