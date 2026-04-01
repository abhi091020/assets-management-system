import {
  Eye,
  Pencil,
  Ban,
  Trash2,
  Search,
  ChevronDown,
  Plus,
} from "lucide-react";

const C = {
  primary: "#8B1A1A",
  primaryHover: "#6E1515",
  primaryLight: "#FFF5F5",
  headerBg: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  activeDot: "#22C55E",
  activeBadgeBg: "#DCFCE7",
  activeBadgeText: "#15803D",
  inactiveDot: "#EF4444",
  inactiveBadgeBg: "#FEE2E2",
  inactiveBadgeText: "#B91C1C",
  rowHover: "#FDF8F8",
  rowZebra: "#FAFAFA",
};

const pulseStyle = `
  @keyframes pulse-dot {
    0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
    70%  { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }
  .pulse-active { animation: pulse-dot 1.8s infinite; }
`;

const styles = {
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
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #8B1A1A 0%, #6E1515 100%)",
    color: C.white,
    border: "none",
    borderRadius: "50px",
    padding: "10px 22px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 14px rgba(139,26,26,0.35)",
  },
  card: {
    backgroundColor: C.white,
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "20px",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
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
  tableWrapper: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "calc(100vh - 320px)",
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "600px" },
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
  thCenter: { textAlign: "center" },
  tr: { borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" },
  td: {
    padding: "13px 16px",
    fontSize: "14px",
    color: C.text,
    verticalAlign: "middle",
  },
  locationName: {
    fontWeight: "700",
    fontSize: "13.5px",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: "0.01em",
  },
  locationSub: { fontSize: "12px", color: C.textLight, marginTop: "2px" },
  badge: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 13px",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: active ? C.activeBadgeBg : C.inactiveBadgeBg,
    color: active ? C.activeBadgeText : C.inactiveBadgeText,
    boxShadow: active
      ? "0 1px 4px rgba(34,197,94,0.2)"
      : "0 1px 4px rgba(239,68,68,0.15)",
  }),
  dot: (active) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: active ? C.activeDot : C.inactiveDot,
    flexShrink: 0,
  }),
  actionsCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
  },
  actionBtn: (color) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    color: color || C.primary,
    display: "flex",
    alignItems: "center",
    transition: "background 0.15s, transform 0.1s",
  }),
  emptyRow: {
    textAlign: "center",
    color: C.textLight,
    padding: "40px",
    fontSize: "14px",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LocationTable
// Props:
//   locations      — array from server (already paginated + filtered)
//   search         — string  from useLocations hook
//   setSearch      — setter  from useLocations hook  (triggers server-side search)
//   statusFilter   — string  from useLocations hook  ("" | "active" | "inactive")
//   setStatusFilter— setter  from useLocations hook  (triggers server-side filter)
//   onAdd / onView / onEdit / onBlock / onDelete — action handlers
// ─────────────────────────────────────────────────────────────────────────────
const LocationTable = ({
  locations = [],
  search = "",
  setSearch,
  statusFilter = "",
  setStatusFilter,
  onAdd,
  onView,
  onEdit,
  onBlock,
  onDelete,
}) => {
  const isActive = (loc) => loc.is_active === true || loc.is_active === 1;

  return (
    <div style={styles.page}>
      <style>{pulseStyle}</style>

      {/* ── Page header ── */}
      <div style={styles.pageHeaderRow}>
        <div style={styles.titleAccent}>
          <div style={styles.accentBar} />
          <div>
            <h1 style={styles.pageTitle}>Locations</h1>
            <p style={styles.pageSubtitle}>
              Manage offices and locations across your organisation
            </p>
          </div>
        </div>
        <button
          style={styles.addBtn}
          onClick={onAdd}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(139,26,26,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(139,26,26,0.35)";
          }}
        >
          Add Location <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div style={styles.card}>
        {/* ── Controls row ── */}
        <div style={styles.controlsRow}>

          {/* Search — drives server-side search via hook */}
          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch?.(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = C.primary;
                e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
                e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            />
            <span style={styles.searchIcon}>
              <Search size={17} />
            </span>
          </div>

          {/* Status filter — drives server-side filter via hook */}
          <div style={styles.filterWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter?.(e.target.value)}
              style={{ ...styles.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span style={styles.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>State</th>
                <th style={styles.th}>Pincode</th>
                <th style={{ ...styles.th, ...styles.thCenter }}>Status</th>
                <th style={{ ...styles.th, ...styles.thCenter }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.emptyRow}>
                    No locations found.
                  </td>
                </tr>
              ) : (
                locations.map((loc, idx) => (
                  <tr
                    key={loc.id ?? idx}
                    style={{
                      ...styles.tr,
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
                    {/* Location name + address */}
                    <td style={styles.td}>
                      <div style={styles.locationName}>
                        {loc.location_name}
                      </div>
                      {loc.address && (
                        <div style={styles.locationSub}>
                          {loc.address.length > 32
                            ? loc.address.slice(0, 32) + "..."
                            : loc.address}
                        </div>
                      )}
                    </td>

                    <td style={styles.td}>{loc.city || "—"}</td>
                    <td style={styles.td}>{loc.state || "—"}</td>
                    <td style={styles.td}>{loc.pin_code || "—"}</td>

                    {/* Status badge */}
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={styles.badge(isActive(loc))}>
                        <span
                          className={isActive(loc) ? "pulse-active" : ""}
                          style={styles.dot(isActive(loc))}
                        />
                        {isActive(loc) ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td style={{ ...styles.td, padding: "13px 8px" }}>
                      <div style={styles.actionsCell}>
                        <button
                          style={styles.actionBtn("#555")}
                          onClick={() => onView?.(loc)}
                          title="View"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          style={styles.actionBtn("#2563EB")}
                          onClick={() => onEdit?.(loc)}
                          title="Edit"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(37,99,235,0.08)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          style={styles.actionBtn("#D97706")}
                          onClick={() => onBlock?.(loc)}
                          title={isActive(loc) ? "Deactivate" : "Activate"}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(217,119,6,0.08)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <Ban size={15} />
                        </button>

                        <button
                          style={styles.actionBtn("#DC2626")}
                          onClick={() => onDelete?.(loc)}
                          title="Delete"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(220,38,38,0.08)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LocationTable;