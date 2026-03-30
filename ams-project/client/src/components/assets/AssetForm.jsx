// client/src/components/assets/AssetForm.jsx

import { useState } from "react";
import DatePicker from "../common/DatePicker";

const CONDITIONS = ["New", "Good", "Fair", "Poor", "Scrap"];

const EDIT_STATUSES = ["Active", "InRepair", "InTransit", "Missing"];
const STATUS_LABELS = {
  Active: "Active",
  InRepair: "In Repair",
  InTransit: "In Transit",
  Missing: "Missing",
};

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
        className={`transition-all duration-200 overflow-hidden ${error ? "max-h-5 mt-1" : "max-h-0"}`}
      >
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
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

// ── Collapsible Section ───────────────────────────────────────────────────────
function CollapsibleSection({ title, isOpen, onToggle, hasError, children }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors
          ${
            isOpen
              ? "bg-red-50 border-b border-red-100"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
      >
        <div className="flex items-center gap-2">
          {hasError && (
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          )}
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isOpen ? "text-red-700" : "text-gray-500"
            }`}
          >
            {title}
          </span>
        </div>
        <span
          className={`flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold transition-colors ${
            isOpen
              ? "border-red-300 text-red-600 bg-white"
              : "border-gray-300 text-gray-500 bg-white"
          }`}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {/* Section Body */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-4 bg-white">{children}</div>
      </div>
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
  locations = [],
  filteredDepartments = [],
  categories = [],
  employees = [],
  dropdownsLoading = false,
}) {
  const [touched, setTouched] = useState({});

  // Sections open state — only top fields open by default
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
    // Auto-open sections that have errors so user can see them
    const locationErr = !!(formErrors.location_id || formErrors.department_id);
    const purchaseErr = !!(
      formErrors.purchase_date || formErrors.purchase_cost
    );
    const physicalErr = !!(
      formErrors.serial_number ||
      formErrors.condition ||
      formErrors.status
    );
    const insuranceErr = !!(
      formErrors.insurance_policy_no || formErrors.insurance_expiry_date
    );
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

  // Error indicators for section headers
  const locationHasError = !!(
    formErrors.location_id || formErrors.department_id
  );
  const purchaseHasError = !!(
    formErrors.purchase_date || formErrors.purchase_cost
  );
  const physicalHasError = !!(
    formErrors.serial_number ||
    formErrors.condition ||
    formErrors.status
  );
  const insuranceHasError = !!(
    formErrors.insurance_policy_no || formErrors.insurance_expiry_date
  );

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
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400
              hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* ── Always-visible top fields ── */}
            <Field label="Asset Name" required error={formErrors.asset_name}>
              <input
                type="text"
                name="asset_name"
                value={form.asset_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Dell Laptop Latitude 5510"
                className={inputClass(
                  formErrors.asset_name,
                  touched.asset_name,
                  form.asset_name,
                )}
              />
            </Field>

            <Field label="Category" required error={formErrors.category_id}>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={dropdownsLoading}
                className={inputClass(
                  formErrors.category_id,
                  touched.category_id,
                  form.category_id,
                )}
              >
                <option value="">
                  {dropdownsLoading ? "Loading..." : "— Select Category —"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
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

            {/* ── Collapsible: Location & Assignment ── */}
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
                  className={inputClass(
                    formErrors.location_id,
                    touched.location_id,
                    form.location_id,
                  )}
                >
                  <option value="">
                    {dropdownsLoading ? "Loading..." : "— Select Location —"}
                  </option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.location_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Department"
                required
                error={formErrors.department_id}
              >
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
                    <option key={d.id} value={d.id}>
                      {d.dept_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Assigned Employee"
                hint="Optional — leave blank if unassigned"
              >
                <select
                  name="assigned_employee_id"
                  value={form.assigned_employee_id}
                  onChange={handleChange}
                  disabled={dropdownsLoading}
                  className={normal}
                >
                  <option value="">
                    {dropdownsLoading ? "Loading..." : "— Unassigned —"}
                  </option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employee_code} — {e.full_name}
                    </option>
                  ))}
                </select>
              </Field>
            </CollapsibleSection>

            {/* ── Collapsible: Purchase Details ── */}
            <CollapsibleSection
              title="Purchase Details"
              isOpen={openSections.purchase}
              onToggle={() => toggleSection("purchase")}
              hasError={purchaseHasError}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Purchase Date"
                  required
                  error={formErrors.purchase_date}
                >
                  <DatePicker
                    value={form.purchase_date}
                    onChange={(v) => handleDateChange("purchase_date", v)}
                    placeholder="Select date"
                    triggerStyle={dpTrigger(
                      formErrors.purchase_date,
                      touched.purchase_date,
                      form.purchase_date,
                    )}
                    containerStyle={dpContainer}
                    popupFixed
                  />
                </Field>
                <Field
                  label="Purchase Cost (₹)"
                  required
                  error={formErrors.purchase_cost}
                >
                  <input
                    type="number"
                    name="purchase_cost"
                    min="0"
                    step="0.01"
                    value={form.purchase_cost}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0.00"
                    className={inputClass(
                      formErrors.purchase_cost,
                      touched.purchase_cost,
                      form.purchase_cost,
                    )}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Scrap Value (₹)"
                  error={formErrors.scrap_value}
                  hint="Optional"
                >
                  <input
                    type="number"
                    name="scrap_value"
                    min="0"
                    step="0.01"
                    value={form.scrap_value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0.00"
                    className={inputClass(
                      formErrors.scrap_value,
                      touched.scrap_value,
                      form.scrap_value,
                    )}
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
                    className={inputClass(
                      formErrors.vendor,
                      touched.vendor,
                      form.vendor,
                    )}
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
                    className={inputClass(
                      formErrors.invoice_number,
                      touched.invoice_number,
                      form.invoice_number,
                    )}
                  />
                </Field>
                <Field label="Invoice Date" error={formErrors.invoice_date}>
                  <DatePicker
                    value={form.invoice_date}
                    onChange={(v) => handleDateChange("invoice_date", v)}
                    placeholder="Select date"
                    triggerStyle={dpTrigger(
                      formErrors.invoice_date,
                      touched.invoice_date,
                      form.invoice_date,
                    )}
                    containerStyle={dpContainer}
                    alignRight
                    popupFixed
                  />
                </Field>
              </div>

              <Field
                label="Warranty Expiry Date"
                error={formErrors.warranty_expiry}
                hint="Optional — as per invoice / box"
              >
                <DatePicker
                  value={form.warranty_expiry}
                  onChange={(v) => handleDateChange("warranty_expiry", v)}
                  placeholder="Select date"
                  triggerStyle={dpTrigger(
                    formErrors.warranty_expiry,
                    touched.warranty_expiry,
                    form.warranty_expiry,
                  )}
                  containerStyle={dpContainer}
                  popupFixed
                />
              </Field>
            </CollapsibleSection>

            {/* ── Collapsible: Physical Details ── */}
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
                    className={inputClass(
                      formErrors.serial_number,
                      touched.serial_number,
                      form.serial_number,
                    )}
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
                    className={inputClass(
                      formErrors.model_number,
                      touched.model_number,
                      form.model_number,
                    )}
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
                    className={inputClass(
                      formErrors.brand,
                      touched.brand,
                      form.brand,
                    )}
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
                    className={inputClass(
                      formErrors.color,
                      touched.color,
                      form.color,
                    )}
                  />
                </Field>
              </div>

              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Condition"
                    required
                    error={formErrors.condition}
                  >
                    <select
                      name="condition"
                      value={form.condition}
                      onChange={handleChange}
                      className={inputClass(
                        formErrors.condition,
                        true,
                        form.condition,
                      )}
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status" required error={formErrors.status}>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className={inputClass(
                        formErrors.status,
                        true,
                        form.status,
                      )}
                    >
                      {EDIT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}
            </CollapsibleSection>

            {/* ── Collapsible: Insurance ── */}
            <CollapsibleSection
              title="Insurance (Optional)"
              isOpen={openSections.insurance}
              onToggle={() => toggleSection("insurance")}
              hasError={insuranceHasError}
            >
              <Field
                label="Policy Number"
                error={formErrors.insurance_policy_no}
              >
                <input
                  type="text"
                  name="insurance_policy_no"
                  value={form.insurance_policy_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="POL-XXXXXXXX"
                  className={inputClass(
                    formErrors.insurance_policy_no,
                    touched.insurance_policy_no,
                    form.insurance_policy_no,
                  )}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Insurance Company"
                  error={formErrors.insurance_company}
                >
                  <input
                    type="text"
                    name="insurance_company"
                    value={form.insurance_company}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. HDFC Ergo"
                    className={inputClass(
                      formErrors.insurance_company,
                      touched.insurance_company,
                      form.insurance_company,
                    )}
                  />
                </Field>
                <Field
                  label="Expiry Date"
                  error={formErrors.insurance_expiry_date}
                >
                  <DatePicker
                    value={form.insurance_expiry_date}
                    onChange={(v) =>
                      handleDateChange("insurance_expiry_date", v)
                    }
                    placeholder="Select date"
                    triggerStyle={dpTrigger(
                      formErrors.insurance_expiry_date,
                      touched.insurance_expiry_date,
                      form.insurance_expiry_date,
                    )}
                    containerStyle={dpContainer}
                    alignRight
                    popupFixed
                  />
                </Field>
              </div>
            </CollapsibleSection>

            {/* ── Collapsible: AMC — Edit only ── */}
            {isEditing && (
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
                      className={inputClass(
                        formErrors.amc_vendor,
                        touched.amc_vendor,
                        form.amc_vendor,
                      )}
                    />
                  </Field>
                  <Field
                    label="AMC Expiry Date"
                    error={formErrors.amc_expiry_date}
                  >
                    <DatePicker
                      value={form.amc_expiry_date}
                      onChange={(v) => handleDateChange("amc_expiry_date", v)}
                      placeholder="Select date"
                      triggerStyle={dpTrigger(
                        formErrors.amc_expiry_date,
                        touched.amc_expiry_date,
                        form.amc_expiry_date,
                      )}
                      containerStyle={dpContainer}
                      alignRight
                      popupFixed
                    />
                  </Field>
                </div>
              </CollapsibleSection>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium
                text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || dropdownsLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold
                rounded-xl hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed
                transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Asset"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
