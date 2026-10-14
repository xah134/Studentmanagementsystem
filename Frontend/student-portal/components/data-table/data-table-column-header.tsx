"use client"

import type { Column, RowData } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/Button/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown/dropdown-menu"

import type { DataTableFeatures } from "./data-table-features"

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div>{title}</div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="-ml-3 h-8" />}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDown />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp />
        ) : (
          <ArrowUpDown />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <ArrowUp />
          Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <ArrowDown />
          Descending
        </DropdownMenuItem>
        {column.getCanHide() ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              Hide
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
