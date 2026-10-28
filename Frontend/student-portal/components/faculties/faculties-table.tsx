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
import { Button } from "@/components/ui/Button/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/dialog"

import { CreateFacultyDialog } from "./create-faculty-dialog"
import {
  deleteFaculty,
  fetchFaculties,
  getFaculty,
  type Faculty,
  type FacultyDetail,
} from "./faculties"

const columnHelper = createColumnHelper<DataTableFeatures, Faculty>()

const columns: ColumnDef<DataTableFeatures, Faculty, any>[] = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    filterFn: "includesString",
  }),
  columnHelper.accessor((faculty) => faculty.code ?? "", {
    id: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => row.original.code ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor((faculty) => faculty.campusName ?? "", {
    id: "campus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Campus" />
    ),
    cell: ({ row }) => row.original.campusName ?? "Whole institution",
    filterFn: "includesString",
  }),
]

export function FacultiesTable({
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
  const [rows, setRows] = React.useState<Faculty[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<FacultyDetail | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [removing, setRemoving] = React.useState<Faculty | null>(null)
  const [removingPending, setRemovingPending] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    fetchFaculties(institutionId, controller.signal, siteId)
      .then((items) => {
        setRows(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setRows([])
        setError(
          err instanceof Error ? err.message : "Failed to load faculties"
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [institutionId, siteId, refreshKey])

  const rowActions = React.useMemo<DataTableRowActionsConfig<Faculty>>(
    () => ({
      getLabel: (faculty) => faculty.name,
      viewHref: (faculty) => `/portal/faculties/${faculty.id}`,
      onEdit: async (faculty) => {
        try {
          const detail = await getFaculty(faculty.id)
          setEditing(detail)
          setEditOpen(true)
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load faculty"
          )
        }
      },
      menu: [
        {
          label: "Remove",
          onSelect: (faculty) => setRemoving(faculty),
        },
      ],
    }),
    []
  )

  async function confirmRemove() {
    if (!removing) return
    setRemovingPending(true)
    try {
      await deleteFaculty(removing.id)
      toast.success("Faculty removed")
      setRemoving(null)
      onChanged()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not remove faculty"
      )
    } finally {
      setRemovingPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading faculties...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DataTable
        columns={columns}
        data={rows}
        filterColumn="name"
        filterPlaceholder="Filter faculties..."
        rowActions={rowActions}
      />
      <CreateFacultyDialog
        institutionId={institutionId}
        faculty={editing}
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
            <DialogTitle>Remove faculty</DialogTitle>
            <DialogDescription>
              {removing
                ? `Remove ${removing.name}? It will leave this list.`
                : "Remove this faculty?"}
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
