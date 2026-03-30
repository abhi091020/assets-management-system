// client/src/pages/assets/QRScannerPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRScanner from "../../components/qr/QRScanner";

/**
 * QRScannerPage
 * ─────────────────────────────────────────────────────────────────────────────
 * In-app QR scanner page. Requires login (protected route).
 * On successful scan → navigates to /assets/:id via the asset detail page.
 *
 * Route: /assets/qr
 */
const QRScannerPage = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);
  const [scanned, setScanned] = useState(null);

  // ── Called when QRScanner finds a valid token ─────────────────────────────
  const handleScan = (token) => {
    setScanned(token);
    setScanning(false);
    // Navigate to public scan page — shows full asset info
    setTimeout(() => {
      navigate(`/scan/${token}`);
    }, 800);
  };

  const handleReset = () => {
    setScanning(true);
    setScanned(null);
    setError(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-sm text-gray-500 mt-1">
          Scan an asset QR code to view its details
        </p>
      </div>

      {/* Success state */}
      {scanned && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-green-700">
            QR Code Detected!
          </p>
          <p className="text-xs text-gray-400">
            Redirecting to asset details...
          </p>
        </div>
      )}

      {/* Scanner */}
      {scanning && !scanned && (
        <div className="space-y-4">
          <QRScanner
            onScan={handleScan}
            onError={(msg) => {
              setError(msg);
              setScanning(false);
            }}
          />

          {/* Manual token input fallback */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              No camera? Enter asset code manually:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste QR token or asset code..."
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    handleScan(e.target.value.trim());
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  if (input.value.trim()) handleScan(input.value.trim());
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !scanning && !scanned && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-8 bg-red-50 rounded-xl border border-red-100">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-600 text-center px-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>

          {/* Manual fallback still available on error */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              Enter token manually:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste QR token..."
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    handleScan(e.target.value.trim());
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  if (input.value.trim()) handleScan(input.value.trim());
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScannerPage;
