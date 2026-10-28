"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

import { openCampusPortal } from "@/lib/campus-portal"

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

import { CreateCampusDialog } from "./create-campus-dialog"
import {
  deleteCampus,
  fetchCampuses,
  getCampus,
  type Campus,
  type CampusDetail,
} from "./campuses"

const columnHelper = createColumnHelper<DataTableFeatures, Campus>()

const columns: ColumnDef<DataTableFeatures, Campus, any>[] = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    filterFn: "includesString",
  }),
  columnHelper.accessor((campus) => campus.city ?? "", {
    id: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => row.original.city ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor((campus) => campus.state ?? "", {
    id: "state",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
    cell: ({ row }) => row.original.state ?? "",
    filterFn: "includesString",
  }),
]

export function CampusesTable({
  institutionId,
  refreshKey = 0,
  onChanged,
}: {
  institutionId: string
  refreshKey?: number
  onChanged: () => void
}) {
  const router = useRouter()
  const [rows, setRows] = React.useState<Campus[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<CampusDetail | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [removing, setRemoving] = React.useState<Campus | null>(null)
  const [removingPending, setRemovingPending] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    fetchCampuses(institutionId, controller.signal)
      .then((items) => {
        setRows(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setRows([])
        setError(err instanceof Error ? err.message : "Failed to load campuses")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [institutionId, refreshKey])

  const rowActions = React.useMemo<DataTableRowActionsConfig<Campus>>(
    () => ({
      getLabel: (campus) => campus.name,
      onView: (campus) => {
        openCampusPortal(campus.id)
        router.push("/campus")
      },
      onEdit: async (campus) => {
        try {
          const detail = await getCampus(campus.id)
          setEditing(detail)
          setEditOpen(true)
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to load campus")
        }
      },
      menu: [
        {
          label: "Remove",
          onSelect: (campus) => setRemoving(campus),
        },
      ],
    }),
    [router]
  )

  async function confirmRemove() {
    if (!removing) return
    setRemovingPending(true)
    try {
      await deleteCampus(removing.id)
      toast.success("Campus removed")
      setRemoving(null)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove campus")
    } finally {
      setRemovingPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading campuses...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DataTable
        columns={columns}
        data={rows}
        filterColumn="name"
        filterPlaceholder="Filter campuses..."
        rowActions={rowActions}
      />
      <CreateCampusDialog
        institutionId={institutionId}
        campus={editing}
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
            <DialogTitle>Remove campus</DialogTitle>
            <DialogDescription>
              {removing
                ? `Remove ${removing.name}? It will leave this list.`
                : "Remove this campus?"}
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
