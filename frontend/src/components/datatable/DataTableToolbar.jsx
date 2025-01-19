import { cn } from "@/lib/utils";
import { DataTableViewOptions } from "./DataTableViewOption";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";

function DataTableToolbar({ 
  table, 
  globalFilter,
  setGlobalFilter,
  children, 
  className, 
  ...props 
}) {
  const isFiltered = table.getState().globalFilter;
  
  return (
    <div className={cn("flex w-full items-center justify-end gap-2 overflow-auto p-1", className)} {...props}>
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Search ..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="h-8 text-xs w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => setGlobalFilter("")}
            className="h-8 px-2 lg:px-3 text-xs"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

export default DataTableToolbar;
