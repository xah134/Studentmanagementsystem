"use client"

import type { ReactTable, RowData } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/Button/button"

import type { DataTableFeatures } from "./data-table-features"

interface DataTablePaginationProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>
}

export function DataTablePagination<TData extends RowData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-4 px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label htmlFor="rows-per-page" className="text-sm font-medium">
            Rows per page
          </label>
          <select
            id="rows-per-page"
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
            value={table.state.pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {[10, 20, 30, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm font-medium">
          Page {table.state.pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">First page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
