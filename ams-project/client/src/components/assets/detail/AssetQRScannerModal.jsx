// client/src/components/assets/detail/AssetQRScannerModal.jsx

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
import { getAssetByToken } from "../../../api/scanApi";
import { C } from "./detailStyles";

export default function AssetQRScannerModal({
  isOpen,
  onClose,
  currentAssetCode,
  currentQrToken,
  onAssetFound,
}) {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);
  const [scanResult, setScanResult] = useState(null); // null | "match" | "different"
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  // ── stop ────────────────────────────────────────────────────────────────────
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        /* already stopped */
      }
      isRunningRef.current = false;
    }
  }, []);

  // ── start ───────────────────────────────────────────────────────────────────
  const startScanner = useCallback(async () => {
    if (isRunningRef.current) return;
    setScanResult(null);
    setError(null);
    setScanning(true);

    try {
      const scanner = new Html5Qrcode("qr-inline-scanner");
      scannerRef.current = scanner;
      isRunningRef.current = true;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          await stopScanner();
          setScanning(false);

          let token = decodedText.trim();
          const match = token.match(/\/scan\/([a-f0-9-]{36})$/i);
          if (match) token = match[1];

          if (token === currentQrToken) {
            setScanResult("match");
            toast.success(`✅ Verified — ${currentAssetCode}`);
          } else {
            const res = await getAssetByToken(token);
            if (res.success) {
              setScanResult("different");
              onAssetFound(res.data);
            } else {
              setError("QR code not recognised. Try again.");
            }
          }
        },
        () => {},
      );
    } catch (err) {
      isRunningRef.current = false;
      setScanning(false);
      setError("Camera access denied or not available.");
      console.error("[AssetQRScannerModal]", err);
    }
  }, [currentQrToken, currentAssetCode, stopScanner, onAssetFound]);

  // ── lifecycle ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(startScanner, 200);
      return () => clearTimeout(t);
    } else {
      stopScanner();
      setScanResult(null);
      setError(null);
      setScanning(false);
    }
  }, [isOpen, startScanner, stopScanner]);

  if (!isOpen) return null;

  // ── helpers ──────────────────────────────────────────────────────────────────
  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const iconBox = (bg, children) => (
    <div
      style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
        onClick={handleClose}
      >
        <div
          style={{
            background: C.white,
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            width: "100%",
            maxWidth: "360px",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ────────────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "#DBEAFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="#1D4ED8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <div>
                <div
                  style={{ fontWeight: "700", fontSize: "13px", color: C.text }}
                >
                  Scan QR Code
                </div>
                <div style={{ fontSize: "11px", color: C.textLight }}>
                  Verify or navigate to asset
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "8px",
                color: C.textLight,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.rowZebra)
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <svg
                width="18"
                height="18"
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
            </button>
          </div>

          {/* ── Current asset hint ────────────────────────────────────────── */}
          <div
            style={{
              margin: "12px 20px",
              padding: "8px 12px",
              background: C.rowZebra,
              borderRadius: "8px",
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              stroke={C.textLight}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span style={{ fontSize: "12px", color: C.textLight }}>
              Current:{" "}
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: "700",
                  color: C.text,
                }}
              >
                {currentAssetCode}
              </span>
            </span>
          </div>

          {/* ── Body ──────────────────────────────────────────────────────── */}
          <div style={{ padding: "0 20px 20px" }}>
            {/* Match */}
            {scanResult === "match" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  padding: "24px 0",
                }}
              >
                {iconBox(
                  "#DCFCE7",
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#15803D"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>,
                )}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "14px",
                      color: "#15803D",
                    }}
                  >
                    Asset Verified!
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: C.textLight,
                      marginTop: "4px",
                    }}
                  >
                    QR matches{" "}
                    <span
                      style={{ fontFamily: "monospace", fontWeight: "700" }}
                    >
                      {currentAssetCode}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setScanResult(null);
                    startScanner();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "#2563EB",
                    textDecoration: "underline",
                  }}
                >
                  Scan again
                </button>
              </div>
            )}

            {/* Different */}
            {scanResult === "different" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  padding: "24px 0",
                }}
              >
                {iconBox(
                  "#DBEAFE",
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#1D4ED8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>,
                )}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "14px",
                      color: "#1D4ED8",
                    }}
                  >
                    Different Asset Found
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: C.textLight,
                      marginTop: "4px",
                    }}
                  >
                    Navigating to scanned asset…
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && !scanResult && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 0",
                }}
              >
                {iconBox(
                  "#FEE2E2",
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="#DC2626"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>,
                )}
                <div
                  style={{
                    fontSize: "13px",
                    color: "#DC2626",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    startScanner();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "#2563EB",
                    textDecoration: "underline",
                  }}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Camera feed */}
            {!scanResult && !error && (
              <>
                <div
                  style={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "2px solid #BFDBFE",
                    background: "#000",
                  }}
                >
                  <div
                    id="qr-inline-scanner"
                    style={{ width: "100%", height: "280px" }}
                  />
                  {scanning && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "32px",
                          right: "32px",
                          height: "2px",
                          background: "rgba(96,165,250,0.8)",
                          top: "50%",
                          boxShadow: "0 0 8px rgba(96,165,250,0.9)",
                          animation: "scanline 2s ease-in-out infinite",
                        }}
                      />
                      {[
                        {
                          top: "12px",
                          left: "12px",
                          borderTop: "2px solid",
                          borderLeft: "2px solid",
                        },
                        {
                          top: "12px",
                          right: "12px",
                          borderTop: "2px solid",
                          borderRight: "2px solid",
                        },
                        {
                          bottom: "12px",
                          left: "12px",
                          borderBottom: "2px solid",
                          borderLeft: "2px solid",
                        },
                        {
                          bottom: "12px",
                          right: "12px",
                          borderBottom: "2px solid",
                          borderRight: "2px solid",
                        },
                      ].map((pos, i) => (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            width: "20px",
                            height: "20px",
                            borderColor: "#60A5FA",
                            borderRadius: "2px",
                            ...pos,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    textAlign: "center",
                    color: C.textLight,
                    marginTop: "10px",
                  }}
                >
                  Hold QR code steady inside the frame
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(-55px); opacity: 0.5; }
          50%       { transform: translateY(55px);  opacity: 1;   }
        }
      `}</style>
    </>
  );
}
