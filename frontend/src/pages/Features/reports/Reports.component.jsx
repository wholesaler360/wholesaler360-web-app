import { useContext, useState } from "react";
import { ReportsContext } from "./Reports.control";
import { REPORT_TYPES, REPORT_TYPE_OPTIONS } from "./reportConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/datatable/DataTable";
import { DataTableSkeleton } from "@/components/datatable/DataTableSkeleton";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FileText, Download, Printer, FileDown } from "lucide-react";
import { showNotification } from "@/core/toaster/toast";
import {
  exportReportToCSV,
  printReport,
  exportReportToPDF,
} from "@/lib/reportExportUtils";
import { Card, CardContent } from "@/components/ui/card";
import DateRangePicker from "./DateRangePicker";

function ReportsComponent() {
  const {
    selectedType,
    setSelectedType,
    dateRange,
    setDateRange,
    filteredData,
    isLoading,
    hasFetched,
    fetchReportData,
    columns,
  } = useContext(ReportsContext);

  const [globalFilter, setGlobalFilter] = useState("");

  const config = REPORT_TYPES[selectedType];
  const hasDateField = config?.dateField != null;

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  const handleGenerate = async () => {
    if (!selectedType) {
      showNotification.error("Please select a report type");
      return;
    }
    try {
      await fetchReportData();
    } catch (error) {
      showNotification.error(
        error.response?.data?.message || "Failed to fetch report data",
      );
    }
  };

  const reportTitle = config ? `${config.label} Report` : "Report";

  const handleCSV = () => exportReportToCSV(filteredData, config, selectedType);
  const handlePrint = () => printReport(filteredData, config, reportTitle);
  const handlePDF = () => exportReportToPDF(filteredData, config, reportTitle);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Generate and export reports for your business data.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex flex-col gap-1.5 w-full sm:w-[200px]">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedType && hasDateField && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Date Range</label>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !selectedType}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isLoading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <DataTableSkeleton
          columnCount={config?.columns.length || 5}
          rowCount={5}
          searchableColumnCount={1}
          showViewOptions={true}
        />
      )}

      {!isLoading && hasFetched && selectedType && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredData.length} record
              {filteredData.length !== 1 ? "s" : ""} found
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-2"
                onClick={handleCSV}
              >
                <Download className="size-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-2"
                onClick={handlePrint}
              >
                <Printer className="size-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-2"
                onClick={handlePDF}
              >
                <FileDown className="size-4" />
                PDF
              </Button>
            </div>
          </div>

          <DataTable
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            hideExportActions
          />
        </>
      )}

      {!isLoading && !hasFetched && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">
            Select a report type to get started
          </p>
          <p className="text-sm">
            Choose a data type and date range, then click Generate Report.
          </p>
        </div>
      )}
    </div>
  );
}

export default ReportsComponent;
