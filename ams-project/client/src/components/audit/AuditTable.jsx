// client/src/components/audit/AuditTable.jsx
import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import DatePicker from "../common/DatePicker";

const C = {
  primary: "#8B1A1A",
  headerBg: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  rowHover: "#FDF8F8",
  rowZebra: "#FAFAFA",
};

const PILL_TRIGGER = {
  padding: "10px 18px",
  borderRadius: "50px",
  fontSize: "14px",
  color: "#333",
  backgroundColor: "#FAFAFA",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  borderColor: "#EBEBEB",
};

const PILL_CONTAINER = {
  minWidth: 0,
  flex: "0 0 auto",
};

const S = {
  page: { fontFamily: "'Segoe UI', sans-serif" },
  pageHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  titleAccent: { display: "flex", alignItems: "center", gap: "10px" },
  accentBar: {
    width: "4px",
    height: "32px",
    borderRadius: "4px",
    background: "linear-gradient(180deg, #8B1A1A 0%, #C0392B 100%)",
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: C.primary,
    margin: 0,
    lineHeight: 1.2,
  },
  pageSubtitle: { fontSize: "13px", color: C.textLight, marginTop: "4px" },
  card: {
    backgroundColor: C.white,
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "20px",
    border: "1px solid rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 230px)",
  },
  tableWrapper: {
    flex: 1,
    overflowX: "auto",
    overflowY: "auto",
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
  },
  searchWrapper: { flex: 1, position: "relative", minWidth: "180px" },
  searchInput: {
    width: "100%",
    padding: "10px 44px 10px 18px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    fontSize: "14px",
    color: C.text,
    outline: "none",
    backgroundColor: "#FAFAFA",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  searchIcon: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: C.textLight,
    pointerEvents: "none",
  },
  filterSelect: {
    padding: "10px 18px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    fontSize: "14px",
    color: C.text,
    backgroundColor: "#FAFAFA",
    cursor: "pointer",
    outline: "none",
    whiteSpace: "nowrap",
    appearance: "none",
    WebkitAppearance: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  filterWrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  filterChevron: {
    position: "absolute",
    right: "12px",
    pointerEvents: "none",
    color: C.textLight,
  },
  clearBtn: {
    padding: "10px 18px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    fontSize: "13px",
    color: C.primary,
    backgroundColor: "#FFF5F5",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "900px" },
  thead: { backgroundColor: C.headerBg, position: "sticky", top: 0, zIndex: 2 },
  th: {
    color: C.white,
    fontWeight: "600",
    fontSize: "13px",
    padding: "14px 16px",
    textAlign: "left",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    backgroundColor: C.headerBg,
  },
  tr: { borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" },
  td: {
    padding: "13px 16px",
    fontSize: "14px",
    color: C.text,
    verticalAlign: "middle",
  },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #C21807 0%, #8B1A1A 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: C.white,
    fontSize: "11px",
    fontWeight: "700",
    flexShrink: 0,
  },
  emptyRow: {
    textAlign: "center",
    color: C.textLight,
    padding: "40px",
    fontSize: "14px",
  },
  paginationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "14px",
    fontSize: "13px",
    color: C.textLight,
    flexShrink: 0,
  },
  pageBtn: (disabled) => ({
    padding: "6px 16px",
    borderRadius: "50px",
    border: `1.5px solid ${C.border}`,
    background: C.white,
    fontSize: "13px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    color: C.text,
  }),
};

const ACTION_COLORS = {
  LOGIN: { bg: "#DCFCE7", color: "#15803D" },
  LOGIN_FAILED: { bg: "#FEE2E2", color: "#B91C1C" },
  CREATE: { bg: "#DBEAFE", color: "#1D4ED8" },
  UPDATE: { bg: "#FEF9C3", color: "#92400E" },
  DELETE: { bg: "#FEE2E2", color: "#B91C1C" },
  APPROVE: { bg: "#DCFCE7", color: "#15803D" },
  REJECT: { bg: "#FEE2E2", color: "#B91C1C" },
  CLOSE: { bg: "#F3F4F6", color: "#4B5563" },
  VERIFY: { bg: "#EDE9FE", color: "#6D28D9" },
};

const ENTITY_COLORS = {
  Asset: { bg: "#EEF2FF", color: "#4338CA" },
  Transfer: { bg: "#FFF7ED", color: "#C2410C" },
  Disposal: { bg: "#FEE2E2", color: "#B91C1C" },
  Verification: { bg: "#F0FDFA", color: "#0F766E" },
  User: { bg: "#DBEAFE", color: "#1D4ED8" },
  Department: { bg: "#FCE7F3", color: "#9D174D" },
  Category: { bg: "#EDE9FE", color: "#6D28D9" },
  Location: { bg: "#ECFEFF", color: "#0E7490" },
  Employee: { bg: "#DCFCE7", color: "#15803D" },
  Auth: { bg: "#F3F4F6", color: "#4B5563" },
};

function Pill({ label, colorMap }) {
  const c = colorMap[label] || { bg: "#F3F4F6", color: "#4B5563" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "50px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: c.bg,
        color: c.color,
      }}
    >
      {label}
    </span>
  );
}

function JsonCell({ value, label }) {
  const [open, setOpen] = useState(false);
  if (!value) return <span style={{ color: "#CCC" }}>—</span>;
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    parsed = value;
  }
  return (
    <div style={{ maxWidth: "160px" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "12px",
          color: "#2563EB",
          fontWeight: "600",
          textDecoration: "underline",
          padding: 0,
        }}
      >
        {open ? "Hide" : "View"} {label}
      </button>
      {open && (
        <pre
          style={{
            marginTop: "6px",
            padding: "8px",
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
            fontSize: "10px",
            color: "#374151",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            maxHeight: "140px",
            overflowY: "auto",
          }}
        >
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Device info parser ────────────────────────────────────────────────────────
function parseDevice(ua) {
  if (!ua) return null;
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const browser = /edg/i.test(ua)
    ? "Edge"
    : /chrome/i.test(ua)
      ? "Chrome"
      : /firefox/i.test(ua)
        ? "Firefox"
        : /safari/i.test(ua)
          ? "Safari"
          : "Browser";
  const os = /windows/i.test(ua)
    ? "Windows"
    : /android/i.test(ua)
      ? "Android"
      : /iphone|ipad/i.test(ua)
        ? "iOS"
        : /mac/i.test(ua)
          ? "Mac"
          : /linux/i.test(ua)
            ? "Linux"
            : "Unknown";
  return { isMobile, browser, os };
}

function DeviceCell({ ipAddress, userAgent }) {
  const ip = ipAddress ? ipAddress.replace("::ffff:", "") : null;
  const device = parseDevice(userAgent);

  return (
    <td style={S.td}>
      {/* IP */}
      <span
        style={{
          fontSize: "11px",
          color: C.white,
          fontFamily: "monospace",
          display: "inline-block",
          background: "#6B7280",
          padding: "2px 7px",
          borderRadius: "4px",
          letterSpacing: "0.3px",
        }}
      >
        {ip || "—"}
      </span>

      {/* Device info */}
      {device && (
        <span
          title={userAgent}
          style={{
            fontSize: "11px",
            color: "#AAA",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            marginTop: "3px",
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "help",
          }}
        >
          <span>{device.isMobile ? "📱" : "🖥️"}</span>
          <span>{device.browser}</span>
          <span style={{ color: "#CCC" }}>·</span>
          <span>{device.os}</span>
        </span>
      )}
    </td>
  );
}

function formatIST(str) {
  if (!str) return "—";
  const clean = str.endsWith("Z") ? str.slice(0, -1) : str;
  return new Date(clean).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const ENTITIES = [
  "Asset",
  "Transfer",
  "Disposal",
  "Verification",
  "User",
  "Department",
  "Category",
  "Location",
  "Employee",
  "Auth",
];
const ACTIONS = [
  "LOGIN",
  "LOGIN_FAILED",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "CLOSE",
  "VERIFY",
];

export default function AuditTable() {
  const {
    logs,
    total,
    totalPages,
    page,
    loading,
    filters,
    fetchLogs,
    handleFilterChange,
    handlePageChange,
    handleSearch,
    resetFilters,
  } = useAuditLogs();

  useEffect(() => {
    fetchLogs();
  }, []); // eslint-disable-line

  const hasActiveFilters =
    filters.search ||
    filters.entity ||
    filters.action ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div style={S.page}>
      {/* ── Page header ── */}
      <div style={S.pageHeaderRow}>
        <div style={S.titleAccent}>
          <div style={S.accentBar} />
          <div>
            <h1 style={S.pageTitle}>Audit Logs</h1>
            <p style={S.pageSubtitle}>
              {total > 0
                ? `${total} total records`
                : "Complete system activity trail"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Card ── */}
      <div style={S.card}>
        {/* ── Controls row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "18px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {/* Search */}
          <div style={S.searchWrapper}>
            <input
              type="text"
              placeholder="Search user, entity, code…"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              style={S.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = C.primary;
                e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
                e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            />
            <span style={S.searchIcon}>
              <Search size={17} />
            </span>
          </div>

          {/* Entity filter */}
          <div style={S.filterWrapper}>
            <select
              value={filters.entity}
              onChange={(e) => handleFilterChange("entity", e.target.value)}
              style={{ ...S.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Entities</option>
              {ENTITIES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <span style={S.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>

          {/* Action filter */}
          <div style={S.filterWrapper}>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              style={{ ...S.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Actions</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <span style={S.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>

          {/* Date From */}
          <DatePicker
            value={filters.dateFrom}
            onChange={(v) => handleFilterChange("dateFrom", v)}
            placeholder="Date From"
            triggerStyle={PILL_TRIGGER}
            containerStyle={PILL_CONTAINER}
          />

          {/* Date To */}
          <DatePicker
            value={filters.dateTo}
            onChange={(v) => handleFilterChange("dateTo", v)}
            placeholder="Date To"
            triggerStyle={PILL_TRIGGER}
            containerStyle={PILL_CONTAINER}
            alignRight
          />

          {hasActiveFilters && (
            <button onClick={resetFilters} style={S.clearBtn}>
              Clear
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div style={S.tableWrapper}>
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={S.th}>Timestamp (IST)</th>
                <th style={S.th}>User</th>
                <th style={S.th}>Action</th>
                <th style={S.th}>Entity</th>
                <th style={S.th}>Code / ID</th>
                <th style={S.th}>Old Value</th>
                <th style={S.th}>New Value</th>
                <th style={S.th}>IP / Device</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={S.emptyRow}>
                    Loading…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={S.emptyRow}>
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr
                    key={log.id}
                    style={{
                      ...S.tr,
                      backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 1 ? C.rowZebra : C.white)
                    }
                  >
                    {/* Timestamp */}
                    <td style={S.td}>
                      <span
                        style={{
                          fontSize: "12px",
                          color: C.textLight,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatIST(log.created_at)}
                      </span>
                    </td>

                    {/* User */}
                    <td style={S.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div style={S.avatar}>
                          {(log.user_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "13px",
                              color: C.primary,
                            }}
                          >
                            {log.user_name}
                          </div>
                          <div style={{ fontSize: "11px", color: C.textLight }}>
                            {log.user_role}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td style={S.td}>
                      <Pill label={log.action} colorMap={ACTION_COLORS} />
                    </td>

                    {/* Entity */}
                    <td style={S.td}>
                      <Pill label={log.entity} colorMap={ENTITY_COLORS} />
                    </td>

                    {/* Code / ID */}
                    <td style={S.td}>
                      {log.entity_code ? (
                        <span
                          style={{
                            fontSize: "12px",
                            fontFamily: "monospace",
                            fontWeight: "600",
                            color: C.text,
                            background: "#F3F4F6",
                            padding: "3px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {log.entity_code}
                        </span>
                      ) : log.entity_id ? (
                        <span style={{ fontSize: "12px", color: C.textLight }}>
                          ID: {log.entity_id}
                        </span>
                      ) : (
                        <span style={{ color: "#CCC" }}>—</span>
                      )}
                    </td>

                    {/* Old Value */}
                    <td style={S.td}>
                      <JsonCell value={log.old_value} label="old" />
                    </td>

                    {/* New Value */}
                    <td style={S.td}>
                      <JsonCell value={log.new_value} label="new" />
                    </td>

                    {/* IP / Device */}
                    <DeviceCell
                      ipAddress={log.ip_address}
                      userAgent={log.user_agent}
                    />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div style={S.paginationRow}>
            <span>
              Page {page} of {totalPages} &nbsp;·&nbsp; {total} records
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={S.pageBtn(page <= 1)}
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <button
                style={S.pageBtn(page >= totalPages)}
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
