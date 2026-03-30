// client/src/components/assets/AssetDeleteModal.jsx

const AssetDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  asset,
  isSubmitting,
}) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-800">
              Delete Asset
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to delete this asset? It will be
              soft-deleted and hidden from all views.
            </p>
          </div>
        </div>

        {/* ── Asset Info ─────────────────────────────────────────────────── */}
        <div className="mx-6 mb-5 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {asset.asset_name}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-mono bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded">
              {asset.asset_code}
            </span>
            {asset.category_name && (
              <span className="text-xs text-gray-400 truncate">
                {asset.category_name}
              </span>
            )}
          </div>
          {asset.location_name && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {asset.location_name}
            </p>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Deleting...
              </>
            ) : (
              "Delete Asset"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDeleteModal;
