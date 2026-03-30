// client/src/pages/users/components/UserRoleBadge.jsx

import { ROLE_STYLES } from "../../utils/userHelpers";

export default function UserRoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${ROLE_STYLES[role] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}
    >
      {role}
    </span>
  );
}
