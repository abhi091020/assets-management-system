// client/src/hooks/useBulkAssets.js

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { bulkCreateAssetsApi }    from "../api/assetApi";
import { getActiveLocationsApi }   from "../api/locationApi";
import { getActiveDepartmentsApi } from "../api/departmentApi";
import { getActiveCategoriesApi }  from "../api/categoryApi";

const MAX_QUANTITY = 200;
const MIN_QUANTITY = 1;

const INITIAL_COMMON = {
  asset_name:            "",
  description:           "",
  category_id:           "",
  asset_type:            "",
  location_id:           "",
  department_id:         "",
  purchase_date:         "",
  purchase_cost:         "",
  depreciation_method:   "",
  useful_life_years:     "",
  vendor:                "",
  invoice_number:        "",
  invoice_date:          "",
  scrap_value:           "",
  warranty_expiry:       "",
  model_number:          "",
  brand:                 "",
  insurance_policy_no:   "",
  insurance_company:     "",
  insurance_start_date:  "",
  insurance_expiry_date: "",
  insurance_premium:     "",
  amc_vendor:            "",
  amc_contract_no:       "",
  amc_start_date:        "",
  amc_expiry_date:       "",
  amc_cost:              "",
};

const makeItem = (index) => ({
  _id:           index,
  serial_number: "",
  color:         "",
  condition:     "New",
  notes:         "",
});

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

export const useBulkAssets = () => {
  // ── Modal & Step ─────────────────────────────────────────────────────────────
  const [open,        setOpen]        = useState(false);
  const [step,        setStep]        = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result,      setResult]      = useState(null); // success result from API

  // ── Common Form (Step 1) ─────────────────────────────────────────────────────
  const [commonForm,   setCommonForm]   = useState(INITIAL_COMMON);
  const [commonErrors, setCommonErrors] = useState({});
  const [categoryPath, setCategoryPath] = useState([]);

  // ── Items (Step 2) ────────────────────────────────────────────────────────────
  const [quantity, setQuantityRaw] = useState(1);
  const [items,    setItems]       = useState([]);
  const [quickFill, setQuickFill]  = useState({ color: "", condition: "New" });

  // ── Dropdowns ─────────────────────────────────────────────────────────────────
  const [locations,           setLocations]           = useState([]);
  const [allDepartments,      setAllDepartments]      = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [categories,          setCategories]          = useState([]);
  const [dropdownsLoading,    setDropdownsLoading]    = useState(false);
  const dropdownsFetched                              = useRef(false);

  // ── Fetch Dropdowns ───────────────────────────────────────────────────────────
  const fetchDropdowns = useCallback(async () => {
    if (dropdownsFetched.current) return;
    setDropdownsLoading(true);
    const [locRes, deptRes, catRes] = await Promise.all([
      getActiveLocationsApi(),
      getActiveDepartmentsApi(),
      getActiveCategoriesApi(),
    ]);
    if (locRes.success)  setLocations(locRes.data   || []);
    if (deptRes.success) setAllDepartments(deptRes.data || []);
    if (catRes.success)  setCategories(catRes.data  || []);
    dropdownsFetched.current = true;
    setDropdownsLoading(false);
  }, []);

  // ── Location → Department cascade ─────────────────────────────────────────────
  useEffect(() => {
    if (!allDepartments.length) return;
    if (commonForm.location_id) {
      const depts = allDepartments.filter(
        (d) => String(d.location_id) === String(commonForm.location_id),
      );
      setFilteredDepartments(depts);
      const valid = depts.find((d) => String(d.id) === String(commonForm.department_id));
      if (!valid)
        setCommonForm((prev) => ({ ...prev, department_id: "" }));
    } else {
      setFilteredDepartments([]);
      setCommonForm((prev) => ({ ...prev, department_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commonForm.location_id, allDepartments]);

  // ── Quantity helper ────────────────────────────────────────────────────────────
  const setQuantity = (val) => {
    const n = Math.min(Math.max(parseInt(val) || MIN_QUANTITY, MIN_QUANTITY), MAX_QUANTITY);
    setQuantityRaw(n);
  };

  // ── Common Form Handlers ──────────────────────────────────────────────────────
  const handleCommonChange = (key, value) => {
    setCommonForm((prev) => ({ ...prev, [key]: value }));
    if (commonErrors[key])
      setCommonErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleCategoryChange = (path) => {
    setCategoryPath(path);
    const leafId = path.length > 0 ? path[path.length - 1] : "";
    handleCommonChange("category_id", leafId);
  };

  // ── Items Handlers (Step 2) ───────────────────────────────────────────────────
  const generateItems = useCallback(() => {
    const n = Math.min(Math.max(parseInt(quantity) || 1, MIN_QUANTITY), MAX_QUANTITY);
    setItems(Array.from({ length: n }, (_, i) => makeItem(i)));
  }, [quantity]);

  const updateItem = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  };

  const applyQuickFill = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        color:     quickFill.color     || item.color,
        condition: quickFill.condition || item.condition,
      })),
    );
    toast.success("Applied to all rows.");
  };

  // ── Validation ────────────────────────────────────────────────────────────────
  const validateCommon = () => {
    const f = commonForm;
    const errors = {};
    if (!f.asset_name?.trim())    errors.asset_name          = "Required.";
    if (!f.category_id)           errors.category_id         = "Required.";
    if (!f.asset_type)            errors.asset_type          = "Required.";
    if (!f.location_id)           errors.location_id         = "Required.";
    if (!f.department_id)         errors.department_id       = "Required.";
    if (!f.purchase_date)         errors.purchase_date       = "Required.";
    if (!f.purchase_cost && f.purchase_cost !== 0)
                                   errors.purchase_cost      = "Required.";
    if (!f.depreciation_method)   errors.depreciation_method = "Required.";
    if (!f.useful_life_years && f.useful_life_years !== 0)
                                   errors.useful_life_years  = "Required.";
    setCommonErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Step Navigation ───────────────────────────────────────────────────────────
  const goToStep2 = () => {
    if (!validateCommon()) {
      toast.error("Please fix the errors before continuing.");
      return;
    }
    generateItems();
    setStep(2);
  };

  const goToStep3 = () => setStep(3);
  const goBack    = () => setStep((s) => Math.max(1, s - 1));

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const f = commonForm;

    const payload = {
      commonData: {
        assetName:           f.asset_name.trim(),
        description:         f.description?.trim() || null,
        categoryId:          Number(f.category_id),
        assetType:           f.asset_type,
        locationId:          Number(f.location_id),
        departmentId:        Number(f.department_id),
        purchaseDate:        f.purchase_date,
        purchaseCost:        Number(f.purchase_cost),
        depreciationMethod:  f.depreciation_method,
        usefulLifeYears:     Number(f.useful_life_years),
        vendor:              f.vendor?.trim() || null,
        invoiceNumber:       f.invoice_number?.trim() || null,
        invoiceDate:         f.invoice_date || null,
        scrapValue:          f.scrap_value !== "" ? Number(f.scrap_value) : null,
        warrantyExpiry:      f.warranty_expiry || null,
        modelNumber:         f.model_number?.trim() || null,
        brand:               f.brand?.trim() || null,
        insurancePolicyNo:   f.insurance_policy_no?.trim() || null,
        insuranceCompany:    f.insurance_company?.trim() || null,
        insuranceStartDate:  f.insurance_start_date || null,
        insuranceExpiryDate: f.insurance_expiry_date || null,
        insurancePremium:    f.insurance_premium !== "" ? Number(f.insurance_premium) : null,
        amcVendor:           f.amc_vendor?.trim() || null,
        amcContractNo:       f.amc_contract_no?.trim() || null,
        amcStartDate:        f.amc_start_date || null,
        amcExpiryDate:       f.amc_expiry_date || null,
        amcCost:             f.amc_cost !== "" ? Number(f.amc_cost) : null,
      },
      items: items.map((item) => ({
        serialNumber: item.serial_number?.trim() || null,
        color:        item.color?.trim() || null,
        condition:    item.condition || "New",
        notes:        item.notes?.trim() || null,
      })),
    };

    const res = await bulkCreateAssetsApi(payload);

    if (res.success) {
      setResult(res.data);
      toast.success(`${res.data.count} assets registered successfully!`);
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  // ── Open / Close ──────────────────────────────────────────────────────────────
  const openModal = () => {
    setStep(1);
    setCommonForm(INITIAL_COMMON);
    setCommonErrors({});
    setCategoryPath([]);
    setItems([]);
    setQuantityRaw(1);
    setQuickFill({ color: "", condition: "New" });
    setResult(null);
    fetchDropdowns();
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setResult(null);
  };

  return {
    // modal
    open, openModal, closeModal,
    // step
    step, goToStep2, goToStep3, goBack,
    // common form
    commonForm, commonErrors, handleCommonChange,
    categoryPath, handleCategoryChange,
    // items
    quantity, setQuantity,
    items, updateItem,
    quickFill, setQuickFill, applyQuickFill,
    // submit
    isSubmitting, handleSubmit, result,
    // dropdowns
    locations, filteredDepartments, categories,
    dropdownsLoading, allDepartments,
  };
};