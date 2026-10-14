"use client"

import { createColumnHelper, type RowData } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/Checkbox/checkbox"

import {
  type DataTableFeatures,
} from "./data-table-features"

export function getSelectColumn<TData extends RowData>() {
  const columnHelper = createColumnHelper<DataTableFeatures, TData>()

  return columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() &&
          !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  })
}
