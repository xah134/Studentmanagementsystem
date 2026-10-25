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

import { CreateStudentDialog } from "./create-student-dialog"
import {
  deleteStudent,
  fetchStudents,
  getStudent,
  verificationStatusLabels,
  type Student,
  type StudentDetail,
} from "./students"

const columnHelper = createColumnHelper<DataTableFeatures, Student>()

const columns: ColumnDef<DataTableFeatures, Student, any>[] = [
  columnHelper.accessor((student) => student.phone ?? "", {
    id: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.phone ?? ""}</span>
    ),
    filterFn: "includesString",
  }),
  columnHelper.accessor((student) => student.idNumber ?? "", {
    id: "idNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID number" />
    ),
    cell: ({ row }) => row.original.idNumber ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor((student) => student.nationality ?? "", {
    id: "nationality",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nationality" />
    ),
    cell: ({ row }) => row.original.nationality ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor((student) => student.siteName ?? "", {
    id: "campus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Campus" />
    ),
    cell: ({ row }) => row.original.siteName ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor("guardianCount", {
    id: "guardians",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Guardians" />
    ),
    cell: ({ row }) => row.original.guardianCount,
    enableColumnFilter: false,
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

export function StudentsTable({
  institutionId,
  refreshKey = 0,
  onChanged,
}: {
  institutionId: string
  refreshKey?: number
  onChanged: () => void
}) {
  const [rows, setRows] = React.useState<Student[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<StudentDetail | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [removing, setRemoving] = React.useState<Student | null>(null)
  const [removingPending, setRemovingPending] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    fetchStudents(institutionId, controller.signal)
      .then((items) => {
        setRows(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setRows([])
        setError(err instanceof Error ? err.message : "Failed to load students")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [institutionId, refreshKey])

  const rowActions = React.useMemo<DataTableRowActionsConfig<Student>>(
    () => ({
      getLabel: (student) => student.phone || student.idNumber || "student",
      viewHref: (student) => `/portal/students/${student.id}`,
      onEdit: async (student) => {
        try {
          const detail = await getStudent(student.id)
          setEditing(detail)
          setEditOpen(true)
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load student"
          )
        }
      },
      menu: [
        {
          label: "Remove",
          onSelect: (student) => setRemoving(student),
        },
      ],
    }),
    []
  )

  async function confirmRemove() {
    if (!removing) return
    setRemovingPending(true)
    try {
      await deleteStudent(removing.id)
      toast.success("Student removed")
      setRemoving(null)
      onChanged()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not remove student"
      )
    } finally {
      setRemovingPending(false)
    }
  }

  const removingLabel = removing
    ? removing.phone || removing.idNumber || "this student"
    : "this student"

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading students...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DataTable
        columns={columns}
        data={rows}
        filterColumn="phone"
        filterPlaceholder="Filter students..."
        rowActions={rowActions}
      />
      <CreateStudentDialog
        institutionId={institutionId}
        student={editing}
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
            <DialogTitle>Remove student</DialogTitle>
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
