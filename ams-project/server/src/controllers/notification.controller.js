// server/src/controllers/notification.controller.js
import { getPool } from "../config/db.js";
import sql from "mssql";
import { success, error } from "../utils/responseHelper.js";

// ── Text formatter ────────────────────────────────────────────────────────────
function formatText(row) {
  const { action, entity, entity_code, user_name } = row;
  const label = entity_code ? `"${entity_code}"` : entity;
  const by = user_name || "System";

  const map = {
    "CREATE:Asset": `New asset ${label} registered by ${by}`,
    "UPDATE:Asset": `Asset ${label} updated by ${by}`,
    "DELETE:Asset": `Asset ${label} deleted by ${by}`,
    "CREATE:User": `New user ${label} created by ${by}`,
    "UPDATE:User": `User ${label} updated by ${by}`,
    "DELETE:User": `User ${label} removed by ${by}`,
    "CREATE:Transfer": `Asset transfer initiated by ${by}`,
    "UPDATE:Transfer": `Transfer ${label} status updated by ${by}`,
    "DELETE:Transfer": `Transfer ${label} cancelled by ${by}`,
    "CREATE:Verification": `Verification batch started by ${by}`,
    "UPDATE:Verification": `Verification ${label} updated by ${by}`,
    "DELETE:Verification": `Verification ${label} deleted by ${by}`,
    "CREATE:Disposal": `Asset ${label} marked for disposal by ${by}`,
    "UPDATE:Disposal": `Disposal ${label} updated by ${by}`,
    "DELETE:Disposal": `Disposal ${label} cancelled by ${by}`,
    "CREATE:Location": `Location ${label} added by ${by}`,
    "UPDATE:Location": `Location ${label} updated by ${by}`,
    "DELETE:Location": `Location ${label} deleted by ${by}`,
    "CREATE:Department": `Department ${label} added by ${by}`,
    "UPDATE:Department": `Department ${label} updated by ${by}`,
    "DELETE:Department": `Department ${label} deleted by ${by}`,
    "CREATE:Category": `Category ${label} added by ${by}`,
    "UPDATE:Category": `Category ${label} updated by ${by}`,
    "DELETE:Category": `Category ${label} deleted by ${by}`,
    "CREATE:Employee": `Employee ${label} added by ${by}`,
    "UPDATE:Employee": `Employee ${label} updated by ${by}`,
    "DELETE:Employee": `Employee ${label} removed by ${by}`,
  };

  return (
    map[`${action}:${entity}`] || `${action} on ${entity} ${label} by ${by}`
  );
}

function getIcon(action, entity) {
  if (action === "DELETE") return "🗑️";
  const entityIcons = {
    Asset: "📦",
    User: "👤",
    Transfer: "🔄",
    Verification: "✅",
    Disposal: "🗑️",
    Location: "📍",
    Department: "🏢",
    Category: "🏷️",
    Employee: "👷",
  };
  return entityIcons[entity] || "🔔";
}

function getAccent(action, entity) {
  if (action === "DELETE") return "#EF4444";
  const map = {
    Asset: "#8B1A1A",
    User: "#1D4ED8",
    Transfer: "#0F766E",
    Verification: "#15803D",
    Disposal: "#B45309",
    Location: "#7C3AED",
    Department: "#0369A1",
    Category: "#BE185D",
    Employee: "#6D28D9",
  };
  return map[entity] || "#6B7280";
}

// ── GET /api/notifications ────────────────────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const pool = getPool();
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);

    // Get user's read/clear timestamps
    let lastReadAt = null;
    let clearedAt = null;
    try {
      const userRes = await pool.request().input("id", sql.Int, req.user.id)
        .query(`
          SELECT notifications_read_at, notifications_cleared_at
          FROM Users WHERE id = @id
        `);
      lastReadAt = userRes.recordset[0]?.notifications_read_at ?? null;
      clearedAt = userRes.recordset[0]?.notifications_cleared_at ?? null;
    } catch {
      // columns may not exist yet — safe fallback
    }

    const result = await pool
      .request()
      .input("limit", sql.Int, limit)
      .input("clearedAt", sql.DateTime, clearedAt)
      .input("userId", sql.Int, req.user.id).query(`
        SELECT TOP (@limit)
          id, action, entity, entity_id, entity_code,
          user_name, user_role, created_at
        FROM AuditLogs
        WHERE action != 'LOGIN_FAILED'
          AND user_id = @userId
          AND (@clearedAt IS NULL OR created_at > @clearedAt)
        ORDER BY created_at DESC
      `);

    const notifications = result.recordset.map((row) => {
      const isUnread = lastReadAt
        ? new Date(row.created_at) > new Date(lastReadAt)
        : true;
      return {
        id: row.id,
        text: formatText(row),
        time: row.created_at,
        unread: isUnread,
        action: row.action,
        entity: row.entity,
        entityCode: row.entity_code,
        userName: row.user_name,
        icon: getIcon(row.action, row.entity),
        accent: getAccent(row.action, row.entity),
      };
    });

    const unreadCount = notifications.filter((n) => n.unread).length;

    return success(
      res,
      { notifications, unreadCount, lastReadAt, clearedAt },
      "Notifications fetched",
    );
  } catch (err) {
    console.error("getNotifications error:", err.message);
    return error(res, "Failed to fetch notifications");
  }
};

// ── PUT /api/notifications/mark-read ─────────────────────────────────────────
export const markNotificationsRead = async (req, res) => {
  try {
    const pool = getPool();
    await pool.request().input("id", sql.Int, req.user.id).query(`
      UPDATE Users
      SET notifications_read_at = GETDATE(), updated_at = GETDATE()
      WHERE id = @id AND is_deleted = 0
    `);
    return success(res, null, "Notifications marked as read");
  } catch (err) {
    console.error("markNotificationsRead error:", err.message);
    return error(res, "Failed to mark notifications as read");
  }
};

// ── PUT /api/notifications/clear ─────────────────────────────────────────────
export const clearNotifications = async (req, res) => {
  try {
    const pool = getPool();
    await pool.request().input("id", sql.Int, req.user.id).query(`
      UPDATE Users
      SET notifications_cleared_at = GETDATE(),
          notifications_read_at    = GETDATE(),
          updated_at               = GETDATE()
      WHERE id = @id AND is_deleted = 0
    `);
    return success(res, null, "Notifications cleared");
  } catch (err) {
    console.error("clearNotifications error:", err.message);
    return error(res, "Failed to clear notifications");
  }
};
