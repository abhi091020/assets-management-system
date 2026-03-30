// client/src/components/assets/detail/AssetPurchaseInfo.jsx

import { AssetInfoCard, DetailRow, IconSvg } from "./AssetInfoCard";
import { formatDate, formatCurrency } from "./detailStyles";

export default function AssetPurchaseInfo({ asset }) {
  return (
    <AssetInfoCard
      title="Purchase Details"
      icon={
        <IconSvg d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      }
    >
      <DetailRow
        idx={0}
        label="Purchase Date"
        value={formatDate(asset.purchase_date)}
      />
      <DetailRow
        idx={1}
        label="Purchase Cost"
        value={formatCurrency(asset.purchase_cost)}
      />
      <DetailRow
        idx={2}
        label="Current Book Value"
        value={formatCurrency(asset.current_book_value)}
      />
      <DetailRow
        idx={3}
        label="Scrap Value"
        value={formatCurrency(asset.scrap_value)}
      />
      <DetailRow idx={4} label="Vendor" value={asset.vendor} />
      <DetailRow idx={5} label="Invoice Number" value={asset.invoice_number} />
      <DetailRow
        idx={6}
        label="Invoice Date"
        value={formatDate(asset.invoice_date)}
      />
    </AssetInfoCard>
  );
}
