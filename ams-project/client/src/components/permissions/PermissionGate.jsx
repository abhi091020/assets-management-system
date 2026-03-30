// client/src/components/permissions/PermissionGate.jsx
import useAuthStore from "../../store/authStore";

/**
 * PermissionGate — renders children only if user has the required permission.
 *
 * Usage:
 *   <PermissionGate module="assets" action="can_add">
 *     <button>Add Asset</button>
 *   </PermissionGate>
 *
 *   <PermissionGate module="assets" action="can_delete" fallback={<span>—</span>}>
 *     <button>Delete</button>
 *   </PermissionGate>
 */
export default function PermissionGate({
  module: moduleKey,
  action,
  children,
  fallback = null,
}) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  if (!hasPermission(moduleKey, action)) return fallback;
  return children;
}
