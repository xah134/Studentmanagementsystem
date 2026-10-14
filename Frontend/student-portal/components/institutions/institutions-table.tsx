"use client"

import * as React from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { Badge } from "@/components/ui/Badge/badge"
import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFeatures,
  type DataTableRowActionsConfig,
} from "@/components/data-table"

import {
  institutionTypeLabels,
  institutions as initialInstitutions,
  type Institution,
} from "./institutions"

const columnHelper = createColumnHelper<DataTableFeatures, Institution>()

const columns: ColumnDef<DataTableFeatures, Institution, any>[] = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
    filterFn: "includesString",
  }),
  columnHelper.accessor("institutionType", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => institutionTypeLabels[row.original.institutionType],
    filterFn: "includesString",
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    filterFn: "includesString",
  }),
  columnHelper.accessor("city", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    filterFn: "includesString",
  }),
  columnHelper.accessor("isActive", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge>Active</Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      ),
    sortFn: "alphanumeric",
    enableColumnFilter: false,
  }),
]

export function InstitutionsTable() {
  const [rows, setRows] = React.useState(initialInstitutions)

  const rowActions = React.useMemo<DataTableRowActionsConfig<Institution>>(
    () => ({
      getLabel: (institution) => institution.name,
      viewHref: (institution) => `/institutions/${institution.id}`,
      editHref: (institution) => `/institutions/${institution.id}/edit`,
      menu: [
        {
          label: "Mark as inactive",
          disabled: (institution) => !institution.isActive,
          onSelect: (institution) => {
            setRows((current) =>
              current.map((row) =>
                row.id === institution.id ? { ...row, isActive: false } : row
              )
            )
            toast.success(`${institution.name} marked as inactive`)
          },
        },
      ],
    }),
    []
  )

  return (
    <DataTable
      columns={columns}
      data={rows}
      filterColumn="name"
      filterPlaceholder="Filter institutions..."
      rowActions={rowActions}
    />
  )
}
