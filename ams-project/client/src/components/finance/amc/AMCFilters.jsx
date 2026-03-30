// client/src/components/finance/amc/AMCFilters.jsx

import DatePicker from "../../common/DatePicker";

const DAYS_OPTIONS = [
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
  { label: "All", value: 0 },
];

export default function AMCFilters({
  days,
  onDaysChange,
  totalCount,
  type,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}) {
  const itemLabel =
    type === "amc"
      ? totalCount === 1
        ? "AMC contract"
        : "AMC contracts"
      : totalCount === 1
        ? "insurance policy"
        : "insurance policies";

  const showDateRange = days === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
      {/* Row 1 — pills + count */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
            Expiring in
          </span>
          {DAYS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDaysChange(opt.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                days === opt.value
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="sm:ml-auto text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{totalCount}</span>{" "}
          {itemLabel} found
        </div>
      </div>

      {/* Row 2 — date range (only when All is selected) */}
      {showDateRange && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
            Expiry between
          </span>
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <DatePicker
              placeholder="From date"
              value={fromDate}
              onChange={onFromDateChange}
              popupFixed
              containerStyle={{ minWidth: 150, flex: "0 1 160px" }}
            />
            <span className="text-xs text-gray-400 font-medium">to</span>
            <DatePicker
              placeholder="To date"
              value={toDate}
              onChange={onToDateChange}
              popupFixed
              containerStyle={{ minWidth: 150, flex: "0 1 160px" }}
            />
            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  onFromDateChange("");
                  onToDateChange("");
                }}
                className="px-3 py-2 text-xs text-gray-500 border border-gray-200
                  rounded-xl hover:bg-gray-50 transition whitespace-nowrap"
              >
                Clear dates
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
