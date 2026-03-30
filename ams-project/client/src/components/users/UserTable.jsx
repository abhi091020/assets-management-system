import { useState } from "react";
import {
  Eye,
  Pencil,
  Ban,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Search,
  ChevronDown,
  Plus,
} from "lucide-react";
import UserRoleBadge from "./UserRoleBadge";
import { formatDate, getInitials } from "../../utils/userHelpers";

const C = {
  primary: "#8B1A1A",
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
  },
  searchWrapper: { flex: 1, position: "relative" },
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
  table: { width: "100%", borderCollapse: "collapse", minWidth: "700px" },
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
  nameText: {
    fontWeight: "700",
    fontSize: "13.5px",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: "0.01em",
  },
  subText: { fontSize: "12px", color: C.textLight, marginTop: "2px" },
  avatar: {
    width: "32px",
    height: "32px",
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
    color,
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
  paginationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "14px",
    fontSize: "13px",
    color: C.textLight,
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

const ROLES = ["", "SuperAdmin", "Admin", "AssetManager", "Auditor", "Viewer"];

export default function UserTable({
  users = [],
  loading,
  total,
  page,
  totalPages,
  onPageChange,
  currentUserId,
  canAdmin,
  canSuperAdmin,
  onAdd,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onPermanentDelete,
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.is_active) ||
      (statusFilter === "inactive" && !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  const hoverEnter = (e, bg, scale = true) => {
    e.currentTarget.style.background = bg;
    if (scale) e.currentTarget.style.transform = "scale(1.1)";
  };
  const hoverLeave = (e) => {
    e.currentTarget.style.background = "none";
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <div style={S.page}>
      <style>{pulseStyle}</style>

      <div style={S.pageHeaderRow}>
        <div style={S.titleAccent}>
          <div style={S.accentBar} />
          <div>
            <h1 style={S.pageTitle}>Users</h1>
            <p style={S.pageSubtitle}>
              Manage system users and their access roles
            </p>
          </div>
        </div>
        {canAdmin && (
          <button
            style={S.addBtn}
            onClick={onAdd}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(139,26,26,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(139,26,26,0.35)";
            }}
          >
            Add User <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div style={S.card}>
        <div style={S.controlsRow}>
          <div style={S.searchWrapper}>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          <div style={S.filterWrapper}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ ...S.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Roles</option>
              {ROLES.filter(Boolean).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <span style={S.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>
          <div style={S.filterWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...S.filterSelect, paddingRight: "36px" }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span style={S.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>
        </div>

        <div style={S.tableWrapper}>
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={S.th}>User</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Role</th>
                <th style={S.th}>Phone</th>
                <th style={S.th}>Last Login</th>
                <th style={{ ...S.th, ...S.thCenter }}>Status</th>
                <th style={{ ...S.th, ...S.thCenter }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={S.emptyRow}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={S.emptyRow}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <tr
                    key={u.id ?? idx}
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
                    <td style={S.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div style={S.avatar}>
                          {u.profile_photo_url ? (
                            <img
                              src={u.profile_photo_url}
                              alt={u.full_name}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              onError={(e) => {
                                // fallback to initials if image fails to load
                                e.target.style.display = "none";
                                e.target.parentNode.innerText = getInitials(
                                  u.full_name,
                                );
                              }}
                            />
                          ) : (
                            getInitials(u.full_name)
                          )}
                        </div>
                        <div style={S.nameText}>{u.full_name}</div>
                      </div>
                    </td>

                    <td style={S.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {u.email}
                      </span>
                    </td>
                    <td style={S.td}>
                      <UserRoleBadge role={u.role} />
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "13px", color: C.textLight }}>
                        {u.phone || "—"}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          fontSize: "12px",
                          color: C.textLight,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(u.last_login_at)}
                      </span>
                    </td>

                    <td style={{ ...S.td, textAlign: "center" }}>
                      <span style={S.badge(u.is_active)}>
                        <span
                          className={u.is_active ? "pulse-active" : ""}
                          style={S.dot(u.is_active)}
                        />
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={{ ...S.td, padding: "13px 8px" }}>
                      <div style={S.actionsCell}>
                        {/* View */}
                        <button
                          style={S.actionBtn("#555")}
                          onClick={() => onView?.(u)}
                          title="View"
                          onMouseEnter={(e) =>
                            hoverEnter(e, "rgba(0,0,0,0.06)")
                          }
                          onMouseLeave={hoverLeave}
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit */}
                        {u.role !== "SuperAdmin" &&
                          ((canAdmin && u.id !== currentUserId) ||
                            canSuperAdmin) && (
                            <button
                              style={S.actionBtn("#2563EB")}
                              onClick={() => onEdit?.(u)}
                              title="Edit"
                              onMouseEnter={(e) =>
                                hoverEnter(e, "rgba(37,99,235,0.08)")
                              }
                              onMouseLeave={hoverLeave}
                            >
                              <Pencil size={15} />
                            </button>
                          )}

                        {/* Toggle status */}
                        {u.role !== "SuperAdmin" &&
                          canAdmin &&
                          u.id !== currentUserId && (
                            <button
                              style={S.actionBtn(
                                u.is_active ? "#D97706" : "#16A34A",
                              )}
                              onClick={() => onToggleStatus?.(u)}
                              title={u.is_active ? "Deactivate" : "Activate"}
                              onMouseEnter={(e) =>
                                hoverEnter(
                                  e,
                                  u.is_active
                                    ? "rgba(217,119,6,0.08)"
                                    : "rgba(22,163,74,0.08)",
                                )
                              }
                              onMouseLeave={hoverLeave}
                            >
                              {u.is_active ? (
                                <Ban size={15} />
                              ) : (
                                <CheckCircle size={15} />
                              )}
                            </button>
                          )}

                        {/* Soft delete */}
                        {u.role !== "SuperAdmin" &&
                          canAdmin &&
                          u.id !== currentUserId && (
                            <button
                              style={S.actionBtn("#DC2626")}
                              onClick={() => onDelete?.(u)}
                              title="Delete"
                              onMouseEnter={(e) =>
                                hoverEnter(e, "rgba(220,38,38,0.08)")
                              }
                              onMouseLeave={hoverLeave}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}

                        {/* Hard delete */}
                        {u.role !== "SuperAdmin" &&
                          canSuperAdmin &&
                          u.id !== currentUserId && (
                            <button
                              style={S.actionBtn("#991B1B")}
                              onClick={() => onPermanentDelete?.(u)}
                              title="Permanent Delete"
                              onMouseEnter={(e) =>
                                hoverEnter(e, "rgba(153,27,27,0.1)")
                              }
                              onMouseLeave={hoverLeave}
                            >
                              <AlertTriangle size={15} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div style={S.paginationRow}>
            <span>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={S.pageBtn(page === 1)}
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </button>
              <button
                style={S.pageBtn(page === totalPages)}
                disabled={page === totalPages}
                onClick={() => onPageChange?.(page + 1)}
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
