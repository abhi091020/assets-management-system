// client/src/components/employees/EmployeeViewModal.jsx

import EmployeeStatusBadge from "./EmployeeStatusBadge";

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

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr.replace("Z", "")).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function EmployeeViewModal({ employee, onClose }) {
  if (!employee) return null;

  // API already returns dept_name and location_name joined from DB
  const departmentName = employee.dept_name || null;
  const locationName = employee.location_name || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Employee Details</h2>
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {getInitials(employee.full_name)}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">
              {employee.full_name}
            </p>
            {employee.designation && (
              <p className="text-sm text-gray-500 mt-0.5">
                {employee.designation}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {employee.employee_code && (
                <span className="inline-flex px-2 py-0.5 rounded-lg bg-gray-100 text-xs font-mono font-semibold text-gray-600">
                  {employee.employee_code}
                </span>
              )}
              <EmployeeStatusBadge isActive={employee.is_active} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-2">
          <Row label="Email" value={employee.email} />
          <Row label="Phone" value={employee.phone} />
          <Row label="Department" value={departmentName} />
          <Row label="Location" value={locationName} />
          <Row label="Created" value={formatDate(employee.created_at)} />
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
