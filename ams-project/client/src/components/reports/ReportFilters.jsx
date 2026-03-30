// src/components/reports/ReportFilters.jsx
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import DatePicker from "../common/DatePicker";

const C = {
  primary: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
};

const styles = {
  card: {
    background: C.white,
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "18px 20px",
    border: "1px solid rgba(0,0,0,0.04)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
  runBtn: (loading) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: loading
      ? "linear-gradient(135deg, #C0392B 0%, #922B21 100%)"
      : "linear-gradient(135deg, #8B1A1A 0%, #6E1515 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "50px",
    padding: "9px 22px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.85 : 1,
    boxShadow: "0 4px 14px rgba(139,26,26,0.35)",
    transition: "all 0.2s",
  }),
  filtersGrid: { display: "flex", flexWrap: "wrap", gap: "12px" },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "160px",
    flex: "1 1 160px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  select: {
    padding: "9px 14px",
    border: "1.5px solid #EBEBEB",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#333",
    background: "#FAFAFA",
    outline: "none",
    cursor: "pointer",
  },
  input: {
    padding: "9px 14px",
    border: "1.5px solid #EBEBEB",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#333",
    background: "#FAFAFA",
    outline: "none",
  },
};

const STATUS_OPTIONS = {
  default: ["Active", "In Repair", "Disposed", "Missing"],
  transfers: ["Pending", "Approved", "Rejected", "Cancelled"],
  disposals: ["Pending", "Approved", "Rejected", "Cancelled"],
  verification: ["Open", "Closed", "Cancelled"],
};
const DISPOSAL_METHODS = ["Sold", "Scrapped", "Donated", "WriteOff"];

export default function ReportFilters({
  activeReport,
  filters,
  onFilterChange,
  onRun,
  loading,
}) {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const f = activeReport?.filters || [];

  useEffect(() => {
    if (!activeReport) return;
    if (f.includes("categoryId"))
      axiosInstance.get("/categories?limit=200").then((r) =>
        setCategories(
          (r.data?.data?.data || []).map((c) => ({
            value: c.id,
            label: c.category_name,
          })),
        ),
      );
    if (f.includes("locationId"))
      axiosInstance.get("/locations?limit=200").then((r) =>
        setLocations(
          (r.data?.data?.data || []).map((l) => ({
            value: l.id,
            label: l.location_name,
          })),
        ),
      );
    if (f.includes("departmentId"))
      axiosInstance.get("/departments?limit=200").then((r) =>
        setDepartments(
          (r.data?.data?.data || []).map((d) => ({
            value: d.id,
            label: d.dept_name,
          })),
        ),
      );
    if (f.includes("employeeId"))
      axiosInstance.get("/employees?limit=200").then((r) =>
        setEmployees(
          (r.data?.data?.data || []).map((e) => ({
            value: e.id,
            label: e.full_name,
          })),
        ),
      );
  }, [activeReport]);

  if (!activeReport) return null;

  const statusOpts = STATUS_OPTIONS[activeReport.key] || STATUS_OPTIONS.default;
  const focusStyle = (e) => {
    e.target.style.borderColor = "#8B1A1A";
    e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = "#EBEBEB";
    e.target.style.boxShadow = "none";
  };

  const SelectField = ({ label, value, onChange, options }) => (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select
        style={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={focusStyle}
        onBlur={blurStyle}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </div>
  );

  const InputField = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
  }) => (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={focusStyle}
        onBlur={blurStyle}
      />
    </div>
  );

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <p style={styles.sectionTitle}>Filters</p>
        <button
          style={styles.runBtn(loading)}
          onClick={() => onRun(1)}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(139,26,26,0.45)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(139,26,26,0.35)";
          }}
        >
          {loading ? "⏳ Running..." : "▶ Run Report"}
        </button>
      </div>
      <div style={styles.filtersGrid}>
        {f.includes("status") && (
          <SelectField
            label="Status"
            value={filters.status}
            onChange={(v) => onFilterChange("status", v)}
            options={statusOpts}
          />
        )}
        {f.includes("categoryId") && (
          <SelectField
            label="Category"
            value={filters.categoryId}
            onChange={(v) => onFilterChange("categoryId", v)}
            options={categories}
          />
        )}
        {f.includes("locationId") && (
          <SelectField
            label="Location"
            value={filters.locationId}
            onChange={(v) => onFilterChange("locationId", v)}
            options={locations}
          />
        )}
        {f.includes("departmentId") && (
          <SelectField
            label="Department"
            value={filters.departmentId}
            onChange={(v) => onFilterChange("departmentId", v)}
            options={departments}
          />
        )}
        {f.includes("employeeId") && (
          <SelectField
            label="Employee"
            value={filters.employeeId}
            onChange={(v) => onFilterChange("employeeId", v)}
            options={employees}
          />
        )}
        {f.includes("method") && (
          <SelectField
            label="Method"
            value={filters.method}
            onChange={(v) => onFilterChange("method", v)}
            options={DISPOSAL_METHODS}
          />
        )}

        {/* Custom DatePicker — stays open while navigating months/years */}
        {f.includes("dateFrom") && (
          <DatePicker
            label="Date From"
            value={filters.dateFrom}
            onChange={(v) => onFilterChange("dateFrom", v)}
            placeholder="Select start date"
          />
        )}
        {f.includes("dateTo") && (
          <DatePicker
            label="Date To"
            value={filters.dateTo}
            onChange={(v) => onFilterChange("dateTo", v)}
            placeholder="Select end date"
          />
        )}

        {f.includes("ageMin") && (
          <InputField
            label="Min Age (yrs)"
            type="number"
            value={filters.ageMin}
            onChange={(v) => onFilterChange("ageMin", v)}
            placeholder="e.g. 1"
          />
        )}
        {f.includes("ageMax") && (
          <InputField
            label="Max Age (yrs)"
            type="number"
            value={filters.ageMax}
            onChange={(v) => onFilterChange("ageMax", v)}
            placeholder="e.g. 10"
          />
        )}
      </div>
    </div>
  );
}
