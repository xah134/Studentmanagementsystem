"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { Badge } from "@/components/ui/Badge/badge"
import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFeatures,
  type DataTableRowActionsConfig,
} from "@/components/data-table"

import { authHeaders } from "@/lib/api"

import { CreateInstitutionDialog } from "./create-institution-dialog"
import {
  fetchInstitutions,
  institutionTypeLabels,
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
  columnHelper.accessor((institution) => institution.city ?? "", {
    id: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => row.original.city ?? "",
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

export function InstitutionsTable({ refreshKey = 0 }: { refreshKey?: number }) {
  const router = useRouter()
  const [rows, setRows] = React.useState<Institution[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [editing, setEditing] = React.useState<Institution | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    fetchInstitutions(controller.signal, authHeaders())
      .then((items) => {
        setRows(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setRows([])
        setError(
          err instanceof Error ? err.message : "Failed to load institutions"
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [refreshKey, reloadKey])

  const rowActions = React.useMemo<DataTableRowActionsConfig<Institution>>(
    () => ({
      getLabel: (institution) => institution.name,
      onView: (institution) => {
        sessionStorage.setItem("portal.institutionId", institution.id)
        router.push("/portal")
      },
      onEdit: (institution) => {
        setEditing(institution)
        setEditOpen(true)
      },
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
    [router]
  )

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading institutions...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DataTable
        columns={columns}
        data={rows}
        filterColumn="name"
        filterPlaceholder="Filter institutions..."
        rowActions={rowActions}
      />
      <CreateInstitutionDialog
        institution={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
        showTrigger={false}
        onSaved={() => setReloadKey((key) => key + 1)}
      />
    </div>
  )
}
