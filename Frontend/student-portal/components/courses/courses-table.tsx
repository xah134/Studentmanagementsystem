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

import { CreateCourseDialog } from "./create-course-dialog"
import {
  deleteCourse,
  fetchCourses,
  getCourse,
  type Course,
  type CourseDetail,
} from "./courses"

const columnHelper = createColumnHelper<DataTableFeatures, Course>()

const columns: ColumnDef<DataTableFeatures, Course, any>[] = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    filterFn: "includesString",
  }),
  columnHelper.accessor((course) => course.code ?? "", {
    id: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => row.original.code ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor((course) => course.facultyName ?? "", {
    id: "faculty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Faculty" />
    ),
    cell: ({ row }) => row.original.facultyName ?? "",
    filterFn: "includesString",
  }),
  columnHelper.accessor((course) => course.campusName ?? "", {
    id: "campus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Campus" />
    ),
    cell: ({ row }) => row.original.campusName ?? "Whole institution",
    filterFn: "includesString",
  }),
]

export function CoursesTable({
  institutionId,
  siteId,
  refreshKey = 0,
  onChanged,
  viewHrefBase = "/portal/courses",
  readOnly = false,
}: {
  institutionId: string
  siteId?: string
  refreshKey?: number
  onChanged: () => void
  viewHrefBase?: string
  readOnly?: boolean
}) {
  const [rows, setRows] = React.useState<Course[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<CourseDetail | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [removing, setRemoving] = React.useState<Course | null>(null)
  const [removingPending, setRemovingPending] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    fetchCourses(institutionId, controller.signal, siteId)
      .then((items) => {
        setRows(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setRows([])
        setError(
          err instanceof Error ? err.message : "Failed to load courses"
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [institutionId, siteId, refreshKey])

  const rowActions = React.useMemo<DataTableRowActionsConfig<Course>>(
    () => ({
      getLabel: (course) => course.name,
      viewHref: (course) => `${viewHrefBase}/${course.id}`,
      ...(readOnly
        ? {}
        : {
            onEdit: async (course: Course) => {
              try {
                const detail = await getCourse(course.id)
                setEditing(detail)
                setEditOpen(true)
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Failed to load course"
                )
              }
            },
            menu: [
              {
                label: "Remove",
                onSelect: (course: Course) => setRemoving(course),
              },
            ],
          }),
    }),
    [viewHrefBase, readOnly]
  )

  async function confirmRemove() {
    if (!removing) return
    setRemovingPending(true)
    try {
      await deleteCourse(removing.id)
      toast.success("Course removed")
      setRemoving(null)
      onChanged()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not remove course"
      )
    } finally {
      setRemovingPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading courses...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DataTable
        columns={columns}
        data={rows}
        filterColumn="name"
        filterPlaceholder="Filter courses..."
        rowActions={rowActions}
      />
      <CreateCourseDialog
        institutionId={institutionId}
        course={editing}
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
            <DialogTitle>Remove course</DialogTitle>
            <DialogDescription>
              {removing
                ? `Remove ${removing.name}? It will leave this list.`
                : "Remove this course?"}
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
