// client/src/components/permissions/PermissionMatrix.jsx
import { Search, Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import { useState } from "react";

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

const ACTIONS = [
  { key: "can_view", label: "View", color: "#6366F1" },
  { key: "can_add", label: "Add", color: "#16A34A" },
  { key: "can_edit", label: "Edit", color: "#2563EB" },
  { key: "can_delete", label: "Delete", color: "#DC2626" },
  { key: "can_approve", label: "Approve", color: "#D97706" },
  { key: "can_export", label: "Export", color: "#0891B2" },
];

// ─── iOS-style toggle switch ──────────────────────────────────────────────────
function Toggle({ actionKey, label, color, value, onChange, saving }) {
  const on = !!value;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        minWidth: "48px",
      }}
    >
      <button
        onClick={() => onChange(actionKey, on)}
        disabled={saving}
        title={`${on ? "Disable" : "Enable"} ${label}`}
        style={{
          width: "40px",
          height: "22px",
          borderRadius: "50px",
          border: "none",
          padding: "2px",
          cursor: saving ? "not-allowed" : "pointer",
          backgroundColor: on ? color : "#D1D5DB",
          transition: "background-color 0.25s",
          position: "relative",
          flexShrink: 0,
          outline: "none",
          boxShadow: on ? `0 0 0 3px ${color}22` : "none",
        }}
      >
        <span
          style={{
            display: "block",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            transform: on ? "translateX(18px)" : "translateX(0)",
            transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </button>
      <span
        style={{
          fontSize: "10px",
          fontWeight: "600",
          color: on ? color : "#9CA3AF",
          letterSpacing: "0.02em",
          transition: "color 0.2s",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function PermissionMatrix({
  roles = [],
  modules = [],
  permissions = [],
  loading,
  saving,
  onToggle,
  onAddRole,
  onEditRole,
  onDeleteRole,
  onAddModule,
  onEditModule,
  onDeleteModule,
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  function getVal(roleId, moduleId, action) {
    const row = permissions.find(
      (p) => p.role_id === roleId && p.module_id === moduleId,
    );
    return row ? !!row[action] : false;
  }

  const filteredModules = modules.filter(
    (m) =>
      !search || m.display_name.toLowerCase().includes(search.toLowerCase()),
  );
  const visibleRoles =
    roleFilter === "all"
      ? roles
      : roles.filter((r) => String(r.id) === roleFilter);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "4px",
              height: "32px",
              borderRadius: "4px",
              background: "linear-gradient(180deg,#8B1A1A,#C0392B)",
              flexShrink: 0,
            }}
          />
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: C.primary,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Role Permissions
            </h1>
            <p
              style={{ fontSize: "13px", color: C.textLight, marginTop: "4px" }}
            >
              Control what each role can access across all modules
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onAddModule}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "10px 18px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              border: `1.5px solid rgba(139,26,26,0.25)`,
              background: C.white,
              color: C.primary,
              boxShadow: "0 2px 8px rgba(139,26,26,0.08)",
            }}
          >
            <Plus size={14} strokeWidth={2.5} /> Add Module
          </button>
          <button
            onClick={onAddRole}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "10px 18px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              border: "none",
              background: "linear-gradient(135deg,#8B1A1A,#6E1515)",
              color: C.white,
              boxShadow: "0 4px 14px rgba(139,26,26,0.35)",
            }}
          >
            <Plus size={14} strokeWidth={2.5} /> Add Role
          </button>
        </div>
      </div>

      {/* ── Card ── */}
      <div
        style={{
          backgroundColor: C.white,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          padding: "20px",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              placeholder="Search modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 44px 10px 18px",
                border: `1.5px solid ${C.border}`,
                borderRadius: "50px",
                fontSize: "14px",
                color: C.text,
                outline: "none",
                backgroundColor: "#FAFAFA",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = C.primary;
                e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
                e.target.style.boxShadow = "none";
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: C.textLight,
                pointerEvents: "none",
              }}
            >
              <Search size={17} />
            </span>
          </div>
          <div
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "10px 36px 10px 18px",
                border: `1.5px solid ${C.border}`,
                borderRadius: "50px",
                fontSize: "14px",
                color: C.text,
                backgroundColor: "#FAFAFA",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.display_name}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: "12px",
                pointerEvents: "none",
                color: C.textLight,
              }}
            >
              <ChevronDown size={15} />
            </span>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "calc(100vh - 280px)",
            borderRadius: "12px",
            border: `1px solid ${C.border}`,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    backgroundColor: C.headerBg,
                    color: C.white,
                    fontWeight: "600",
                    fontSize: "13px",
                    padding: "14px 20px",
                    textAlign: "left",
                    position: "sticky",
                    top: 0,
                    left: 0,
                    zIndex: 3,
                    minWidth: "200px",
                    letterSpacing: "0.04em",
                  }}
                >
                  Module
                </th>
                {visibleRoles.map((role) => (
                  <th
                    key={role.id}
                    style={{
                      backgroundColor: C.headerBg,
                      color: C.white,
                      fontWeight: "600",
                      fontSize: "13px",
                      padding: "12px 16px",
                      textAlign: "center",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      minWidth: "360px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: "700" }}>
                        {role.display_name}
                      </span>
                      {/* column sub-labels */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        {ACTIONS.map((a) => (
                          <span
                            key={a.key}
                            style={{
                              fontSize: "10px",
                              fontWeight: "600",
                              opacity: 0.7,
                              minWidth: "48px",
                              textAlign: "center",
                            }}
                          >
                            {a.label}
                          </span>
                        ))}
                      </div>
                      {/* role edit / delete */}
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => onEditRole(role)}
                          style={{
                            background: "rgba(255,255,255,0.15)",
                            border: "none",
                            cursor: "pointer",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            color: "rgba(255,255,255,0.9)",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            fontSize: "11px",
                          }}
                        >
                          <Pencil size={10} /> Edit
                        </button>
                        {!role.is_system && (
                          <button
                            onClick={() => onDeleteRole(role)}
                            style={{
                              background: "rgba(220,38,38,0.3)",
                              border: "none",
                              cursor: "pointer",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              color: "rgba(255,255,255,0.9)",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              fontSize: "11px",
                            }}
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={visibleRoles.length + 1}
                    style={{
                      textAlign: "center",
                      color: C.textLight,
                      padding: "48px",
                      fontSize: "14px",
                    }}
                  >
                    Loading permissions...
                  </td>
                </tr>
              ) : filteredModules.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleRoles.length + 1}
                    style={{
                      textAlign: "center",
                      color: C.textLight,
                      padding: "48px",
                      fontSize: "14px",
                    }}
                  >
                    No modules found.
                  </td>
                </tr>
              ) : (
                filteredModules.map((mod, idx) => (
                  <tr
                    key={mod.id}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 1 ? C.rowZebra : C.white)
                    }
                  >
                    {/* Module name — sticky left */}
                    <td
                      style={{
                        padding: "14px 20px",
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
                        borderRight: `2px solid ${C.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "13px",
                              color: C.primary,
                              textTransform: "uppercase",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {mod.display_name}
                          </span>
                          {mod.is_system && (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "1px 7px",
                                borderRadius: "50px",
                                fontSize: "10px",
                                fontWeight: "600",
                                marginLeft: "6px",
                                backgroundColor: "#F1F5F9",
                                color: "#64748B",
                              }}
                            >
                              system
                            </span>
                          )}
                          <div
                            style={{
                              fontSize: "11px",
                              color: C.textLight,
                              marginTop: "2px",
                            }}
                          >
                            {mod.module_key}
                          </div>
                        </div>
                        <div
                          style={{ display: "flex", gap: "2px", flexShrink: 0 }}
                        >
                          <button
                            onClick={() => onEditModule(mod)}
                            title="Edit module"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "5px",
                              borderRadius: "7px",
                              color: "#2563EB",
                            }}
                          >
                            <Pencil size={13} />
                          </button>
                          {!mod.is_system && (
                            <button
                              onClick={() => onDeleteModule(mod)}
                              title="Delete module"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "5px",
                                borderRadius: "7px",
                                color: "#DC2626",
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Toggle cells */}
                    {visibleRoles.map((role) => (
                      <td
                        key={role.id}
                        style={{
                          padding: "14px 16px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                            alignItems: "flex-start",
                          }}
                        >
                          {ACTIONS.map((action) => (
                            <Toggle
                              key={action.key}
                              actionKey={action.key}
                              label={action.label}
                              color={action.color}
                              value={getVal(role.id, mod.id, action.key)}
                              saving={saving}
                              onChange={(actionKey, currentVal) =>
                                onToggle(role.id, mod.id, actionKey, currentVal)
                              }
                            />
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer legend */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px", color: C.textLight }}>
              Legend:
            </span>
            {ACTIONS.map((a) => (
              <span
                key={a.key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "11px",
                  color: "#64748B",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: a.color,
                    display: "inline-block",
                  }}
                />
                {a.label}
              </span>
            ))}
          </div>
          <span style={{ fontSize: "11px", color: C.textLight }}>
            Changes are saved automatically
          </span>
        </div>
      </div>
    </div>
  );
}
