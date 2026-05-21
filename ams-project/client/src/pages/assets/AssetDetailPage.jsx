// client/src/pages/assets/AssetDetailPage.jsx

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal";

import {
  getAssetByIdApi,
  updateAssetApi,
  updateAssetStatusApi,
  deleteAssetApi,
  assignAssetApi,
  collectAssetApi,
  reassignAssetApi,
  getAssignmentHistoryApi,
} from "../../api/assetApi";
import { getActiveLocationsApi }   from "../../api/locationApi";
import { getActiveDepartmentsApi } from "../../api/departmentApi";
import { getActiveCategoriesApi }  from "../../api/categoryApi";
import { getActiveEmployeesApi }   from "../../api/employeeApi";
import useAuthStore from "../../store/authStore";

// ── Modular sub-components ────────────────────────────────────────────────────
import AssetDetailHeader   from "../../components/assets/detail/AssetDetailHeader";
import AssetDetailStatus   from "../../components/assets/detail/AssetDetailStatus";
import AssetDetailSkeleton from "../../components/assets/detail/AssetDetailSkeleton";
import AssetBasicInfo      from "../../components/assets/detail/AssetBasicInfo";
import AssetPurchaseInfo   from "../../components/assets/detail/AssetPurchaseInfo";
import AssetPhysicalInfo   from "../../components/assets/detail/AssetPhysicalInfo";
import AssetInsuranceInfo  from "../../components/assets/detail/AssetInsuranceInfo";
import AssetAmcInfo        from "../../components/assets/detail/AssetAmcInfo";
import AssetQRPanel        from "../../components/assets/detail/AssetQRPanel";
import AssetLocationInfo   from "../../components/assets/detail/AssetLocationInfo";
import AssetQRScannerModal from "../../components/assets/detail/AssetQRScannerModal";
import { AssetInfoCard, IconSvg } from "../../components/assets/detail/AssetInfoCard";

// ── Existing shared components ────────────────────────────────────────────────
import AssetForm        from "../../components/assets/AssetForm";
import AssetDeleteModal from "../../components/assets/AssetDeleteModal";
import AssetPhotoPanel  from "../../components/assets/AssetPhotoPanel";
import { C, S }         from "../../components/assets/detail/detailStyles";

// ── Assignment modals ─────────────────────────────────────────────────────────
import AssignModal   from "../../components/assets/detail/AssignModal";
import CollectModal  from "../../components/assets/detail/CollectModal";
import ReassignModal from "../../components/assets/detail/ReassignModal";

// ── Build ancestor path [ rootId, …, leafId ] ─────────────────────────────────
function buildCategoryPath(categories, leafId) {
  if (!leafId || !categories.length) return [];
  const map = {};
  categories.forEach((c) => (map[c.id] = c));
  const path = [];
  let cur = map[Number(leafId)];
  while (cur) {
    path.unshift(cur.id);
    cur = cur.parent_category_id ? map[cur.parent_category_id] : null;
  }
  return path;
}

// ── Not-found screen ──────────────────────────────────────────────────────────
const NotFound = ({ onBack }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "60vh",
    textAlign: "center", padding: "24px",
  }}>
    <div style={{
      width: "64px", height: "64px", borderRadius: "50%",
      background: C.rowZebra, display: "flex",
      alignItems: "center", justifyContent: "center", marginBottom: "16px",
    }}>
      <svg width="32" height="32" fill="none" stroke={C.textLight} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h2 style={{ fontSize: "18px", fontWeight: "700", color: C.text, margin: "0 0 8px" }}>
      Asset not found
    </h2>
    <p style={{ fontSize: "13px", color: C.textLight, margin: 0 }}>
      This asset may have been deleted or doesn't exist.
    </p>
    <button
      onClick={onBack}
      style={{ marginTop: "20px", ...S.backBtn }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.textLight; }}
    >
      Back to Assets
    </button>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AssetDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role      = user?.role || "";
  const canAdmin  = ["SuperAdmin", "Admin"].includes(role);
  const canManage = ["SuperAdmin", "Admin", "AssetManager"].includes(role);

  const [asset,    setAsset]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [drawerOpen,      setDrawerOpen]      = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scannerOpen,     setScannerOpen]     = useState(false);

  // ★ Assignment modal states
  const [assignModalOpen,   setAssignModalOpen]   = useState(false);
  const [collectModalOpen,  setCollectModalOpen]  = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);

  // ★ Pending confirmation (assign / collect / reassign)
  const [pendingConfirm, setPendingConfirm] = useState(null);

  // ── Edit form state ───────────────────────────────────────────────────────
  const [editForm,     setEditForm]     = useState({});
  const [editErrors,   setEditErrors]   = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [categoryPath, setCategoryPath] = useState([]);

  // ── Dropdowns for edit form ───────────────────────────────────────────────
  const [locations,           setLocations]           = useState([]);
  const [allDepartments,      setAllDepartments]      = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [categories,          setCategories]          = useState([]);
  const [dropdownsLoading,    setDropdownsLoading]    = useState(false);

  // ★ Employees — only needed for Assign / Reassign modals
  const [allEmployees, setAllEmployees] = useState([]);

  // ★ Assignment history
  const [history,        setHistory]        = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Fetch asset ───────────────────────────────────────────────────────────
  const fetchAsset = useCallback(async () => {
    setLoading(true);
    const res = await getAssetByIdApi(id);
    if (res.success)                   setAsset(res.data);
    else if (res.code === "NOT_FOUND") setNotFound(true);
    else                               toast.error(res.message);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAsset(); }, [fetchAsset]);

  // ★ Fetch assignment history
  const fetchHistory = useCallback(async () => {
    if (!id) return;
    setHistoryLoading(true);
    const res = await getAssignmentHistoryApi(id);
    if (res.success) setHistory(res.data || []);
    setHistoryLoading(false);
  }, [id]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Fetch all dropdowns ───────────────────────────────────────────────────
  const fetchDropdowns = useCallback(async () => {
    setDropdownsLoading(true);
    const [locRes, deptRes, catRes, empRes] = await Promise.all([
      getActiveLocationsApi(),
      getActiveDepartmentsApi(),
      getActiveCategoriesApi(),
      getActiveEmployeesApi(),
    ]);
    if (locRes.success)  setLocations(locRes.data      || []);
    if (deptRes.success) setAllDepartments(deptRes.data || []);
    if (catRes.success)  setCategories(catRes.data     || []);
    if (empRes.success)  setAllEmployees(empRes.data   || []);
    setDropdownsLoading(false);
  }, []);

  // ── Location → Department cascade (edit form only) ────────────────────────
  useEffect(() => {
    if (!allDepartments.length) return;
    if (editForm.location_id) {
      const depts = allDepartments.filter(
        (d) => String(d.location_id) === String(editForm.location_id),
      );
      setFilteredDepartments(depts);
      const valid = depts.find((d) => String(d.id) === String(editForm.department_id));
      if (!valid) setEditForm((p) => ({ ...p, department_id: "" }));
    } else {
      setFilteredDepartments([]);
      setEditForm((p) => ({ ...p, department_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm.location_id, allDepartments]);

  // ── Rebuild category path when categories load ────────────────────────────
  useEffect(() => {
    if (asset && categories.length > 0)
      setCategoryPath(buildCategoryPath(categories, asset.category_id));
  }, [asset, categories]);

  // ── Open edit drawer ──────────────────────────────────────────────────────
  const openEditDrawer = () => {
    if (!asset) return;
    setEditForm({
      asset_name:            asset.asset_name || "",
      description:           asset.description || "",
      category_id:           asset.category_id || "",
      asset_type:            asset.asset_type || "",
      location_id:           asset.location_id || "",
      department_id:         asset.department_id || "",
      purchase_date:         asset.purchase_date?.split("T")[0] || "",
      purchase_cost:         asset.purchase_cost ?? "",
      depreciation_method:   asset.depreciation_method || "",
      useful_life_years:     asset.useful_life_years ?? "",
      vendor:                asset.vendor || "",
      invoice_number:        asset.invoice_number || "",
      invoice_date:          asset.invoice_date?.split("T")[0] || "",
      scrap_value:           asset.scrap_value ?? "",
      warranty_expiry:       asset.warranty_expiry?.split("T")[0] || "",
      serial_number:         asset.serial_number || "",
      model_number:          asset.model_number || "",
      brand:                 asset.brand || "",
      color:                 asset.color || "",
      condition:             asset.condition || "New",
      status:                asset.status || "Active",
      insurance_policy_no:   asset.insurance_policy_no || "",
      insurance_company:     asset.insurance_company || "",
      insurance_expiry_date: asset.insurance_expiry_date?.split("T")[0] || "",
      amc_vendor:            asset.amc_vendor || "",
      amc_expiry_date:       asset.amc_expiry_date?.split("T")[0] || "",
    });
    setCategoryPath(buildCategoryPath(categories, asset.category_id));
    setEditErrors({});
    fetchDropdowns();
    setDrawerOpen(true);
  };

  const handleFormChange = (key, value) => {
    setEditForm((p) => ({ ...p, [key]: value }));
    if (editErrors[key]) setEditErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleCategoryChange = (path) => {
    setCategoryPath(path);
    const leafId = path.length > 0 ? path[path.length - 1] : "";
    setEditForm((p) => ({ ...p, category_id: leafId }));
    if (editErrors.category_id) setEditErrors((p) => ({ ...p, category_id: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!editForm.asset_name?.trim())  errors.asset_name          = "Asset name is required.";
    if (!editForm.category_id)         errors.category_id         = "Category is required.";
    if (!editForm.asset_type)          errors.asset_type          = "Asset type is required.";
    if (!editForm.location_id)         errors.location_id         = "Location is required.";
    if (!editForm.department_id)       errors.department_id       = "Department is required.";
    if (!editForm.purchase_date)       errors.purchase_date       = "Purchase date is required.";
    if (editForm.purchase_cost === "" || editForm.purchase_cost == null)
      errors.purchase_cost = "Purchase cost is required.";
    if (!editForm.depreciation_method) errors.depreciation_method = "Depreciation method is required.";
    if (!editForm.useful_life_years)   errors.useful_life_years   = "Useful life is required.";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const payload = {
      assetName:           editForm.asset_name.trim(),
      description:         editForm.description?.trim() || "",
      categoryId:          Number(editForm.category_id),
      assetType:           editForm.asset_type,
      locationId:          Number(editForm.location_id),
      departmentId:        Number(editForm.department_id),
      purchaseDate:        editForm.purchase_date,
      purchaseCost:        Number(editForm.purchase_cost),
      depreciationMethod:  editForm.depreciation_method,
      usefulLifeYears:     Number(editForm.useful_life_years),
      vendor:              editForm.vendor?.trim() || "",
      invoiceNumber:       editForm.invoice_number?.trim() || "",
      invoiceDate:         editForm.invoice_date || null,
      scrapValue:          editForm.scrap_value !== "" ? Number(editForm.scrap_value) : null,
      warrantyExpiry:      editForm.warranty_expiry || null,
      serialNumber:        editForm.serial_number?.trim() || "",
      modelNumber:         editForm.model_number?.trim() || "",
      brand:               editForm.brand?.trim() || "",
      color:               editForm.color?.trim() || "",
      condition:           editForm.condition,
      status:              editForm.status,
      insurancePolicyNo:   editForm.insurance_policy_no?.trim() || "",
      insuranceCompany:    editForm.insurance_company?.trim() || "",
      insuranceExpiryDate: editForm.insurance_expiry_date || null,
      amcVendor:           editForm.amc_vendor?.trim() || "",
      amcExpiryDate:       editForm.amc_expiry_date || null,
    };
    const res = await updateAssetApi(asset.id, payload);
    if (res.success) {
      toast.success("Asset updated successfully.");
      setDrawerOpen(false);
      fetchAsset();
    } else toast.error(res.message);
    setIsSubmitting(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === asset.status) return;
    const res = await updateAssetStatusApi(asset.id, newStatus);
    if (res.success) { toast.success(`Asset marked as ${newStatus}.`); fetchAsset(); }
    else toast.error(res.message);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteAssetApi(asset.id);
    if (res.success) { toast.success("Asset deleted."); navigate("/assets"); }
    else toast.error(res.message);
    setIsDeleting(false);
  };

  // ════════════════════════════════════════════════════════════════════════
  // ★ Assignment handlers
  // ════════════════════════════════════════════════════════════════════════

  // ── Assign ───────────────────────────────────────────────────────────────
  const handleAssignRequest = (payload) => {
    setAssignModalOpen(false);
    const emp      = allEmployees.find((e) => e.id === payload.employeeId);
    const empLabel = emp
      ? `${emp.full_name}${emp.employee_code ? ` (${emp.employee_code})` : ""}`
      : "Selected Employee";
    setPendingConfirm({
      type:    "assign",
      payload,
      title:   "Confirm Asset Assignment",
      message: `Assign to ${empLabel}?`,
      subText: `${asset?.asset_name} (${asset?.asset_code}) · Condition: ${payload.condition}`,
      label:   "Yes, Assign",
      color:   "green",
    });
  };

  const handleAssign = async (payload) => {
    const res = await assignAssetApi(asset.id, payload);
    if (res.success) {
      toast.success("Asset assigned successfully.");
      setPendingConfirm(null);
      fetchAsset();
      fetchHistory();
    } else {
      toast.error(res.message);
      setPendingConfirm(null);
    }
  };

  // ── Collect ───────────────────────────────────────────────────────────────
  const handleCollectRequest = (payload) => {
    setCollectModalOpen(false);
    setPendingConfirm({
      type:    "collect",
      payload,
      title:   "Confirm Asset Collection",
      message: `Collect this asset back from ${asset?.employee_name}?`,
      subText: `${asset?.asset_name} (${asset?.asset_code}) · Condition: ${payload.conditionAtReturn || "—"}`,
      label:   "Yes, Collect",
      color:   "red",
    });
  };

  const handleCollect = async (payload) => {
    const res = await collectAssetApi(asset.id, payload);
    if (res.success) {
      toast.success("Asset collected successfully.");
      setPendingConfirm(null);
      fetchAsset();
      fetchHistory();
    } else {
      toast.error(res.message);
      setPendingConfirm(null);
    }
  };

  // ── Reassign ──────────────────────────────────────────────────────────────
  const handleReassignRequest = (payload) => {
    setReassignModalOpen(false);
    const emp      = allEmployees.find((e) => e.id === payload.toEmployeeId);
    const empLabel = emp
      ? `${emp.full_name}${emp.employee_code ? ` (${emp.employee_code})` : ""}`
      : "Selected Employee";
    setPendingConfirm({
      type:    "reassign",
      payload,
      title:   "Confirm Asset Reassignment",
      message: `Reassign from ${asset?.employee_name} → ${empLabel}?`,
      subText: `${asset?.asset_name} (${asset?.asset_code})${payload.conditionAtReturn ? ` · Condition: ${payload.conditionAtReturn}` : ""}`,
      label:   "Yes, Reassign",
      color:   "blue",
    });
  };

  const handleReassign = async (payload) => {
    const res = await reassignAssetApi(asset.id, payload);
    if (res.success) {
      toast.success("Asset reassigned successfully.");
      setPendingConfirm(null);
      fetchAsset();
      fetchHistory();
    } else {
      toast.error(res.message);
      setPendingConfirm(null);
    }
  };

  const handleScanAssetFound = (scannedAsset) => {
    setScannerOpen(false);
    toast(`Navigating to ${scannedAsset.assetCode}`, { icon: "→" });
    setTimeout(() => navigate(`/assets/${scannedAsset.id}`), 400);
  };

  if (notFound) return <NotFound onBack={() => navigate("/assets")} />;

  return (
    <>
      <div style={S.page}>
        <AssetDetailHeader
          asset={asset}
          loading={loading}
          canManage={canManage}
          canAdmin={canAdmin}
          onBack={() => navigate("/assets")}
          onEdit={openEditDrawer}
          onDelete={() => setDeleteModalOpen(true)}
          onAssign={() => { fetchDropdowns(); setAssignModalOpen(true); }}
          onCollect={() => setCollectModalOpen(true)}
          onReassign={() => { fetchDropdowns(); setReassignModalOpen(true); }}
        />

        {loading ? (
          <AssetDetailSkeleton />
        ) : asset ? (
          <>
            <AssetDetailStatus
              asset={asset}
              canManage={canManage}
              onStatusChange={handleStatusChange}
            />

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              alignItems: "start",
            }}>
              <div style={{ gridColumn: "span 2" }}>
                <AssetBasicInfo     asset={asset} />
                <AssetPurchaseInfo  asset={asset} />
                <AssetPhysicalInfo  asset={asset} />
                <AssetInsuranceInfo asset={asset} />
                <AssetAmcInfo       asset={asset} />
              </div>

              <div>
                <AssetQRPanel
                  asset={asset}
                  onScanClick={() => setScannerOpen(true)}
                />
                <AssetLocationInfo asset={asset} />
              </div>
            </div>

            {/* ★ Assignment History */}
            <div style={{ marginTop: "16px" }}>
              <AssetInfoCard
                title="Assignment History"
                icon={<IconSvg d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
              >
                <AssignmentHistoryTable history={history} loading={historyLoading} />
              </AssetInfoCard>
            </div>

            {/* Photos */}
            <div style={{ marginTop: "16px" }}>
              <AssetInfoCard
                title="Photos"
                icon={<IconSvg d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />}
              >
                <div style={{ padding: "20px" }}>
                  <AssetPhotoPanel assetId={asset.id} canManage={canManage} />
                </div>
              </AssetInfoCard>
            </div>
          </>
        ) : null}
      </div>

      {/* ── Edit Form ── */}
      <AssetForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isEditing
        editingAsset={asset}
        form={editForm}
        formErrors={editErrors}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        categoryPath={categoryPath}
        onCategoryChange={handleCategoryChange}
        locations={locations}
        filteredDepartments={filteredDepartments}
        categories={categories}
        dropdownsLoading={dropdownsLoading}
      />

      {/* ── Delete Modal ── */}
      <AssetDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        asset={asset}
        isSubmitting={isDeleting}
      />

      {/* ── QR Scanner ── */}
      {asset && (
        <AssetQRScannerModal
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          currentAssetCode={asset.asset_code}
          currentQrToken={asset.qr_token}
          onAssetFound={handleScanAssetFound}
        />
      )}

      {/* ── Assignment Modals ── */}
      <AssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onConfirm={handleAssignRequest}
        asset={asset}
        employees={allEmployees}
        departments={allDepartments}
        loading={dropdownsLoading}
      />

      <CollectModal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        onConfirm={handleCollectRequest}
        asset={asset}
      />

      <ReassignModal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        onConfirm={handleReassignRequest}
        asset={asset}
        employees={allEmployees}
        departments={allDepartments}
        loading={dropdownsLoading}
      />

      {/* ── Global Confirmation Modal ── */}
      <ConfirmModal
        open={!!pendingConfirm}
        title={pendingConfirm?.title}
        message={pendingConfirm?.message}
        subText={pendingConfirm?.subText}
        confirmLabel={pendingConfirm?.label}
        confirmColor={pendingConfirm?.color}
        onConfirm={() => {
          const { type, payload } = pendingConfirm;
          if (type === "assign")   handleAssign(payload);
          if (type === "collect")  handleCollect(payload);
          if (type === "reassign") handleReassign(payload);
        }}
        onCancel={() => setPendingConfirm(null)}
      />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ★ Assignment History Table (inline component)
// ══════════════════════════════════════════════════════════════════════════════

const ACTION_STYLES = {
  Assigned:   { bg: "#DCFCE7", color: "#15803D" },
  Collected:  { bg: "#FEE2E2", color: "#DC2626" },
  Reassigned: { bg: "#DBEAFE", color: "#1D4ED8" },
};

// ── "Company" badge — shown when no employee on From/To ──────────────────────
const CompanyBadge = () => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "4px",
    background: "#F1F5F9", color: "#64748B", fontSize: "11px",
    fontWeight: 600, padding: "3px 9px", borderRadius: "20px",
    border: "1px solid #E2E8F0",
  }}>
    <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
    Company
  </span>
);

function AssignmentHistoryTable({ history, loading }) {
  if (loading) return (
    <div style={{ padding: "24px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
      Loading history...
    </div>
  );

  if (!history.length) return (
    <div style={{ padding: "24px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
      No assignment history yet.
    </div>
  );

  const fmt = (d) =>
    d ? new Date(d).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }) : "—";

  const TH = {
    padding: "10px 14px", textAlign: "left", fontWeight: 700,
    color: "#64748B", fontSize: "11px", textTransform: "uppercase",
    letterSpacing: "0.5px", borderBottom: "1px solid #F1F5F9", whiteSpace: "nowrap",
  };

  const TD = { padding: "10px 14px", borderBottom: "1px solid #F8FAFC", color: "#475569" };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#F8FAFC" }}>
            {["Action", "From", "To", "Assigned At", "Collected At", "Condition", "By", "Notes"].map((h) => (
              <th key={h} style={TH}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((row, i) => {
            const s = ACTION_STYLES[row.action_type] || { bg: "#F1F5F9", color: "#64748B" };
            return (
              <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>

                {/* Action badge */}
                <td style={TD}>
                  <span style={{
                    background: s.bg, color: s.color, fontSize: "11px",
                    fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  }}>
                    {row.action_type}
                  </span>
                </td>

                {/* From — Company badge when no previous employee */}
                <td style={{ ...TD, color: "#1E293B" }}>
                  {row.from_employee_name
                    ? <>
                        {row.from_employee_name}
                        {row.from_employee_code && (
                          <><br /><span style={{ fontSize: "11px", color: "#94A3B8" }}>{row.from_employee_code}</span></>
                        )}
                      </>
                    : <CompanyBadge />}
                </td>

                {/* To — Company badge when collected back (no receiving employee) */}
                <td style={{ ...TD, color: "#1E293B" }}>
                  {row.to_employee_name
                    ? <>
                        {row.to_employee_name}
                        {row.to_employee_code && (
                          <><br /><span style={{ fontSize: "11px", color: "#94A3B8" }}>{row.to_employee_code}</span></>
                        )}
                      </>
                    : <CompanyBadge />}
                </td>

                <td style={{ ...TD, whiteSpace: "nowrap" }}>{fmt(row.assigned_at)}</td>
                <td style={{ ...TD, whiteSpace: "nowrap" }}>{fmt(row.collected_at)}</td>
                <td style={TD}>{row.condition_at_return || "—"}</td>
                <td style={TD}>{row.performed_by_name || "—"}</td>
                <td style={{ ...TD, color: "#94A3B8", maxWidth: "180px" }}>{row.notes || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}