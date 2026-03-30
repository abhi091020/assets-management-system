// client/src/components/permissions/RoleFormModal.jsx
import { useState, useEffect } from "react";

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

const EMPTY = { roleName: "", displayName: "", description: "" };

export default function RoleFormModal({
  open,
  onClose,
  editingRole,
  onSave,
  saving,
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouch] = useState({});

  // Pre-fill when editing
  useEffect(() => {
    if (open) {
      if (editingRole) {
        setForm({
          roleName: editingRole.role_name ?? "",
          displayName: editingRole.display_name ?? "",
          description: editingRole.description ?? "",
        });
      } else {
        setForm(EMPTY);
      }
      setErrors({});
      setTouch({});
    }
  }, [open, editingRole]);

  if (!open) return null;
  const isEdit = !!editingRole;

  function validate(name, value) {
    if (name === "roleName") {
      if (!value.trim()) return "Role key is required";
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value.trim()))
        return "Only letters, numbers and underscores. Must start with a letter.";
      if (value.trim().length > 50) return "Max 50 characters";
    }
    if (name === "displayName") {
      if (!value.trim()) return "Display name is required";
      if (value.trim().length > 100) return "Max 100 characters";
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
      roleName: validate("roleName", form.roleName),
      displayName: validate("displayName", form.displayName),
    };
    setErrors(newErrors);
    setTouch({ roleName: true, displayName: true });
    if (Object.values(newErrors).some(Boolean)) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Role" : "Add New Role"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? `Editing — ${editingRole.display_name}`
                : "Create a custom role"}
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
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Role Key — hidden in edit (system constraint) */}
          {!isEdit && (
            <Field
              label="Role Key"
              required
              error={errors.roleName}
              hint="Unique identifier used in code — e.g. AssetManager"
            >
              <input
                name="roleName"
                value={form.roleName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. WarehouseManager"
                className={inputClass(
                  errors.roleName,
                  touched.roleName,
                  form.roleName,
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
              placeholder="e.g. Warehouse Manager"
              className={inputClass(
                errors.displayName,
                touched.displayName,
                form.displayName,
              )}
            />
          </Field>

          {/* Description */}
          <Field label="Description" hint="Optional — what this role can do">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="Describe the responsibilities of this role..."
              className={`${normal} resize-none`}
            />
          </Field>

          {/* System role warning in edit */}
          {isEdit && editingRole?.is_system === 1 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 mb-0.5">
                System Role
              </p>
              <p className="text-xs text-amber-600 leading-relaxed">
                This is a built-in role. Only the display name and description
                can be edited. The role key cannot be changed.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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
                "Create Role"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
