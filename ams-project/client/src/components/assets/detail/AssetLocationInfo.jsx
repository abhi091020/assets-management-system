// client/src/components/assets/detail/AssetLocationInfo.jsx

import { AssetInfoCard, DetailRow, IconSvg } from "./AssetInfoCard";
import { formatDate } from "./detailStyles";

export default function AssetLocationInfo({ asset }) {
  const isAssigned = !!asset.employee_name;

  const assignedToValue = isAssigned ? (
    `${asset.employee_code ? asset.employee_code + " — " : ""}${asset.employee_name}`
  ) : (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontSize: "12px", fontWeight: 600, padding: "3px 10px",
      borderRadius: "20px", background: "#F1F5F9", color: "#64748B",
    }}>
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      Unassigned
    </span>
  );

  return (
    <>
      <AssetInfoCard
        title="Location & Assignment"
        icon={
          <IconSvg
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            d2="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        }
      >
        <DetailRow idx={0} label="Location"    value={asset.location_name} />
        <DetailRow idx={1} label="Department"  value={asset.dept_name} />
        <DetailRow idx={2} label="Assigned To" value={assignedToValue} />
      </AssetInfoCard>

      <AssetInfoCard
        title="Audit Trail"
        icon={<IconSvg d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
      >
        <DetailRow idx={0} label="Created At"   value={formatDate(asset.created_at)} />
        <DetailRow idx={1} label="Last Updated" value={formatDate(asset.updated_at)} />
      </AssetInfoCard>
    </>
  );
}