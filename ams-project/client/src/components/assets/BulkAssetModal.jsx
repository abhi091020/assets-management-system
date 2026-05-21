// client/src/components/assets/BulkAssetModal.jsx

import { useMemo } from "react";
import DatePicker from "../common/DatePicker";

// ── Shared style helpers (same as AssetForm) ──────────────────────────────────
const base    = "w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-50";
const normal  = `${base} border-gray-200 focus:ring-red-500/20 focus:border-red-400`;
const errCls  = `${base} border-red-400 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500`;
const validCls= `${base} border-green-400 focus:ring-green-500/20 focus:border-green-500`;

function inputClass(error, value) {
  if (error) return errCls;
  if (value !== "" && value != null) return validCls;
  return normal;
}

function dpTrigger(error, value) {
  return {
    padding: "10px 14px", borderRadius: "12px", fontSize: "14px",
    backgroundColor: error ? "rgba(239,68,68,0.05)" : "#F9FAFB",
    borderColor: error ? "#F87171" : value ? "#4ADE80" : "#E5E7EB",
    boxShadow: "none", color: value ? "#333" : "#9CA3AF",
  };
}

const dpContainer = { minWidth: 0, flex: "1 1 auto" };

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{children}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

const ASSET_TYPES = [
  "IT Equipment","Furniture","Vehicle","Office Equipment",
  "Machinery","Electrical Equipment","Building & Infrastructure",
  "Tools & Equipment","Medical Equipment","Other",
];
const DEPRECIATION_METHODS = [
  { value: "SLM", label: "SLM — Straight Line Method" },
  { value: "WDV", label: "WDV — Written Down Value" },
];
const CONDITIONS = ["New", "Good", "Fair", "Poor", "Damaged", "Scrap"];
const LEVEL_LABELS = ["Category", "Sub-Category", "Sub-Sub-Category", "Level 4"];

// ── Category Cascade (same logic as AssetForm) ───────────────────────────────
function CategoryCascade({ categories, path, onChange, error, disabled }) {
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

  const levels = useMemo(() => {
    const result = [];
    let parentKey = "root";
    for (let depth = 0; ; depth++) {
      const options = childrenOf[parentKey] || [];
      if (options.length === 0) break;
      const selectedId = path[depth] ?? "";
      result.push({ depth, options, selectedId });
      if (!selectedId) break;
      parentKey = selectedId;
    }
    return result;
  }, [childrenOf, path]);

  function handleSelect(depth, rawValue) {
    const newPath = path.slice(0, depth);
    if (rawValue) newPath.push(Number(rawValue));
    onChange(newPath);
  }

  return (
    <div className="space-y-3">
      {levels.map(({ depth, options, selectedId }) => (
        <Field
          key={depth}
          label={LEVEL_LABELS[depth] ?? `Level ${depth + 1}`}
          required={depth === 0}
          error={depth === 0 ? error : undefined}
        >
          <select
            value={selectedId}
            onChange={(e) => handleSelect(depth, e.target.value)}
            disabled={disabled}
            className={`${inputClass(depth === 0 ? error : undefined, selectedId)} disabled:opacity-50`}
          >
            <option value="">{disabled ? "Loading…" : depth === 0 ? "— Select Category —" : `— Select ${LEVEL_LABELS[depth]} —`}</option>
            {options.map((c) => <option key={c.id} value={c.id}>{c.category_name}</option>)}
          </select>
        </Field>
      ))}
    </div>
  );
}

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ["Common Details", "Item Details", "Review & Register"];
  return (
    <div className="flex items-center justify-center gap-0 px-6">
      {steps.map((label, i) => {
        const idx = i + 1;
        const active   = step === idx;
        const done     = step > idx;
        return (
          <div key={idx} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${done   ? "bg-green-500 border-green-500 text-white"
                  : active ? "bg-red-600 border-red-600 text-white"
                  : "bg-white border-gray-300 text-gray-400"}`}>
                {done ? "✓" : idx}
              </div>
              <span className={`mt-1 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap
                ${active ? "text-red-600" : done ? "text-green-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-0.5 mb-4 mx-1 transition-colors
                ${step > idx ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Common Details Form ───────────────────────────────────────────────
function Step1Common({
  form, errors, onChange,
  categoryPath, onCategoryChange,
  locations, filteredDepartments, categories, dropdownsLoading,
}) {
  function handleChange(e) {
    onChange(e.target.name, e.target.value);
  }

  return (
    <div className="space-y-4">
      <SectionLabel>Basic Info</SectionLabel>

      <Field label="Asset Name" required error={errors.asset_name}
        hint="This name will be used for ALL assets in this batch">
        <input type="text" name="asset_name" value={form.asset_name}
          onChange={handleChange} placeholder="e.g. Dell Laptop Latitude 5510"
          className={inputClass(errors.asset_name, form.asset_name)} />
      </Field>

      <CategoryCascade
        categories={categories} path={categoryPath}
        onChange={onCategoryChange} error={errors.category_id}
        disabled={dropdownsLoading}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Asset Type" required error={errors.asset_type}>
          <select name="asset_type" value={form.asset_type} onChange={handleChange}
            className={inputClass(errors.asset_type, form.asset_type)}>
            <option value="">— Select —</option>
            {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Brand">
          <input type="text" name="brand" value={form.brand}
            onChange={handleChange} placeholder="e.g. Dell"
            className={inputClass("", form.brand)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Model Number">
          <input type="text" name="model_number" value={form.model_number}
            onChange={handleChange} placeholder="e.g. LAT-5510"
            className={inputClass("", form.model_number)} />
        </Field>
        <Field label="Description">
          <input type="text" name="description" value={form.description}
            onChange={handleChange} placeholder="Optional"
            className={inputClass("", form.description)} />
        </Field>
      </div>

      <SectionLabel>Location & Department</SectionLabel>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Location" required error={errors.location_id}>
          <select name="location_id" value={form.location_id}
            onChange={handleChange} disabled={dropdownsLoading}
            className={`${inputClass(errors.location_id, form.location_id)} disabled:opacity-50`}>
            <option value="">{dropdownsLoading ? "Loading…" : "— Select —"}</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.location_name}</option>)}
          </select>
        </Field>
        <Field label="Department" required error={errors.department_id}>
          <select name="department_id" value={form.department_id}
            onChange={handleChange} disabled={!form.location_id || dropdownsLoading}
            className={`${inputClass(errors.department_id, form.department_id)} disabled:opacity-50`}>
            <option value="">
              {!form.location_id ? "Select location first"
                : filteredDepartments.length === 0 ? "No departments"
                : "— Select —"}
            </option>
            {filteredDepartments.map((d) => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
          </select>
        </Field>
      </div>

      <SectionLabel>Finance Info</SectionLabel>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Purchase Date" required error={errors.purchase_date}>
          <DatePicker value={form.purchase_date} onChange={(v) => onChange("purchase_date", v)}
            placeholder="Select date"
            triggerStyle={dpTrigger(errors.purchase_date, form.purchase_date)}
            containerStyle={dpContainer} popupFixed />
        </Field>
        <Field label="Purchase Cost (₹) — per unit" required error={errors.purchase_cost}>
          <input type="number" name="purchase_cost" min="0" step="0.01"
            value={form.purchase_cost} onChange={handleChange} placeholder="0.00"
            className={inputClass(errors.purchase_cost, form.purchase_cost)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Depreciation Method" required error={errors.depreciation_method}>
          <select name="depreciation_method" value={form.depreciation_method} onChange={handleChange}
            className={inputClass(errors.depreciation_method, form.depreciation_method)}>
            <option value="">— Select —</option>
            {DEPRECIATION_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </Field>
        <Field label="Useful Life (Years)" required error={errors.useful_life_years}>
          <input type="number" name="useful_life_years" min="1" max="99"
            value={form.useful_life_years} onChange={handleChange} placeholder="e.g. 5"
            className={inputClass(errors.useful_life_years, form.useful_life_years)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Vendor">
          <input type="text" name="vendor" value={form.vendor}
            onChange={handleChange} placeholder="e.g. Dell India"
            className={inputClass("", form.vendor)} />
        </Field>
        <Field label="Invoice Number">
          <input type="text" name="invoice_number" value={form.invoice_number}
            onChange={handleChange} placeholder="INV-00001"
            className={inputClass("", form.invoice_number)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Invoice Date">
          <DatePicker value={form.invoice_date} onChange={(v) => onChange("invoice_date", v)}
            placeholder="Select date"
            triggerStyle={dpTrigger("", form.invoice_date)}
            containerStyle={dpContainer} popupFixed />
        </Field>
        <Field label="Warranty Expiry">
          <DatePicker value={form.warranty_expiry} onChange={(v) => onChange("warranty_expiry", v)}
            placeholder="Select date"
            triggerStyle={dpTrigger("", form.warranty_expiry)}
            containerStyle={dpContainer} popupFixed />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Scrap Value (₹)" hint="Optional">
          <input type="number" name="scrap_value" min="0" step="0.01"
            value={form.scrap_value} onChange={handleChange} placeholder="0.00"
            className={inputClass("", form.scrap_value)} />
        </Field>
      </div>

      <SectionLabel>Insurance & AMC — Optional</SectionLabel>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Insurance Policy No.">
          <input type="text" name="insurance_policy_no" value={form.insurance_policy_no}
            onChange={handleChange} placeholder="POL-XXXXX"
            className={inputClass("", form.insurance_policy_no)} />
        </Field>
        <Field label="Insurance Company">
          <input type="text" name="insurance_company" value={form.insurance_company}
            onChange={handleChange} placeholder="e.g. HDFC Ergo"
            className={inputClass("", form.insurance_company)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Insurance Expiry">
          <DatePicker value={form.insurance_expiry_date} onChange={(v) => onChange("insurance_expiry_date", v)}
            placeholder="Select date"
            triggerStyle={dpTrigger("", form.insurance_expiry_date)}
            containerStyle={dpContainer} popupFixed />
        </Field>
        <Field label="AMC Vendor">
          <input type="text" name="amc_vendor" value={form.amc_vendor}
            onChange={handleChange} placeholder="e.g. HP Service"
            className={inputClass("", form.amc_vendor)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="AMC Expiry">
          <DatePicker value={form.amc_expiry_date} onChange={(v) => onChange("amc_expiry_date", v)}
            placeholder="Select date"
            triggerStyle={dpTrigger("", form.amc_expiry_date)}
            containerStyle={dpContainer} popupFixed />
        </Field>
      </div>
    </div>
  );
}

// ── Step 2: Items Grid ────────────────────────────────────────────────────────
function Step2Items({ quantity, onQuantityChange, items, onUpdateItem, quickFill, onQuickFillChange, onApplyQuickFill }) {
  return (
    <div className="space-y-4 flex flex-col h-full">

      {/* Quantity setter */}
      <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Number of Assets to Register
            <span className="ml-2 text-xs font-normal text-gray-400">(max 200)</span>
          </label>
          <input
            type="number" min="1" max="200" value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Cost</p>
          <p className="text-lg font-bold text-red-600">
            {items.length} assets
          </p>
        </div>
      </div>

      {/* Quick Fill bar */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Quick Fill:</span>
        <input
          type="text"
          placeholder="Color for all rows"
          value={quickFill.color}
          onChange={(e) => onQuickFillChange("color", e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        <select
          value={quickFill.condition}
          onChange={(e) => onQuickFillChange("condition", e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
        >
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="button"
          onClick={onApplyQuickFill}
          className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition whitespace-nowrap"
        >
          Apply to All
        </button>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12 text-gray-400 text-sm">
          Set quantity above — rows will appear here
        </div>
      ) : (
        <div className="flex-1 overflow-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 w-10">#</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[160px]">Serial Number</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[120px]">Color</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[120px]">Condition</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[180px]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <tr key={item._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-3 py-2 text-xs text-gray-400 font-mono">{index + 1}</td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.serial_number}
                      onChange={(e) => onUpdateItem(index, "serial_number", e.target.value)}
                      placeholder="SN-XXXXXX (optional)"
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.color}
                      onChange={(e) => onUpdateItem(index, "color", e.target.value)}
                      placeholder="e.g. Black"
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={item.condition}
                      onChange={(e) => onUpdateItem(index, "condition", e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-400"
                    >
                      {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => onUpdateItem(index, "notes", e.target.value)}
                      placeholder="Optional notes"
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Review ────────────────────────────────────────────────────────────
function Step3Review({ commonForm, items, result }) {
  const totalCost = items.length * Number(commonForm.purchase_cost || 0);

  if (result) {
    // Success state
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{result.count} Assets Registered!</h3>
          <p className="text-sm text-gray-500 mt-1">Batch ID: <span className="font-mono font-semibold text-red-600">{result.batchId}</span></p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">First Code</p>
            <p className="font-mono text-sm font-bold text-gray-800">{result.firstCode}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Last Code</p>
            <p className="font-mono text-sm font-bold text-gray-800">{result.lastCode}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">All QR codes have been generated and saved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{items.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Assets</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">₹{Number(commonForm.purchase_cost || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Cost per Unit</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">₹{totalCost.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total Value</p>
        </div>
      </div>

      {/* Common Details Summary */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Common Details</p>
        {[
          ["Asset Name", commonForm.asset_name],
          ["Brand / Model", [commonForm.brand, commonForm.model_number].filter(Boolean).join(" / ") || "—"],
          ["Depreciation", `${commonForm.depreciation_method || "—"} · ${commonForm.useful_life_years || "—"} years`],
          ["Vendor", commonForm.vendor || "—"],
          ["Invoice No.", commonForm.invoice_number || "—"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* Items Preview */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Items Preview ({items.length} rows)
        </p>
        <div className="max-h-48 overflow-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500 w-8">#</th>
                <th className="px-3 py-2 text-left text-gray-500">Serial No.</th>
                <th className="px-3 py-2 text-left text-gray-500">Color</th>
                <th className="px-3 py-2 text-left text-gray-500">Condition</th>
                <th className="px-3 py-2 text-left text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, i) => (
                <tr key={item._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-1.5 font-mono text-gray-700">{item.serial_number || <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 py-1.5 text-gray-700">{item.color || <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold
                      ${item.condition === "New" ? "bg-green-100 text-green-700"
                        : item.condition === "Good" ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-gray-600">{item.notes || <span className="text-gray-300">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700">
        ⚠️ This will register <strong>{items.length} assets</strong> in one transaction.
        All or none will be saved. QR codes will be generated for each asset.
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BulkAssetModal({
  open, onClose,
  step, goToStep2, goToStep3, goBack,
  commonForm, commonErrors, onCommonChange,
  categoryPath, onCategoryChange,
  locations, filteredDepartments, categories, dropdownsLoading,
  quantity, onQuantityChange,
  items, onUpdateItem,
  quickFill, onQuickFillChange, onApplyQuickFill,
  onSubmit, isSubmitting, result,
}) {
  if (!open) return null;

  const isSuccess = !!result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bulk Asset Registration</h2>
              <p className="text-xs text-gray-500 mt-0.5">Register multiple assets at once from a single order</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {!isSuccess && <StepIndicator step={step} />}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <Step1Common
              form={commonForm} errors={commonErrors} onChange={onCommonChange}
              categoryPath={categoryPath} onCategoryChange={onCategoryChange}
              locations={locations} filteredDepartments={filteredDepartments}
              categories={categories} dropdownsLoading={dropdownsLoading}
            />
          )}
          {step === 2 && (
            <Step2Items
              quantity={quantity} onQuantityChange={onQuantityChange}
              items={items} onUpdateItem={onUpdateItem}
              quickFill={quickFill}
              onQuickFillChange={(key, val) => onQuickFillChange(key, val)}
              onApplyQuickFill={onApplyQuickFill}
            />
          )}
          {step === 3 && (
            <Step3Review
              commonForm={commonForm} items={items} result={result}
            />
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            {step > 1 ? (
              <button type="button" onClick={goBack}
                className="px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition">
                ← Back
              </button>
            ) : (
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
            )}

            <div className="flex-1" />

            {step === 1 && (
              <button type="button" onClick={goToStep2}
                className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition">
                Next: Item Details →
              </button>
            )}
            {step === 2 && (
              <button type="button" onClick={goToStep3}
                disabled={items.length === 0}
                className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition">
                Review {items.length} Assets →
              </button>
            )}
            {step === 3 && (
              <button type="button" onClick={onSubmit} disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 transition flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Registering {items.length} assets...
                  </>
                ) : `Register ${items.length} Assets`}
              </button>
            )}
          </div>
        )}

        {isSuccess && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-center flex-shrink-0">
            <button type="button" onClick={onClose}
              className="px-8 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition">
              Done — View Assets
            </button>
          </div>
        )}
      </div>
    </div>
  );
}