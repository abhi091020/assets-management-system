// client/src/components/verification/VerificationFilters.jsx
export default function VerificationFilters({
  filters,
  onFilterChange,
  onClear,
  locations,
  totalCount,
}) {
  const hasFilters = filters.status || filters.locationId;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex flex-wrap gap-3 items-center">
      <select
        value={filters.status}
        onChange={(e) => onFilterChange("status", e.target.value)}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="Closed">Closed</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <select
        value={filters.locationId}
        onChange={(e) => onFilterChange("locationId", e.target.value)}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">All Locations</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.location_name}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={onClear}
          className="text-xs text-red-600 font-semibold hover:underline"
        >
          Clear
        </button>
      )}

      <div className="ml-auto text-xs text-gray-500">
        {totalCount} batch{totalCount !== 1 ? "es" : ""}
      </div>
    </div>
  );
}
