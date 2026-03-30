// client/src/components/assets/detail/AssetDetailStatus.jsx

import { useState } from "react";
import AssetStatusBadge from "../AssetStatusBadge";
import AssetConditionBadge from "../AssetConditionBadge";
import { C } from "./detailStyles";

const STATUSES = ["Active", "InRepair", "InTransit", "Disposed", "Missing"];
const STATUS_LABELS = {
  Active: "Active",
  InRepair: "In Repair",
  InTransit: "In Transit",
  Disposed: "Disposed",
  Missing: "Missing",
};

function StatusMenu({ asset, onStatusChange, canManage }) {
  const [open, setOpen] = useState(false);

  if (!canManage) return <AssetStatusBadge status={asset.status} />;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: 0,
        }}
      >
        <AssetStatusBadge status={asset.status} />
        <svg
          width="12"
          height="12"
          fill="none"
          stroke={C.textLight}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "calc(100% + 6px)",
              zIndex: 20,
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              padding: "4px 0",
              minWidth: "140px",
            }}
          >
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onStatusChange(s);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: s === asset.status ? "700" : "400",
                  color: s === asset.status ? C.primary : C.text,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = C.rowHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AssetDetailStatus({
  asset,
  canManage,
  onStatusChange,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      <StatusMenu
        asset={asset}
        onStatusChange={onStatusChange}
        canManage={canManage}
      />
      <AssetConditionBadge condition={asset.condition} />
      {asset.brand && (
        <span
          style={{
            fontSize: "13px",
            color: C.textLight,
            paddingLeft: "4px",
            borderLeft: `1px solid ${C.border}`,
          }}
        >
          &nbsp;{asset.brand}
        </span>
      )}
    </div>
  );
}
