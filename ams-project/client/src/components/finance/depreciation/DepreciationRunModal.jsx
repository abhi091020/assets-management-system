// client/src/components/finance/depreciation/DepreciationRunModal.jsx

const base =
  "w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-50";
const normal = `${base} border-gray-200 focus:ring-red-500/20 focus:border-red-400`;
const errCls = `${base} border-red-400 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500`;

function inputClass(error) {
  return error ? errCls : normal;
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default function DepreciationRunModal({
  open,
  onClose,
  mode = "all",
  targetAsset = null,
  form,
  formErrors,
  onFormChange,
  onSubmit,
  isRunning,
  runResult,
  currentFY,
}) {
  if (!open) return null;

  // Generate FY options
  const fyOptions = [];
  const baseFY =
    currentFY ||
    (() => {
      const now = new Date();
      const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      return `${y}-${String(y + 1).slice(-2)}`;
    })();
  const startYear = parseInt(baseFY.split("-")[0]);
  for (let i = 0; i < 5; i++) {
    const y = startYear - i;
    fyOptions.push(`${y}-${String(y + 1).slice(-2)}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === "single"
                ? "Run Depreciation"
                : "Run Depreciation — All Assets"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {mode === "single" && targetAsset
                ? `Asset: ${targetAsset.asset_code} — ${targetAsset.asset_name}`
                : "Applies to all active, non-disposed assets"}
            </p>
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

        <div className="px-6 py-5 space-y-4">
          {/* Method */}
          <Field label="Depreciation Method" required error={formErrors.method}>
            <select
              value={form.method}
              onChange={(e) => onFormChange("method", e.target.value)}
              className={inputClass(formErrors.method)}
            >
              <option value="WDV">WDV — Written Down Value</option>
              <option value="SLM">SLM — Straight Line Method</option>
            </select>
          </Field>

          {/* Rate */}
          <Field
            label="Depreciation Rate (%)"
            required
            error={formErrors.rate}
            hint="e.g. 20 for 20% per year"
          >
            <input
              type="number"
              min="0.01"
              max="99.99"
              step="0.01"
              value={form.rate}
              onChange={(e) => onFormChange("rate", e.target.value)}
              placeholder="e.g. 20"
              className={inputClass(formErrors.rate)}
            />
          </Field>

          {/* Useful Life — SLM only */}
          {form.method === "SLM" && (
            <Field
              label="Useful Life (Years)"
              required
              error={formErrors.usefulLifeYears}
              hint="Total expected useful life of the asset"
            >
              <input
                type="number"
                min="1"
                step="1"
                value={form.usefulLifeYears}
                onChange={(e) =>
                  onFormChange("usefulLifeYears", e.target.value)
                }
                placeholder="e.g. 5"
                className={inputClass(formErrors.usefulLifeYears)}
              />
            </Field>
          )}

          {/* Financial Year */}
          <Field label="Financial Year" required error={formErrors.fy}>
            <select
              value={form.fy}
              onChange={(e) => onFormChange("fy", e.target.value)}
              className={inputClass(formErrors.fy)}
            >
              <option value="">— Select FY —</option>
              {fyOptions.map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy}
                </option>
              ))}
            </select>
          </Field>

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <svg
              className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              />
            </svg>
            <p className="text-xs text-amber-700">
              {mode === "single"
                ? "Re-running will overwrite existing depreciation for this FY + method."
                : "Re-running will overwrite existing depreciation for ALL assets for this FY + method. This cannot be undone."}
            </p>
          </div>

          {/* Bulk Run Result */}
          {runResult && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Run Result
              </p>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-semibold">
                  ✓ {runResult.success} succeeded
                </span>
                {runResult.failed > 0 && (
                  <span className="text-red-600 font-semibold">
                    ✗ {runResult.failed} failed
                  </span>
                )}
              </div>
              {runResult.errors?.length > 0 && (
                <div className="mt-2 max-h-28 overflow-y-auto space-y-1">
                  {runResult.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-500">
                      {e.assetCode}: {e.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium
              text-gray-700 rounded-xl hover:bg-gray-50 transition"
          >
            {runResult ? "Close" : "Cancel"}
          </button>
          {!runResult && (
            <button
              onClick={onSubmit}
              disabled={isRunning}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold
                rounded-xl hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed
                transition flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  Running...
                </>
              ) : (
                "Run Depreciation"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
