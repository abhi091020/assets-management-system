// client/src/components/users/UserDrawer.jsx

import { ROLES, ROLE_DESCRIPTIONS } from "../../utils/userHelpers";

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
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Input class helpers ───────────────────────────────────────────────────────
const base =
  "w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition";
const normal = `${base} border-gray-200 bg-gray-50`;
const hasError = `${base} border-red-400 bg-red-50`;
const disabled = `${normal} opacity-60 cursor-not-allowed`;

// ── Drawer ────────────────────────────────────────────────────────────────────
export default function UserDrawer({
  open,
  onClose,
  editingUser,
  form,
  formErrors,
  onChange,
  onSubmit,
  submitting,
}) {
  const isEdit = !!editingUser;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
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
            className="w-8 h-8 flex items-center justify-center rounded-xl
              text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
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

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Full Name */}
            <Field label="Full Name" required error={formErrors.fullName}>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="John Doe"
                className={formErrors.fullName ? hasError : normal}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" required error={formErrors.email}>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                disabled={isEdit}
                placeholder="john@company.com"
                className={
                  isEdit ? disabled : formErrors.email ? hasError : normal
                }
              />
            </Field>

            {/* Password — add only */}
            {!isEdit && (
              <Field label="Password" required error={formErrors.password}>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Min. 6 characters"
                  className={formErrors.password ? hasError : normal}
                />
              </Field>
            )}

            {/* Phone */}
            <Field label="Phone" error={formErrors.phone}>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="9876543210"
                className={normal}
              />
            </Field>

            {/* Role */}
            <Field label="Role" required error={formErrors.role}>
              <select
                name="role"
                value={form.role}
                onChange={onChange}
                className={formErrors.role ? hasError : normal}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            {/* Role hint */}
            {form.role && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 -mt-2">
                <p className="text-xs font-semibold text-blue-700 mb-0.5">
                  Permissions
                </p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  {ROLE_DESCRIPTIONS[form.role]}
                </p>
              </div>
            )}

            {/* Department ID */}
            <Field
              label="Department ID"
              hint="Will become a dropdown after master data is built"
            >
              <input
                type="number"
                name="department_id"
                value={form.department_id}
                onChange={onChange}
                placeholder="Optional"
                className={normal}
              />
            </Field>

            {/* Location ID */}
            <Field
              label="Location ID"
              hint="Will become a dropdown after master data is built"
            >
              <input
                type="number"
                name="location_id"
                value={form.location_id}
                onChange={onChange}
                placeholder="Optional"
                className={normal}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-white">
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
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
