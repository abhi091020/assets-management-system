// client/src/components/assets/detail/CollectModal.jsx

import { useState, useEffect } from "react";
import { C } from "./detailStyles";
import useAuthStore from "../../../store/authStore";

// ─── Constants ────────────────────────────────────────────────────────────────
const CONDITIONS = ["New", "Good", "Fair", "Poor", "Damaged", "Scrap"];

const REASONS = [
  "Routine Return",
  "Employee Resignation",
  "Role Change / Department Transfer",
  "Project Ended",
  "Sent for Repair",
  "Lost / Stolen",
  "Other",
];

// ─── Styles (mirrors AssignModal pattern) ────────────────────────────────────
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

const readonlyStyle = {
  ...inputStyle,
  background: "#F8FAFC", color: "#64748B", cursor: "default",
};

const label = {
  fontSize: "12px", fontWeight: 600, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.4px",
  marginBottom: "6px", display: "block",
};

const errStyle = { fontSize: "11px", color: "#DC2626", marginTop: "4px" };

// ─── Helper: local datetime string for <input type="datetime-local"> ─────────
const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CollectModal({ isOpen, onClose, onConfirm, asset }) {
  const { user } = useAuthStore();

  // ── Form state ──────────────────────────────────────────────────────────
  const [collectedAt,       setCollectedAt]       = useState("");
  const [conditionAtReturn, setConditionAtReturn] = useState("");
  const [reason,            setReason]            = useState("");
  const [notes,             setNotes]             = useState("");
  const [errors,            setErrors]            = useState({});
  const [submitting,        setSubmitting]        = useState(false);

  // Auto-set collection time to now whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCollectedAt(localNow());
      setConditionAtReturn("");
      setReason("");
      setNotes("");
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Derived ─────────────────────────────────────────────────────────────
  const assignedEmployeeName = asset?.employee_name  || "—";
  const assignedEmployeeCode = asset?.employee_code  || "";
  const collectorName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    user?.display_name ||
    user?.displayName ||
    user?.email ||
    "—";

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!collectedAt)       e.collectedAt       = "Collection date & time is required.";
    if (!conditionAtReturn) e.conditionAtReturn = "Please select the condition at return.";
    if (!reason)            e.reason            = "Please select a reason for collection.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await onConfirm({
      conditionAtReturn,
      reason,
      collectedAt: new Date(collectedAt).toISOString(),
      notes,
    });
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={modal}>

        {/* ── Header ── */}
        <div style={{
          background: "#B91C1C", padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.9)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                Collect Asset
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

        {/* ── Info Banner — who this asset is being collected from ── */}
        <div style={{
          background: "#FEF2F2", borderBottom: "1px solid #FECACA",
          padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px",
        }}>
          <svg width="16" height="16" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span style={{ fontSize: "13px", color: "#991B1B" }}>
            Collecting from&nbsp;
            <strong>{assignedEmployeeName}</strong>
            {assignedEmployeeCode && (
              <span style={{ fontSize: "11px", color: "#B91C1C", marginLeft: "6px" }}>
                ({assignedEmployeeCode})
              </span>
            )}
          </span>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Row: Collected By (read-only) + Collection Date & Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={label}>Collected By</label>
              <input
                type="text"
                value={collectorName}
                readOnly
                style={readonlyStyle}
              />
              <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Auto-filled from your login
              </p>
            </div>

            <div>
              <label style={label}>Collection Date & Time *</label>
              <input
                type="datetime-local"
                value={collectedAt}
                onChange={(e) => {
                  setCollectedAt(e.target.value);
                  setErrors((p) => ({ ...p, collectedAt: "" }));
                }}
                style={{ ...inputStyle, borderColor: errors.collectedAt ? "#DC2626" : "#E2E8F0" }}
              />
              {errors.collectedAt && <p style={errStyle}>{errors.collectedAt}</p>}
            </div>
          </div>

          {/* Condition at Return */}
          <div>
            <label style={label}>Condition at Return *</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {CONDITIONS.map((c) => {
                const selected = conditionAtReturn === c;
                const colorMap = {
                  New:     { bg: "#DCFCE7", border: "#16A34A", text: "#15803D" },
                  Good:    { bg: "#DBEAFE", border: "#2563EB", text: "#1D4ED8" },
                  Fair:    { bg: "#FEF9C3", border: "#CA8A04", text: "#A16207" },
                  Poor:    { bg: "#FED7AA", border: "#EA580C", text: "#C2410C" },
                  Damaged: { bg: "#FEE2E2", border: "#DC2626", text: "#B91C1C" },
                  Scrap:   { bg: "#F1F5F9", border: "#94A3B8", text: "#475569" },
                };
                const col = colorMap[c] || { bg: "#F1F5F9", border: "#CBD5E1", text: "#475569" };
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setConditionAtReturn(c); setErrors((p) => ({ ...p, conditionAtReturn: "" })); }}
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
            {errors.conditionAtReturn && <p style={errStyle}>{errors.conditionAtReturn}</p>}
          </div>

          {/* Reason for Collection */}
          <div>
            <label style={label}>Reason for Collection *</label>
            <select
              value={reason}
              onChange={(e) => { setReason(e.target.value); setErrors((p) => ({ ...p, reason: "" })); }}
              style={{ ...inputStyle, borderColor: errors.reason ? "#DC2626" : "#E2E8F0" }}
            >
              <option value="">— Select Reason —</option>
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.reason && <p style={errStyle}>{errors.reason}</p>}
          </div>

          {/* Notes */}
          <div>
            <label style={label}>Notes / Remarks (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Screen cracked on bottom-left, charger not returned..."
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* ── Footer ── */}
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
          <button onClick={handleSubmit} disabled={submitting}
            style={{ padding: "9px 20px", borderRadius: "8px", border: "none",
              background: "#B91C1C", color: "#fff", fontSize: "13px", fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Collecting..." : "Confirm Collection"}
          </button>
        </div>

      </div>
    </div>
  );
}