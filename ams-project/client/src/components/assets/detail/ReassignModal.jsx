// client/src/components/assets/detail/ReassignModal.jsx

import { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const CONDITIONS = ["New", "Good", "Fair", "Poor", "Damaged", "Scrap"];

// ─── Styles ───────────────────────────────────────────────────────────────────
const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: "16px",
};

const modal = {
  background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "500px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden",
};

const inputStyle = {
  width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0",
  borderRadius: "8px", fontSize: "13px", color: "#1E293B",
  background: "#fff", outline: "none", boxSizing: "border-box",
};

const label = {
  fontSize: "12px", fontWeight: 600, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.4px",
  marginBottom: "6px", display: "block",
};

const errStyle = { fontSize: "11px", color: "#DC2626", marginTop: "4px" };

// ─── Helper ───────────────────────────────────────────────────────────────────
const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReassignModal({
  isOpen,
  onClose,
  onConfirm,
  asset,
  employees   = [],
  departments = [],
  loading,
}) {
  const [departmentId,      setDepartmentId]      = useState("");
  const [toEmployeeId,      setToEmployeeId]      = useState("");
  const [handoverAt,        setHandoverAt]        = useState("");
  const [conditionAtReturn, setConditionAtReturn] = useState("");
  const [notes,             setNotes]             = useState("");
  const [errors,            setErrors]            = useState({});
  const [submitting,        setSubmitting]        = useState(false);

  // ── Init state whenever modal opens ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setDepartmentId(asset?.department_id ? String(asset.department_id) : "");
      setToEmployeeId("");
      setHandoverAt(localNow());
      setConditionAtReturn("");
      setNotes("");
      setErrors({});
    }
  }, [isOpen, asset]);

  // ── Reset employee when department changes ────────────────────────────────
  useEffect(() => {
    setToEmployeeId("");
  }, [departmentId]);

  if (!isOpen || !asset) return null;

  // ── Derived ───────────────────────────────────────────────────────────────
  const fromName = asset.employee_name  || "Current Employee";
  const fromCode = asset.employee_code  || "";

  // Employees in selected dept, excluding the currently assigned employee
  const filteredEmployees = departmentId
    ? employees.filter(
        (e) =>
          String(e.department_id) === departmentId &&
          e.id !== asset.assigned_employee_id,
      )
    : employees.filter((e) => e.id !== asset.assigned_employee_id);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!departmentId) e.departmentId = "Please select a department.";
    if (!toEmployeeId) e.toEmployeeId = "Please select the new employee.";
    if (!handoverAt)   e.handoverAt   = "Handover date & time is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit → pass to parent for ConfirmModal ──────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await onConfirm({
      toEmployeeId:    Number(toEmployeeId),
      assignedAt:      new Date(handoverAt).toISOString(),
      conditionAtReturn,
      notes,
    });
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  // ── Pill button colour map ────────────────────────────────────────────────
  const colorMap = {
    New:     { bg: "#DCFCE7", border: "#16A34A", text: "#15803D" },
    Good:    { bg: "#DBEAFE", border: "#2563EB", text: "#1D4ED8" },
    Fair:    { bg: "#FEF9C3", border: "#CA8A04", text: "#A16207" },
    Poor:    { bg: "#FED7AA", border: "#EA580C", text: "#C2410C" },
    Damaged: { bg: "#FEE2E2", border: "#DC2626", text: "#B91C1C" },
    Scrap:   { bg: "#F1F5F9", border: "#94A3B8", text: "#475569" },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={modal}>

        {/* ── Header — blue for reassign ── */}
        <div style={{
          background: "#1D4ED8", padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.9)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <div>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                Reassign Asset
              </h2>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
                {asset.asset_name} · {asset.asset_code}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)",
              cursor: "pointer", padding: "4px", borderRadius: "4px" }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Info Banner — orange/amber, who it's coming from ── */}
        <div style={{
          background: "#FFF7ED", borderBottom: "1px solid #FED7AA",
          padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px",
        }}>
          <svg width="16" height="16" fill="none" stroke="#EA580C" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span style={{ fontSize: "13px", color: "#9A3412" }}>
            Reassigning from&nbsp;
            <strong>{fromName}</strong>
            {fromCode && (
              <span style={{ fontSize: "11px", color: "#C2410C", marginLeft: "6px" }}>
                ({fromCode})
              </span>
            )}
          </span>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Department */}
          <div>
            <label style={label}>Department *</label>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setErrors((p) => ({ ...p, departmentId: "" }));
              }}
              disabled={loading}
              style={{ ...inputStyle, borderColor: errors.departmentId ? "#DC2626" : "#E2E8F0" }}
            >
              <option value="">{loading ? "Loading..." : "— Select Department —"}</option>
              {departments.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.dept_name}
                </option>
              ))}
            </select>
            {errors.departmentId && <p style={errStyle}>{errors.departmentId}</p>}
          </div>

          {/* New Employee — filtered by department, current excluded */}
          <div>
            <label style={label}>
              Reassign To *
              {departmentId && filteredEmployees.length === 0 && !loading && (
                <span style={{ fontWeight: 400, color: "#F59E0B", marginLeft: "8px", textTransform: "none" }}>
                  No available employees in this department
                </span>
              )}
            </label>
            <select
              value={toEmployeeId}
              onChange={(e) => {
                setToEmployeeId(e.target.value);
                setErrors((p) => ({ ...p, toEmployeeId: "" }));
              }}
              disabled={loading || !departmentId}
              style={{
                ...inputStyle,
                borderColor: errors.toEmployeeId ? "#DC2626" : "#E2E8F0",
                background: !departmentId ? "#F8FAFC" : "#fff",
              }}
            >
              <option value="">
                {!departmentId ? "Select a department first" : "— Select New Employee —"}
              </option>
              {filteredEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                  {emp.employee_code ? ` (${emp.employee_code})` : ""}
                  {emp.designation ? ` — ${emp.designation}` : ""}
                </option>
              ))}
            </select>
            {errors.toEmployeeId && <p style={errStyle}>{errors.toEmployeeId}</p>}
          </div>

          {/* Handover Date & Time */}
          <div>
            <label style={label}>Handover Date & Time *</label>
            <input
              type="datetime-local"
              value={handoverAt}
              onChange={(e) => {
                setHandoverAt(e.target.value);
                setErrors((p) => ({ ...p, handoverAt: "" }));
              }}
              style={{ ...inputStyle, borderColor: errors.handoverAt ? "#DC2626" : "#E2E8F0" }}
            />
            {errors.handoverAt && <p style={errStyle}>{errors.handoverAt}</p>}
          </div>

          {/* Condition at Handover — pill buttons */}
          <div>
            <label style={label}>Condition at Handover (optional)</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {CONDITIONS.map((c) => {
                const selected = conditionAtReturn === c;
                const col = colorMap[c] || { bg: "#F1F5F9", border: "#CBD5E1", text: "#475569" };
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConditionAtReturn((prev) => (prev === c ? "" : c))}
                    style={{
                      padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                      border: `2px solid ${selected ? col.border : "#E2E8F0"}`,
                      background: selected ? col.bg : "#fff",
                      color: selected ? col.text : "#94A3B8",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "5px" }}>
              Leave unselected to keep current condition ({asset.condition || "Unknown"})
            </p>
          </div>

          {/* Notes */}
          <div>
            <label style={label}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Handover notes or remarks..."
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid #F1F5F9",
          display: "flex", gap: "10px", justifyContent: "flex-end",
        }}>
          <button
            onClick={handleClose}
            disabled={submitting}
            style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #E2E8F0",
              background: "#fff", color: "#64748B", fontSize: "13px", fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            style={{ padding: "9px 20px", borderRadius: "8px", border: "none",
              background: "#1D4ED8", color: "#fff", fontSize: "13px", fontWeight: 600,
              cursor: submitting || loading ? "not-allowed" : "pointer",
              opacity: submitting || loading ? 0.7 : 1 }}
          >
            {submitting ? "Reassigning..." : "Confirm Reassign"}
          </button>
        </div>

      </div>
    </div>
  );
}