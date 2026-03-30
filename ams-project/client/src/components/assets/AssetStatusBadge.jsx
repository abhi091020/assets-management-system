// client/src/components/assets/AssetStatusBadge.jsx

const STATUS_STYLES = {
  Active: "bg-green-100 text-green-700 border border-green-200",
  InRepair: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  InTransit: "bg-blue-100 text-blue-700 border border-blue-200",
  Disposed: "bg-red-100 text-red-700 border border-red-200",
  Missing: "bg-rose-100 text-rose-800 border border-rose-200",
};

const STATUS_LABELS = {
  Active: "Active",
  InRepair: "In Repair",
  InTransit: "In Transit",
  Disposed: "Disposed",
  Missing: "Missing",
};

const AssetStatusBadge = ({ status }) => {
  const style =
    STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border border-gray-200";
  const label = STATUS_LABELS[status] || status || "—";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
};

export default AssetStatusBadge;
