// client/src/components/permissions/ModuleFormModal.jsx
import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
//  ALL KNOWN APP MODULES — auto-fill when selected
//  Add new entries here as the app grows (Phase 7, 9, etc.)
// ─────────────────────────────────────────────────────────────
const PRESET_MODULES = [
  {
    moduleKey: "dashboard",
    displayName: "Dashboard",
    description: "Main dashboard overview",
    icon: "Dashboard",
    sortOrder: 1,
  },
  {
    moduleKey: "assets",
    displayName: "Assets",
    description: "Asset register and management",
    icon: "AssetRegister",
    sortOrder: 2,
  },
  {
    moduleKey: "categories",
    displayName: "Categories",
    description: "Asset categories and depreciation defaults",
    icon: "Categories",
    sortOrder: 3,
  },
  {
    moduleKey: "departments",
    displayName: "Departments",
    description: "Department master data",
    icon: "Department",
    sortOrder: 4,
  },
  {
    moduleKey: "locations",
    displayName: "Locations",
    description: "Location master data",
    icon: "Location",
    sortOrder: 5,
  },
  {
    moduleKey: "employees",
    displayName: "Employees",
    description: "Employee records",
    icon: "Employees",
    sortOrder: 6,
  },
  {
    moduleKey: "users",
    displayName: "Users",
    description: "User accounts and role management",
    icon: "Users",
    sortOrder: 7,
  },
  {
    moduleKey: "transfers",
    displayName: "Transfers",
    description: "Asset transfer operations",
    icon: "Transfer",
    sortOrder: 8,
  },
  {
    moduleKey: "disposals",
    displayName: "Disposals",
    description: "Asset disposal operations",
    icon: "Disposal",
    sortOrder: 9,
  },
  {
    moduleKey: "verification",
    displayName: "Verification",
    description: "Physical asset verification batches",
    icon: "Verification",
    sortOrder: 10,
  },
  {
    moduleKey: "reports",
    displayName: "Reports",
    description: "Reports centre — 10 report types",
    icon: "Reports",
    sortOrder: 11,
  },
  {
    moduleKey: "audit_logs",
    displayName: "Audit Logs",
    description: "System-wide audit trail",
    icon: "AuditLogs",
    sortOrder: 12,
  },
  {
    moduleKey: "settings",
    displayName: "Settings",
    description: "User profile and app settings",
    icon: "Settings",
    sortOrder: 13,
  },
  {
    moduleKey: "qr_scanner",
    displayName: "QR Scanner",
    description: "QR code scanner for assets",
    icon: "QRScanner",
    sortOrder: 14,
  },
  {
    moduleKey: "depreciation",
    displayName: "Depreciation",
    description: "Depreciation engine — Phase 7",
    icon: "Deprication",
    sortOrder: 15,
  },
  {
    moduleKey: "amc_tracker",
    displayName: "AMC & Insurance",
    description: "AMC and insurance expiry tracker — Phase 7",
    icon: "AMCInsurance",
    sortOrder: 16,
  },
  // ── Future modules — add here as app grows ──────────────────
  // { moduleKey: "maintenance",  displayName: "Maintenance",  description: "...", icon: "...", sortOrder: 17 },
];

const CUSTOM_OPTION = "__custom__";

// ─────────────────────────────────────────────────────────────
//  Field wrapper
// ─────────────────────────────────────────────────────────────
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
  if (touched && value && !error) return validCls;
  return normal;
}

const EMPTY = {
  moduleKey: "",
  displayName: "",
  description: "",
  icon: "",
  sortOrder: "",
};

// ─────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────
export default function ModuleFormModal({
  open,
  onClose,
  editingModule,
  onSave,
  saving,
  existingModuleKeys = [], // pass existing module_key values to grey out already-added presets
}) {
  const [selectedPreset, setSelectedPreset] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouch] = useState({});

  // ── Reset on open ───────────────────────────────────────────
  useEffect(() => {
    if (open) {
      if (editingModule) {
        // Edit mode — show full form directly, no preset picker
        setForm({
          moduleKey: editingModule.module_key ?? "",
          displayName: editingModule.display_name ?? "",
          description: editingModule.description ?? "",
          icon: editingModule.icon ?? "",
          sortOrder: editingModule.sort_order ?? "",
        });
        setIsCustom(true); // show full form
        setSelectedPreset(""); // no preset selected
      } else {
        setForm(EMPTY);
        setIsCustom(false);
        setSelectedPreset("");
      }
      setErrors({});
      setTouch({});
    }
  }, [open, editingModule]);

  if (!open) return null;
  const isEdit = !!editingModule;

  // ── Preset selected ─────────────────────────────────────────
  function handlePresetChange(e) {
    const val = e.target.value;
    setSelectedPreset(val);
    setErrors({});
    setTouch({});

    if (val === CUSTOM_OPTION) {
      setIsCustom(true);
      setForm(EMPTY);
    } else if (val) {
      const preset = PRESET_MODULES.find((p) => p.moduleKey === val);
      if (preset) {
        setIsCustom(false);
        setForm({
          moduleKey: preset.moduleKey,
          displayName: preset.displayName,
          description: preset.description,
          icon: preset.icon,
          sortOrder: String(preset.sortOrder),
        });
      }
    } else {
      setIsCustom(false);
      setForm(EMPTY);
    }
  }

  // ── Validation ──────────────────────────────────────────────
  function validate(name, value) {
    if (name === "moduleKey") {
      if (!value.trim()) return "Module key is required";
      if (!/^[a-z][a-z0-9_]*$/.test(value.trim()))
        return "Only lowercase letters, numbers, underscores. Must start with a letter.";
      if (value.trim().length > 50) return "Max 50 characters";
    }
    if (name === "displayName") {
      if (!value.trim()) return "Display name is required";
      if (value.trim().length > 100) return "Max 100 characters";
    }
    if (name === "sortOrder" && value !== "" && isNaN(Number(value))) {
      return "Must be a number";
    }
    return "";
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setTouch((p) => ({ ...p, [name]: true }));
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: validate(name, value) }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouch((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validate(name, value) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {
      moduleKey: validate("moduleKey", form.moduleKey),
      displayName: validate("displayName", form.displayName),
      sortOrder: validate("sortOrder", form.sortOrder),
    };
    setErrors(newErrors);
    setTouch({ moduleKey: true, displayName: true, sortOrder: true });
    if (Object.values(newErrors).some(Boolean)) return;
    onSave({
      ...form,
      sortOrder: form.sortOrder !== "" ? Number(form.sortOrder) : undefined,
    });
  }

  // ── Check if preset is already registered ───────────────────
  const isAlreadyAdded = (key) => existingModuleKeys.includes(key);

  // ── Is form ready to show (preset selected or edit mode) ────
  const showForm = isEdit || !!selectedPreset;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Module" : "Add Module"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? `Editing — ${editingModule.display_name}`
                : "Select a preset or add a custom module"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
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

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* ── Preset selector (add mode only) ── */}
            {!isEdit && (
              <Field
                label="Module"
                required
                hint={
                  isCustom
                    ? "Entering a custom module key"
                    : "Select a known module or choose Custom"
                }
              >
                <select
                  value={selectedPreset}
                  onChange={handlePresetChange}
                  className={normal}
                >
                  <option value="">— Select a module —</option>

                  {/* ── Known app modules ── */}
                  <optgroup label="App Modules">
                    {PRESET_MODULES.map((p) => {
                      const added = isAlreadyAdded(p.moduleKey);
                      return (
                        <option
                          key={p.moduleKey}
                          value={p.moduleKey}
                          disabled={added}
                        >
                          {p.displayName}
                          {added ? " (already added)" : ""}
                        </option>
                      );
                    })}
                  </optgroup>

                  {/* ── Custom ── */}
                  <optgroup label="Other">
                    <option value={CUSTOM_OPTION}>✏️ Custom module...</option>
                  </optgroup>
                </select>
              </Field>
            )}

            {/* ── Preview card for preset (non-custom) ── */}
            {showForm && !isCustom && !isEdit && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-red-700">
                    Selected Preset
                  </p>
                  <span className="text-xs text-red-400 font-mono bg-red-100 px-2 py-0.5 rounded-md">
                    {form.moduleKey}
                  </span>
                </div>
                <p className="text-xs text-red-600">{form.description}</p>
                <div className="flex items-center gap-4 pt-1 text-xs text-red-500">
                  <span>
                    Icon: <span className="font-mono">{form.icon || "—"}</span>
                  </span>
                  <span>
                    Sort: <span className="font-mono">{form.sortOrder}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className="text-xs text-red-600 underline underline-offset-2 hover:text-red-800 transition"
                >
                  Customise these values →
                </button>
              </div>
            )}

            {/* ── Full form (custom or edit mode) ── */}
            {showForm && (isCustom || isEdit) && (
              <>
                {/* Module Key — hidden in edit mode */}
                {!isEdit && (
                  <Field
                    label="Module Key"
                    required
                    error={errors.moduleKey}
                    hint="Unique identifier — lowercase, e.g. asset_reports"
                  >
                    <input
                      name="moduleKey"
                      value={form.moduleKey}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. asset_reports"
                      className={inputClass(
                        errors.moduleKey,
                        touched.moduleKey,
                        form.moduleKey,
                      )}
                    />
                  </Field>
                )}

                {/* Display Name */}
                <Field label="Display Name" required error={errors.displayName}>
                  <input
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Asset Reports"
                    className={inputClass(
                      errors.displayName,
                      touched.displayName,
                      form.displayName,
                    )}
                  />
                </Field>

                {/* Description */}
                <Field
                  label="Description"
                  hint="Optional — what this module covers"
                >
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={2}
                    placeholder="Describe this module..."
                    className={`${normal} resize-none`}
                  />
                </Field>

                {/* Icon + Sort Order */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Icon Name" hint="Must match Icons.jsx key">
                    <input
                      name="icon"
                      value={form.icon}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Reports"
                      className={inputClass("", touched.icon, form.icon)}
                    />
                  </Field>
                  <Field
                    label="Sort Order"
                    error={errors.sortOrder}
                    hint="Lower = higher in list"
                  >
                    <input
                      name="sortOrder"
                      value={form.sortOrder}
                      type="number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 17"
                      className={inputClass(
                        errors.sortOrder,
                        touched.sortOrder,
                        form.sortOrder,
                      )}
                    />
                  </Field>
                </div>
              </>
            )}

            {/* System module warning in edit */}
            {isEdit && editingModule?.is_system === 1 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-amber-700 mb-0.5">
                  System Module
                </p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  This is a built-in module. The module key cannot be changed.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
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
              disabled={saving || (!isEdit && !selectedPreset)}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {saving ? (
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
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Module"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
