// src/pages/reports/ReportsPage.jsx
import { useReports } from "../../hooks/useReports";
import ReportSelector from "../../components/reports/ReportSelector";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportSummaryCards from "../../components/reports/ReportSummaryCards";
import ReportExportBar from "../../components/reports/ReportExportBar";
import ReportTable from "../../components/reports/ReportTable";
import ReportEmptyState, {
  ReportWelcomeState,
} from "../../components/reports/ReportEmptyState";

export default function ReportsPage() {
  const {
    activeReport,
    selectReport,
    filters,
    updateFilter,
    data,
    total,
    page,
    loading,
    exporting,
    error,
    hasRun,
    runReport,
    changePage,
    exportReport,
  } = useReports();

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      {/* ── Left: Report Selector ────────────────────────────────────────── */}
      <ReportSelector activeKey={activeReport?.key} onSelect={selectReport} />

      {/* ── Right: Report Workspace ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {activeReport ? activeReport.label : "Reports Centre"}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeReport
                  ? activeReport.description
                  : "Generate, filter and export enterprise reports"}
              </p>
            </div>
            {activeReport && (
              <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1 font-medium">
                Phase 8
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* No report selected */}
          {!activeReport && <ReportWelcomeState />}

          {/* Report workspace */}
          {activeReport && (
            <>
              {/* Filters + Run */}
              <ReportFilters
                activeReport={activeReport}
                filters={filters}
                onFilterChange={updateFilter}
                onRun={runReport}
                loading={loading}
              />

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              {/* Summary Cards */}
              {hasRun && data.length > 0 && (
                <ReportSummaryCards reportKey={activeReport.key} data={data} />
              )}

              {/* Export Bar */}
              {hasRun && data.length > 0 && (
                <ReportExportBar
                  total={total}
                  onExport={exportReport}
                  exporting={exporting}
                />
              )}

              {/* Table or Empty State */}
              {hasRun && data.length > 0 ? (
                <ReportTable
                  reportKey={activeReport.key}
                  data={data}
                  total={total}
                  page={page}
                  limit={filters.limit}
                  onChangePage={changePage}
                  loading={loading}
                />
              ) : (
                <ReportEmptyState
                  hasRun={hasRun}
                  reportLabel={activeReport.label}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
