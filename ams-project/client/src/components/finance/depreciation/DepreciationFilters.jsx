// client/src/components/finance/depreciation/DepreciationFilters.jsx

const METHODS = ["SLM", "WDV"];

export default function DepreciationFilters({
  filters,
  onFilterChange,
  onClearFilters,
  currentFY,
}) {
  const fyOptions = [];
  const now = new Date();
  const calYear =
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const baseYear = currentFY ? parseInt(currentFY.split("-")[0]) : calYear;
  for (let i = 0; i < 5; i++) {
    const y = baseYear - i;
    fyOptions.push(`${y}-${String(y + 1).slice(-2)}`);
  }

  const hasActive =
    (filters.method && filters.method !== "") ||
    (filters.search && filters.search !== "") ||
    (filters.fy && filters.fy !== currentFY);

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
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          placeholder="Search asset code or name..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50"
        />
      </div>

      {/* FY */}
      <select
        value={filters.fy}
        onChange={(e) => onFilterChange("fy", e.target.value)}
        className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400
          bg-gray-50 text-gray-700 min-w-[130px]"
      >
        {fyOptions.map((fy) => (
          <option key={fy} value={fy}>
            FY {fy}
          </option>
        ))}
      </select>

      {/* Method */}
      <select
        value={filters.method}
        onChange={(e) => onFilterChange("method", e.target.value)}
        className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400
          bg-gray-50 text-gray-700 min-w-[130px]"
      >
        <option value="">All Methods</option>
        {METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasActive && (
        <button
          onClick={onClearFilters}
          className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700
            border border-gray-200 rounded-xl hover:bg-gray-50 transition whitespace-nowrap"
        >
          Clear
        </button>
      )}
    </div>
  );
}
