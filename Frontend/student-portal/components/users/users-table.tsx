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

import { authHeaders } from "@/lib/api"

import { CreateUserDialog } from "./create-user-dialog"
import { fetchUsers, getUserName, userRoleLabels, type User } from "./users"

const columnHelper = createColumnHelper<DataTableFeatures, User>()

const columns: ColumnDef<DataTableFeatures, User, any>[] = [
  columnHelper.accessor((user) => getUserName(user), {
    id: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{getUserName(row.original)}</span>
    ),
    filterFn: "includesString",
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    filterFn: "includesString",
  }),
  columnHelper.accessor((user) => user.phone ?? "", {
    id: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => row.original.phone ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor("role", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => userRoleLabels[row.original.role] ?? row.original.role,
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

export function UsersTable({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  // Keep the last edited row after closing so the dialog doesn't flip to
  // "Create" while it animates out.
  const [editing, setEditing] = React.useState<User | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    fetchUsers(controller.signal, authHeaders())
      .then((items) => {
        setRows(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setRows([])
        setError(err instanceof Error ? err.message : "Failed to load users")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [refreshKey, reloadKey])

  const rowActions = React.useMemo<DataTableRowActionsConfig<User>>(
    () => ({
      getLabel: (user) => getUserName(user) || user.email,
      viewHref: (user) => `/settings/team/${user.id}`,
      onEdit: (user) => {
        setEditing(user)
        setEditOpen(true)
      },
      menu: [
        {
          label: "Mark as inactive",
          disabled: (user) => !user.isActive,
          onSelect: (user) => {
            setRows((current) =>
              current.map((row) =>
                row.id === user.id ? { ...row, isActive: false } : row
              )
            )
            toast.success(
              `${getUserName(user) || user.email} marked as inactive`
            )
          },
        },
      ],
    }),
    []
  )

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DataTable
        columns={columns}
        data={rows}
        filterColumn="name"
        filterPlaceholder="Filter users..."
        rowActions={rowActions}
      />
      <CreateUserDialog
        user={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
        showTrigger={false}
        onSaved={() => setReloadKey((key) => key + 1)}
      />
    </div>
  )
}
