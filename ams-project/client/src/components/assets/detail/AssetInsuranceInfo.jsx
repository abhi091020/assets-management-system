// client/src/components/assets/detail/AssetInsuranceInfo.jsx

import { AssetInfoCard, DetailRow, IconSvg } from "./AssetInfoCard";
import { formatDate } from "./detailStyles";

export default function AssetInsuranceInfo({ asset }) {
  const hasData =
    asset.insurance_policy_no ||
    asset.insurance_company ||
    asset.insurance_expiry_date;

  if (!hasData) return null;

  return (
    <AssetInfoCard
      title="Insurance"
      icon={
        <IconSvg d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      }
    >
      <DetailRow
        idx={0}
        label="Policy Number"
        value={asset.insurance_policy_no}
      />
      <DetailRow
        idx={1}
        label="Insurance Company"
        value={asset.insurance_company}
      />
      <DetailRow
        idx={2}
        label="Expiry Date"
        value={formatDate(asset.insurance_expiry_date)}
      />
    </AssetInfoCard>
  );
}
