// client/src/components/assets/AssetFilters.jsx

import { useRef } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "InRepair", label: "In Repair" },
  { value: "InTransit", label: "In Transit" },
  { value: "Disposed", label: "Disposed" },
  { value: "Missing", label: "Missing" },
];

const CONDITION_OPTIONS = [
  { value: "", label: "All Conditions" },
  { value: "New", label: "New" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
  { value: "Scrap", label: "Scrap" },
];

const AssetFilters = ({
  filters,
  onSearchChange,
  onFilterChange,
  onClearFilters,
  locations = [],
  categories = [],
  filterDepartments = [],
}) => {
  const searchRef = useRef(null);

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.categoryId ||
    filters.locationId ||
    filters.departmentId ||
    filters.condition;

  const handleClear = () => {
    if (searchRef.current) searchRef.current.value = "";
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      {/* Row 1 — Search + Status + Condition */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search asset name, code, serial, brand..."
            defaultValue={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px]"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Condition */}
        <select
          value={filters.condition}
          onChange={(e) => onFilterChange("condition", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[150px]"
        >
          {CONDITION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Row 2 — Category + Location + Department + Clear */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category */}
        <select
          value={filters.categoryId}
          onChange={(e) => onFilterChange("categoryId", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex-1"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.category_name}
            </option>
          ))}
        </select>

        {/* Location */}
        <select
          value={filters.locationId}
          onChange={(e) => onFilterChange("locationId", e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex-1"
        >
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.location_name}
            </option>
          ))}
        </select>

        {/* Department — cascades from location */}
        <select
          value={filters.departmentId}
          onChange={(e) => onFilterChange("departmentId", e.target.value)}
          disabled={!filters.locationId}
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {filters.locationId ? "All Departments" : "Select location first"}
          </option>
          {filterDepartments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.dept_name}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetFilters;
