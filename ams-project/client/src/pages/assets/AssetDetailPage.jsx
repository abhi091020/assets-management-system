// client/src/pages/assets/AssetDetailPage.jsx

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  getAssetByIdApi,
  updateAssetApi,
  updateAssetStatusApi,
  deleteAssetApi,
} from "../../api/assetApi";
import { getActiveLocationsApi } from "../../api/locationApi";
import { getActiveDepartmentsApi } from "../../api/departmentApi";
import { getActiveCategoriesApi } from "../../api/categoryApi";
import { getActiveEmployeesApi } from "../../api/employeeApi";
import useAuthStore from "../../store/authStore";

// ── Modular sub-components ────────────────────────────────────────────────────
import AssetDetailHeader from "../../components/assets/detail/AssetDetailHeader";
import AssetDetailStatus from "../../components/assets/detail/AssetDetailStatus";
import AssetDetailSkeleton from "../../components/assets/detail/AssetDetailSkeleton";
import AssetBasicInfo from "../../components/assets/detail/AssetBasicInfo";
import AssetPurchaseInfo from "../../components/assets/detail/AssetPurchaseInfo";
import AssetPhysicalInfo from "../../components/assets/detail/AssetPhysicalInfo";
import AssetInsuranceInfo from "../../components/assets/detail/AssetInsuranceInfo";
import AssetAmcInfo from "../../components/assets/detail/AssetAmcInfo";
import AssetQRPanel from "../../components/assets/detail/AssetQRPanel";
import AssetLocationInfo from "../../components/assets/detail/AssetLocationInfo";
import AssetQRScannerModal from "../../components/assets/detail/AssetQRScannerModal";
import {
  AssetInfoCard,
  IconSvg,
} from "../../components/assets/detail/AssetInfoCard";

// ── Existing shared components ────────────────────────────────────────────────
import AssetForm from "../../components/assets/AssetForm";
import AssetDeleteModal from "../../components/assets/AssetDeleteModal";
import AssetPhotoPanel from "../../components/assets/AssetPhotoPanel";
import { C, S } from "../../components/assets/detail/detailStyles";

// ── Drawer shell ──────────────────────────────────────────────────────────────
const Drawer = ({ isOpen, onClose, children }) => (
  <>
    {isOpen && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 30,
          background: "rgba(0,0,0,0.4)",
        }}
        onClick={onClose}
      />
    )}
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 40,
        height: "100%",
        width: "560px",
        maxWidth: "100vw",
        background: C.white,
        boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      {isOpen && children}
    </div>
  </>
);

// ── Not-found screen ──────────────────────────────────────────────────────────
const NotFound = ({ onBack }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      textAlign: "center",
      padding: "24px",
    }}
  >
    <div
      style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: C.rowZebra,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px",
      }}
    >
      <svg
        width="32"
        height="32"
        fill="none"
        stroke={C.textLight}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h2
      style={{
        fontSize: "18px",
        fontWeight: "700",
        color: C.text,
        margin: "0 0 8px",
      }}
    >
      Asset not found
    </h2>
    <p style={{ fontSize: "13px", color: C.textLight, margin: 0 }}>
      This asset may have been deleted or doesn't exist.
    </p>
    <button
      onClick={onBack}
      style={{ marginTop: "20px", ...S.backBtn }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.primary;
        e.currentTarget.style.color = C.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.color = C.textLight;
      }}
    >
      Back to Assets
    </button>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role || "";
  const canAdmin = ["SuperAdmin", "Admin"].includes(role);
  const canManage = ["SuperAdmin", "Admin", "AssetManager"].includes(role);

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [locations, setLocations] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);

  const fetchAsset = useCallback(async () => {
    setLoading(true);
    const res = await getAssetByIdApi(id);
    if (res.success) setAsset(res.data);
    else if (res.code === "NOT_FOUND") setNotFound(true);
    else toast.error(res.message);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  const fetchDropdowns = useCallback(async () => {
    setDropdownsLoading(true);
    const [locRes, deptRes, catRes, empRes] = await Promise.all([
      getActiveLocationsApi(),
      getActiveDepartmentsApi(),
      getActiveCategoriesApi(),
      getActiveEmployeesApi(),
    ]);
    if (locRes.success) setLocations(locRes.data || []);
    if (deptRes.success) setAllDepartments(deptRes.data || []);
    if (catRes.success) setCategories(catRes.data || []);
    if (empRes.success) setEmployees(empRes.data || []);
    setDropdownsLoading(false);
  }, []);

  useEffect(() => {
    if (!allDepartments.length) return;
    if (editForm.location_id) {
      const depts = allDepartments.filter(
        (d) => String(d.location_id) === String(editForm.location_id),
      );
      setFilteredDepartments(depts);
      const valid = depts.find(
        (d) => String(d.id) === String(editForm.department_id),
      );
      if (!valid) setEditForm((p) => ({ ...p, department_id: "" }));
    } else {
      setFilteredDepartments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm.location_id, allDepartments]);

  const openEditDrawer = () => {
    if (!asset) return;
    setEditForm({
      asset_name: asset.asset_name || "",
      description: asset.description || "",
      category_id: asset.category_id || "",
      location_id: asset.location_id || "",
      department_id: asset.department_id || "",
      assigned_employee_id: asset.assigned_employee_id || "",
      purchase_date: asset.purchase_date?.split("T")[0] || "",
      purchase_cost: asset.purchase_cost ?? "",
      vendor: asset.vendor || "",
      invoice_number: asset.invoice_number || "",
      invoice_date: asset.invoice_date?.split("T")[0] || "",
      scrap_value: asset.scrap_value ?? "",
      serial_number: asset.serial_number || "",
      model_number: asset.model_number || "",
      brand: asset.brand || "",
      color: asset.color || "",
      condition: asset.condition || "New",
      status: asset.status || "Active",
      insurance_policy_no: asset.insurance_policy_no || "",
      insurance_company: asset.insurance_company || "",
      insurance_expiry_date: asset.insurance_expiry_date?.split("T")[0] || "",
      amc_vendor: asset.amc_vendor || "",
      amc_expiry_date: asset.amc_expiry_date?.split("T")[0] || "",
    });
    setEditErrors({});
    fetchDropdowns();
    setDrawerOpen(true);
  };

  const handleFormChange = (key, value) => {
    setEditForm((p) => ({ ...p, [key]: value }));
    if (editErrors[key]) setEditErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!editForm.asset_name?.trim())
      errors.asset_name = "Asset name is required.";
    if (!editForm.category_id) errors.category_id = "Category is required.";
    if (!editForm.location_id) errors.location_id = "Location is required.";
    if (!editForm.department_id)
      errors.department_id = "Department is required.";
    if (!editForm.purchase_date)
      errors.purchase_date = "Purchase date is required.";
    if (editForm.purchase_cost === "" || editForm.purchase_cost == null)
      errors.purchase_cost = "Purchase cost is required.";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const payload = {
      assetName: editForm.asset_name.trim(),
      description: editForm.description?.trim() || "",
      categoryId: Number(editForm.category_id),
      locationId: Number(editForm.location_id),
      departmentId: Number(editForm.department_id),
      assignedEmployeeId: editForm.assigned_employee_id
        ? Number(editForm.assigned_employee_id)
        : null,
      purchaseDate: editForm.purchase_date,
      purchaseCost: Number(editForm.purchase_cost),
      vendor: editForm.vendor?.trim() || "",
      invoiceNumber: editForm.invoice_number?.trim() || "",
      invoiceDate: editForm.invoice_date || null,
      scrapValue:
        editForm.scrap_value !== "" ? Number(editForm.scrap_value) : null,
      serialNumber: editForm.serial_number?.trim() || "",
      modelNumber: editForm.model_number?.trim() || "",
      brand: editForm.brand?.trim() || "",
      color: editForm.color?.trim() || "",
      condition: editForm.condition,
      status: editForm.status,
      insurancePolicyNo: editForm.insurance_policy_no?.trim() || "",
      insuranceCompany: editForm.insurance_company?.trim() || "",
      insuranceExpiryDate: editForm.insurance_expiry_date || null,
      amcVendor: editForm.amc_vendor?.trim() || "",
      amcExpiryDate: editForm.amc_expiry_date || null,
    };
    const res = await updateAssetApi(asset.id, payload);
    if (res.success) {
      toast.success("Asset updated successfully.");
      setDrawerOpen(false);
      fetchAsset();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === asset.status) return;
    const res = await updateAssetStatusApi(asset.id, newStatus);
    if (res.success) {
      toast.success(`Asset marked as ${newStatus}.`);
      fetchAsset();
    } else toast.error(res.message);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteAssetApi(asset.id);
    if (res.success) {
      toast.success("Asset deleted.");
      navigate("/assets");
    } else toast.error(res.message);
    setIsDeleting(false);
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                alignItems: "start",
              }}
            >
              <div style={{ gridColumn: "span 2" }}>
                <AssetBasicInfo asset={asset} />
                <AssetPurchaseInfo asset={asset} />
                <AssetPhysicalInfo asset={asset} />
                <AssetInsuranceInfo asset={asset} />
                <AssetAmcInfo asset={asset} />
              </div>

              <div>
                <AssetQRPanel
                  asset={asset}
                  onScanClick={() => setScannerOpen(true)}
                />
                <AssetLocationInfo asset={asset} />
              </div>
            </div>

            <div style={{ marginTop: "4px" }}>
              <AssetInfoCard
                title="Photos"
                icon={
                  <IconSvg d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                }
              >
                <div style={{ padding: "20px" }}>
                  <AssetPhotoPanel assetId={asset.id} canManage={canManage} />
                </div>
              </AssetInfoCard>
            </div>
          </>
        ) : null}
      </div>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <AssetForm
          form={editForm}
          formErrors={editErrors}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={() => setDrawerOpen(false)}
          isSubmitting={isSubmitting}
          isEditing
          editingAsset={asset}
          locations={locations}
          filteredDepartments={filteredDepartments}
          categories={categories}
          employees={employees}
          dropdownsLoading={dropdownsLoading}
        />
      </Drawer>

      <AssetDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        asset={asset}
        isSubmitting={isDeleting}
      />

      {asset && (
        <AssetQRScannerModal
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          currentAssetCode={asset.asset_code}
          currentQrToken={asset.qr_token}
          onAssetFound={handleScanAssetFound}
        />
      )}
    </>
  );
}
