// client/src/pages/finance/DepreciationPage.jsx

import { useDepreciation } from "../../hooks/useDepreciation";
import useAuthStore from "../../store/authStore";
import DepreciationFilters from "../../components/finance/depreciation/DepreciationFilters";
import DepreciationTable from "../../components/finance/depreciation/DepreciationTable";
import DepreciationRunModal from "../../components/finance/depreciation/DepreciationRunModal";
import DepreciationLedgerDrawer from "../../components/finance/depreciation/DepreciationLedgerDrawer";

export default function DepreciationPage() {
  const { hasPermission } = useAuthStore();
  const canAdd = hasPermission("depreciation", "can_add");

  const {
    summary,
    totalCount,
    loading,
    page,
    pageSize,
    setPage,
    filters,
    handleFilterChange,
    handleClearFilters,
    currentFY,
    refresh,
    runModalOpen,
    runMode,
    runTargetAsset,
    runForm,
    runFormErrors,
    isRunning,
    runResult,
    openRunModal,
    closeRunModal,
    handleRunFormChange,
    handleRunSubmit,
    ledgerDrawerOpen,
    ledgerData,
    ledgerLoading,
    openLedgerDrawer,
    closeLedgerDrawer,
  } = useDepreciation();

  function handleReRun(row) {
    openRunModal("single", {
      asset_id: row.asset_id,
      asset_code: row.asset_code,
      asset_name: row.asset_name,
    });
  }

  return (
    <>
      <DepreciationTable
        data={summary}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onViewLedger={openLedgerDrawer}
        onReRun={handleReRun}
        onRunAll={() => openRunModal("all")}
        canAdd={canAdd}
        currentFY={currentFY}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <DepreciationRunModal
        open={runModalOpen}
        onClose={closeRunModal}
        mode={runMode}
        targetAsset={runTargetAsset}
        form={runForm}
        formErrors={runFormErrors}
        onFormChange={handleRunFormChange}
        onSubmit={handleRunSubmit}
        isRunning={isRunning}
        runResult={runResult}
        currentFY={currentFY}
      />

      <DepreciationLedgerDrawer
        open={ledgerDrawerOpen}
        onClose={closeLedgerDrawer}
        data={ledgerData}
        loading={ledgerLoading}
      />
    </>
  );
}
