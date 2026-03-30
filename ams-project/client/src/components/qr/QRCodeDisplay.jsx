// client/src/components/qr/QRCodeDisplay.jsx

import { useRef, useState } from "react";

const QRCodeDisplay = ({ qrCodeImagePath, assetCode, assetName }) => {
  const imgRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!qrCodeImagePath) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-sm text-gray-400">QR code not available</p>
      </div>
    );
  }

  const qrUrl = `/${qrCodeImagePath}`;

  // ── Print — Industry Standard Label ───────────────────────────────────────
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=500,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Label — ${assetCode}</title>
          <style>
            @page { size: 100mm 100mm; margin: 0; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #fff;
              font-family: 'Courier New', monospace;
            }
            .label {
              width: 90mm;
              border: 1.5px solid #000;
              border-radius: 4px;
              padding: 6mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 3mm;
            }
            .company { font-size: 9pt; font-weight: bold; letter-spacing: 2px; color: #333; text-transform: uppercase; }
            .qr img { width: 60mm; height: 60mm; display: block; }
            .code { font-size: 11pt; font-weight: bold; letter-spacing: 1.5px; color: #000; }
            .name { font-size: 8pt; color: #555; text-align: center; max-width: 80mm; }
            .divider { width: 100%; border-top: 1px dashed #ccc; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="company">Asset Management System</div>
            <div class="divider"></div>
            <div class="qr"><img src="https://${window.location.host}${qrUrl}" /></div>
            <div class="code">${assetCode}</div>
            <div class="name">${assetName}</div>
            <div class="divider"></div>
            <div class="name">Scan QR to view asset details</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${assetCode}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (_err) {
      window.open(qrUrl, "_blank");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {/* QR Image — clickable to open fullscreen */}
        <div
          className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm cursor-zoom-in hover:shadow-md transition-shadow"
          onClick={() => setModalOpen(true)}
          title="Click to view full size"
        >
          <img
            ref={imgRef}
            src={qrUrl}
            alt={`QR Code for ${assetCode}`}
            className="w-52 h-52 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Asset code label */}
        <div className="text-center">
          <p className="text-xs font-mono font-semibold text-gray-700 tracking-widest">
            {assetCode}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
            {assetName}
          </p>
          <p
            className="text-xs text-blue-400 mt-1 cursor-pointer hover:underline"
            onClick={() => setModalOpen(true)}
          >
            Click QR to view full size
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Label
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Fullscreen QR Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <div className="w-full flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">QR Code</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
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

            {/* Large QR */}
            <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
              <img
                src={qrUrl}
                alt={`QR Code for ${assetCode}`}
                className="w-72 h-72 object-contain"
              />
            </div>

            {/* Labels */}
            <div className="text-center">
              <p className="text-sm font-mono font-bold text-gray-800 tracking-widest">
                {assetCode}
              </p>
              <p className="text-xs text-gray-500 mt-1">{assetName}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Label
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRCodeDisplay;
