// client/src/components/categories/CategoryForm.jsx
import { useState, useEffect, useRef } from "react";

const base =
  "w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition";
const normal = `${base} border-gray-200 bg-gray-50 focus:ring-red-500/20 focus:border-red-400`;
const okCls = `${base} border-green-400 bg-green-50 focus:ring-green-500/20 focus:border-green-400`;
const warnCls = `${base} border-amber-400 bg-amber-50 focus:ring-amber-500/20 focus:border-amber-400`;
const errCls = `${base} border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400`;

function StatusMsg({ type, message }) {
  if (!message) return null;
  const cfg = {
    exists: {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    new: {
      bg: "bg-green-50 border-green-200 text-green-700",
      d: "M5 13l4 4L19 7",
    },
    error: {
      bg: "bg-red-50 border-red-200 text-red-600",
      d: "M6 18L18 6M6 6l12 12",
    },
  };
  const c = cfg[type] || cfg.exists;
  return (
    <div
      className={`mt-2 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border ${c.bg}`}
    >
      <svg
        className="w-3.5 h-3.5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={c.d} />
      </svg>
      {message}
    </div>
  );
}

function Spinner() {
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      Checking...
    </div>
  );
}

function SectionHeader({ title, isOpen, onToggle, statusDot }) {
  const dotColor =
    statusDot === "ok"
      ? "bg-green-500"
      : statusDot === "warn"
        ? "bg-amber-400"
        : statusDot === "error"
          ? "bg-red-500"
          : "";
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 group"
    >
      <div className="flex items-center gap-2.5">
        {statusDot && (
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
        )}
        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition">
          {title}
        </span>
      </div>
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
        ${isOpen ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}`}
      >
        {isOpen ? (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        ) : (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        )}
      </div>
    </button>
  );
}

function SubChips({ subs }) {
  if (!subs.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {subs.map((s) => (
        <span
          key={s.id}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border
          ${
            s.asset_type === "Static"
              ? "bg-slate-50 text-slate-600 border-slate-200"
              : s.asset_type === "Movable"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${s.asset_type === "Static" ? "bg-slate-400" : s.asset_type === "Movable" ? "bg-green-400" : "bg-gray-400"}`}
          />
          {s.category_name}
        </span>
      ))}
    </div>
  );
}

function TypePills({ value, onChange }) {
  const opts = [
    { key: null, label: "None", color: "gray" },
    { key: "Movable", label: "Movable", color: "green" },
    { key: "Static", label: "Static", color: "slate" },
  ];
  const styles = {
    gray: {
      active: "bg-gray-100 border-gray-400 text-gray-700",
      inactive: "border-gray-200 text-gray-400 hover:border-gray-300",
    },
    green: {
      active: "bg-green-50 border-green-500 text-green-700",
      inactive: "border-gray-200 text-gray-400 hover:border-green-300",
    },
    slate: {
      active: "bg-slate-50 border-slate-500 text-slate-700",
      inactive: "border-gray-200 text-gray-400 hover:border-slate-300",
    },
  };
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">
        Asset Movement Type <span className="text-gray-300">(optional)</span>
      </p>
      <div className="flex gap-2">
        {opts.map(({ key, label, color }) => {
          const active = value === key;
          const s = styles[color];
          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(key)}
              className={`flex-1 py-2 px-3 border-2 rounded-xl text-xs font-semibold transition-all ${active ? s.active : s.inactive}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypeToggle({ value, onChange }) {
  const opts = [
    {
      key: null,
      label: "None",
      sub: "Not specified",
      ac: "none",
      iconPath: ["M6 18L18 6M6 6l12 12"],
    },
    {
      key: "Movable",
      label: "Movable",
      sub: "Can be transferred",
      ac: "green",
      iconPath: [
        "M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z",
        "M1 3h15v11H1zm15 5h4l3 3v4h-7V8z",
      ],
    },
    {
      key: "Static",
      label: "Static",
      sub: "Fixed, non-transferable",
      ac: "slate",
      iconPath: [
        "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h2m4 0h2M9 7h2m4 0h2",
      ],
    },
  ];
  const colors = {
    none: {
      border: "border-gray-400 bg-gray-50",
      iconBg: "bg-gray-100",
      text: "text-gray-600",
      iconCol: "text-gray-500",
      check: "bg-gray-400",
    },
    green: {
      border: "border-green-500 bg-green-50",
      iconBg: "bg-green-100",
      text: "text-green-700",
      iconCol: "text-green-600",
      check: "bg-green-500",
    },
    slate: {
      border: "border-slate-500 bg-slate-50",
      iconBg: "bg-slate-100",
      text: "text-slate-700",
      iconCol: "text-slate-600",
      check: "bg-slate-500",
    },
  };
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map(({ key, label, sub, ac, iconPath }) => {
        const active = value === key;
        const c = colors[ac];
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all text-center
              ${active ? c.border : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? c.iconBg : "bg-white border border-gray-200"}`}
            >
              <svg
                className={`w-4 h-4 ${active ? c.iconCol : "text-gray-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                {iconPath.map((d, i) => (
                  <path
                    key={i}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={d}
                  />
                ))}
              </svg>
            </div>
            <div>
              <p
                className={`text-xs font-semibold ${active ? c.text : "text-gray-600"}`}
              >
                {label}
              </p>
              <p className="text-xs text-gray-400 leading-tight">{sub}</p>
            </div>
            {active && (
              <div
                className={`w-4 h-4 rounded-full ${c.check} flex items-center justify-center flex-shrink-0`}
              >
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function CloseBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
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
  );
}

function SpinLabel({ label }) {
  return (
    <>
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      {label}
    </>
  );
}

export default function CategoryForm({
  open,
  onClose,
  editingCategory,
  form,
  formErrors,
  setFormErrors,
  onChange,
  onSubmit,
  submitting,
  allCategories = [],
}) {
  const isEdit = !!editingCategory;

  // ── Create mode state ─────────────────────────────────────────────────────
  const [catInput, setCatInput] = useState("");
  const [subInput, setSubInput] = useState("");
  const [subAssetType, setSubAssetType] = useState(null);
  const [subOpen, setSubOpen] = useState(false);
  const [catResolved, setCatResolved] = useState("");
  const [catChecking, setCatChecking] = useState(false);
  const [subResolved, setSubResolved] = useState("");
  const [subChecking, setSubChecking] = useState(false);

  // ── Edit mode state ───────────────────────────────────────────────────────
  const [editName, setEditName] = useState("");
  const [editAssetType, setEditAssetType] = useState(null);
  // For editing a main category: optional add-subcategory section
  const [editSubOpen, setEditSubOpen] = useState(false);
  const [editSubName, setEditSubName] = useState("");
  const [editSubType, setEditSubType] = useState(null);

  const catTimer = useRef(null);
  const subTimer = useRef(null);

  // ── Reset when form opens ─────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      if (isEdit) {
        // FIX: always load category_name into editName (works for both main & subcat)
        setEditName(editingCategory.category_name || "");
        // FIX: load actual asset_type from DB record — null/Movable/Static
        setEditAssetType(editingCategory.asset_type ?? null);
        // Reset add-sub section
        setEditSubOpen(false);
        setEditSubName("");
        setEditSubType(null);
      } else {
        setCatInput("");
        setSubInput("");
        setSubAssetType(null);
        setSubOpen(false);
        setCatResolved("");
        setCatChecking(false);
        setSubResolved("");
        setSubChecking(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingCategory?.id]);

  // ── Auto-open subcat section when existing cat matched ────────────────────
  useEffect(() => {
    if (!catChecking && catResolved) {
      const topLevel = allCategories.filter((c) => !c.parent_category_id);
      const matched = topLevel.find(
        (c) => c.category_name.toLowerCase() === catResolved,
      );
      if (matched) setSubOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catResolved, catChecking]);

  // ── Auto-collapse subcat only if no matched parent ────────────────────────
  useEffect(() => {
    if (!subInput.trim() && subOpen) {
      const topLevel = allCategories.filter((c) => !c.parent_category_id);
      const matched = catResolved
        ? topLevel.find((c) => c.category_name.toLowerCase() === catResolved)
        : null;
      if (!matched) {
        setSubOpen(false);
        setSubAssetType(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subInput]);

  // ── Cat debounce ──────────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(catTimer.current);
    if (!catInput.trim()) {
      setCatChecking(false);
      setCatResolved("");
      setSubOpen(false);
      return;
    }
    setCatChecking(true);
    setCatResolved("");
    catTimer.current = setTimeout(() => {
      setCatChecking(false);
      setCatResolved(catInput.trim().toLowerCase());
    }, 2000);
    return () => clearTimeout(catTimer.current);
  }, [catInput]);

  // ── Sub debounce ──────────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(subTimer.current);
    if (!subInput.trim()) {
      setSubChecking(false);
      setSubResolved("");
      return;
    }
    setSubChecking(true);
    setSubResolved("");
    subTimer.current = setTimeout(() => {
      setSubChecking(false);
      setSubResolved(subInput.trim().toLowerCase());
    }, 2000);
    return () => clearTimeout(subTimer.current);
  }, [subInput]);

  if (!open) return null;

  // ══════════════════════════════════════════════════════════════════════════
  // EDIT MODE
  // ══════════════════════════════════════════════════════════════════════════
  if (isEdit) {
    const isSubCat = !!editingCategory.parent_category_id;

    // Existing subcategories under this main cat (for chips preview)
    const existingSubsForEdit = !isSubCat
      ? allCategories.filter((c) => c.parent_category_id === editingCategory.id)
      : [];

    const saveLabel = editSubName.trim()
      ? "Save & Add Subcategory"
      : "Save Changes";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Edit {isSubCat ? "Subcategory" : "Category"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Editing — {editingCategory.category_name}
              </p>
            </div>
            <CloseBtn onClick={onClose} />
          </div>

          <div className="overflow-y-auto flex-1">
            <form
              id="cat-edit-form"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(e, {
                  mode: "edit",
                  catName: editName.trim(),
                  assetType: isSubCat ? editAssetType : null,
                  // Pass add-sub data only for main cat edits
                  newSubName:
                    !isSubCat && editSubName.trim() ? editSubName.trim() : null,
                  newSubType: !isSubCat ? editSubType : null,
                });
              }}
            >
              <div className="px-6 divide-y divide-gray-100">
                {/* ── Name field ──────────────────────────────── */}
                <div className="py-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isSubCat ? "Subcategory" : "Category"} Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoComplete="off"
                    maxLength={100}
                    placeholder="Name"
                    className={editName.trim() ? okCls : normal}
                    autoFocus
                  />
                </div>

                {/* ── Type toggle — subcats only ───────────────── */}
                {isSubCat && (
                  <div className="py-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Asset Movement Type{" "}
                      <span className="font-normal normal-case text-gray-300">
                        (optional)
                      </span>
                    </p>
                    <TypeToggle
                      value={editAssetType}
                      onChange={setEditAssetType}
                    />
                  </div>
                )}

                {/* ── Add Subcategory section — main cats only ─── */}
                {!isSubCat && (
                  <div className="py-1">
                    <SectionHeader
                      title="Add Subcategory"
                      isOpen={editSubOpen}
                      onToggle={() => {
                        setEditSubOpen((v) => !v);
                        if (editSubOpen) {
                          setEditSubName("");
                          setEditSubType(null);
                        }
                      }}
                      statusDot={editSubName.trim() ? "ok" : null}
                    />
                    {editSubOpen && (
                      <div className="pb-5 space-y-4">
                        {/* Existing subcats chips */}
                        {existingSubsForEdit.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1.5">
                              Already exists:
                            </p>
                            <SubChips subs={existingSubsForEdit} />
                          </div>
                        )}
                        {existingSubsForEdit.length === 0 && (
                          <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                            <p className="text-xs text-blue-700 font-medium">
                              No subcategories yet — add one below
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1.5">
                            Subcategory Name{" "}
                            <span className="text-red-400">*</span>
                          </p>
                          <input
                            type="text"
                            value={editSubName}
                            onChange={(e) => setEditSubName(e.target.value)}
                            autoComplete="off"
                            maxLength={100}
                            placeholder="e.g. Laptop, AC, Server Rack"
                            className={editSubName.trim() ? okCls : normal}
                          />
                        </div>
                        <TypePills
                          value={editSubType}
                          onChange={setEditSubType}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="cat-edit-form"
              disabled={!editName.trim() || submitting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl
                hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition
                flex items-center justify-center gap-2"
            >
              {submitting ? <SpinLabel label="Saving..." /> : saveLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CREATE MODE
  // ══════════════════════════════════════════════════════════════════════════
  const topLevel = allCategories.filter((c) => !c.parent_category_id);
  const matchedCat = catResolved
    ? topLevel.find((c) => c.category_name.toLowerCase() === catResolved)
    : null;
  const existingSubs = matchedCat
    ? allCategories.filter((c) => c.parent_category_id === matchedCat.id)
    : [];
  const matchedSub =
    subResolved && matchedCat
      ? existingSubs.find((s) => s.category_name.toLowerCase() === subResolved)
      : null;

  const catChecked = !catChecking && !!catResolved;
  const subChecked = !subChecking && !!subResolved;
  const catIsNew = catChecked && !matchedCat;
  const subIsNew = subChecked && !matchedSub;
  const subIsDupe = subChecked && !!matchedSub;

  let mode = "nothing";
  if (catIsNew && !subInput.trim()) mode = "cat_only";
  if (catIsNew && subIsNew) mode = "cat_and_sub";
  if (!catIsNew && matchedCat && subIsNew) mode = "sub_only";

  const canCreate =
    !submitting && mode !== "nothing" && !!catInput.trim() && !subIsDupe;

  let catStatus = null,
    catStyle = normal;
  if (!catChecking && catResolved) {
    if (matchedCat) {
      catStatus = {
        type: "exists",
        message: `"${matchedCat.category_name}" already exists — add a subcategory below`,
      };
      catStyle = warnCls;
    } else {
      catStatus = { type: "new", message: `"${catInput.trim()}" is new` };
      catStyle = okCls;
    }
  }

  let subStatus = null,
    subStyle = normal;
  if (!subChecking && subResolved) {
    if (subIsDupe) {
      subStatus = {
        type: "error",
        message: `"${matchedSub.category_name}" already exists under "${matchedCat.category_name}"`,
      };
      subStyle = errCls;
    } else if (subIsNew && matchedCat) {
      subStatus = {
        type: "new",
        message: `"${subInput.trim()}" will be added under "${matchedCat.category_name}"`,
      };
      subStyle = okCls;
    } else if (subIsNew) {
      subStatus = { type: "new", message: `"${subInput.trim()}" is new` };
      subStyle = okCls;
    }
  }

  const subDot = !subOpen
    ? subIsDupe
      ? "error"
      : subInput.trim() && !subChecking && subResolved
        ? "ok"
        : null
    : null;

  const btnLabel =
    mode === "sub_only"
      ? "Add Subcategory"
      : mode === "cat_and_sub"
        ? "Create Category + Subcategory"
        : mode === "cat_only"
          ? "Create Category"
          : "Create";

  function handleSubmit(e) {
    e.preventDefault();
    if (!canCreate) return;
    onSubmit(e, {
      mode,
      catName: catInput.trim(),
      catId: matchedCat?.id || null,
      subName: subInput.trim() || null,
      assetType: subAssetType,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Category</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Type to search or create
            </p>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div className="overflow-y-auto flex-1">
          <form id="cat-create-form" onSubmit={handleSubmit}>
            <div className="px-6 divide-y divide-gray-100">
              {/* ── Category input ───────────────────────────── */}
              <div className="py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Category
                </p>
                <input
                  type="text"
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value)}
                  autoComplete="off"
                  maxLength={100}
                  placeholder="e.g. Electronics, Furniture, Vehicles"
                  className={catStyle}
                  autoFocus
                />
                {catChecking && catInput.trim() && <Spinner />}
                {!catChecking && catStatus && (
                  <StatusMsg
                    type={catStatus.type}
                    message={catStatus.message}
                  />
                )}
              </div>

              {/* ── Subcategory section ──────────────────────── */}
              <div className="py-1">
                <SectionHeader
                  title={
                    matchedCat
                      ? `Add Subcategory to "${matchedCat.category_name}"`
                      : "Subcategory"
                  }
                  isOpen={subOpen}
                  onToggle={() => setSubOpen((v) => !v)}
                  statusDot={subDot}
                />
                {subOpen && (
                  <div className="pb-4 space-y-4">
                    {matchedCat && existingSubs.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">
                          Already under{" "}
                          <span className="font-medium text-gray-600">
                            {matchedCat.category_name}
                          </span>
                          :
                        </p>
                        <SubChips subs={existingSubs} />
                      </div>
                    )}
                    {matchedCat &&
                      existingSubs.length === 0 &&
                      !catChecking && (
                        <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-xs text-blue-700 font-medium">
                            No subcategories yet under "
                            {matchedCat.category_name}"
                          </p>
                        </div>
                      )}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1.5">
                        Subcategory Name <span className="text-red-400">*</span>
                      </p>
                      <input
                        type="text"
                        value={subInput}
                        onChange={(e) => setSubInput(e.target.value)}
                        autoComplete="off"
                        maxLength={100}
                        placeholder="e.g. Laptop, Mobile, TV"
                        className={subStyle}
                      />
                      {subChecking && subInput.trim() && <Spinner />}
                      {!subChecking && subStatus && (
                        <StatusMsg
                          type={subStatus.type}
                          message={subStatus.message}
                        />
                      )}
                    </div>
                    <TypePills
                      value={subAssetType}
                      onChange={setSubAssetType}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="cat-create-form"
            disabled={!canCreate}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl
              hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition
              flex items-center justify-center gap-2"
          >
            {submitting ? <SpinLabel label="Creating..." /> : btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
