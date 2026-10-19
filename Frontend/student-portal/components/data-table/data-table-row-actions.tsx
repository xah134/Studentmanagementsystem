"use client"

import Link from "next/link"
import { createColumnHelper, type RowData } from "@tanstack/react-table"
import { Eye, MoreHorizontal, Pencil } from "lucide-react"

import { Button } from "@/components/ui/Button/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown/dropdown-menu"

import type { DataTableFeatures } from "./data-table-features"

export type DataTableMenuAction<TData> = {
  label: string
  onSelect: (row: TData) => void
  disabled?: (row: TData) => boolean
}

export type DataTableRowActionsConfig<TData> = {
  getLabel?: (row: TData) => string
  onView?: (row: TData) => void
  viewHref?: (row: TData) => string
  onEdit?: (row: TData) => void
  editHref?: (row: TData) => string
  menu?: DataTableMenuAction<TData>[]
}

export function getActionsColumn<TData extends RowData>(
  actions: DataTableRowActionsConfig<TData>
) {
  const columnHelper = createColumnHelper<DataTableFeatures, TData>()

  return columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DataTableRowActions row={row.original} actions={actions} />
    ),
    enableSorting: false,
    enableHiding: false,
  })
}

function DataTableRowActions<TData>({
  row,
  actions,
}: {
  row: TData
  actions: DataTableRowActionsConfig<TData>
}) {
  const label = actions.getLabel?.(row) ?? "row"
  const viewHref = actions.viewHref?.(row)
  const editHref = actions.editHref?.(row)
  const menu = actions.menu ?? []

  return (
    <div className="flex items-center justify-end gap-1">
      {actions.onView ? (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`View ${label}`}
          onClick={() => actions.onView?.(row)}
        >
          <Eye />
        </Button>
      ) : viewHref ? (
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          aria-label={`View ${label}`}
          render={<Link href={viewHref} />}
        >
          <Eye />
        </Button>
      ) : null}
      {actions.onEdit ? (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${label}`}
          onClick={() => actions.onEdit?.(row)}
        >
          <Pencil />
        </Button>
      ) : editHref ? (
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          aria-label={`Edit ${label}`}
          render={<Link href={editHref} />}
        >
          <Pencil />
        </Button>
      ) : null}
      {menu.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Open actions for ${label}`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {menu.map((action) => (
              <DropdownMenuItem
                key={action.label}
                disabled={action.disabled?.(row)}
                onClick={() => action.onSelect(row)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
