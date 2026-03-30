// client/src/components/transfers/TransferFilters.jsx
export default function TransferFilters({
  filters,
  onFilterChange,
  onClear,
  totalCount,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex flex-wrap gap-3 items-center">
      <select
        value={filters.status}
        onChange={(e) => onFilterChange("status", e.target.value)}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      {filters.status && (
        <button
          onClick={onClear}
          className="text-xs text-red-600 font-semibold hover:underline"
        >
          Clear Filters
        </button>
      )}

      <div className="ml-auto text-xs text-gray-500">
        {totalCount} transfer{totalCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
