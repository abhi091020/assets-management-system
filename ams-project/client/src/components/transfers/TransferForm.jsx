// client/src/components/transfers/TransferForm.jsx
import { useState, useRef, useEffect } from "react";

// ── Searchable Dropdown ───────────────────────────────────────────────────────
function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder,
  renderOption,
  renderSelected,
  filterFn,
  disabled = false,
  error = false,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => String(o.id) === String(value));

  const filtered = query ? options.filter((o) => filterFn(o, query)) : options;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset query when closed
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          width: "100%",
          border: `1.5px solid ${error ? "#EF4444" : open ? "#8B1A1A" : "#E5E7EB"}`,
          borderRadius: "12px",
          padding: "9px 14px",
          fontSize: "13px",
          backgroundColor: disabled ? "#F9FAFB" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          boxShadow: open ? "0 0 0 3px rgba(139,26,26,0.08)" : "none",
          transition: "border-color 0.15s",
          minHeight: "42px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            renderSelected(selected)
          ) : (
            <span style={{ color: "#9CA3AF", fontSize: "13px" }}>
              {placeholder}
            </span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            color: "#9CA3AF",
          }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1.5px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            zIndex: 999,
            overflow: "hidden",
            maxHeight: "280px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search input */}
          <div
            style={{
              padding: "8px",
              borderBottom: "1px solid #F3F4F6",
              flexShrink: 0,
            }}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              style={{
                width: "100%",
                padding: "7px 12px",
                border: "1.5px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#FAFAFA",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#8B1A1A";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5E7EB";
              }}
            />
          </div>
          {/* Options */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#9CA3AF",
                  fontSize: "13px",
                }}
              >
                No results found
              </div>
            ) : (
              filtered.map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    onChange(String(o.id));
                    setOpen(false);
                  }}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontSize: "13px",
                    backgroundColor:
                      String(o.id) === String(value)
                        ? "#FFF5F5"
                        : "transparent",
                    borderLeft:
                      String(o.id) === String(value)
                        ? "3px solid #8B1A1A"
                        : "3px solid transparent",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (String(o.id) !== String(value))
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      String(o.id) === String(value)
                        ? "#FFF5F5"
                        : "transparent";
                  }}
                >
                  {renderOption(o)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Status chip ───────────────────────────────────────────────────────────────
const STATUS_CHIP = {
  Active: { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
  "In Repair": { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  Disposed: { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444" },
  Missing: { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
};

function StatusChip({ status }) {
  const s = STATUS_CHIP[status] || STATUS_CHIP.Missing;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "1px 7px",
        borderRadius: "50px",
        fontSize: "11px",
        fontWeight: "600",
        backgroundColor: s.bg,
        color: s.color,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          backgroundColor: s.dot,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

// ── Transfer Summary Card ─────────────────────────────────────────────────────
function TransferSummary({
  form,
  asset,
  fromLocation,
  fromDept,
  toLocation,
  toDept,
  toEmployee,
  isSameLocation,
}) {
  if (!asset || !toLocation || !toDept) return null;
  return (
    <div
      style={{
        borderRadius: "12px",
        border: isSameLocation ? "1.5px solid #FCA5A5" : "1.5px solid #D1FAE5",
        backgroundColor: isSameLocation ? "#FFF5F5" : "#F0FDF4",
        padding: "14px",
        marginBottom: "4px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: isSameLocation ? "#B91C1C" : "#15803D",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "10px",
        }}
      >
        {isSameLocation ? "⚠ Same Location — No Change" : "✓ Transfer Preview"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* FROM */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: "10px",
            padding: "10px 12px",
            border: "1px solid #E5E7EB",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#EF4444",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "6px",
            }}
          >
            From
          </div>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}
          >
            {fromLocation?.location_name || "—"}
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
            {fromDept?.dept_name || "—"}
          </div>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
            {form.fromEmployeeId
              ? toEmployee
                ? toEmployee.full_name
                : "Assigned"
              : "Unassigned"}
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "20px",
              color: isSameLocation ? "#EF4444" : "#8B1A1A",
            }}
          >
            →
          </div>
        </div>

        {/* TO */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: "10px",
            padding: "10px 12px",
            border: `1px solid ${isSameLocation ? "#FCA5A5" : "#BBF7D0"}`,
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#16A34A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "6px",
            }}
          >
            To
          </div>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}
          >
            {toLocation?.location_name || "—"}
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
            {toDept?.dept_name || "—"}
          </div>
          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
            {toEmployee?.full_name || "Unassigned"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function TransferForm({
  open,
  onClose,
  form,
  formErrors,
  onChange,
  onSubmit,
  isSubmitting,
  assets = [],
  locations = [],
  toDepartments = [],
  employees = [],
  dropdownsLoading,
  isEditing = false,
}) {
  if (!open) return null;

  // Resolve objects for summary card
  const selectedAsset = assets.find(
    (a) => String(a.id) === String(form.assetId),
  );
  const fromLocation = locations.find(
    (l) => String(l.id) === String(form.fromLocationId),
  );
  const fromDept = null; // not in locations list — show from form text
  const toLocation = locations.find(
    (l) => String(l.id) === String(form.toLocationId),
  );
  const toDept = toDepartments.find(
    (d) => String(d.id) === String(form.toDepartmentId),
  );
  const toEmployee = employees.find(
    (e) => String(e.id) === String(form.toEmployeeId),
  );

  const isSameLocation =
    form.fromLocationId &&
    form.toLocationId &&
    form.fromDepartmentId &&
    form.toDepartmentId &&
    String(form.fromLocationId) === String(form.toLocationId) &&
    String(form.fromDepartmentId) === String(form.toDepartmentId);

  const showSummary = selectedAsset && toLocation && toDept;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: "relative",
          marginLeft: "auto",
          width: "100%",
          maxWidth: "520px",
          background: "#fff",
          height: "100%",
          boxShadow: "0 0 40px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "17px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}
            >
              {isEditing ? "Edit Transfer" : "Raise Transfer"}
            </h2>
            <p
              style={{ fontSize: "12px", color: "#9CA3AF", margin: "3px 0 0" }}
            >
              {isEditing
                ? "Update destination details"
                : "Move an asset to a new location"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F9FAFB",
              border: "none",
              borderRadius: "10px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {dropdownsLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "120px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: "3px solid #FEE2E2",
                  borderTopColor: "#8B1A1A",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}
            >
              {/* ── ASSET ── */}
              {!isEditing && (
                <div>
                  <label style={labelStyle}>Asset *</label>
                  <SearchableSelect
                    options={assets}
                    value={form.assetId}
                    onChange={(v) => onChange("assetId", v)}
                    placeholder="Search by code or name..."
                    error={!!formErrors.assetId}
                    filterFn={(a, q) =>
                      a.asset_code?.toLowerCase().includes(q.toLowerCase()) ||
                      a.asset_name?.toLowerCase().includes(q.toLowerCase()) ||
                      a.location_name
                        ?.toLowerCase()
                        .includes(q.toLowerCase()) ||
                      a.dept_name?.toLowerCase().includes(q.toLowerCase())
                    }
                    renderOption={(a) => (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#374151",
                              background: "#F3F4F6",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {a.asset_code}
                          </span>
                          <span
                            style={{
                              fontWeight: "600",
                              fontSize: "13px",
                              color: "#111827",
                            }}
                          >
                            {a.asset_name}
                          </span>
                          <StatusChip status={a.status} />
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6B7280",
                            marginTop: "3px",
                          }}
                        >
                          📍 {a.location_name || "No location"} &rsaquo;{" "}
                          {a.dept_name || "No dept"}
                          {a.employee_name ? ` · 👤 ${a.employee_name}` : ""}
                        </div>
                      </div>
                    )}
                    renderSelected={(a) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#374151",
                            background: "#F3F4F6",
                            padding: "1px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {a.asset_code}
                        </span>
                        <span
                          style={{
                            fontWeight: "600",
                            fontSize: "13px",
                            color: "#111827",
                          }}
                        >
                          {a.asset_name}
                        </span>
                        <StatusChip status={a.status} />
                      </div>
                    )}
                  />
                  {formErrors.assetId && (
                    <p style={errStyle}>{formErrors.assetId}</p>
                  )}
                </div>
              )}

              {/* ── FROM (auto-filled info card) ── */}
              {(form.assetId || isEditing) && (
                <div
                  style={{
                    background: "#FAFAFA",
                    border: "1px solid #F3F4F6",
                    borderRadius: "12px",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "10px",
                    }}
                  >
                    📍 Current Location (From)
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <InfoPill
                      label="Location"
                      value={
                        fromLocation?.location_name ||
                        selectedAsset?.location_name ||
                        form.fromLocationId ||
                        "—"
                      }
                    />
                    <InfoPill
                      label="Department"
                      value={
                        selectedAsset?.dept_name || form.fromDepartmentId || "—"
                      }
                    />
                    <InfoPill
                      label="Assigned To"
                      value={
                        selectedAsset?.employee_name ||
                        (form.fromEmployeeId ? "Assigned" : "Unassigned")
                      }
                    />
                    {isEditing && selectedAsset && (
                      <InfoPill
                        label="Asset"
                        value={`${selectedAsset.asset_code}`}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* ── TO SECTION ── */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  🏁 Transfer Destination
                </div>

                {/* To Location */}
                <div>
                  <label style={labelStyle}>Destination Location *</label>
                  <SearchableSelect
                    options={locations}
                    value={form.toLocationId}
                    onChange={(v) => onChange("toLocationId", v)}
                    placeholder="Search location..."
                    error={!!formErrors.toLocationId}
                    filterFn={(l, q) =>
                      l.location_name
                        ?.toLowerCase()
                        .includes(q.toLowerCase()) ||
                      l.city?.toLowerCase().includes(q.toLowerCase()) ||
                      l.state?.toLowerCase().includes(q.toLowerCase())
                    }
                    renderOption={(l) => (
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "13px",
                            color: "#111827",
                          }}
                        >
                          {l.location_name}
                        </div>
                        {(l.city || l.state) && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6B7280",
                              marginTop: "2px",
                            }}
                          >
                            {[l.city, l.state].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                    renderSelected={(l) => (
                      <span
                        style={{
                          fontWeight: "600",
                          fontSize: "13px",
                          color: "#111827",
                        }}
                      >
                        {l.location_name}
                        {l.city ? (
                          <span style={{ color: "#6B7280", fontWeight: "400" }}>
                            {" "}
                            · {l.city}
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                    )}
                  />
                  {formErrors.toLocationId && (
                    <p style={errStyle}>{formErrors.toLocationId}</p>
                  )}
                </div>

                {/* To Department */}
                <div>
                  <label style={labelStyle}>Destination Department *</label>
                  <SearchableSelect
                    options={toDepartments}
                    value={form.toDepartmentId}
                    onChange={(v) => onChange("toDepartmentId", v)}
                    placeholder={
                      form.toLocationId
                        ? "Search department..."
                        : "Select location first"
                    }
                    disabled={!form.toLocationId}
                    error={!!formErrors.toDepartmentId}
                    filterFn={(d, q) =>
                      d.dept_name?.toLowerCase().includes(q.toLowerCase()) ||
                      d.cost_center?.toLowerCase().includes(q.toLowerCase())
                    }
                    renderOption={(d) => (
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "13px",
                            color: "#111827",
                          }}
                        >
                          {d.dept_name}
                        </div>
                        {d.cost_center && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6B7280",
                              marginTop: "2px",
                            }}
                          >
                            Cost Center: {d.cost_center}
                          </div>
                        )}
                      </div>
                    )}
                    renderSelected={(d) => (
                      <span
                        style={{
                          fontWeight: "600",
                          fontSize: "13px",
                          color: "#111827",
                        }}
                      >
                        {d.dept_name}
                        {d.cost_center ? (
                          <span style={{ color: "#6B7280", fontWeight: "400" }}>
                            {" "}
                            · {d.cost_center}
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                    )}
                  />
                  {formErrors.toDepartmentId && (
                    <p style={errStyle}>{formErrors.toDepartmentId}</p>
                  )}
                </div>

                {/* To Employee */}
                <div>
                  <label style={labelStyle}>
                    Assign To Employee{" "}
                    <span style={{ color: "#9CA3AF", fontWeight: "400" }}>
                      (optional)
                    </span>
                  </label>
                  <SearchableSelect
                    options={employees}
                    value={form.toEmployeeId}
                    onChange={(v) =>
                      onChange("toEmployeeId", v === form.toEmployeeId ? "" : v)
                    }
                    placeholder="Search employee..."
                    filterFn={(e, q) =>
                      e.full_name?.toLowerCase().includes(q.toLowerCase()) ||
                      e.employee_code
                        ?.toLowerCase()
                        .includes(q.toLowerCase()) ||
                      e.designation?.toLowerCase().includes(q.toLowerCase())
                    }
                    renderOption={(e) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            flexShrink: 0,
                            background:
                              "linear-gradient(135deg, #C21807, #8B1A1A)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          {e.full_name
                            ?.split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "13px",
                              color: "#111827",
                            }}
                          >
                            {e.full_name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6B7280" }}>
                            {e.employee_code}{" "}
                            {e.designation ? `· ${e.designation}` : ""}
                          </div>
                        </div>
                      </div>
                    )}
                    renderSelected={(e) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            flexShrink: 0,
                            background:
                              "linear-gradient(135deg, #C21807, #8B1A1A)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: "700",
                          }}
                        >
                          {e.full_name
                            ?.split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <span
                          style={{
                            fontWeight: "600",
                            fontSize: "13px",
                            color: "#111827",
                          }}
                        >
                          {e.full_name}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6B7280" }}>
                          {e.employee_code}
                        </span>
                      </div>
                    )}
                  />
                  {form.toEmployeeId && (
                    <button
                      type="button"
                      onClick={() => onChange("toEmployeeId", "")}
                      style={{
                        fontSize: "11px",
                        color: "#EF4444",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        padding: "2px 0",
                        marginTop: "4px",
                      }}
                    >
                      ✕ Remove employee
                    </button>
                  )}
                </div>
              </div>

              {/* ── Reason ── */}
              <div>
                <label style={labelStyle}>
                  Reason{" "}
                  <span style={{ color: "#9CA3AF", fontWeight: "400" }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => onChange("reason", e.target.value)}
                  rows={2}
                  placeholder="Why is this transfer needed?"
                  style={{
                    width: "100%",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8B1A1A";
                    e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* ── Transfer Summary ── */}
              {showSummary && (
                <TransferSummary
                  form={form}
                  asset={selectedAsset}
                  fromLocation={
                    fromLocation || {
                      location_name: selectedAsset?.location_name,
                    }
                  }
                  fromDept={{ dept_name: selectedAsset?.dept_name }}
                  toLocation={toLocation}
                  toDept={toDept}
                  toEmployee={toEmployee}
                  isSameLocation={isSameLocation}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #F3F4F6",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              background: "#F3F4F6",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || isSameLocation}
            style={{
              padding: "10px 22px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#fff",
              background: isSameLocation
                ? "#D1D5DB"
                : "linear-gradient(135deg, #8B1A1A 0%, #6E1515 100%)",
              border: "none",
              borderRadius: "10px",
              cursor:
                isSubmitting || isSameLocation ? "not-allowed" : "pointer",
              boxShadow: isSameLocation
                ? "none"
                : "0 4px 14px rgba(139,26,26,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            {isSubmitting && (
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            )}
            {isEditing
              ? "Update Transfer"
              : isSameLocation
                ? "Same Location — No Change"
                : "Raise Transfer"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "6px",
};

const errStyle = {
  fontSize: "11px",
  color: "#EF4444",
  marginTop: "4px",
};

function InfoPill({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
        padding: "8px 10px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "#9CA3AF",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "3px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
        {value}
      </div>
    </div>
  );
}
