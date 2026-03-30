// client/src/components/locations/LocationForm.jsx

import { useState } from "react";

// ── Field wrapper ─────────────────────────────────────────────────────────────
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

// ── Input classes ─────────────────────────────────────────────────────────────
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

// ── Main form ─────────────────────────────────────────────────────────────────
export default function LocationForm({
  open,
  onClose,
  editingLocation,
  form,
  formErrors,
  setFormErrors,
  onChange,
  onSubmit,
  submitting,
}) {
  const [touched, setTouched] = useState({});

  if (!open) return null;

  const isEdit = !!editingLocation;

  function handleChange(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    onChange(e);

    // Inline validation
    let err = "";
    if (name === "location_name") {
      if (!value.trim()) err = "Location name is required";
      else if (value.trim().length < 2) err = "Name too short";
      else if (value.trim().length > 100) err = "Name too long (max 100)";
    }
    if (name === "pin_code" && value && !/^\d{0,6}$/.test(value)) return; // only allow digits
    if (
      name === "pin_code" &&
      value &&
      value.length === 6 &&
      !/^\d{6}$/.test(value)
    ) {
      err = "Enter a valid 6-digit PIN code";
    }
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    let err = "";
    if (name === "location_name" && !value.trim())
      err = "Location name is required";
    if (name === "pin_code" && value && !/^\d{6}$/.test(value))
      err = "Enter a valid 6-digit PIN code";
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Location" : "Add New Location"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? `Editing — ${editingLocation.location_name}`
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

        {/* Scrollable form body */}
        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Location Name */}
            <Field
              label="Location Name"
              required
              error={formErrors.location_name}
            >
              <input
                type="text"
                name="location_name"
                value={form.location_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Mumbai Head Office"
                className={inputClass(
                  formErrors.location_name,
                  touched.location_name,
                  form.location_name,
                )}
              />
            </Field>

            {/* Address */}
            <Field label="Address" error={formErrors.address}>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Street address, building name..."
                rows={2}
                className={`${inputClass(formErrors.address, touched.address, form.address)} resize-none`}
              />
            </Field>

            {/* City + State */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" error={formErrors.city}>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Mumbai"
                  className={inputClass(
                    formErrors.city,
                    touched.city,
                    form.city,
                  )}
                />
              </Field>

              <Field label="State" error={formErrors.state}>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Maharashtra"
                  className={inputClass(
                    formErrors.state,
                    touched.state,
                    form.state,
                  )}
                />
              </Field>
            </div>

            {/* PIN Code */}
            <Field
              label="PIN Code"
              error={formErrors.pin_code}
              hint="6-digit Indian postal code (optional)"
            >
              <input
                type="text"
                name="pin_code"
                value={form.pin_code}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="400001"
                maxLength={6}
                className={inputClass(
                  formErrors.pin_code,
                  touched.pin_code,
                  form.pin_code,
                )}
              />
            </Field>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-0.5">Note</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Departments and assets are linked to locations. You can assign
                departments to this location after creation.
              </p>
            </div>
          </div>

          {/* Footer */}
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
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold
                rounded-xl hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed
                transition flex items-center justify-center gap-2"
            >
              {submitting ? (
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
                "Create Location"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
