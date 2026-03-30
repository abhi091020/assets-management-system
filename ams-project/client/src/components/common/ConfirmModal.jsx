// src/components/common/ConfirmModal.jsx

const ICONS = {
  red: (
    <svg
      className="w-6 h-6 text-red-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  ),
  green: (
    <svg
      className="w-6 h-6 text-green-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  orange: (
    <svg
      className="w-6 h-6 text-orange-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
    </svg>
  ),
  blue: (
    <svg
      className="w-6 h-6 text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const COLORS = {
  red: { iconBg: "bg-red-100", btn: "bg-red-600 hover:bg-red-700" },
  green: { iconBg: "bg-green-100", btn: "bg-green-600 hover:bg-green-700" },
  orange: { iconBg: "bg-orange-100", btn: "bg-orange-500 hover:bg-orange-600" },
  blue: { iconBg: "bg-blue-100", btn: "bg-blue-600 hover:bg-blue-700" },
};

export default function ConfirmModal({
  open,
  title,
  message,
  subText,
  confirmLabel = "Confirm",
  confirmColor = "red",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;
  const c = COLORS[confirmColor] ?? COLORS.red;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-full ${c.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            {ICONS[confirmColor] ?? ICONS.red}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {message && (
              <p className="text-sm text-gray-500 mt-0.5">{message}</p>
            )}
          </div>
        </div>

        {subText && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-2">
            <p className="text-sm font-semibold text-gray-700">{subText}</p>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200
              text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl ${c.btn} text-white text-sm font-semibold
              transition disabled:opacity-60 flex items-center justify-center gap-2`}
          >
            {loading ? (
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
                Please wait...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
