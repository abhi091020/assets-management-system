// client/src/components/assets/AssetForm.jsx

import { useState, useMemo } from "react";
import DatePicker from "../common/DatePicker";

const CONDITIONS = ["New", "Good", "Fair", "Poor", "Scrap"];

const EDIT_STATUSES = ["Active", "InRepair", "InTransit", "Missing"];
const STATUS_LABELS = {
  Active: "Active",
  InRepair: "In Repair",
  InTransit: "In Transit",
  Missing: "Missing",
};

const ASSET_TYPES = [
  "IT Equipment",
  "Furniture",
  "Vehicle",
  "Office Equipment",
  "Machinery",
  "Electrical Equipment",
  "Building & Infrastructure",
  "Tools & Equipment",
  "Medical Equipment",
  "Other",
];

const DEPRECIATION_METHODS = [
  { value: "SLM", label: "SLM — Straight Line Method" },
  { value: "WDV", label: "WDV — Written Down Value" },
];

// ── Depth label for each cascade level ───────────────────────────────────────
const LEVEL_LABELS = ["Category", "Sub-Category", "Sub-Sub-Category", "Level 4", "Level 5"];

function dpTrigger(error, touched, value) {
  return {
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    backgroundColor: error ? "rgba(239,68,68,0.05)" : "#F9FAFB",
    borderColor: error ? "#F87171" : touched && value ? "#4ADE80" : "#E5E7EB",
    boxShadow: "none",
    color: value ? "#333" : "#9CA3AF",
  };
}

const dpContainer = { minWidth: 0, flex: "1 1 auto" };

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      <div
        className={`transition-all duration-200 overflow-hidden ${
          error ? "max-h-5 mt-1" : "max-h-0"
        }`}
      >
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            />
          </svg>
          {error}
        </p>
      </div>
    </div>
  );
}

const base =
  "w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-50";
const normal = `${base} border-gray-200 focus:ring-red-500/20 focus:border-red-400`;
const errCls = `${base} border-red-400 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500`;
const validCls = `${base} border-green-400 focus:ring-green-500/20 focus:border-green-500`;

function inputClass(error, touched, value) {
  if (error) return errCls;
  if (touched && value !== "" && value != null && !error) return validCls;
  return normal;
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {children}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function CollapsibleSection({ title, isOpen, onToggle, hasError, children }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors
          ${isOpen ? "bg-red-50 border-b border-red-100" : "bg-gray-50 hover:bg-gray-100"}`}
      >
        <div className="flex items-center gap-2">
          {hasError && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
          <span className={`text-xs font-semibold uppercase tracking-wider ${isOpen ? "text-red-700" : "text-gray-500"}`}>
            {title}
          </span>
        </div>
        <span className={`flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold transition-colors ${
          isOpen ? "border-red-300 text-red-600 bg-white" : "border-gray-300 text-gray-500 bg-white"
        }`}>
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-4 py-4 space-y-4 bg-white">{children}</div>
      </div>
    </div>
  );
}

// ── CategoryCascade ───────────────────────────────────────────────────────────
// Renders N dynamic dropdowns (Category → Sub-Category → Sub-Sub-Category …)
// based on the real DB flat list.  Only levels that have actual children in the
// DB are shown — no dummy placeholders.
//
// Props:
//   categories   – flat array from /categories/active  (each has id, category_name, parent_category_id)
//   path         – array of selected IDs from root → leaf  e.g. [1, 2, 3, 4]
//   onChange     – (newPath: number[]) => void
//   error        – formErrors.category_id string (shown on first dropdown)
//   disabled     – bool (while loading)
// ─────────────────────────────────────────────────────────────────────────────
function CategoryCascade({ categories, path, onChange, error, disabled }) {
  // Build a map: parentId → sorted children array
  // Root-level categories have parent_category_id = null  → key "root"
  const childrenOf = useMemo(() => {
    const map = {};
    [...categories]
      .sort((a, b) => a.category_name.localeCompare(b.category_name))
      .forEach((c) => {
        const key = c.parent_category_id ?? "root";
        if (!map[key]) map[key] = [];
        map[key].push(c);
      });
    return map;
  }, [categories]);

  // Derive the list of levels to render:
  // Walk from root, adding a dropdown for each level that has options.
  // Stop adding dropdowns once the user hasn't selected anything at the current level.
  const levels = useMemo(() => {
    const result = [];
    let parentKey = "root";

    for (let depth = 0; ; depth++) {
      const options = childrenOf[parentKey] || [];
      if (options.length === 0) break; // no children at this depth → stop

      const selectedId = path[depth] ?? "";
      result.push({ depth, options, selectedId });

      if (!selectedId) break; // user hasn't picked here yet → don't show next level
      parentKey = selectedId; // dive deeper
    }

    return result;
  }, [childrenOf, path]);

  // Called when user picks a value at a given depth
  function handleSelect(depth, rawValue) {
    // Keep path up to (but not including) this depth, then append new selection
    const newPath = path.slice(0, depth);
    if (rawValue) newPath.push(Number(rawValue));
    onChange(newPath);
  }

  if (categories.length === 0 && !disabled) return null;

  return (
    <div className="space-y-3">
      {levels.map(({ depth, options, selectedId }) => {
        const isFirst = depth === 0;
        const label = LEVEL_LABELS[depth] ?? `Level ${depth + 1}`;
        // Show the category_id error only on the first (root) dropdown
        const fieldError = isFirst ? error : undefined;

        return (
          <div key={depth} className="relative">
            {/* Indentation guide for sub-levels */}
            {depth > 0 && (
              <div
                className="absolute left-0 top-0 bottom-0 flex items-center"
                style={{ left: `${depth * 12}px` }}
              >
                <div className="w-px h-full bg-gray-200" />
              </div>
            )}

            <div style={{ paddingLeft: depth > 0 ? `${depth * 12 + 8}px` : 0 }}>
              <Field label={label} required={isFirst} error={fieldError}>
                <div className="relative">
                  {/* Depth badge */}
                  {depth > 0 && (
                    <span className="absolute right-9 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-300 uppercase tracking-wider pointer-events-none select-none">
                      L{depth + 1}
                    </span>
                  )}
                  <select
                    value={selectedId}
                    onChange={(e) => handleSelect(depth, e.target.value)}
                    disabled={disabled}
                    className={`${inputClass(fieldError, true, selectedId)} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {disabled
                        ? "Loading…"
                        : isFirst
                          ? "— Select Category —"
                          : `— Select ${label} —`}
                    </option>
                    {options.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
            </div>
          </div>
        );
      })}

      {/* Empty state — shown only while loading and no categories yet */}
      {disabled && levels.length === 0 && (
        <Field label="Category" required error={error}>
          <select disabled className={`${normal} opacity-50 cursor-not-allowed`}>
            <option>Loading…</option>
          </select>
        </Field>
      )}

      {/* Breadcrumb pill — shows full selected path below the dropdowns */}
      {path.length > 1 && !disabled && (() => {
        const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
        const crumbs = path.map((id) => catMap[id]?.category_name).filter(Boolean);
        return (
          <div className="flex items-center flex-wrap gap-1 pt-0.5">
            {crumbs.map((name, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-[11px] bg-red-50 text-red-700 border border-red-100 rounded-full px-2 py-0.5 font-medium">
                  {name}
                </span>
                {i < crumbs.length - 1 && (
                  <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AssetForm({
  open,
  onClose,
  isEditing,
  editingAsset,
  form,
  formErrors,
  onFormChange,
  onSubmit,
  isSubmitting,
  // ── Category cascade ──────────────────────────────────────────────────────
  categoryPath,
  onCategoryChange,
  // ─────────────────────────────────────────────────────────────────────────
  locations = [],
  filteredDepartments = [],
  categories = [],
  employees = [],
  dropdownsLoading = false,
}) {
  const [touched, setTouched] = useState({});

  const [openSections, setOpenSections] = useState({
    location: false,
    purchase: false,
    physical: false,
    insurance: false,
    amc: false,
  });

  if (!open) return null;

  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    onFormChange(name, value);
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  function handleDateChange(name, value) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    onFormChange(name, value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const locationErr = !!(formErrors.location_id || formErrors.department_id);
    const purchaseErr = !!(formErrors.scrap_value);
    const physicalErr = !!(formErrors.serial_number || formErrors.condition || formErrors.status);
    const insuranceErr = !!(formErrors.insurance_policy_no || formErrors.insurance_expiry_date);
    if (locationErr || purchaseErr || physicalErr || insuranceErr) {
      setOpenSections({
        location: locationErr,
        purchase: purchaseErr,
        physical: physicalErr,
        insurance: insuranceErr,
        amc: false,
      });
    }
    onSubmit();
  }

  const locationHasError = !!(formErrors.location_id || formErrors.department_id);
  const purchaseHasError = !!(formErrors.scrap_value);
  const physicalHasError = !!(formErrors.serial_number || formErrors.condition || formErrors.status);
  const insuranceHasError = !!(formErrors.insurance_policy_no || formErrors.insurance_expiry_date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? "Edit Asset" : "Add New Asset"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEditing && editingAsset
                ? `Editing — ${editingAsset.asset_code}`
                : "Fill in the details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* ══ BASIC INFO ══════════════════════════════════════════════ */}
            <SectionLabel>Basic Info</SectionLabel>

            <Field label="Asset Name" required error={formErrors.asset_name}>
              <input
                type="text"
                name="asset_name"
                value={form.asset_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Dell Laptop Latitude 5510"
                className={inputClass(formErrors.asset_name, touched.asset_name, form.asset_name)}
              />
            </Field>

            {/* ── Category Cascade (N-level, real DB data) ── */}
            <CategoryCascade
              categories={categories}
              path={categoryPath}
              onChange={onCategoryChange}
              error={formErrors.category_id}
              disabled={dropdownsLoading}
            />

            {/* ── Asset Type ── */}
            <Field label="Asset Type" required error={formErrors.asset_type}>
              <select
                name="asset_type"
                value={form.asset_type}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass(formErrors.asset_type, touched.asset_type, form.asset_type)}
              >
                <option value="">— Select —</option>
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Description" error={formErrors.description}>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Optional description..."
                rows={2}
                className={`${inputClass(formErrors.description, touched.description, form.description)} resize-none`}
              />
            </Field>

            {/* ══ FINANCE INFO ════════════════════════════════════════════ */}
            <SectionLabel>Finance Info</SectionLabel>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Purchase Date" required error={formErrors.purchase_date}>
                <DatePicker
                  value={form.purchase_date}
                  onChange={(v) => handleDateChange("purchase_date", v)}
                  placeholder="Select date"
                  triggerStyle={dpTrigger(formErrors.purchase_date, touched.purchase_date, form.purchase_date)}
                  containerStyle={dpContainer}
                  popupFixed
                />
              </Field>
              <Field label="Purchase Cost (₹)" required error={formErrors.purchase_cost}>
                <input
                  type="number"
                  name="purchase_cost"
                  min="0"
                  step="0.01"
                  value={form.purchase_cost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  className={inputClass(formErrors.purchase_cost, touched.purchase_cost, form.purchase_cost)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Depreciation Method"
                required
                error={formErrors.depreciation_method}
                hint="SLM = fixed ₹/yr  ·  WDV = % of book value"
              >
                <select
                  name="depreciation_method"
                  value={form.depreciation_method}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass(formErrors.depreciation_method, touched.depreciation_method, form.depreciation_method)}
                >
                  <option value="">— Select —</option>
                  {DEPRECIATION_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Useful Life (Years)"
                required
                error={formErrors.useful_life_years}
                hint="e.g. 3, 5, 10"
              >
                <input
                  type="number"
                  name="useful_life_years"
                  min="1"
                  max="99"
                  step="1"
                  value={form.useful_life_years}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 5"
                  className={inputClass(formErrors.useful_life_years, touched.useful_life_years, form.useful_life_years)}
                />
              </Field>
            </div>

            {/* ══ COLLAPSIBLE SECTIONS ════════════════════════════════════ */}

            {/* Location & Assignment */}
            <CollapsibleSection
              title="Location & Assignment"
              isOpen={openSections.location}
              onToggle={() => toggleSection("location")}
              hasError={locationHasError}
            >
              <Field label="Location" required error={formErrors.location_id}>
                <select
                  name="location_id"
                  value={form.location_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={dropdownsLoading}
                  className={inputClass(formErrors.location_id, touched.location_id, form.location_id)}
                >
                  <option value="">{dropdownsLoading ? "Loading..." : "— Select Location —"}</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.location_name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Department" required error={formErrors.department_id}>
                <select
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!form.location_id || dropdownsLoading}
                  className={`${inputClass(formErrors.department_id, touched.department_id, form.department_id)} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {!form.location_id
                      ? "Select location first"
                      : filteredDepartments.length === 0
                        ? "No departments for this location"
                        : "— Select Department —"}
                  </option>
                  {filteredDepartments.map((d) => (
                    <option key={d.id} value={d.id}>{d.dept_name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Assigned Employee" hint="Optional — leave blank if unassigned">
                <select
                  name="assigned_employee_id"
                  value={form.assigned_employee_id}
                  onChange={handleChange}
                  disabled={dropdownsLoading}
                  className={normal}
                >
                  <option value="">{dropdownsLoading ? "Loading..." : "— Unassigned —"}</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.employee_code} — {e.full_name}</option>
                  ))}
                </select>
              </Field>
            </CollapsibleSection>

            {/* Purchase Details */}
            <CollapsibleSection
              title="Purchase Details"
              isOpen={openSections.purchase}
              onToggle={() => toggleSection("purchase")}
              hasError={purchaseHasError}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Scrap Value (₹)" error={formErrors.scrap_value} hint="Optional">
                  <input
                    type="number"
                    name="scrap_value"
                    min="0"
                    step="0.01"
                    value={form.scrap_value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0.00"
                    className={inputClass(formErrors.scrap_value, touched.scrap_value, form.scrap_value)}
                  />
                </Field>
                <Field label="Vendor" error={formErrors.vendor}>
                  <input
                    type="text"
                    name="vendor"
                    value={form.vendor}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Dell India"
                    className={inputClass(formErrors.vendor, touched.vendor, form.vendor)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Invoice Number" error={formErrors.invoice_number}>
                  <input
                    type="text"
                    name="invoice_number"
                    value={form.invoice_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="INV-00001"
                    className={inputClass(formErrors.invoice_number, touched.invoice_number, form.invoice_number)}
                  />
                </Field>
                <Field label="Invoice Date" error={formErrors.invoice_date}>
                  <DatePicker
                    value={form.invoice_date}
                    onChange={(v) => handleDateChange("invoice_date", v)}
                    placeholder="Select date"
                    triggerStyle={dpTrigger(formErrors.invoice_date, touched.invoice_date, form.invoice_date)}
                    containerStyle={dpContainer}
                    alignRight
                    popupFixed
                  />
                </Field>
              </div>

              <Field label="Warranty Expiry Date" error={formErrors.warranty_expiry} hint="Optional — as per invoice / box">
                <DatePicker
                  value={form.warranty_expiry}
                  onChange={(v) => handleDateChange("warranty_expiry", v)}
                  placeholder="Select date"
                  triggerStyle={dpTrigger(formErrors.warranty_expiry, touched.warranty_expiry, form.warranty_expiry)}
                  containerStyle={dpContainer}
                  popupFixed
                />
              </Field>
            </CollapsibleSection>

            {/* Physical Details */}
            <CollapsibleSection
              title="Physical Details"
              isOpen={openSections.physical}
              onToggle={() => toggleSection("physical")}
              hasError={physicalHasError}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Serial Number" error={formErrors.serial_number}>
                  <input
                    type="text"
                    name="serial_number"
                    value={form.serial_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="SN-XXXXXXXX"
                    className={inputClass(formErrors.serial_number, touched.serial_number, form.serial_number)}
                  />
                </Field>
                <Field label="Model Number" error={formErrors.model_number}>
                  <input
                    type="text"
                    name="model_number"
                    value={form.model_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. LAT-5510"
                    className={inputClass(formErrors.model_number, touched.model_number, form.model_number)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Brand" error={formErrors.brand}>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Dell"
                    className={inputClass(formErrors.brand, touched.brand, form.brand)}
                  />
                </Field>
                <Field label="Color" error={formErrors.color}>
                  <input
                    type="text"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Black"
                    className={inputClass(formErrors.color, touched.color, form.color)}
                  />
                </Field>
              </div>

              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Condition" required error={formErrors.condition}>
                    <select
                      name="condition"
                      value={form.condition}
                      onChange={handleChange}
                      className={inputClass(formErrors.condition, true, form.condition)}
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status" required error={formErrors.status}>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className={inputClass(formErrors.status, true, form.status)}
                    >
                      {EDIT_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}
            </CollapsibleSection>

            {/* Insurance */}
            <CollapsibleSection
              title="Insurance (Optional)"
              isOpen={openSections.insurance}
              onToggle={() => toggleSection("insurance")}
              hasError={insuranceHasError}
            >
              <Field label="Policy Number" error={formErrors.insurance_policy_no}>
                <input
                  type="text"
                  name="insurance_policy_no"
                  value={form.insurance_policy_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="POL-XXXXXXXX"
                  className={inputClass(formErrors.insurance_policy_no, touched.insurance_policy_no, form.insurance_policy_no)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Insurance Company" error={formErrors.insurance_company}>
                  <input
                    type="text"
                    name="insurance_company"
                    value={form.insurance_company}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. HDFC Ergo"
                    className={inputClass(formErrors.insurance_company, touched.insurance_company, form.insurance_company)}
                  />
                </Field>
                <Field label="Expiry Date" error={formErrors.insurance_expiry_date}>
                  <DatePicker
                    value={form.insurance_expiry_date}
                    onChange={(v) => handleDateChange("insurance_expiry_date", v)}
                    placeholder="Select date"
                    triggerStyle={dpTrigger(formErrors.insurance_expiry_date, touched.insurance_expiry_date, form.insurance_expiry_date)}
                    containerStyle={dpContainer}
                    alignRight
                    popupFixed
                  />
                </Field>
              </div>
            </CollapsibleSection>

            {/* AMC */}
            <CollapsibleSection
              title="AMC (Optional)"
              isOpen={openSections.amc}
              onToggle={() => toggleSection("amc")}
              hasError={false}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="AMC Vendor" error={formErrors.amc_vendor}>
                  <input
                    type="text"
                    name="amc_vendor"
                    value={form.amc_vendor}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. HP Service Center"
                    className={inputClass(formErrors.amc_vendor, touched.amc_vendor, form.amc_vendor)}
                  />
                </Field>
                <Field label="AMC Expiry Date" error={formErrors.amc_expiry_date}>
                  <DatePicker
                    value={form.amc_expiry_date}
                    onChange={(v) => handleDateChange("amc_expiry_date", v)}
                    placeholder="Select date"
                    triggerStyle={dpTrigger(formErrors.amc_expiry_date, touched.amc_expiry_date, form.amc_expiry_date)}
                    containerStyle={dpContainer}
                    alignRight
                    popupFixed
                  />
                </Field>
              </div>
            </CollapsibleSection>

          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || dropdownsLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </>
              ) : isEditing ? "Save Changes" : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}