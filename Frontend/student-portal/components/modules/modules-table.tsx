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

import { CreateModuleDialog } from "./create-module-dialog"
import {
  deleteModule,
  fetchModules,
  getModule,
  type Module,
  type ModuleDetail,
} from "./modules"

const columnHelper = createColumnHelper<DataTableFeatures, Module>()

const columns: ColumnDef<DataTableFeatures, Module, any>[] = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    filterFn: "includesString",
  }),
  columnHelper.accessor((moduleRow) => moduleRow.code ?? "", {
    id: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => row.original.code ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor(
    (moduleRow) =>
      moduleRow.credits === null || moduleRow.credits === undefined
        ? ""
        : String(moduleRow.credits),
    {
      id: "credits",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Credits" />
      ),
      cell: ({ row }) =>
        row.original.credits === null || row.original.credits === undefined
          ? ""
          : row.original.credits,
      filterFn: "includesString",
    }
  ),
  columnHelper.accessor((moduleRow) => moduleRow.courseName ?? "", {
    id: "course",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
    cell: ({ row }) => row.original.courseName ?? "",
    filterFn: "includesString",
  }),
]

export function ModulesTable({
  institutionId,
  refreshKey = 0,
  onChanged,
}: {
  institutionId: string
  refreshKey?: number
  onChanged: () => void
}) {
  const [rows, setRows] = React.useState<Module[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<ModuleDetail | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [removing, setRemoving] = React.useState<Module | null>(null)
  const [removingPending, setRemovingPending] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    fetchModules(institutionId, controller.signal)
      .then((items) => {
        setRows(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setRows([])
        setError(
          err instanceof Error ? err.message : "Failed to load modules"
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [institutionId, refreshKey])

  const rowActions = React.useMemo<DataTableRowActionsConfig<Module>>(
    () => ({
      getLabel: (moduleRow) => moduleRow.name,
      viewHref: (moduleRow) => `/portal/modules/${moduleRow.id}`,
      onEdit: async (moduleRow) => {
        try {
          const detail = await getModule(moduleRow.id)
          setEditing(detail)
          setEditOpen(true)
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load module"
          )
        }
      },
      menu: [
        {
          label: "Remove",
          onSelect: (moduleRow) => setRemoving(moduleRow),
        },
      ],
    }),
    []
  )

  async function confirmRemove() {
    if (!removing) return
    setRemovingPending(true)
    try {
      await deleteModule(removing.id)
      toast.success("Module removed")
      setRemoving(null)
      onChanged()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not remove module"
      )
    } finally {
      setRemovingPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading modules...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DataTable
        columns={columns}
        data={rows}
        filterColumn="name"
        filterPlaceholder="Filter modules..."
        rowActions={rowActions}
      />
      <CreateModuleDialog
        institutionId={institutionId}
        module={editing}
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
            <DialogTitle>Remove module</DialogTitle>
            <DialogDescription>
              {removing
                ? `Remove ${removing.name}? It will leave this list.`
                : "Remove this module?"}
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
