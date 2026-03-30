// client/src/components/assets/detail/AssetQRPanel.jsx

import QRCodeDisplay from "../../qr/QRCodeDisplay";
import { AssetInfoCard, IconSvg } from "./AssetInfoCard";
import { C, S } from "./detailStyles";

export default function AssetQRPanel({ asset, onScanClick }) {
  return (
    <AssetInfoCard
      title="QR Code"
      icon={
        <IconSvg d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      }
    >
      <div style={{ padding: "16px 20px" }}>
        <QRCodeDisplay
          qrCodeImagePath={asset.qr_code_image_path}
          assetCode={asset.asset_code}
          assetName={asset.asset_name}
        />

        <div
          style={{
            marginTop: "14px",
            paddingTop: "14px",
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <button
            onClick={onScanClick}
            style={S.scanBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#DBEAFE")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#EFF6FF")}
          >
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Scan QR to Verify
          </button>

          <div
            style={{
              fontSize: "11px",
              textAlign: "center",
              color: C.textLight,
              marginTop: "8px",
            }}
          >
            Verify this asset or jump to another
          </div>
        </div>
      </div>
    </AssetInfoCard>
  );
}
