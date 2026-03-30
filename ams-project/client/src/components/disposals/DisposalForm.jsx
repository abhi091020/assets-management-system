// client/src/components/disposals/DisposalForm.jsx
import DatePicker from "../common/DatePicker";

export default function DisposalForm({
  open,
  onClose,
  form,
  formErrors,
  onChange,
  onSubmit,
  isSubmitting,
  assets,
  locations,
  departments,
  dropdownsLoading,
  isEditing,
  editingDisposal,
  pendingAssetIds,
}) {
  if (!open) return null;
  const isSold = form.disposalMethod === "Sold";
  const hasScrapValue = ["Scrapped", "WriteOff"].includes(form.disposalMethod);

  const filteredDepts = form.locationId
    ? departments.filter(
        (d) => String(d.location_id) === String(form.locationId),
      )
    : [];

  const filteredAssets = assets.filter((a) => {
    const matchLoc =
      !form.locationId || String(a.location_id) === String(form.locationId);
    const matchDept =
      !form.departmentId ||
      String(a.department_id) === String(form.departmentId);
    return matchLoc && matchDept;
  });

  const availableCount = filteredAssets.filter(
    (a) => !pendingAssetIds?.has(String(a.id)),
  ).length;

  const assetScopeLabel = form.departmentId
    ? `${availableCount} assets available in selected department`
    : form.locationId
      ? `${availableCount} assets available in selected location`
      : "Select a location to filter assets";

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
              {isEditing ? "Edit Disposal" : "Raise Disposal"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing
                ? "Update the disposal request details"
                : "Submit an asset for disposal approval"}
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
              {/* ── Edit mode: asset info card ── */}
              {isEditing && editingDisposal && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Asset
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {editingDisposal.asset_code}{" "}
                    <span className="font-normal text-gray-600">
                      — {editingDisposal.asset_name}
                    </span>
                  </p>
                  {(editingDisposal.location_name ||
                    editingDisposal.dept_name) && (
                    <p className="text-xs text-gray-500">
                      {editingDisposal.location_name}
                      {editingDisposal.location_name &&
                        editingDisposal.dept_name &&
                        " · "}
                      {editingDisposal.dept_name}
                    </p>
                  )}
                </div>
              )}

              {/* ── Location ── */}
              {!isEditing && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Location *
                  </label>
                  <select
                    value={form.locationId}
                    onChange={(e) => onChange("locationId", e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 ${formErrors.locationId ? "border-red-400" : "border-gray-200"}`}
                  >
                    <option value="">Select location...</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.location_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.locationId && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.locationId}
                    </p>
                  )}
                </div>
              )}

              {/* ── Department ── */}
              {!isEditing && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Department *
                  </label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => onChange("departmentId", e.target.value)}
                    disabled={!form.locationId}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.departmentId ? "border-red-400" : "border-gray-200"}`}
                  >
                    <option value="">
                      {!form.locationId
                        ? "Select a location first"
                        : filteredDepts.length === 0
                          ? "No departments for this location"
                          : "Select department..."}
                    </option>
                    {filteredDepts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.dept_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.departmentId && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.departmentId}
                    </p>
                  )}
                </div>
              )}

              {/* ── Asset ── */}
              {!isEditing && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Asset *
                  </label>
                  <select
                    value={form.assetId}
                    onChange={(e) => {
                      if (pendingAssetIds?.has(String(e.target.value))) return;
                      onChange("assetId", e.target.value);
                    }}
                    disabled={!form.locationId}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${formErrors.assetId ? "border-red-400" : "border-gray-200"}`}
                  >
                    <option value="">
                      {!form.locationId
                        ? "Select a location first"
                        : filteredAssets.length === 0
                          ? "No assets available"
                          : "Select asset..."}
                    </option>
                    {filteredAssets.map((a) => {
                      const isPending = pendingAssetIds?.has(String(a.id));
                      return (
                        <option
                          key={a.id}
                          value={a.id}
                          disabled={isPending}
                          style={isPending ? { color: "#9CA3AF" } : {}}
                        >
                          {isPending
                            ? `${a.asset_code} — ${a.asset_name} [Disposal Pending]`
                            : `${a.asset_code} — ${a.asset_name}`}
                        </option>
                      );
                    })}
                  </select>
                  {formErrors.assetId ? (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.assetId}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      {assetScopeLabel}
                    </p>
                  )}
                </div>
              )}

              {/* ── Reason ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Reason *
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => onChange("reason", e.target.value)}
                  rows={3}
                  placeholder="Why is this asset being disposed?"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${formErrors.reason ? "border-red-400" : "border-gray-200"}`}
                />
                {formErrors.reason && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.reason}
                  </p>
                )}
              </div>

              {/* ── Disposal Method ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Disposal Method *
                </label>
                <select
                  value={form.disposalMethod}
                  onChange={(e) => onChange("disposalMethod", e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 ${formErrors.disposalMethod ? "border-red-400" : "border-gray-200"}`}
                >
                  <option value="">Select method...</option>
                  <option value="Sold">Sold</option>
                  <option value="Scrapped">Scrapped</option>
                  <option value="Donated">Donated</option>
                  <option value="WriteOff">Write-Off</option>
                </select>
                {formErrors.disposalMethod && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.disposalMethod}
                  </p>
                )}
              </div>

              {/* ── Sold-only fields ── */}
              {isSold && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Sale Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={form.saleAmount}
                      onChange={(e) => onChange("saleAmount", e.target.value)}
                      placeholder="0.00"
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${formErrors.saleAmount ? "border-red-400" : "border-gray-200"}`}
                    />
                    {formErrors.saleAmount && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.saleAmount}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Buyer Details
                    </label>
                    <input
                      type="text"
                      value={form.buyerDetails}
                      onChange={(e) => onChange("buyerDetails", e.target.value)}
                      placeholder="Buyer name and contact..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}

              {/* ── Scrap Value — for Scrapped / WriteOff ── */}
              {hasScrapValue && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Scrap Value (₹){" "}
                    <span className="text-gray-400 font-normal">
                      (optional — used for depreciation)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={form.scrapValue}
                    onChange={(e) => onChange("scrapValue", e.target.value)}
                    placeholder="0.00"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${formErrors.scrapValue ? "border-red-400" : "border-gray-200"}`}
                  />
                  {formErrors.scrapValue && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.scrapValue}
                    </p>
                  )}
                </div>
              )}

              {/* ── Disposal Date ── */}
              <div>
                <DatePicker
                  label="Disposal Date *"
                  value={form.disposalDate}
                  onChange={(v) => onChange("disposalDate", v)}
                  placeholder="Select disposal date"
                  labelStyle={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: formErrors.disposalDate ? "#EF4444" : "#4B5563",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                  triggerStyle={{
                    padding: "10px 12px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    backgroundColor: "#FFFFFF",
                    borderColor: formErrors.disposalDate
                      ? "#F87171"
                      : "#E5E7EB",
                  }}
                  containerStyle={{ minWidth: 0, flex: "1 1 auto" }}
                />
                {formErrors.disposalDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.disposalDate}
                  </p>
                )}
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
            {isEditing ? "Update Disposal" : "Raise Disposal"}
          </button>
        </div>
      </div>
    </div>
  );
}
