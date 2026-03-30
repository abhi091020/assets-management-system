// client/src/components/finance/amc/AMCStatusBadge.jsx

export default function AMCStatusBadge({ daysRemaining }) {
  if (daysRemaining == null) return null;

  if (daysRemaining < 0) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        Expired {Math.abs(daysRemaining)}d ago
      </span>
    );
  }
  if (daysRemaining <= 30) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
        Critical — {daysRemaining}d left
      </span>
    );
  }
  if (daysRemaining <= 60) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        Warning — {daysRemaining}d left
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      OK — {daysRemaining}d left
    </span>
  );
}
