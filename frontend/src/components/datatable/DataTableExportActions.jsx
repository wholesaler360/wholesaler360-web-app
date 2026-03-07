import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { exportToCSV, printTable } from "@/lib/tableExportUtils";

function DataTableExportActions({ table, filename, title }) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-2 hidden lg:flex"
        onClick={() => exportToCSV(table, filename)}
      >
        <Download className="size-4" />
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-2 hidden lg:flex"
        onClick={() => printTable(table, title)}
      >
        <Printer className="size-4" />
        Print
      </Button>
    </>
  );
}

export default DataTableExportActions;
