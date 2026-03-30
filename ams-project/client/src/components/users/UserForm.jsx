// client/src/components/users/UserForm.jsx

import { useState } from "react";
import {
  ROLES,
  ROLE_DESCRIPTIONS,
  validateField,
} from "../../utils/userHelpers";

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

// ── Input classes ─────────────────────────────────────────────────────────────
const base =
  "w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-50";
const normal = `${base} border-gray-200 focus:ring-red-500/20 focus:border-red-400`;
const errCls = `${base} border-red-400 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500`;
const disCls = `${base} border-gray-200 opacity-60 cursor-not-allowed`;
const validCls = `${base} border-green-400 focus:ring-green-500/20 focus:border-green-500`;

function inputClass(error, touched, value, disabled) {
  if (disabled) return disCls;
  if (error) return errCls;
  if (touched && value && !error) return validCls;
  return normal;
}

// ── Password input with show/hide ─────────────────────────────────────────────
function PasswordInput({ name, value, onChange, placeholder, className }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
      >
        {show ? (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Password strength indicator ───────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-green-500",
  ];
  const textColors = [
    "",
    "text-red-500",
    "text-amber-500",
    "text-blue-500",
    "text-green-600",
  ];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[score]}`}>
        {labels[score]}
      </p>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function UserForm({
  open,
  onClose,
  editingUser,
  form,
  formErrors,
  setFormErrors,
  onChange,
  onSubmit,
  submitting,
  isSuperAdmin,
  locations = [],
  departments = [],
  loadingDepts = false,
}) {
  const [touched, setTouched] = useState({});

  if (!open) return null;

  const isEdit = !!editingUser;
  const emailEditable = !isEdit || isSuperAdmin;

  function handleChange(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    onChange(e);

    const context = {
      isEdit,
      password: name === "password" ? value : form.password,
    };
    const err = validateField(name, value, context);
    setFormErrors((prev) => ({ ...prev, [name]: err }));

    if (name === "password") {
      const cpErr = validateField("confirmPassword", form.confirmPassword, {
        isEdit,
        password: value,
      });
      setFormErrors((prev) => ({ ...prev, confirmPassword: cpErr }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const context = { isEdit, password: form.password };
    const err = validateField(name, value, context);
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit User" : "Add New User"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? `Editing — ${editingUser.full_name}`
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

        {/* Scrollable form body */}
        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Full Name */}
            <Field label="Full Name" required error={formErrors.fullName}>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John Doe"
                className={inputClass(
                  formErrors.fullName,
                  touched.fullName,
                  form.fullName,
                  false,
                )}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" required error={formErrors.email}>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!emailEditable}
                  placeholder="john@company.com"
                  className={inputClass(
                    formErrors.email,
                    touched.email,
                    form.email,
                    !emailEditable,
                  )}
                />
                {isEdit && isSuperAdmin && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full pointer-events-none">
                    SuperAdmin
                  </span>
                )}
              </div>
            </Field>

            {/* Password — add mode only */}
            {!isEdit && (
              <>
                <Field
                  label="Password"
                  required
                  error={formErrors.password}
                  hint="Min 8 chars, 1 uppercase, 1 number"
                >
                  <PasswordInput
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={inputClass(
                      formErrors.password,
                      touched.password,
                      form.password,
                      false,
                    )}
                  />
                  <PasswordStrength password={form.password} />
                </Field>

                <Field
                  label="Confirm Password"
                  required
                  error={formErrors.confirmPassword}
                >
                  <PasswordInput
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={inputClass(
                      formErrors.confirmPassword,
                      touched.confirmPassword,
                      form.confirmPassword,
                      false,
                    )}
                  />
                </Field>
              </>
            )}

            {/* Phone + Role */}
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Phone"
                error={formErrors.phone}
                hint="10-digit mobile number"
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
                    false,
                  )}
                />
              </Field>

              <Field label="Role" required error={formErrors.role}>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass(
                    formErrors.role,
                    touched.role,
                    form.role,
                    false,
                  )}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Role hint — add mode only */}
            {!isEdit && form.role && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-blue-700 mb-0.5">
                  Role Permissions
                </p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  {ROLE_DESCRIPTIONS[form.role]}
                </p>
              </div>
            )}

            {/* Location dropdown */}
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

            {/* Department dropdown — cascades from location */}
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
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
