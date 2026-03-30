// client/src/components/departments/DepartmentViewModal.jsx

import DepartmentStatusBadge from "./DepartmentStatusBadge";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right break-words max-w-[200px]">
        {value || "—"}
      </span>
    </div>
  );
}

function DeptIcon() {
  return (
    <div
      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700
      flex items-center justify-center flex-shrink-0"
    >
      <svg
        className="w-7 h-7 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const clean = dateStr.replace("Z", "");
    return new Date(clean).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function DepartmentViewModal({
  department,
  onClose,
  locations = [],
}) {
  if (!department) return null;

  const locationName =
    locations.find((l) => Number(l.id) === Number(department.location_id))
      ?.location_name ??
    department.location_id ??
    null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Department Details
          </h2>
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

        {/* Icon + name */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <DeptIcon />
          <div>
            <p className="text-base font-bold text-gray-900">
              {department.dept_name}
            </p>
            {department.cost_center && (
              <p className="text-sm text-gray-500 mt-0.5">
                CC: {department.cost_center}
              </p>
            )}
            <div className="mt-1.5">
              <DepartmentStatusBadge isActive={department.is_active} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-2">
          <Row label="Location" value={locationName} />
          <Row label="Cost Center" value={department.cost_center} />
          <Row label="Created" value={formatDate(department.created_at)} />
          <Row label="Last Updated" value={formatDate(department.updated_at)} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-200 text-sm font-medium
              text-gray-700 rounded-xl hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
