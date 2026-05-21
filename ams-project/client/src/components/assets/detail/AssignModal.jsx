// client/src/components/assets/detail/AssignModal.jsx

import { useState, useEffect } from "react";
import { C } from "./detailStyles";

// ─── Constants ────────────────────────────────────────────────────────────────
const CONDITIONS = ["New", "Good", "Fair", "Poor", "Damaged", "Scrap"];

const colorMap = {
  New:     { bg: "#DCFCE7", border: "#16A34A", text: "#15803D" },
  Good:    { bg: "#DBEAFE", border: "#2563EB", text: "#1D4ED8" },
  Fair:    { bg: "#FEF9C3", border: "#CA8A04", text: "#A16207" },
  Poor:    { bg: "#FED7AA", border: "#EA580C", text: "#C2410C" },
  Damaged: { bg: "#FEE2E2", border: "#DC2626", text: "#B91C1C" },
  Scrap:   { bg: "#F1F5F9", border: "#94A3B8", text: "#475569" },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: "16px",
};

const modal = {
  background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "480px",
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

const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AssignModal({
  isOpen,
  onClose,
  onConfirm,
  asset,
  employees   = [],
  departments = [],
  loading,
}) {
  const [departmentId, setDepartmentId] = useState("");
  const [employeeId,   setEmployeeId]   = useState("");
  const [assignedAt,   setAssignedAt]   = useState("");
  const [condition,    setCondition]    = useState("");
  const [notes,        setNotes]        = useState("");
  const [errors,       setErrors]       = useState({});
  const [submitting,   setSubmitting]   = useState(false);

  // Pre-select asset's own department + current condition when modal opens
  useEffect(() => {
    if (isOpen) {
      setDepartmentId(asset?.department_id ? String(asset.department_id) : "");
      setEmployeeId("");
      setAssignedAt(localNow());
      setCondition(asset?.condition || "");   // pre-fill with current asset condition
      setNotes("");
      setErrors({});
    }
  }, [isOpen, asset]);

  // Reset employee when department changes
  useEffect(() => {
    setEmployeeId("");
  }, [departmentId]);

  if (!isOpen) return null;

  // Filter employees by selected department
  const filteredEmployees = departmentId
    ? employees.filter((e) => String(e.department_id) === departmentId)
    : employees;

  const validate = () => {
    const e = {};
    if (!departmentId) e.departmentId = "Please select a department.";
    if (!employeeId)   e.employeeId   = "Please select an employee.";
    if (!assignedAt)   e.assignedAt   = "Assignment date & time is required.";
    if (!condition)    e.condition    = "Please select the asset condition.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await onConfirm({
      employeeId: Number(employeeId),
      assignedAt: new Date(assignedAt).toISOString(),
      condition,
      notes,
    });
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={modal}>

        {/* Header */}
        <div style={{
          background: C.primary || "#7F1D1D", padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.9)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                Assign Asset
              </h2>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
                {asset?.asset_name} · {asset?.asset_code}
              </p>
            </div>
          </div>
          <button onClick={handleClose} disabled={submitting}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)",
              cursor: "pointer", padding: "4px", borderRadius: "4px" }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
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
                <option key={d.id} value={String(d.id)}>{d.dept_name}</option>
              ))}
            </select>
            {errors.departmentId && <p style={errStyle}>{errors.departmentId}</p>}
          </div>

          {/* Employee — filtered by department */}
          <div>
            <label style={label}>
              Employee *
              {departmentId && filteredEmployees.length === 0 && !loading && (
                <span style={{ fontWeight: 400, color: "#F59E0B", marginLeft: "8px", textTransform: "none" }}>
                  No active employees in this department
                </span>
              )}
            </label>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setErrors((p) => ({ ...p, employeeId: "" }));
              }}
              disabled={loading || !departmentId}
              style={{
                ...inputStyle,
                borderColor: errors.employeeId ? "#DC2626" : "#E2E8F0",
                background: !departmentId ? "#F8FAFC" : "#fff",
              }}
            >
              <option value="">
                {!departmentId ? "Select a department first" : "— Select Employee —"}
              </option>
              {filteredEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                  {emp.employee_code ? ` (${emp.employee_code})` : ""}
                  {emp.designation ? ` — ${emp.designation}` : ""}
                </option>
              ))}
            </select>
            {errors.employeeId && <p style={errStyle}>{errors.employeeId}</p>}
          </div>

          {/* Assignment Date & Time */}
          <div>
            <label style={label}>Assignment Date & Time *</label>
            <input
              type="datetime-local"
              value={assignedAt}
              onChange={(e) => {
                setAssignedAt(e.target.value);
                setErrors((p) => ({ ...p, assignedAt: "" }));
              }}
              style={{ ...inputStyle, borderColor: errors.assignedAt ? "#DC2626" : "#E2E8F0" }}
            />
            {errors.assignedAt && <p style={errStyle}>{errors.assignedAt}</p>}
          </div>

          {/* Condition at Assignment — pill buttons */}
          <div>
            <label style={label}>Condition at Assignment *</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {CONDITIONS.map((c) => {
                const selected = condition === c;
                const col = colorMap[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCondition(c); setErrors((p) => ({ ...p, condition: "" })); }}
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
            {errors.condition && <p style={errStyle}>{errors.condition}</p>}
          </div>

          {/* Notes */}
          <div>
            <label style={label}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any handover notes..."
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid #F1F5F9",
          display: "flex", gap: "10px", justifyContent: "flex-end",
        }}>
          <button onClick={handleClose} disabled={submitting}
            style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #E2E8F0",
              background: "#fff", color: "#64748B", fontSize: "13px", fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting || loading}
            style={{ padding: "9px 20px", borderRadius: "8px", border: "none",
              background: C.primary || "#7F1D1D", color: "#fff", fontSize: "13px",
              fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting || loading ? 0.7 : 1 }}>
            {submitting ? "Assigning..." : "Assign Asset"}
          </button>
        </div>

      </div>
    </div>
  );
}