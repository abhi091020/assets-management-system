// client/src/components/employees/EmployeeForm.jsx

import { useState } from "react";

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
const disCls = `${base} border-gray-200 opacity-60 cursor-not-allowed`;

function inputClass(error, touched, value) {
  if (error) return errCls;
  if (touched && value && !error) return validCls;
  return normal;
}

export default function EmployeeForm({
  open,
  onClose,
  editingEmployee,
  form,
  formErrors,
  setFormErrors,
  onChange,
  onSubmit,
  submitting,
  locations = [],
  departments = [],
  loadingDepts = false,
}) {
  const [touched, setTouched] = useState({});

  if (!open) return null;

  const isEdit = !!editingEmployee;

  function handleChange(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    onChange(e);

    let err = "";
    if (name === "full_name") {
      if (!value.trim()) err = "Full name is required";
      else if (value.trim().length < 2) err = "Name too short";
      else if (value.trim().length > 100) err = "Name too long (max 100)";
    }
    if (
      name === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      err = "Enter a valid email address";
    }
    if (name === "phone" && value && !/^[6-9]\d{9}$/.test(value)) {
      err = "Enter a valid 10-digit Indian mobile number";
    }
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    let err = "";
    if (name === "full_name" && !value.trim()) err = "Full name is required";
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      err = "Enter a valid email address";
    if (name === "phone" && value && !/^[6-9]\d{9}$/.test(value))
      err = "Enter a valid 10-digit Indian mobile number";
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Employee" : "Add New Employee"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? `Editing — ${editingEmployee.full_name}`
                : "Fill in the details below"}
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

        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Auto EMP code info — edit mode */}
            {isEdit && editingEmployee.employee_code && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Employee Code</p>
                  <p className="text-sm font-bold text-gray-800 font-mono">
                    {editingEmployee.employee_code}
                  </p>
                </div>
              </div>
            )}

            {/* Full Name */}
            <Field label="Full Name" required error={formErrors.full_name}>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John Doe"
                className={inputClass(
                  formErrors.full_name,
                  touched.full_name,
                  form.full_name,
                )}
              />
            </Field>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" error={formErrors.email}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="john@company.com"
                  className={inputClass(
                    formErrors.email,
                    touched.email,
                    form.email,
                  )}
                />
              </Field>
              <Field
                label="Phone"
                error={formErrors.phone}
                hint="10-digit mobile"
              >
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  maxLength={10}
                  className={inputClass(
                    formErrors.phone,
                    touched.phone,
                    form.phone,
                  )}
                />
              </Field>
            </div>

            {/* Designation */}
            <Field label="Designation" error={formErrors.designation}>
              <input
                type="text"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Senior Engineer, Manager"
                className={inputClass(
                  formErrors.designation,
                  touched.designation,
                  form.designation,
                )}
              />
            </Field>

            {/* Location */}
            <Field label="Location">
              <select
                name="location_id"
                value={form.location_id}
                onChange={handleChange}
                className={normal}
              >
                <option value="">— Select Location —</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.location_name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Department — cascades from location */}
            <Field label="Department">
              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                disabled={!form.location_id || loadingDepts}
                className={!form.location_id || loadingDepts ? disCls : normal}
              >
                <option value="">
                  {!form.location_id
                    ? "— Select a location first —"
                    : loadingDepts
                      ? "Loading departments..."
                      : "— Select Department —"}
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.dept_name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-0.5">Note</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Employee code (EMP-001, EMP-002...) is auto-generated by the
                system. Assets can be assigned to active employees.
              </p>
            </div>
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
                "Create Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
