// client/src/components/assets/AssetViewModal.jsx

import AssetStatusBadge from "./AssetStatusBadge";
import AssetConditionBadge from "./AssetConditionBadge";
import AssetPhotoPanel from "./AssetPhotoPanel";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val.includes("T") ? val : val + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (val) => {
  if (val == null || val === "") return "—";
  return `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4">
    <span className="text-xs text-gray-400 sm:w-40 shrink-0">{label}</span>
    <span className="text-sm text-gray-800 font-medium break-words">
      {value || "—"}
    </span>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {title}
    </h4>
    <div className="space-y-2.5">{children}</div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AssetViewModal = ({ isOpen, onClose, asset, canManage = false }) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-800 truncate">
                {asset.asset_name}
              </h2>
              <AssetStatusBadge status={asset.status} />
              <AssetConditionBadge condition={asset.condition} />
            </div>
            <span className="inline-block mt-1 text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {asset.asset_code}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
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

        {/* ── Scrollable Body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* ── Basic Info ────────────────────────────────────────────────── */}
          <SectionCard title="Basic Information">
            <DetailRow label="Asset Name" value={asset.asset_name} />
            <DetailRow label="Category" value={asset.category_name} />
            <DetailRow label="Description" value={asset.description || "—"} />
          </SectionCard>

          {/* ── Location & Assignment ─────────────────────────────────────── */}
          <SectionCard title="Location & Assignment">
            <DetailRow label="Location" value={asset.location_name} />
            <DetailRow label="Department" value={asset.dept_name} />
            <DetailRow
              label="Assigned Employee"
              value={
                asset.employee_name
                  ? `${asset.employee_code ? asset.employee_code + " — " : ""}${asset.employee_name}`
                  : "Unassigned"
              }
            />
          </SectionCard>

          {/* ── Purchase Details ──────────────────────────────────────────── */}
          <SectionCard title="Purchase Details">
            <DetailRow
              label="Purchase Date"
              value={formatDate(asset.purchase_date)}
            />
            <DetailRow
              label="Purchase Cost"
              value={formatCurrency(asset.purchase_cost)}
            />
            <DetailRow
              label="Scrap Value"
              value={formatCurrency(asset.scrap_value)}
            />
            <DetailRow
              label="Current Book Value"
              value={formatCurrency(asset.current_book_value)}
            />
            <DetailRow label="Vendor" value={asset.vendor} />
            <DetailRow label="Invoice Number" value={asset.invoice_number} />
            <DetailRow
              label="Invoice Date"
              value={formatDate(asset.invoice_date)}
            />
          </SectionCard>

          {/* ── Physical Details ──────────────────────────────────────────── */}
          <SectionCard title="Physical Details">
            <DetailRow label="Serial Number" value={asset.serial_number} />
            <DetailRow label="Model Number" value={asset.model_number} />
            <DetailRow label="Brand" value={asset.brand} />
            <DetailRow label="Color" value={asset.color} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4">
              <span className="text-xs text-gray-400 sm:w-40 shrink-0">
                Condition
              </span>
              <AssetConditionBadge condition={asset.condition} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4">
              <span className="text-xs text-gray-400 sm:w-40 shrink-0">
                Status
              </span>
              <AssetStatusBadge status={asset.status} />
            </div>
          </SectionCard>

          {/* ── Insurance ─────────────────────────────────────────────────── */}
          {(asset.insurance_policy_no ||
            asset.insurance_company ||
            asset.insurance_expiry_date) && (
            <SectionCard title="Insurance">
              <DetailRow
                label="Policy Number"
                value={asset.insurance_policy_no}
              />
              <DetailRow
                label="Insurance Company"
                value={asset.insurance_company}
              />
              <DetailRow
                label="Expiry Date"
                value={formatDate(asset.insurance_expiry_date)}
              />
            </SectionCard>
          )}

          {/* ── AMC ───────────────────────────────────────────────────────── */}
          {(asset.amc_vendor || asset.amc_expiry_date) && (
            <SectionCard title="AMC (Annual Maintenance Contract)">
              <DetailRow label="AMC Vendor" value={asset.amc_vendor} />
              <DetailRow
                label="AMC Expiry Date"
                value={formatDate(asset.amc_expiry_date)}
              />
            </SectionCard>
          )}

          {/* ── Audit Trail ───────────────────────────────────────────────── */}
          <SectionCard title="Audit Trail">
            <DetailRow
              label="Created At"
              value={formatDate(asset.created_at)}
            />
            <DetailRow
              label="Last Updated"
              value={formatDate(asset.updated_at)}
            />
          </SectionCard>

          {/* ── Photos ────────────────────────────────────────────────────── */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Photos
            </h4>
            <AssetPhotoPanel assetId={asset.id} canManage={canManage} />
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetViewModal;
