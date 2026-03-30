// client/src/utils/userHelpers.js

export const ROLES = [
  "SuperAdmin",
  "Admin",
  "AssetManager",
  "Auditor",
  "Viewer",
];

export const ROLE_STYLES = {
  SuperAdmin: "bg-purple-100 text-purple-700 border border-purple-200",
  Admin: "bg-blue-100 text-blue-700 border border-blue-200",
  AssetManager: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Auditor: "bg-amber-100 text-amber-700 border border-amber-200",
  Viewer: "bg-gray-100 text-gray-600 border border-gray-200",
};

export const ROLE_DESCRIPTIONS = {
  SuperAdmin: "Full system access — all APIs, hard delete, settings",
  Admin: "User management, approvals, depreciation, master data",
  AssetManager: "Add/edit assets, QR codes, transfers, manage employees",
  Auditor: "Scan QR codes and verify assets physically",
  Viewer: "Read-only access to all data",
};

export const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  role: "Viewer",
  department_id: "",
  location_id: "",
};

// ── Date + time ───────────────────────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const normalized =
    typeof dateStr === "string" ? dateStr.replace(/Z$/, "") : dateStr;
  return new Date(normalized).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Resolves a profile photo URL for display.
 *
 * Vite proxies both /api and /uploads → Express, so relative paths like
 * "/uploads/profile-photos/x.jpg" work perfectly without cross-origin issues.
 * Never convert to an absolute URL — that bypasses the proxy and causes
 * ERR_BLOCKED_BY_RESPONSE.NotSameOrigin.
 */
export function resolvePhotoUrl(url) {
  if (!url) return null;
  return url; // relative → Vite proxy handles it; absolute → passes through
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ── Real-time single field validation ─────────────────────────────────────────
export function validateField(name, value, context = {}) {
  const { isEdit = false, password = "" } = context;

  switch (name) {
    case "fullName":
      if (!value.trim()) return "Full name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      if (value.trim().length > 100) return "Name too long (max 100 chars)";
      if (!/^[a-zA-Z\s'-]+$/.test(value.trim()))
        return "Only letters, spaces, hyphens allowed";
      return "";
    case "email":
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Enter a valid email address";
      return "";
    case "password":
      if (isEdit) return "";
      if (!value) return "Password is required";
      if (value.length < 8) return "Minimum 8 characters";
      if (!/[A-Z]/.test(value))
        return "Must include at least one uppercase letter";
      if (!/[0-9]/.test(value)) return "Must include at least one number";
      return "";
    case "confirmPassword":
      if (isEdit) return "";
      if (!value) return "Please confirm your password";
      if (value !== password) return "Passwords do not match";
      return "";
    case "phone":
      if (!value) return "";
      if (!/^[6-9]\d{9}$/.test(value.replace(/\s/g, "")))
        return "Enter a valid 10-digit Indian mobile number";
      return "";
    case "role":
      if (!value) return "Role is required";
      return "";
    default:
      return "";
  }
}

// ── Full form submit validation ───────────────────────────────────────────────
export function validateUserForm(form, isEdit = false) {
  const errors = {};
  const context = { isEdit, password: form.password };

  ["fullName", "email", "role", "phone"].forEach((f) => {
    const err = validateField(f, form[f], context);
    if (err) errors[f] = err;
  });

  if (!isEdit) {
    const pwErr = validateField("password", form.password, context);
    if (pwErr) errors.password = pwErr;

    const cpErr = validateField(
      "confirmPassword",
      form.confirmPassword,
      context,
    );
    if (cpErr) errors.confirmPassword = cpErr;
  }

  return errors;
}
