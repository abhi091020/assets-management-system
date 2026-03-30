// client/src/components/categories/CategoryViewModal.jsx

import CategoryStatusBadge from "./CategoryStatusBadge";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr.replace("Z", "")).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right break-words max-w-[200px]">
        {value ?? "—"}
      </span>
    </div>
  );
}

function AssetTypeBadge({ type }) {
  if (!type)
    return <span className="text-sm font-medium text-gray-400">—</span>;
  const isMovable = type === "Movable";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
      ${
        isMovable
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isMovable ? "bg-green-500" : "bg-slate-400"}`}
      />
      {type}
    </span>
  );
}

function SubcatChips({ subs }) {
  if (!subs.length)
    return <span className="text-sm font-medium text-gray-400">None</span>;
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      {subs.map((s) => (
        <span
          key={s.id}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border
            ${
              s.asset_type === "Static"
                ? "bg-slate-50 text-slate-600 border-slate-200"
                : s.asset_type === "Movable"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
        >
          {s.category_name}
        </span>
      ))}
    </div>
  );
}

function CategoryIcon({ isSub }) {
  return (
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
      ${
        isSub
          ? "bg-gradient-to-br from-slate-400 to-slate-600"
          : "bg-gradient-to-br from-red-500 to-red-700"
      }`}
    >
      <svg
        className="w-7 h-7 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    </div>
  );
}

export default function CategoryViewModal({
  category,
  onClose,
  allCategories = [],
}) {
  if (!category) return null;

  const isSubCat = !!category.parent_category_id;

  const parentName = isSubCat
    ? (allCategories.find(
        (c) => Number(c.id) === Number(category.parent_category_id),
      )?.category_name ?? `ID: ${category.parent_category_id}`)
    : null;

  // Subcategories of this category (only relevant for main cats)
  const subcats = !isSubCat
    ? allCategories.filter(
        (c) => Number(c.parent_category_id) === Number(category.id),
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Category Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400
              hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Identity block ── */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <CategoryIcon isSub={isSubCat} />
          <div>
            <p className="text-base font-bold text-gray-900">
              {category.category_name}
            </p>
            {isSubCat && parentName && (
              <p className="text-sm text-gray-500 mt-0.5">
                Sub-category of: {parentName}
              </p>
            )}
            {!isSubCat && (
              <p className="text-sm text-gray-400 mt-0.5">Main Category</p>
            )}
            <div className="mt-1.5">
              <CategoryStatusBadge isActive={category.is_active} />
            </div>
          </div>
        </div>

        {/* ── Details ── */}
        <div className="px-6 py-2">
          {/* Main cat: show subcategories list */}
          {!isSubCat && (
            <div className="flex items-start justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500 w-36 flex-shrink-0">
                Subcategories
              </span>
              <div className="max-w-[200px]">
                <SubcatChips subs={subcats} />
              </div>
            </div>
          )}

          {/* Sub cat: show asset movement type */}
          {isSubCat && (
            <div className="flex items-start justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500 w-36 flex-shrink-0">
                Movement Type
              </span>
              <AssetTypeBadge type={category.asset_type} />
            </div>
          )}

          <Row label="Created" value={formatDate(category.created_at)} />
          <Row label="Last Updated" value={formatDate(category.updated_at)} />
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-200 text-sm font-medium
              text-gray-700 rounded-xl hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
