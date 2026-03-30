// client/src/components/verification/VerificationForm.jsx
export default function VerificationForm({
  open,
  onClose,
  form,
  formErrors,
  onChange,
  onSubmit,
  isSubmitting,
  locations,
  departments,
  dropdownsLoading,
}) {
  if (!open) return null;

  // Filter departments to only those belonging to the selected location
  const filteredDepartments = form.locationId
    ? departments.filter(
        (d) => String(d.location_id) === String(form.locationId),
      )
    : departments;

  // When location changes — reset dept if it no longer belongs to new location
  const handleLocationChange = (value) => {
    onChange("locationId", value);
    if (form.departmentId) {
      const stillValid = departments.find(
        (d) =>
          String(d.id) === String(form.departmentId) &&
          String(d.location_id) === String(value),
      );
      if (!stillValid) onChange("departmentId", "");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Create Verification Batch
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Start a new physical asset verification
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <svg
              className="w-5 h-5 text-gray-500"
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {dropdownsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Batch Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => onChange("title", e.target.value)}
                  placeholder="e.g. Monthly Stock Check — March 2026"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    formErrors.title
                      ? "border-red-400 bg-red-50/40"
                      : "border-gray-200"
                  }`}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <svg
                      className="w-3 h-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Location{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={form.locationId}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Locations</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.location_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department — filtered by location */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Department{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={form.departmentId}
                  onChange={(e) => onChange("departmentId", e.target.value)}
                  disabled={!form.locationId}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!form.locationId
                      ? "Select a location first"
                      : filteredDepartments.length === 0
                        ? "No departments for this location"
                        : "All Departments"}
                  </option>
                  {filteredDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.dept_name}
                    </option>
                  ))}
                </select>
                {form.locationId && filteredDepartments.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    No departments found for this location.
                  </p>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Remarks{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.remarks}
                  onChange={(e) => onChange("remarks", e.target.value)}
                  rows={3}
                  placeholder="Any notes for this batch..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Create Batch
          </button>
        </div>
      </div>
    </div>
  );
}
