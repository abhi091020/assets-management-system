// client/src/components/locations/LocationViewModal.jsx

import LocationStatusBadge from "./LocationStatusBadge";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right break-words max-w-[200px]">
        {value || "—"}
      </span>
    </div>
  );
}

function LocationIcon() {
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
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
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

export default function LocationViewModal({ location, onClose }) {
  if (!location) return null;

  const fullAddress = [
    location.address,
    location.city,
    location.state,
    location.pin_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Location Details</h2>
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
          <LocationIcon />
          <div>
            <p className="text-base font-bold text-gray-900">
              {location.location_name}
            </p>
            {fullAddress && (
              <p className="text-sm text-gray-500 mt-0.5 max-w-[220px] leading-relaxed">
                {fullAddress}
              </p>
            )}
            <div className="mt-1.5">
              <LocationStatusBadge isActive={location.is_active} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-2">
          <Row label="City" value={location.city} />
          <Row label="State" value={location.state} />
          <Row label="PIN Code" value={location.pin_code} />
          <Row label="Created" value={formatDate(location.created_at)} />
          <Row label="Last Updated" value={formatDate(location.updated_at)} />
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
