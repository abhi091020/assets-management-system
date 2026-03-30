// client/src/components/qr/QRScanner.jsx

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

/**
 * QRScanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Camera-based QR code scanner using html5-qrcode.
 * Extracts the UUID token from the scanned URL and calls onScan(token).
 *
 * Props:
 *   onScan(token)  — called with extracted UUID when a valid QR is scanned
 *   onError(msg)   — called if camera access fails
 */
const QRScanner = ({ onScan, onError }) => {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false); // ← tracks actual running state for safe cleanup
  const [cameraError, setCameraError] = useState(null);

  const SCANNER_ID = "qr-scanner-container";

  useEffect(() => {
    let cancelled = false;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        const config = {
          fps: 15,
          qrbox: { width: 400, height: 400 },
          aspectRatio: 1.777, // 16:9 wider view
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (cancelled) return;

            // Extract UUID token from scanned URL or raw token
            const uuidRegex =
              /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
            const match = decodedText.match(uuidRegex);

            if (match) {
              isRunningRef.current = false;
              scanner
                .stop()
                .catch(() => {})
                .finally(() => {
                  if (!cancelled) onScan(match[0]);
                });
            }
          },
          () => {
            // QR not detected in frame — silent, expected
          },
        );

        // Only mark running if start() resolved without error
        if (!cancelled) {
          isRunningRef.current = true;
        }
      } catch (err) {
        if (cancelled) return;
        isRunningRef.current = false;
        const msg = err?.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access and try again."
          : "Unable to start camera. Please check your device settings.";
        setCameraError(msg);
        if (onError) onError(msg);
      }
    };

    startScanner();

    // ── Cleanup — only stop if scanner actually started ──────────────────────
    return () => {
      cancelled = true;
      if (scannerRef.current && isRunningRef.current) {
        isRunningRef.current = false;
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 bg-red-50 rounded-xl border border-red-200">
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
            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
          />
        </svg>
        <p className="text-sm text-red-600 text-center">{cameraError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scanner viewfinder */}
      <div className="relative w-full rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg">
        <div id={SCANNER_ID} className="w-full" />

        {/* Corner guides overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-md" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-md" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-md" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-md" />
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center">
        Point your camera at an asset QR code
      </p>
    </div>
  );
};

export default QRScanner;
