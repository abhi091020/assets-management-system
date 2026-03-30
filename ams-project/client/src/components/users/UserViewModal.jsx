// client/src/components/users/UserViewModal.jsx

import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import { formatDate, getInitials } from "../../utils/userHelpers";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">
        {value || "—"}
      </span>
    </div>
  );
}

export default function UserViewModal({
  user,
  onClose,
  locations = [],
  departments = [],
}) {
  if (!user) return null;

  const locationName =
    locations.find((l) => l.id === user.location_id)?.location_name ??
    user.location_id ??
    null;

  const departmentName =
    departments.find((d) => d.id === user.department_id)?.dept_name ??
    user.department_id ??
    null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">User Details</h2>
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

        {/* Avatar + name */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            {user.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt={user.full_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.innerText = getInitials(user.full_name);
                }}
              />
            ) : (
              <span className="text-white text-lg font-bold">
                {getInitials(user.full_name)}
              </span>
            )}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">
              {user.full_name}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge isActive={user.is_active} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-2">
          <Row label="Phone" value={user.phone} />
          <Row label="Department" value={departmentName} />
          <Row label="Location" value={locationName} />
          <Row label="Last Login" value={formatDate(user.last_login_at)} />
          <Row label="Created" value={formatDate(user.created_at)} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
