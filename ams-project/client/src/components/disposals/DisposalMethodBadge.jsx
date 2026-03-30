// client/src/components/disposals/DisposalMethodBadge.jsx
export default function DisposalMethodBadge({ method }) {
  const map = {
    Sold: "bg-blue-100 text-blue-700",
    Scrapped: "bg-gray-100 text-gray-700",
    Donated: "bg-purple-100 text-purple-700",
    WriteOff: "bg-orange-100 text-orange-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${map[method] || "bg-gray-100 text-gray-600"}`}
    >
      {method}
    </span>
  );
}
