"use client"

import * as React from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFeatures,
  type DataTableRowActionsConfig,
} from "@/components/data-table"
import { Badge } from "@/components/ui/Badge/badge"
import { Button } from "@/components/ui/Button/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/dialog"

import { CreateLecturerDialog } from "./create-lecturer-dialog"
import {
  deleteLecturer,
  fetchLecturers,
  getLecturer,
  verificationStatusLabels,
  type Lecturer,
  type LecturerDetail,
} from "./lecturers"

const columnHelper = createColumnHelper<DataTableFeatures, Lecturer>()

const columns: ColumnDef<DataTableFeatures, Lecturer, any>[] = [
  columnHelper.accessor(
    (lecturer) =>
      [lecturer.firstName, lecturer.lastName].filter(Boolean).join(" "),
    {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {[row.original.firstName, row.original.lastName]
            .filter(Boolean)
            .join(" ") || "—"}
        </span>
      ),
      filterFn: "includesString",
    }
  ),
  columnHelper.accessor((lecturer) => lecturer.phone ?? "", {
    id: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => row.original.phone ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor((lecturer) => lecturer.idNumber ?? "", {
    id: "idNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID number" />
    ),
    cell: ({ row }) => row.original.idNumber ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor((lecturer) => lecturer.nationality ?? "", {
    id: "nationality",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nationality" />
    ),
    cell: ({ row }) => row.original.nationality ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor((lecturer) => lecturer.siteName ?? "Unassigned", {
    id: "campus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Campus" />
    ),
    cell: ({ row }) => row.original.siteName ?? "Unassigned",
    filterFn: "includesString",
  }),
  columnHelper.accessor("verificationStatus", {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.verificationStatus
      const variant =
        status === "VERIFIED"
          ? "default"
          : status === "REJECTED"
            ? "destructive"
            : "secondary"
      return <Badge variant={variant}>{verificationStatusLabels[status]}</Badge>
    },
    sortFn: "alphanumeric",
    enableColumnFilter: false,
  }),
]

export function LecturersTable({
  institutionId,
  siteId,
  refreshKey = 0,
  onChanged,
}: {
  institutionId: string
  siteId?: string
  refreshKey?: number
  onChanged: () => void
}) {
  const [rows, setRows] = React.useState<Lecturer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<LecturerDetail | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [removing, setRemoving] = React.useState<Lecturer | null>(null)
  const [removingPending, setRemovingPending] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    fetchLecturers(institutionId, controller.signal, siteId)
      .then((items) => {
        setRows(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setRows([])
        setError(err instanceof Error ? err.message : "Failed to load lecturers")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [institutionId, siteId, refreshKey])

  const rowActions = React.useMemo<DataTableRowActionsConfig<Lecturer>>(
    () => ({
      getLabel: (lecturer) => lecturer.phone || lecturer.idNumber || "lecturer",
      viewHref: (lecturer) => `/portal/lecturers/${lecturer.id}`,
      onEdit: async (lecturer) => {
        try {
          const detail = await getLecturer(lecturer.id)
          setEditing(detail)
          setEditOpen(true)
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load lecturer"
          )
        }
      },
      menu: [
        {
          label: "Remove",
          onSelect: (lecturer) => setRemoving(lecturer),
        },
      ],
    }),
    []
  )

  async function confirmRemove() {
    if (!removing) return
    setRemovingPending(true)
    try {
      await deleteLecturer(removing.id)
      toast.success("Lecturer removed")
      setRemoving(null)
      onChanged()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not remove lecturer"
      )
    } finally {
      setRemovingPending(false)
    }
  }

  const removingLabel = removing
    ? removing.phone || removing.idNumber || "this lecturer"
    : "this lecturer"

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading lecturers...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DataTable
        columns={columns}
        data={rows}
        filterColumn="phone"
        filterPlaceholder="Filter lecturers..."
        rowActions={rowActions}
      />
      <CreateLecturerDialog
        institutionId={institutionId}
        lecturer={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={onChanged}
      />
      <Dialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open && !removingPending) setRemoving(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove lecturer</DialogTitle>
            <DialogDescription>
              {`Remove ${removingLabel}? They will leave this list.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={removingPending}
              onClick={() => setRemoving(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={removingPending}
              onClick={confirmRemove}
            >
              {removingPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
