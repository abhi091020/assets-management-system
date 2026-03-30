// client/src/components/assets/detail/AssetBasicInfo.jsx

import { AssetInfoCard, DetailRow, IconSvg } from "./AssetInfoCard";

export default function AssetBasicInfo({ asset }) {
  return (
    <AssetInfoCard
      title="Basic Information"
      icon={
        <IconSvg d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      }
    >
      <DetailRow idx={0} label="Asset Name" value={asset.asset_name} />
      <DetailRow idx={1} label="Category" value={asset.category_name} />
      <DetailRow idx={2} label="Description" value={asset.description} />
    </AssetInfoCard>
  );
}
