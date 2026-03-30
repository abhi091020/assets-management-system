// client/src/components/finance/depreciation/DepreciationLedgerDrawer.jsx

function formatINR(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function MethodBadge({ method }) {
  const styles =
    method === "SLM"
      ? "bg-blue-50 text-blue-700 border border-blue-200"
      : "bg-purple-50 text-purple-700 border border-purple-200";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles}`}
    >
      {method}
    </span>
  );
}

export default function DepreciationLedgerDrawer({
  open,
  onClose,
  data,
  loading,
}) {
  if (!open) return null;

  const asset = data?.asset;
  const ledger = data?.ledger || [];

  // Total depreciation across all FYs
  const totalDepreciation = ledger.reduce(
    (sum, row) => sum + parseFloat(row.depreciation_amount || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Depreciation Ledger
            </h2>
            {asset && (
              <p className="text-sm text-gray-500 mt-0.5">
                {asset.asset_code} — {asset.asset_name}
              </p>
            )}
          </div>
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

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <svg
              className="w-8 h-8 animate-spin text-red-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Asset Summary Cards */}
            {asset && (
              <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-gray-100">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium">
                    Purchase Cost
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {formatINR(asset.purchase_cost)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium">
                    Current Book Value
                  </p>
                  <p className="text-sm font-bold text-green-700 mt-0.5">
                    {formatINR(asset.current_book_value)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium">
                    Scrap Value
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {formatINR(asset.scrap_value)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-red-400 font-medium">
                    Total Depreciated
                  </p>
                  <p className="text-sm font-bold text-red-700 mt-0.5">
                    {formatINR(totalDepreciation)}
                  </p>
                </div>
              </div>
            )}

            {/* Ledger Table */}
            {ledger.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-sm text-gray-400">
                  No depreciation records yet
                </p>
              </div>
            ) : (
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Year-by-Year Ledger
                </p>
                <div className="space-y-2">
                  {ledger.map((row, index) => (
                    <div
                      key={row.id}
                      className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full bg-red-100 text-red-600
                            text-xs font-bold flex items-center justify-center"
                          >
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            FY {row.financial_year}
                          </span>
                          <MethodBadge method={row.method} />
                        </div>
                        <span className="text-xs text-gray-400">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleDateString(
                                "en-IN",
                              )
                            : "—"}
                        </span>
                      </div>

                      {/* Values row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-400">Opening Value</p>
                          <p className="text-sm font-medium text-gray-700 mt-0.5">
                            {formatINR(row.opening_value)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-red-400">
                            Depreciation ({row.rate_used}%)
                          </p>
                          <p className="text-sm font-semibold text-red-600 mt-0.5">
                            − {formatINR(row.depreciation_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Closing Value</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                            {formatINR(row.closing_value)}
                          </p>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2">
                        {row.useful_life_years && (
                          <span className="text-xs text-gray-400">
                            Useful life: {row.useful_life_years} yrs
                          </span>
                        )}
                        {row.run_by && (
                          <span className="text-xs text-gray-400">
                            Run by: {row.run_by}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
