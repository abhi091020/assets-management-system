// client/src/components/locations/LocationFilters.jsx

export default function LocationFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClear,
}) {
  const hasFilters = search || statusFilter;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by name, city or state..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50"
        />
      </div>

      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400
    bg-red-200 text-gray-700 min-w-[140px]" // Changed to red background temporarily
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="shownull">Null</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700
            border border-gray-200 rounded-xl hover:bg-gray-50 transition whitespace-nowrap"
        >
          Clear
        </button>
      )}
    </div>
  );
}
