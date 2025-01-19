import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function DataTableSkeleton({
  columnCount = 5,
  rowCount = 5,
  searchableColumnCount = 1,
  filterableColumnCount = 0,
  showViewOptions = true,
  cellWidths = ["auto"],
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {searchableColumnCount > 0 && (
          <div className="flex-1">
            <Skeleton className="h-8 w-[250px]" />
          </div>
        )}
        {filterableColumnCount > 0
            ? Array.from({ length: filterableColumnCount }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-[4.5rem] border-dashed" />
              ))
            : null}
        {showViewOptions && (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-[70px]" />
          </div>
        )}
        
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i} style={{ width: cellWidths[i] }}>
                  <Skeleton className="h-4 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[70px]" />
      </div>
    </div>
  );
}

export { DataTableSkeleton } ;
