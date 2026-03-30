// client/src/components/transfers/TransferStatusBadge.jsx
export default function TransferStatusBadge({ status }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Approved: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
    Cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || map.Cancelled}`}
    >
      {status}
    </span>
  );
}
